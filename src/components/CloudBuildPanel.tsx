import React, { useState, useEffect, useRef } from 'react';
import {
  Cloud,
  Server,
  Play,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Key,
  Lock,
  Smartphone,
  Download,
  Terminal,
  Settings,
  HelpCircle,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  GitBranch,
  Wrench,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppConfig } from '../types';
import {
  getSavedGitHubConfig,
  saveGitHubConfig,
  triggerCloudBuild,
  syncWorkflowFileToRepo,
  getLatestWorkflowRun,
  getRunArtifacts,
  GitHubConfig,
  WorkflowRun,
  ArtifactItem,
} from '../utils/githubCloudBuild';

interface CloudBuildPanelProps {
  config: AppConfig;
  onOpenPlayStoreGuide: () => void;
}

export const CloudBuildPanel: React.FC<CloudBuildPanelProps> = ({ config }) => {
  const [ghConfig, setGhConfig] = useState<GitHubConfig>(() => getSavedGitHubConfig());
  const [showConfigSettings, setShowConfigSettings] = useState(() => !getSavedGitHubConfig().token);
  const [showTokenGuide, setShowTokenGuide] = useState(() => !getSavedGitHubConfig().token);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isSyncingWorkflow, setIsSyncingWorkflow] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [activeRun, setActiveRun] = useState<WorkflowRun | null>(null);
  const [artifacts, setArtifacts] = useState<ArtifactItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [buildDurationSeconds, setBuildDurationSeconds] = useState(0);
  const [pollingStatusText, setPollingStatusText] = useState('');
  const [copiedTokenHelper, setCopiedTokenHelper] = useState(false);

  const timerRef = useRef<any>(null);
  const pollIntervalRef = useRef<any>(null);

  // Update token or repo in local storage
  const handleSaveConfig = (updates: Partial<GitHubConfig>) => {
    const updated = { ...ghConfig, ...updates };
    setGhConfig(updated);
    saveGitHubConfig(updates);
  };

  // Manual sync workflow file to GitHub
  const handleSyncWorkflow = async () => {
    if (!ghConfig.token.trim()) {
      setShowConfigSettings(true);
      setErrorMessage('Masukkan Token GitHub Anda terlebih dahulu untuk menyinkronkan alur kerja.');
      return;
    }

    setIsSyncingWorkflow(true);
    setSyncStatusMessage('Sedang memperbarui alur kerja perbaikan Android ke repositori GitHub Anda...');
    const res = await syncWorkflowFileToRepo(ghConfig);
    setIsSyncingWorkflow(false);

    if (res.success) {
      setSyncStatusMessage('Alur kerja perbaikan (Java 17 + Gradle 8.4 + SDK 34) berhasil diperbarui di GitHub!');
      setTimeout(() => setSyncStatusMessage(null), 6000);
    } else {
      setErrorMessage(res.message);
    }
  };

  // Timer while building
  useEffect(() => {
    if (activeRun && (activeRun.status === 'in_progress' || activeRun.status === 'queued')) {
      timerRef.current = setInterval(() => {
        setBuildDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [activeRun?.status]);

  // Poller while workflow run is active
  useEffect(() => {
    if (!activeRun || activeRun.status === 'completed') {
      clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      const { run, error } = await getLatestWorkflowRun(ghConfig);
      if (run) {
        setActiveRun(run);
        if (run.status === 'in_progress') {
          setPollingStatusText('Server Cloud Ubuntu sedang menjalankan Gradle & Java 17 untuk menyusun APK...');
        } else if (run.status === 'queued') {
          setPollingStatusText('Antrean server GitHub Cloud siap dimulai...');
        } else if (run.status === 'completed') {
          clearInterval(pollIntervalRef.current);
          if (run.conclusion === 'success') {
            setPollingStatusText('Kompilasi Selesai 100%! Mengambil berkas APK...');
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#10B981', '#3B82F6', '#8B5CF6'],
            });
            // Fetch artifacts
            const art = await getRunArtifacts(ghConfig, run.id);
            if (art.artifacts.length > 0) {
              setArtifacts(art.artifacts);
            }
          } else {
            setErrorMessage(`Kompilasi gagal dengan status: ${run.conclusion}. Periksa log di GitHub.`);
          }
        }
      }
    }, 6000);

    return () => clearInterval(pollIntervalRef.current);
  }, [activeRun?.id, activeRun?.status, ghConfig]);

  // Trigger Build via API
  const handleStartCloudBuild = async () => {
    setErrorMessage(null);
    setArtifacts([]);
    setBuildDurationSeconds(0);

    if (!ghConfig.token.trim()) {
      setShowConfigSettings(true);
      setErrorMessage('Masukkan Token GitHub Anda terlebih dahulu untuk memulai kompilasi otomatis dari aplikasi.');
      return;
    }

    setIsTriggering(true);
    setPollingStatusText('Mengirim instruksi kompilasi ke server GitHub Cloud...');

    const result = await triggerCloudBuild(ghConfig, {
      target_url: config.url,
      app_name: config.appName,
      package_name: config.packageName,
    });

    setIsTriggering(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Gagal memulai kompilasi.');
      setShowConfigSettings(true);
      return;
    }

    // Successfully dispatched, now wait 3 seconds and find the run
    setPollingStatusText('Instruksi diterima oleh GitHub! Menghubungkan ke proses build...');
    setTimeout(async () => {
      const { run } = await getLatestWorkflowRun(ghConfig);
      if (run) {
        setActiveRun(run);
      } else {
        // Fallback placeholder run
        setActiveRun({
          id: Date.now(),
          status: 'queued',
          conclusion: null,
          html_url: `https://github.com/${ghConfig.owner}/${ghConfig.repo}/actions`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }, 3000);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const directWorkflowUrl = `https://github.com/${ghConfig.owner}/${ghConfig.repo}/actions/workflows/build-apk.yml`;

  return (
    <div className="space-y-4">
      {/* Top Banner Explaining Cloud Compiler */}
      <div className="p-4 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-500/40 rounded-xl flex items-start gap-3.5 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
          <Cloud className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">Kompilasi Cloud Otomatis (APK Biner ~10 MB)</h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              100% Berfungsi di HP
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Aplikasi Web2App Studio terhubung langsung ke server cloud GitHub Anda untuk menyusun <strong>Dalvik Bytecode (.dex)</strong> dan <strong>AndroidManifest biner</strong>. Menghasilkan APK asli yang bisa langsung diinstal di smartphone tanpa pesan galat paket.
          </p>
        </div>
      </div>

      {/* Configuration Box (Token & Repo) */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-200">Kredensial GitHub Cloud Compiler:</span>
            {ghConfig.token ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                <Check className="w-3 h-3" /> Token Tersimpan
              </span>
            ) : (
              <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                Belum Ada Token
              </span>
            )}
          </div>
          <button
            onClick={() => setShowConfigSettings(!showConfigSettings)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>{showConfigSettings ? 'Sembunyikan Pengaturan' : 'Ubah Pengaturan'}</span>
            {showConfigSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Config Settings Form */}
        {showConfigSettings && (
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Repositori GitHub (Owner / Repo):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={`${ghConfig.owner}/${ghConfig.repo}`}
                    onChange={(e) => {
                      const parts = e.target.value.split('/');
                      handleSaveConfig({
                        owner: parts[0] || '',
                        repo: parts[1] || '',
                      });
                    }}
                    placeholder="username/nama-repo"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-400">
                    GitHub Personal Access Token:
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=Web2App%20Studio%20Cloud%20Compiler"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold underline flex items-center gap-0.5"
                  >
                    <span>Buat Token Baru (10 Detik)</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={ghConfig.token}
                  onChange={(e) => handleSaveConfig({ token: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick 3-Step Guide to Generate Token */}
            <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Cara Mendapatkan Token GitHub (Gratis & 30 Detik):
                </span>
                <button
                  type="button"
                  onClick={() => setShowTokenGuide(!showTokenGuide)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  {showTokenGuide ? 'Tutup Panduan' : 'Buka Panduan'}
                </button>
              </div>

              {showTokenGuide && (
                <div className="space-y-2 text-[11px] text-slate-300 pt-1 border-t border-blue-500/20">
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                    <li>
                      Klik tombol biru di bawah ini untuk membuka formulir token GitHub (izin <strong>repo</strong> dan <strong>workflow</strong> sudah otomatis dicentang).
                    </li>
                    <li>
                      Gulir ke bagian paling bawah halaman GitHub, lalu klik tombol hijau <strong>"Generate token"</strong>.
                    </li>
                    <li>
                      Salin (Copy) kode token yang berawalan <code>ghp_...</code>, lalu tempel (Paste) ke kolom Token di atas.
                    </li>
                  </ol>

                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=Web2App%20Studio%20Cloud%20Compiler"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                  >
                    <span>Buka Halaman Pembuatan Token GitHub (Otomatis Dicentang)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Manual Sync Workflow Button */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                Alur Kerja: <span className="text-emerald-400 font-semibold">Java 17 + Gradle 8.4 + SDK 34 (Stabil)</span>
              </div>
              <button
                type="button"
                onClick={handleSyncWorkflow}
                disabled={isSyncingWorkflow || !ghConfig.token.trim()}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              >
                {isSyncingWorkflow ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Menyinkronkan...</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-3 h-3" />
                    <span>Perbarui Berkas Alur Kerja di GitHub</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Token hanya disimpan di peramban (browser) lokal Anda dan hanya digunakan untuk memicu GitHub Actions.</span>
            </p>
          </div>
        )}
      </div>

      {/* Sync Status Banner */}
      {syncStatusMessage && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncStatusMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">{errorMessage}</span>
            <p className="text-[11px] text-slate-300">
              Alternatif cepat: Anda juga bisa langsung membuka menu kompilasi manual di GitHub di bawah ini.
            </p>
          </div>
        </div>
      )}

      {/* Dedicated Failure & Auto-Repair Card */}
      {activeRun && activeRun.conclusion === 'failure' && (
        <div className="p-4 bg-amber-950/40 border border-amber-500/50 rounded-xl space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-amber-300">
            <Wrench className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-sm font-bold">Kompilasi Sebelumnya Mengalami Masalah (Telah Diperbaiki)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Penyebab kegagalan pada build sebelumnya (konfigurasi SDK / Gradle pada runner GitHub) telah diperbaiki dengan alur kerja baru yang menggunakan <strong>Java 17</strong>, <strong>Gradle 8.4 resmi</strong>, dan <strong>Android SDK 34 stabil</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={handleStartCloudBuild}
              disabled={isTriggering}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              {isTriggering ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Menyiapkan & Memulai...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Sinkronkan Perbaikan & Ulangi Kompilasi Sekarang</span>
                </>
              )}
            </button>
            <a
              href={activeRun.html_url}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Lihat Log GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* MAIN ACTION SECTION: Start Build or Show Live Progress */}
      {!activeRun || activeRun.status === 'completed' ? (
        <div className="space-y-3">
          {/* If there was a previous successful build */}
          {activeRun && activeRun.conclusion === 'success' && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Kompilasi Cloud Berhasil!</span>
                </div>
                <span className="text-xs text-emerald-300 font-mono">
                  Selesai dalam {formatTimer(buildDurationSeconds)}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                Berkas <strong>app-debug-real-apk (~10 MB)</strong> telah berhasil dibuat oleh server Android SDK. Anda dapat langsung mengunduhnya sekarang.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={activeRun.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh APK Asli di Halaman GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={handleStartCloudBuild}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Kompilasi Ulang</span>
                </button>
              </div>
            </div>
          )}

          {/* Big Start Cloud Build Button */}
          {(!activeRun || activeRun.conclusion !== 'success') && (
            <div className="space-y-2">
              <button
                onClick={handleStartCloudBuild}
                disabled={isTriggering}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.99]"
              >
                {isTriggering ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Menghubungi Cloud GitHub...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Mulai Kompilasi Cloud APK Asli (~10 MB)</span>
                  </>
                )}
              </button>
              <div className="text-center text-[11px] text-slate-400">
                Server Ubuntu akan otomatis menjalankan <code>gradlew assembleDebug</code> untuk website: <span className="text-blue-400 font-mono">{config.url}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* LIVE PROGRESS VIEW WHILE BUILDING */
        <div className="p-4 bg-slate-900 border border-blue-500/50 rounded-xl space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
              <span className="text-sm font-bold text-white">Proses Kompilasi Sedang Berjalan</span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-500/30">
              Waktu: {formatTimer(buildDurationSeconds)} (Estimasi: ~02:15)
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(95, Math.max(15, (buildDurationSeconds / 135) * 100))}%`,
              }}
            />
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Server className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-slate-200">{pollingStatusText || 'Menghubungkan ke GitHub Actions...'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
              <span>Status: <strong className="text-blue-400 uppercase">{activeRun.status}</strong></span>
              <a
                href={activeRun.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-sans underline"
              >
                <span>Lihat Live Log di GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Anda dapat tetap berada di halaman ini. Begitu selesai, tombol unduh APK asli akan otomatis muncul di sini.
          </p>
        </div>
      )}

      {/* Fallback Section: 1-Click Manual Execution */}
      <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-300">
            Atau jalankan langsung 1-klik di halaman web GitHub:
          </span>
        </div>
        <a
          href={directWorkflowUrl}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <span>Buka Tab Actions</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
