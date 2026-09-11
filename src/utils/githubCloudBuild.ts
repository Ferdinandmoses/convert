/**
 * GitHub Actions Cloud Compiler Client
 * Triggers workflow_dispatch and tracks build status for real Android APK compilation.
 */

import { LATEST_WORKFLOW_YML } from './workflowTemplate';

export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  branch: string;
}

export interface WorkflowRun {
  id: number;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | 'timed_out' | null;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface ArtifactItem {
  id: number;
  name: string;
  size_in_bytes: number;
  archive_download_url: string;
  expired: boolean;
}

const STORAGE_KEY = 'web2app_github_cloud_config';

export function getSavedGitHubConfig(): GitHubConfig {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return {
    owner: 'perdinanmoses34-hub',
    repo: 'tn.timbu',
    token: '',
    branch: 'main',
  };
}

export function saveGitHubConfig(config: Partial<GitHubConfig>): void {
  const current = getSavedGitHubConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Synchronizes the latest build-apk.yml workflow directly to the user's GitHub repository.
 */
export async function syncWorkflowFileToRepo(
  config: GitHubConfig,
  customWorkflowYml?: string
): Promise<{ success: boolean; message: string }> {
  if (!config.token.trim()) {
    return { success: false, message: 'Token GitHub belum diisi.' };
  }

  const path = '.github/workflows/build-apk.yml';
  const branch = config.branch || 'main';
  const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${branch}`;

  let existingSha: string | undefined;

  try {
    const getRes = await fetch(getUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (getRes.ok) {
      const data = await getRes.json();
      existingSha = data.sha;
    }

    const workflowContentToSync = customWorkflowYml || LATEST_WORKFLOW_YML;

    const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
    // Base64 encode UTF-8 string safely
    const utf8Bytes = new TextEncoder().encode(workflowContentToSync);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64Content = btoa(binary);

    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        message: 'ci: update Android build workflow with custom app icon and styling',
        content: base64Content,
        branch,
        ...(existingSha ? { sha: existingSha } : {}),
      }),
    });

    if (putRes.ok) {
      return { success: true, message: 'Alur kerja build-apk.yml berhasil disinkronkan ke repositori GitHub.' };
    }

    const errData = await putRes.json().catch(() => ({}));
    return {
      success: false,
      message: errData.message || `Gagal menyinkronkan berkas ke GitHub (HTTP ${putRes.status})`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Gagal menghubungi GitHub API untuk sinkronisasi alur kerja.',
    };
  }
}

/**
 * Dispatches the build-apk.yml workflow on GitHub Actions.
 */
export async function triggerCloudBuild(
  config: GitHubConfig,
  inputs: { target_url: string; app_name: string; package_name: string },
  customWorkflowYml?: string
): Promise<{ success: boolean; error?: string }> {
  // Ensure workflow file is up to date on GitHub with custom icon & styling before dispatching
  if (config.token.trim()) {
    await syncWorkflowFileToRepo(config, customWorkflowYml).catch(() => {});
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/actions/workflows/build-apk.yml/dispatches`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        ref: config.branch || 'main',
        inputs,
      }),
    });

    if (response.status === 204) {
      return { success: true };
    }

    if (response.status === 401) {
      return { success: false, error: 'Token GitHub tidak valid atau sudah kedaluwarsa. Periksa kembali token Anda.' };
    }

    if (response.status === 404) {
      return {
        success: false,
        error: `Repositori "${config.owner}/${config.repo}" atau alur kerja "build-apk.yml" tidak ditemukan. Pastikan nama repositori dan token sudah benar (memiliki izin "repo" dan "workflow").`,
      };
    }

    const data = await response.json().catch(() => ({}));
    return {
      success: false,
      error: data.message || `Gagal memulai kompilasi (HTTP ${response.status})`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Gagal terhubung ke server GitHub. Periksa koneksi internet Anda.',
    };
  }
}

/**
 * Polls the latest workflow run for build-apk.yml.
 */
export async function getLatestWorkflowRun(
  config: GitHubConfig
): Promise<{ run?: WorkflowRun; error?: string }> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/actions/workflows/build-apk.yml/runs?per_page=1`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(config.token ? { Authorization: `Bearer ${config.token.trim()}` } : {}),
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { error: data.message || `HTTP ${response.status}` };
    }

    const data = await response.json();
    if (data.workflow_runs && data.workflow_runs.length > 0) {
      return { run: data.workflow_runs[0] };
    }

    return { error: 'Belum ada riwayat build.' };
  } catch (err: any) {
    return { error: err?.message || 'Gagal mengambil status build' };
  }
}

/**
 * Gets downloadable artifacts for a completed workflow run.
 */
export async function getRunArtifacts(
  config: GitHubConfig,
  runId: number
): Promise<{ artifacts: ArtifactItem[]; error?: string }> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/actions/runs/${runId}/artifacts`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(config.token ? { Authorization: `Bearer ${config.token.trim()}` } : {}),
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { artifacts: [], error: data.message || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { artifacts: data.artifacts || [] };
  } catch (err: any) {
    return { artifacts: [], error: err?.message || 'Gagal mengambil berkas artefak' };
  }
}
