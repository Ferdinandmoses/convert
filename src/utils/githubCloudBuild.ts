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
      const parsed = JSON.parse(saved);
      // Auto-migrate legacy placeholder repository if still pointing to old repo
      if (parsed.owner === 'perdinanmoses34-hub' || !parsed.owner) {
        parsed.owner = 'Ferdinandmoses';
      }
      if (parsed.repo === 'tn.timbu' || !parsed.repo) {
        parsed.repo = 'convert';
      }
      return parsed;
    } catch {
      // ignore
    }
  }
  return {
    owner: 'Ferdinandmoses',
    repo: 'convert',
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

  // Helper to fetch the latest SHA fresh from GitHub (with cache busting)
  const fetchLatestSha = async (): Promise<string | undefined> => {
    try {
      const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${branch}&_ts=${Date.now()}`;
      const res = await fetch(getUrl, {
        cache: 'no-store',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${config.token.trim()}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      if (res.ok) {
        const data = await res.json();
        return data.sha;
      }
    } catch {
      // ignore
    }
    return undefined;
  };

  try {
    let existingSha = await fetchLatestSha();
    const workflowContentToSync = customWorkflowYml || LATEST_WORKFLOW_YML;

    const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
    // Base64 encode UTF-8 string safely
    const utf8Bytes = new TextEncoder().encode(workflowContentToSync);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64Content = btoa(binary);

    const sendPut = async (sha?: string) => {
      return fetch(putUrl, {
        method: 'PUT',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${config.token.trim()}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          message: 'ci: fix workflow YAML syntax and optimize Android APK build',
          content: base64Content,
          branch,
          ...(sha ? { sha } : {}),
        }),
      });
    };

    let putRes = await sendPut(existingSha);

    // If 409 Conflict (e.g. SHA mismatch), re-fetch fresh SHA and retry once
    if (putRes.status === 409) {
      existingSha = await fetchLatestSha();
      if (existingSha) {
        putRes = await sendPut(existingSha);
      }
    }

    if (putRes.ok) {
      return { success: true, message: 'Alur kerja build-apk.yml berhasil disinkronkan ke repositori GitHub.' };
    }

    const errData = await putRes.json().catch(() => ({}));
    let errMsg = errData.message || `Gagal menyinkronkan berkas ke GitHub (HTTP ${putRes.status})`;
    if (errMsg.toLowerCase().includes('admin rights') || putRes.status === 403) {
      errMsg = `Must have admin rights to Repository (${config.owner}/${config.repo}). Pastikan nama repositori sesuai dengan akun Anda dan Token memiliki izin 'repo' serta 'workflow'.`;
    } else if (errMsg.includes('does not match') || putRes.status === 409) {
      errMsg = `Konflik versi: Berkas alur kerja di GitHub baru saja diperbarui. Alur kerja sudah tersedia di repositori Anda dan siap dijalankan.`;
    }
    return {
      success: false,
      message: errMsg,
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
  inputs: { target_url: string; app_name: string; package_name?: string },
  customWorkflowYml?: string
): Promise<{ success: boolean; error?: string }> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/actions/workflows/build-apk.yml/dispatches`;

  const sendDispatch = async () => {
    return fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        ref: config.branch || 'main',
        inputs: {
          target_url: inputs.target_url,
          app_name: inputs.app_name,
          ...(inputs.package_name ? { package_name: inputs.package_name } : {}),
        },
      }),
    });
  };

  try {
    let response = await sendDispatch();

    // If 404 (workflow file missing) OR 422 (workflow does not have 'workflow_dispatch' trigger, caused by earlier YAML syntax error)
    if (response.status === 404 || response.status === 422) {
      const syncRes = await syncWorkflowFileToRepo(config, customWorkflowYml);
      if (syncRes.success) {
        // Wait 3 seconds for GitHub Actions to re-parse the newly pushed valid workflow
        await new Promise((r) => setTimeout(r, 3000));
        response = await sendDispatch();
      }
    }

    if (response.status === 204) {
      return { success: true };
    }

    if (response.status === 401) {
      return { success: false, error: 'Token GitHub tidak valid atau sudah kedaluwarsa. Periksa kembali token Anda.' };
    }

    if (response.status === 404) {
      return {
        success: false,
        error: `Repositori "${config.owner}/${config.repo}" atau alur kerja "build-apk.yml" tidak ditemukan di branch ${config.branch || 'main'}. Pastikan repositori sudah di-push ke GitHub.`,
      };
    }

    const data = await response.json().catch(() => ({}));
    let errMsg = data.message || `Gagal memulai kompilasi (HTTP ${response.status})`;
    if (errMsg.toLowerCase().includes('admin rights') || response.status === 403) {
      errMsg = `Must have admin rights to Repository (${config.owner}/${config.repo}). Token GitHub Anda tidak memiliki hak akses/admin pada repositori ini atau belum dicentang izin 'workflow'.`;
    } else if (errMsg.toLowerCase().includes('workflow_dispatch') || response.status === 422) {
      errMsg = `GitHub Actions baru saja menerima alur kerja yang diperbaiki dan sedang memproses validasi. Silakan tunggu sekitar 10-15 detik lalu klik tombol 'Mulai Kompilasi Cloud APK Asli' lagi, atau buka langsung tautan GitHub Actions di bawah.`;
    }
    return {
      success: false,
      error: errMsg,
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
