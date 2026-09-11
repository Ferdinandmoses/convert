import React, { useState } from 'react';
import { Globe, ArrowRight, ShieldCheck, Sparkles, Check, AlertCircle } from 'lucide-react';
import { DEMO_PRESETS, PresetItem, urlToPackageName } from '../data/defaults';
import { AppConfig } from '../types';

interface UrlInputSectionProps {
  config: AppConfig;
  onChangeConfig: (newConfig: Partial<AppConfig>) => void;
  onApplyPreset: (preset: PresetItem) => void;
}

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  config,
  onChangeConfig,
  onApplyPreset,
}) => {
  const [inputUrl, setInputUrl] = useState(config.url);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedSuccess, setAnalyzedSuccess] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    let cleanUrl = inputUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
      setInputUrl(cleanUrl);
    }

    setTimeout(() => {
      const { packageName, appName } = urlToPackageName(cleanUrl);
      onChangeConfig({
        url: cleanUrl,
        appName: config.appName === 'Toko Online Store' || !config.appName ? appName : config.appName,
        packageName,
      });
      setIsAnalyzing(false);
      setAnalyzedSuccess(true);
      setTimeout(() => setAnalyzedSuccess(false), 3000);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  const isHttps = config.url.startsWith('https://');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Masukkan URL Website yang Ingin Dikonversi
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Ubah website Anda menjadi aplikasi Android Native & AAB resmi untuk Google Play Store
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {isHttps ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                HTTPS Aman (Syarat Google Play)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5" />
                Gunakan HTTPS untuk rilis Play Store
              </span>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="text-xs font-mono font-bold text-blue-400">URL</span>
            </div>
            <input
              id="input-website-url"
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://website-anda.com"
              className="w-full pl-14 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base font-mono transition-all"
            />
          </div>

          <button
            id="btn-analyze-url"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputUrl}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : analyzedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>URL Diterapkan</span>
              </>
            ) : (
              <>
                <span>Analisis & Terapkan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Quick Demo Presets */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Coba Contoh URL:
          </span>
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setInputUrl(preset.url);
                onApplyPreset(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white text-xs border border-slate-700/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{preset.iconEmoji}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
