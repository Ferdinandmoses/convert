import React from 'react';
import { Smartphone, Sparkles, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onOpenGuide: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenGuide, onReset }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">Web2App</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Konversi URL Web ke APK & AAB Google Play</p>
          </div>
        </div>

        {/* Badges & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target SDK 35 (Android 15)</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Format .AAB & .APK Siap Unggah</span>
          </div>

          <button
            id="btn-open-play-guide"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors border border-slate-700 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Panduan</span> Play Store
          </button>

          <button
            id="btn-reset-config"
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
            title="Reset konfigurasi ke default"
          >
            Reset
          </button>
        </div>
      </div>
    </header>
  );
};
