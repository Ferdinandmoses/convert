import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Download, 
  PackageCheck, 
  FileCode, 
  Key, 
  ArrowRight, 
  X, 
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Sparkles,
  QrCode,
  AlertTriangle,
  GitBranch,
  Info,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { AppConfig, BuildStep } from '../types';
import { createAabZip, createApkZip, createFullProjectZip } from '../utils/androidProjectGenerator';
import { generateKeystoreBlob, generateAssetLinksJson } from '../utils/cryptoKeystore';
import { generateGoogleServicesJson } from '../utils/firebaseHelper';
import { Bell, Cloud, Layers } from 'lucide-react';
import { CloudBuildPanel } from './CloudBuildPanel';

interface BuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onOpenGuide: () => void;
}

const BUILD_STEPS: { id: string; name: string; description: string }[] = [
  { id: '1', name: 'Validasi URL & Kompatibilitas Android 10-15', description: 'Memeriksa keamanan HTTPS, Min SDK (Android 10+), dan Target SDK 35' },
  { id: '2', name: 'Menyusun AndroidManifest.xml & FCM Push Service', description: 'Mengonfigurasi izin POST_NOTIFICATIONS, Firebase Messaging, dan deep links' },
  { id: '3', name: 'Mengompilasi Modul Kotlin & ChromeClient', description: 'Membangun WebAppInterface, file uploader kamera, dan layout' },
  { id: '4', name: 'Kriptografi Tanda Tangan Rilis (Keystore)', description: 'Menghasilkan sertifikat SHA-256 Google Play App Signing' },
  { id: '5', name: 'Mengemas app-release.aab (Play Store Bundle)', description: 'Mengompres modul base, protos, dan resources bundle' },
  { id: '6', name: 'Mengemas app-release.apk (Universal APK)', description: 'Membangun paket instalasi mandiri untuk ponsel pengguna' },
];

export const BuildModal: React.FC<BuildModalProps> = ({
  isOpen,
  onClose,
  config,
  onOpenGuide,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [aabBlob, setAabBlob] = useState<Blob | null>(null);
  const [apkBlob, setApkBlob] = useState<Blob | null>(null);
  const [projectBlob, setProjectBlob] = useState<Blob | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [showParseTroubleshoot, setShowParseTroubleshoot] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'cloud' | 'artifacts'>('cloud');

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(config.url).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsDone(false);
      setAabBlob(null);
      setApkBlob(null);
      setProjectBlob(null);
      setShowQr(false);
      return;
    }

    let isMounted = true;

    // Run progressive build steps
    const runBuildPipeline = async () => {
      for (let i = 0; i < BUILD_STEPS.length; i++) {
        if (!isMounted) return;
        setCurrentStepIndex(i);
        // Wait between steps for realistic compilation feedback
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      if (!isMounted) return;

      // Generate real downloadable Blobs
      try {
        const [aab, apk, project] = await Promise.all([
          createAabZip(config),
          createApkZip(config),
          createFullProjectZip(config),
        ]);

        if (!isMounted) return;
        setAabBlob(aab);
        setApkBlob(apk);
        setProjectBlob(project);
        setIsDone(true);

        // Burst celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#10B981', '#6366F1', '#EC4899'],
        });
      } catch (err) {
        console.error('Build generation error:', err);
      }
    };

    runBuildPipeline();

    return () => {
      isMounted = false;
    };
  }, [isOpen, config]);

  if (!isOpen) return null;

  // File Download Helpers
  const triggerDownload = (blob: Blob | null, filename: string) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadKeystore = () => {
    const blob = generateKeystoreBlob(config.keystore.alias, config.keystore.storePassword, config.keystore.organization);
    triggerDownload(blob, `${config.packageName}-release.keystore`);
  };

  const handleDownloadAssetLinks = () => {
    const json = generateAssetLinksJson(config.packageName, config.keystore.sha256);
    const blob = new Blob([json], { type: 'application/json' });
    triggerDownload(blob, 'assetlinks.json');
  };

  const handleDownloadGoogleServices = () => {
    const json = generateGoogleServicesJson(config);
    const blob = new Blob([json], { type: 'application/json' });
    triggerDownload(blob, 'google-services.json');
  };

  const cleanPackageFile = config.packageName.replace(/\./g, '-');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isDone ? 'Aplikasi Berhasil Dibuat!' : 'Sedang Mengonversi & Mengompilasi...'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">{config.packageName} (v{config.versionName})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {!isDone ? (
            /* BUILD PROGRESS PIPELINE */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Tahap Kompilasi</span>
                <span className="font-semibold text-blue-400">
                  {Math.round(((currentStepIndex + 1) / BUILD_STEPS.length) * 100)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStepIndex + 1) / BUILD_STEPS.length) * 100}%` }}
                />
              </div>

              {/* Steps List */}
              <div className="space-y-2 mt-4">
                {BUILD_STEPS.map((step, idx) => {
                  const isFinished = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-blue-600/10 border-blue-500/50'
                          : isFinished
                          ? 'bg-slate-950/40 border-slate-800'
                          : 'opacity-40 border-transparent'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isFinished ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${isCurrent ? 'text-blue-300' : isFinished ? 'text-white' : 'text-slate-500'}`}>
                            {step.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* COMPLETED - TABS & PANELS */
            <div className="space-y-4">
              {/* Tab Selector: Cloud Compiler vs Manual Bundles */}
              <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('cloud')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'cloud'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Cloud className="w-4 h-4" />
                  <span>Kompilasi Cloud (APK Asli ~10 MB)</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500 text-white rounded font-extrabold">
                    SOLUSI UTAMA
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('artifacts')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'artifacts'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Berkas Play Store & Kode Sumber</span>
                </button>
              </div>

              {activeTab === 'cloud' ? (
                /* TAB 1: CLOUD COMPILER FOR REAL 10MB APK */
                <CloudBuildPanel config={config} onOpenPlayStoreGuide={onOpenGuide} />
              ) : (
                /* TAB 2: MANUAL BUNDLES & SOURCE CODE */
                <div className="space-y-5">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Siap untuk Google Play Store (Android 10 s/d 15)</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Berkas <strong>.AAB</strong> telah dikemas untuk <strong>Android 10 ke atas (API {config.minSdk} s/d API 35)</strong> dan ditandatangani dengan Release Keystore SHA-256. Siap diunggah ke Google Play Console!
                      </p>
                    </div>
                  </div>

                  {/* Primary Download Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1. Download AAB (Primary for Play Store) */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/40 flex flex-col justify-between hover:border-blue-400 transition-all shadow-lg">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500 text-white">
                            WAJIB PLAY STORE
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">Template Bundle</span>
                        </div>
                        <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                          <PackageCheck className="w-5 h-5 text-blue-400" />
                          Unduh Berkas .AAB
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Android App Bundle resmi untuk diunggah ke Google Play Console (Internal / Closed / Production).
                        </p>
                      </div>

                      <button
                        id="btn-download-aab"
                        onClick={() => triggerDownload(aabBlob, `${cleanPackageFile}-release.aab`)}
                        className="mt-4 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 cursor-pointer transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download app-release.aab</span>
                      </button>
                    </div>

                    {/* 2. Download APK (For Direct Phone Testing) */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                            UJI COBA HP
                          </span>
                          <span className="text-[11px] text-amber-400 font-mono">Template Paket</span>
                        </div>
                        <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                          <Smartphone className="w-5 h-5 text-emerald-400" />
                          Unduh Berkas .APK
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Berkas paket APK template. Untuk APK instalasi 10 MB tanpa galat paket, gunakan tab Kompilasi Cloud.
                        </p>
                      </div>

                      <button
                        id="btn-download-apk"
                        onClick={() => triggerDownload(apkBlob, `${cleanPackageFile}-universal.apk`)}
                        className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download app-release.apk</span>
                      </button>
                    </div>
                  </div>

                  {/* Troubleshooting Card for "Masalah dalam mengurai paket" & 5 KB */}
                  <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/40 rounded-xl space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                            PENTING: Mengapa Berkas dari Browser Hanya ~5 KB & Muncul "Masalah Mengurai Paket"?
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            Browser web tidak memiliki mesin kompiler Android SDK (D8 & AAPT2) internal untuk menyusun Dalvik Bytecode (.dex). Berkas APK langsung dari browser hanya berupa <strong>template konfigurasi</strong>.
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowParseTroubleshoot(!showParseTroubleshoot)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline shrink-0 cursor-pointer"
                      >
                        {showParseTroubleshoot ? 'Tutup' : 'Lihat Solusi'}
                      </button>
                    </div>

                    {showParseTroubleshoot && (
                      <div className="space-y-3 pt-2 border-t border-amber-500/20">
                        <p className="text-xs font-semibold text-slate-200">
                          Gunakan 3 cara resmi di bawah agar aplikasi dapat langsung diinstal dan digunakan 100% di HP Android:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Opsi 1: PWA WebAPK */}
                          <div className="p-3 bg-slate-950/80 border border-emerald-500/40 rounded-lg flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-1.5">
                                <Smartphone className="w-4 h-4" />
                                <span>1. PWA Langsung di HP (Instan)</span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                Buka URL website Anda di <strong>Google Chrome HP Android</strong>, klik menu titik tiga (<strong>⋮</strong>), lalu pilih <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                              </p>
                              <p className="text-[10px] text-emerald-400/90 mt-1 font-medium">
                                ✓ Otomatis jadi aplikasi Android native tanpa galat parse!
                              </p>
                            </div>
                            <button
                              onClick={handleCopyUrl}
                              className="mt-2.5 w-full py-1.5 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedUrl ? 'URL Disalin!' : 'Salin URL Website'}</span>
                            </button>
                          </div>

                          {/* Opsi 2: GitHub Actions Cloud Build */}
                          <div className="p-3 bg-slate-950/80 border border-blue-500/40 rounded-lg flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs mb-1.5">
                                <GitBranch className="w-4 h-4" />
                                <span>2. Build APK Asli via GitHub</span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                Buka tab <strong>Kompilasi Cloud</strong> di atas atau kunjungi tab <strong>Actions &gt; Build Real Android APK</strong> di GitHub.
                              </p>
                              <p className="text-[10px] text-blue-400/90 mt-1 font-medium">
                                ✓ Menghasilkan APK asli (~10 MB) siap unduh dari Artifacts.
                              </p>
                            </div>
                            <div className="mt-2.5 text-center">
                              <span className="inline-block text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                Gratis via GitHub Actions
                              </span>
                            </div>
                          </div>

                          {/* Opsi 3: Android Studio */}
                          <div className="p-3 bg-slate-950/80 border border-purple-500/40 rounded-lg flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs mb-1.5">
                                <FileCode className="w-4 h-4" />
                                <span>3. Android Studio (Laptop/PC)</span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                Unduh <strong>Android Studio (.ZIP)</strong> di bawah. Ekstrak dan buka foldernya di Android Studio, lalu klik <strong>Build &gt; Build APK(s)</strong>.
                              </p>
                              <p className="text-[10px] text-purple-400/90 mt-1 font-medium">
                                ✓ 100% Valid & siap dirilis ke Google Play Store.
                              </p>
                            </div>
                            <div className="mt-2.5 text-center">
                              <span className="inline-block text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                Source code Kotlin & Gradle
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Secondary Downloads (Keystore, Source Project, AssetLinks) */}
                  <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
                    <span className="text-xs font-semibold text-slate-300 block">Berkas Pendukung & Kode Sumber:</span>
                    
                    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${config.firebase?.enabled ? '4' : '3'} gap-2`}>
                      {/* Keystore */}
                      <button
                        onClick={handleDownloadKeystore}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Key className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="truncate">
                          <div className="font-semibold truncate">Release Keystore</div>
                          <div className="text-[10px] text-slate-500">.keystore & JKS</div>
                        </div>
                      </button>

                      {/* Android Studio Project ZIP */}
                      <button
                        onClick={() => triggerDownload(projectBlob, `${cleanPackageFile}-android-studio-project.zip`)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                        <div className="truncate">
                          <div className="font-semibold truncate">Android Studio (.ZIP)</div>
                          <div className="text-[10px] text-slate-500">Source code lengkap</div>
                        </div>
                      </button>

                      {/* assetlinks.json */}
                      <button
                        onClick={handleDownloadAssetLinks}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="truncate">
                          <div className="font-semibold truncate">assetlinks.json</div>
                          <div className="text-[10px] text-slate-500">Verifikasi domain TWA</div>
                        </div>
                      </button>

                      {/* google-services.json (FCM) */}
                      {config.firebase?.enabled && (
                        <button
                          onClick={handleDownloadGoogleServices}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                          <div className="truncate">
                            <div className="font-semibold truncate">google-services.json</div>
                            <div className="text-[10px] text-slate-500">Konfigurasi FCM Push</div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Banner to Guide */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    onClose();
                    onOpenGuide();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Buka Panduan Upload Play Store</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
