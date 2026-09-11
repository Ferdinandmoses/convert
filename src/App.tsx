/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Rocket, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  Smartphone, 
  HelpCircle,
  FileCheck2,
  Sparkles,
  Layers,
  Code2,
  Lock
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { UrlInputSection } from './components/UrlInputSection';
import { ConfigTabs } from './components/ConfigTabs';
import { DeviceSimulator } from './components/DeviceSimulator';
import { BuildModal } from './components/BuildModal';
import { PlayStoreGuideModal } from './components/PlayStoreGuideModal';
import { AppConfig, NotificationItem } from './types';
import { getInitialAppConfig, DEMO_PRESETS, PresetItem } from './data/defaults';

export default function App() {
  const [config, setConfig] = useState<AppConfig>(() => getInitialAppConfig());
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [incomingNotification, setIncomingNotification] = useState<NotificationItem | null>(null);

  // Handle configuration updates
  const handleChangeConfig = (newConfig: Partial<AppConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...newConfig,
    }));
  };

  // Apply Preset
  const handleApplyPreset = (preset: PresetItem) => {
    setConfig((prev) => ({
      ...prev,
      url: preset.url,
      appName: preset.appName,
      packageName: preset.packageName,
      themeColor: preset.themeColor,
      statusBarColor: preset.themeColor,
      icon: {
        ...prev.icon,
        value: preset.iconEmoji,
        bgColor: preset.iconBg,
      },
    }));
  };

  // Reset Configuration
  const handleReset = () => {
    setConfig(getInitialAppConfig());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar 
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onReset={handleReset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* URL Input & Inspector Section */}
        <UrlInputSection
          config={config}
          onChangeConfig={handleChangeConfig}
          onApplyPreset={handleApplyPreset}
        />

        {/* Studio Workspace: Config on Left, Device Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Configuration Panels & Generator CTA (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Quick Summary Pill Bar */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Target Aplikasi:</span>
                <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  {config.appName}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
                <span className="text-blue-400 font-semibold">{config.packageName}</span>
                <span className="text-slate-500">•</span>
                <span>v{config.versionName} ({config.versionCode})</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-bold uppercase">{config.architecture}</span>
              </div>
            </div>

            {/* Comprehensive Configuration Tabs */}
            <ConfigTabs
              config={config}
              onChangeConfig={handleChangeConfig}
              onSendTestNotification={(notif) => setIncomingNotification(notif)}
            />

            {/* Primary Action Button: Generate APK & AAB */}
            <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-blue-400" />
                    Siap Membuat Berkas APK & AAB?
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Kompilasi otomatis ke format Android App Bundle (.AAB) resmi Google Play, Universal APK & Firebase Cloud Messaging.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-semibold border border-blue-500/30 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    Android 10+ (API {config.minSdk}-35)
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Target SDK 35
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-semibold border border-amber-500/30 flex items-center gap-1">
                    FCM Push Ready
                  </span>
                </div>
              </div>

              {/* Big CTA Button */}
              <button
                id="btn-generate-apk-aab"
                onClick={() => setIsBuildModalOpen(true)}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 transition-all transform active:scale-[0.99] cursor-pointer"
              >
                <Rocket className="w-5 h-5 animate-pulse" />
                <span>Mulai Konversi & Buat APK / AAB Otomatis</span>
              </button>

              {/* Security & Play Store Compliance Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Format .AAB Play Store</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Signed Keystore Aktif</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Firebase Push (FCM)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>AssetLinks.json TWA</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Android Device Simulator & Play Store Checklist (5 cols) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col items-center">
            
            {/* Live Android Smartphone Simulator */}
            <DeviceSimulator 
              config={config} 
              incomingNotification={incomingNotification}
              onClearNotification={() => setIncomingNotification(null)}
            />

            {/* Google Play Store Readiness Checklist */}
            <div className="w-full max-w-[340px] bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  Kepatuhan Google Play Store
                </h4>
                <button
                  onClick={() => setIsGuideModalOpen(true)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                >
                  Lihat Panduan
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Format Berkas
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400 font-semibold">.AAB (Lolos)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Target API Level
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400 font-semibold">API 35 (Android 15)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Kompatibilitas Ponsel
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400 font-semibold">Android 10+ (API {config.minSdk}-35)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Keystore Kriptografi
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400 font-semibold">SHA-256 Valid</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Keamanan Jaringan
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400 font-semibold">HTTPS Enforced</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Web2App Studio</span>
            <span>•</span>
            <span>Konversi URL Web ke APK & AAB Android Otomatis</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Google Play Console Ready</span>
            <span>Target SDK 35</span>
            <span>Android 15 Compliant</span>
          </div>
        </div>
      </footer>

      {/* Interactive Build Pipeline & Download Modal */}
      <BuildModal
        isOpen={isBuildModalOpen}
        onClose={() => setIsBuildModalOpen(false)}
        config={config}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Step-by-Step Google Play Console Guide Modal */}
      <PlayStoreGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
