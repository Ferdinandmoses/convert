import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Palette, 
  Cpu, 
  Key, 
  Check, 
  Copy, 
  RefreshCw, 
  Shield, 
  HelpCircle,
  Camera,
  MapPin,
  FolderOpen,
  Mic,
  Bell,
  RotateCw,
  WifiOff,
  ExternalLink,
  Smartphone,
  Send,
  Download,
  Code2,
  Volume2,
  Sparkles,
  Radio,
  Upload,
  Image as ImageIcon,
  Trash2,
  Shapes,
  Type,
  Grid,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppConfig, ArchitectureType, ScreenOrientation, NotificationItem } from '../types';
import { generateFingerprint, generateAssetLinksJson } from '../utils/cryptoKeystore';
import { 
  generateGoogleServicesJson, 
  generateFcmPayload, 
  generateNodeJsSnippet, 
  generateCurlSnippet 
} from '../utils/firebaseHelper';

interface ConfigTabsProps {
  config: AppConfig;
  onChangeConfig: (newConfig: Partial<AppConfig>) => void;
  onSendTestNotification?: (notification: NotificationItem) => void;
}

export const ICON_CATEGORIES = [
  {
    id: 'all',
    name: 'Semua',
    icon: '✨',
    icons: [
      '🛍️', '🛒', '🏷️', '💳', '🏪', '🏬', '📦', '🎁', '💎', '👔',
      '💼', '📊', '📈', '🏢', '📁', '📝', '📅', '🤝', '💰', '⚖️',
      '📰', '📢', '🎙️', '📹', '📻', '📺', '📸', '🔔', '💬', '🌐',
      '🍔', '🍕', '☕', '🍜', '🍰', '🍹', '🍣', '🥑', '🧁', '🥖',
      '🚀', '💻', '📱', '⚡', '🤖', '⚙️', '🔒', '💡', '🔋', '🔧',
      '📚', '🎓', '🎨', '🏛️', '🌍', '✍️', '🎵', '🎼', '🎬', '🎭',
      '🩺', '💊', '🏥', '❤️', '🩹', '🌿', '🧘', '🍎', '🦷', '🔬',
      '🚗', '✈️', '🏠', '🎮', '🕹️', '🎯', '⚽', '🏆', '🌴', '🛎️'
    ]
  },
  {
    id: 'store',
    name: 'Toko & Belanja',
    icon: '🛍️',
    icons: ['🛍️', '🛒', '🏷️', '💳', '🏪', '🏬', '📦', '🎁', '💎', '👔', '👠', '👜', '💍', '👗', '🎫']
  },
  {
    id: 'business',
    name: 'Bisnis & Kantor',
    icon: '💼',
    icons: ['💼', '📊', '📈', '🏢', '📁', '📝', '📅', '🤝', '💰', '⚖️', '📋', '📇', '📉', '🗂️', '📌']
  },
  {
    id: 'media',
    name: 'Media & Sosial',
    icon: '📰',
    icons: ['📰', '📢', '🎙️', '📹', '📻', '📺', '📸', '🔔', '💬', '🌐', '📡', '✉️', '🗣️', '🎥', '📮']
  },
  {
    id: 'food',
    name: 'Kuliner & Kafe',
    icon: '🍔',
    icons: ['🍔', '🍕', '☕', '🍜', '🍰', '🍹', '🍣', '🥑', '🧁', '🥖', '🍩', '🍦', '🥞', '🥗', '🍷']
  },
  {
    id: 'tech',
    name: 'Teknologi & Dev',
    icon: '🚀',
    icons: ['🚀', '💻', '📱', '⚡', '🤖', '⚙️', '🔒', '💡', '🔋', '🔧', '🌐', '📡', '🖥️', '🛰️', '🕹️']
  },
  {
    id: 'edu',
    name: 'Edukasi & Seni',
    icon: '📚',
    icons: ['📚', '🎓', '🎨', '🏛️', '🌍', '✍️', '🎵', '🎼', '🎬', '🎭', '✏️', '🖌️', '📖', '🎻', '🎷']
  },
  {
    id: 'health',
    name: 'Kesehatan & Medis',
    icon: '🩺',
    icons: ['🩺', '💊', '🏥', '❤️', '🩹', '🌿', '🧘', '🍎', '🦷', '🔬', '🚑', '🌡️', '🧬', '💉', '🧠']
  },
  {
    id: 'lifestyle',
    name: 'Layanan & Hiburan',
    icon: '🚗',
    icons: ['🚗', '✈️', '🏠', '🎮', '🕹️', '🎯', '⚽', '🏆', '🌴', '🛎️', '💈', '🎪', '🚕', '🚢', '🎳']
  },
];

const QUICK_MONOGRAMS = ['TN', 'A', 'B', 'M', 'P', 'S', 'T', 'W', '🔥', '⭐', '⚡', '👑'];

const THEME_COLORS = [
  '#2563EB', // Blue
  '#059669', // Emerald
  '#7C3AED', // Purple
  '#DC2626', // Red
  '#D97706', // Amber
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
  '#BE185D', // Pink
  '#0F172A', // Slate
  '#10B981', // Green
];

export const ConfigTabs: React.FC<ConfigTabsProps> = ({ config, onChangeConfig, onSendTestNotification }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'design' | 'features' | 'keystore' | 'firebase'>('info');
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const [copiedAssetLinks, setCopiedAssetLinks] = useState(false);
  const [copiedGoogleServices, setCopiedGoogleServices] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [snippetType, setSnippetType] = useState<'nodejs' | 'curl' | 'payload'>('nodejs');

  // Icon customization state
  const [selectedIconCategory, setSelectedIconCategory] = useState('all');
  const [iconInputMode, setIconInputMode] = useState<'catalog' | 'custom_text' | 'upload'>('catalog');
  const [customSymbolText, setCustomSymbolText] = useState('');
  const [iconUploadError, setIconUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Push notification composer state
  const [testTitle, setTestTitle] = useState('🎉 Promo Spesial Hari Ini!');
  const [testBody, setTestBody] = useState('Dapatkan diskon potongan harga hingga 50% untuk pesanan pertama Anda.');
  const [testUrl, setTestUrl] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  // Handle Image File Upload for Icon
  const handleIconFileUpload = (file: File) => {
    setIconUploadError(null);
    if (!file.type.startsWith('image/')) {
      setIconUploadError('Silakan pilih berkas gambar (PNG, JPG, atau WEBP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setIconUploadError('Ukuran berkas maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onChangeConfig({
          icon: {
            ...config.icon,
            type: 'uploaded',
            value: dataUrl,
          },
        });
      }
    };
    reader.onerror = () => {
      setIconUploadError('Gagal membaca berkas gambar.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Keystore Regeneration
  const handleRegenerateFingerprint = () => {
    const sha1 = generateFingerprint(config.packageName, config.keystore.alias, 'sha1');
    const sha256 = generateFingerprint(config.packageName, config.keystore.alias, 'sha256');
    onChangeConfig({
      keystore: {
        ...config.keystore,
        sha1,
        sha256,
      },
    });
  };

  const copyToClipboard = (text: string, type: 'fingerprint' | 'assetlinks' | 'googleServices' | 'snippet') => {
    navigator.clipboard.writeText(text);
    if (type === 'fingerprint') {
      setCopiedFingerprint(true);
      setTimeout(() => setCopiedFingerprint(false), 2000);
    } else if (type === 'assetlinks') {
      setCopiedAssetLinks(true);
      setTimeout(() => setCopiedAssetLinks(false), 2000);
    } else if (type === 'googleServices') {
      setCopiedGoogleServices(true);
      setTimeout(() => setCopiedGoogleServices(false), 2000);
    } else if (type === 'snippet') {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  const handleSendPush = () => {
    if (!testTitle.trim() || !testBody.trim()) return;

    const notif: NotificationItem = {
      id: 'test-' + Date.now(),
      title: testTitle,
      body: testBody,
      timestamp: Date.now(),
      targetUrl: testUrl || config.url,
      read: false
    };

    if (onSendTestNotification) {
      onSendTestNotification(notif);
    }

    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  const handleApplyNotificationPreset = (preset: { title: string; body: string }) => {
    setTestTitle(preset.title);
    setTestBody(preset.body);
  };

  const handleDownloadGoogleServices = () => {
    const jsonStr = generateGoogleServicesJson(config);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'google-services.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const assetLinksJson = generateAssetLinksJson(config.packageName, config.keystore.sha256);
  const googleServicesJson = generateGoogleServicesJson(config);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Tab Navigation Header */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'info'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>1. Info & Arsitektur</span>
        </button>

        <button
          onClick={() => setActiveTab('design')}
          className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'design'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>2. Tampilan & Ikon</span>
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'features'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>3. Fitur & Izin Native</span>
        </button>

        <button
          onClick={() => setActiveTab('keystore')}
          className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'keystore'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>4. Keystore & Play Store</span>
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'firebase'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span>5. Firebase Notifikasi</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            FCM
          </span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* TAB 1: INFO & ARSITEKTUR */}
        {activeTab === 'info' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Aplikasi (App Name)
                </label>
                <input
                  type="text"
                  value={config.appName}
                  onChange={(e) => onChangeConfig({ appName: e.target.value })}
                  placeholder="Contoh: Toko Online Saya"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-[11px] text-slate-500 mt-1">Nama yang tampil di layar utama ponsel dan Google Play Store.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Package Name (Application ID)
                </label>
                <input
                  type="text"
                  value={config.packageName}
                  onChange={(e) => onChangeConfig({ packageName: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '') })}
                  placeholder="com.perusahaan.app"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-[11px] text-slate-500 mt-1">Format: <code>com.domain.app</code> (ID unik di Google Play Store).</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Version Name</label>
                <input
                  type="text"
                  value={config.versionName}
                  onChange={(e) => onChangeConfig({ versionName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Version Code</label>
                <input
                  type="number"
                  min="1"
                  value={config.versionCode}
                  onChange={(e) => onChangeConfig({ versionCode: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target SDK</label>
                <div className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-emerald-400 font-mono text-xs sm:text-sm font-semibold flex items-center justify-between">
                  <span>API 35 (Android 15)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Min SDK (Versi Minimum)
                </label>
                <select
                  value={config.minSdk}
                  onChange={(e) => onChangeConfig({ minSdk: parseInt(e.target.value) || 29 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/50 rounded-xl text-emerald-300 font-mono text-xs sm:text-sm focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value={29}>API 29 (Android 10.0+) [Target Utama]</option>
                  <option value={30}>API 30 (Android 11.0+)</option>
                  <option value={31}>API 31 (Android 12.0+)</option>
                  <option value={33}>API 33 (Android 13.0+)</option>
                  <option value={26}>API 26 (Android 8.0+ Oreo)</option>
                  <option value={24}>API 24 (Android 7.0+ Nougat)</option>
                </select>
              </div>
            </div>

            {/* Android 10+ Target & Device Compatibility Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-slate-950 border border-emerald-500/30 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">Target Android 10 Ke Atas Aktif</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                    API {config.minSdk} s/d API 35 (Android 15)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-medium border border-blue-500/30">
                    ~96% Perangkat Aktif
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Aplikasi web Anda dikonfigurasi agar dapat diinstal dan berjalan lancar di smartphone bersistem <strong>Android 10 (Q)</strong>, <strong>Android 11</strong>, <strong>Android 12</strong>, <strong>Android 13</strong>, <strong>Android 14</strong>, hingga <strong>Android 15</strong> versi terbaru Google Play Store.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">✓ Kompatibilitas Legacy & Scoped Storage</span>
                  <span className="flex items-center gap-1">✓ Gesture Navigasi Android 10+</span>
                  <span className="flex items-center gap-1">✓ Dark Theme & Web Hardware Acceleration</span>
                  <span className="flex items-center gap-1">✓ Keamanan Jaringan & Push Notifikasi</span>
                </div>
              </div>
            </div>

            {/* Architecture Selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Pilih Tipe Arsitektur Android
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => onChangeConfig({ architecture: 'webview' })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    config.architecture === 'webview'
                      ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">Enhanced Native WebView</span>
                    {config.architecture === 'webview' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white font-medium">Aktif</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Wrapper native lengkap dengan dukungan file chooser kamera, offline fallback, bridge JavaScript, dan kendali penuh tanpa dependensi browser.
                  </p>
                </div>

                <div
                  onClick={() => onChangeConfig({ architecture: 'twa' })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    config.architecture === 'twa'
                      ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">Trusted Web Activity (TWA)</span>
                    {config.architecture === 'twa' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white font-medium">Aktif</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Standar resmi Google Chrome untuk PWA di Google Play. Menggunakan engine Chrome terbaru dan verifikasi Digital Asset Links tanpa address bar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TAMPILAN & IKON */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* App Icon Studio */}
            <div className="p-4 sm:p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shapes className="w-4 h-4 text-blue-400" />
                    Studio Desain Ikon Aplikasi (App Launcher Icon)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ikon ini akan otomatis diekspor sebagai aset launcher Android nyata (Semua resolusi Mipmap & Adaptive Icon).
                  </p>
                </div>

                {/* Shape Selector */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ icon: { ...config.icon, shape: 'squircle' } })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      config.icon.shape === 'squircle' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Bentuk Kotak Lengkung Modern (Samsung OneUI / Oppo / Xiaomi)"
                  >
                    Squircle
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ icon: { ...config.icon, shape: 'circle' } })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      config.icon.shape === 'circle' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Bentuk Lingkaran Penuh (Google Pixel)"
                  >
                    Lingkaran
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ icon: { ...config.icon, shape: 'rounded' } })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      config.icon.shape === 'rounded' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Bentuk Persegi Rounded Halus"
                  >
                    Rounded
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ icon: { ...config.icon, shape: 'full' } })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      config.icon.shape === 'full' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Bentuk Kotak Penuh"
                  >
                    Kotak
                  </button>
                </div>
              </div>

              {/* Icon Preview & Style Controls */}
              <div className="flex flex-col md:flex-row items-center gap-5 p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
                {/* Visual Icon Live Preview */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div
                    className={`w-20 h-20 shadow-2xl flex items-center justify-center transition-all overflow-hidden border border-white/20 relative ${
                      config.icon.shape === 'circle'
                        ? 'rounded-full'
                        : config.icon.shape === 'squircle'
                        ? 'rounded-[26px]'
                        : config.icon.shape === 'rounded'
                        ? 'rounded-2xl'
                        : 'rounded-md'
                    }`}
                    style={{ backgroundColor: config.icon.bgColor || '#2563EB' }}
                  >
                    {config.icon.type === 'uploaded' && config.icon.value ? (
                      <img
                        src={config.icon.value}
                        alt="Custom Icon"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-4xl select-none">
                        {config.icon.value || config.appName.charAt(0).toUpperCase() || '★'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">192x192 HD</span>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex-1 w-full space-y-3">
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
                    <button
                      type="button"
                      onClick={() => setIconInputMode('catalog')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        iconInputMode === 'catalog'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Katalog Ikon (80+ Emoji)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIconInputMode('custom_text')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        iconInputMode === 'custom_text'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Ketik Simbol / Huruf Sendiri</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIconInputMode('upload')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        iconInputMode === 'upload'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Logo Sendiri (PNG/JPG)</span>
                    </button>
                  </div>

                  {/* MODE 1: CATALOG OF ICONS */}
                  {iconInputMode === 'catalog' && (
                    <div className="space-y-2.5">
                      {/* Category Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        {ICON_CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedIconCategory(cat.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                              selectedIconCategory === cat.id
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold'
                                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-transparent'
                            }`}
                          >
                            <span className="mr-1">{cat.icon}</span>
                            {cat.name}
                          </button>
                        ))}
                      </div>

                      {/* Icon Grid */}
                      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/60">
                        {(ICON_CATEGORIES.find((c) => c.id === selectedIconCategory)?.icons || ICON_CATEGORIES[0].icons).map((emoji, idx) => (
                          <button
                            key={`${emoji}-${idx}`}
                            type="button"
                            onClick={() => onChangeConfig({ icon: { ...config.icon, value: emoji, type: 'emoji' } })}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all cursor-pointer ${
                              config.icon.value === emoji && config.icon.type !== 'uploaded'
                                ? 'bg-blue-600 scale-110 shadow-lg text-white ring-2 ring-blue-400'
                                : 'bg-slate-800/70 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MODE 2: CUSTOM TEXT / MONOGRAM */}
                  {iconInputMode === 'custom_text' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={3}
                          value={customSymbolText}
                          onChange={(e) => {
                            setCustomSymbolText(e.target.value);
                            if (e.target.value.trim()) {
                              onChangeConfig({ icon: { ...config.icon, value: e.target.value.trim(), type: 'emoji' } });
                            }
                          }}
                          placeholder="Ketik 1-3 huruf inisial atau emoji apa saja (cth: TN, A, 🔥)"
                          className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customSymbolText.trim()) {
                              onChangeConfig({ icon: { ...config.icon, value: customSymbolText.trim(), type: 'emoji' } });
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
                        >
                          Terapkan
                        </button>
                      </div>

                      {/* Quick Monogram Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400 mr-1">Inisial Populer:</span>
                        {QUICK_MONOGRAMS.map((mono) => (
                          <button
                            key={mono}
                            type="button"
                            onClick={() => {
                              setCustomSymbolText(mono);
                              onChangeConfig({ icon: { ...config.icon, value: mono, type: 'emoji' } });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/80 transition-colors"
                          >
                            {mono}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MODE 3: UPLOAD LOGO */}
                  {iconInputMode === 'upload' && (
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleIconFileUpload(file);
                        }}
                      />

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleIconFileUpload(file);
                        }}
                        className="p-4 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl bg-slate-950/60 hover:bg-slate-900/60 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors text-center"
                      >
                        <Upload className="w-5 h-5 text-blue-400" />
                        <span className="text-xs font-semibold text-white">
                          Klik atau Seret Berkas Logo ke Sini
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Format PNG transparan, JPG, atau WEBP (Maks 2 MB).
                        </span>
                      </div>

                      {iconUploadError && (
                        <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {iconUploadError}
                        </p>
                      )}

                      {config.icon.type === 'uploaded' && config.icon.value && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            Logo kustom Anda aktif digunakan sebagai ikon APK
                          </span>
                          <button
                            type="button"
                            onClick={() => onChangeConfig({ icon: { ...config.icon, type: 'emoji', value: '🛍️' } })}
                            className="text-slate-400 hover:text-rose-400 flex items-center gap-1 text-[11px] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Background Color & Presets */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Warna Latar Ikon (Background):</span>
                  <input
                    type="color"
                    value={config.icon.bgColor || config.themeColor}
                    onChange={(e) => onChangeConfig({ icon: { ...config.icon, bgColor: e.target.value } })}
                    className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-400">{config.icon.bgColor || config.themeColor}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => onChangeConfig({ 
                        themeColor: color,
                        icon: { ...config.icon, bgColor: color }
                      })}
                      className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                        (config.icon.bgColor || config.themeColor) === color ? 'ring-2 ring-white scale-110 border-white' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Colors & Status Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Warna Tema Aplikasi (Primary Color)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.themeColor}
                    onChange={(e) => onChangeConfig({ 
                      themeColor: e.target.value,
                      icon: { ...config.icon, bgColor: e.target.value }
                    })}
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {THEME_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => onChangeConfig({ 
                          themeColor: color,
                          icon: { ...config.icon, bgColor: color }
                        })}
                        className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110 cursor-pointer"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Warna Android Status Bar
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.statusBarColor}
                    onChange={(e) => onChangeConfig({ statusBarColor: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-400">{config.statusBarColor}</span>
                </div>
              </div>
            </div>

            {/* Screen Orientation */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Orientasi Layar (Screen Orientation)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['portrait', 'landscape', 'unspecified'] as ScreenOrientation[]).map((orient) => (
                  <button
                    key={orient}
                    onClick={() => onChangeConfig({ orientation: orient })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer capitalize ${
                      config.orientation === orient
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {orient === 'portrait' ? 'Potret (Tegak)' : orient === 'landscape' ? 'Lanskap' : 'Otomatis (Sensor)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Splash Screen Settings */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Aktifkan Splash Screen</span>
                <input
                  type="checkbox"
                  checked={config.splash.enabled}
                  onChange={(e) => onChangeConfig({ splash: { ...config.splash, enabled: e.target.checked } })}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {config.splash.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Teks Slogan / Tagline</label>
                    <input
                      type="text"
                      value={config.splash.tagline}
                      onChange={(e) => onChangeConfig({ splash: { ...config.splash, tagline: e.target.value } })}
                      placeholder="Selamat datang di aplikasi kami"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Durasi Splash (Detik)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={config.splash.durationSeconds}
                      onChange={(e) => onChangeConfig({ splash: { ...config.splash, durationSeconds: parseInt(e.target.value) || 2 } })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FITUR & IZIN NATIVE */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Aktifkan fitur native Android yang dibutuhkan website Anda. Semua izin otomatis ditambahkan ke <code>AndroidManifest.xml</code>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Camera */}
              <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={config.permissions.camera}
                  onChange={(e) => onChangeConfig({ permissions: { ...config.permissions, camera: e.target.checked } })}
                  className="mt-0.5 w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>Akses Kamera</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Untuk ambil foto langsung di formulir web atau scan QR code.</p>
                </div>
              </label>

              {/* Storage / File Chooser */}
              <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={config.permissions.storage}
                  onChange={(e) => onChangeConfig({ permissions: { ...config.permissions, storage: e.target.checked } })}
                  className="mt-0.5 w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>Upload Berkas & Galeri</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Mendukung input <code>&lt;input type="file"&gt;</code> untuk upload dokumen atau gambar.</p>
                </div>
              </label>

              {/* Location GPS */}
              <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={config.permissions.location}
                  onChange={(e) => onChangeConfig({ permissions: { ...config.permissions, location: e.target.checked } })}
                  className="mt-0.5 w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>Lokasi GPS (Geolocation)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Mendeteksi lokasi pengguna untuk ongkir, peta, atau fitur pencarian.</p>
                </div>
              </label>

              {/* Push Notifications */}
              <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={config.permissions.notifications}
                  onChange={(e) => onChangeConfig({ permissions: { ...config.permissions, notifications: e.target.checked } })}
                  className="mt-0.5 w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Bell className="w-3.5 h-3.5 text-blue-400" />
                    <span>Izin Notifikasi (Android 13+)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Izin <code>POST_NOTIFICATIONS</code> untuk kirim push notifikasi ke pengguna.</p>
                </div>
              </label>

              {/* Pull to Refresh */}
              <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={config.permissions.pullToRefresh}
                  onChange={(e) => onChangeConfig({ permissions: { ...config.permissions, pullToRefresh: e.target.checked } })}
                  className="mt-0.5 w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tarik untuk Memuat Ulang (Pull-to-Refresh)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pengguna dapat menarik ke bawah layar untuk reload konten terbaru.</p>
                </div>
              </label>

              {/* Offline Cache & Fallback */}
              <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={config.permissions.offlineCache}
                  onChange={(e) => onChangeConfig({ permissions: { ...config.permissions, offlineCache: e.target.checked } })}
                  className="mt-0.5 w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <WifiOff className="w-3.5 h-3.5 text-blue-400" />
                    <span>Halaman Offline Otomatis</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Menampilkan layar cadangan yang ramah saat internet pengguna terputus.</p>
                </div>
              </label>

              {/* External App Links (WhatsApp/Maps) */}
              <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={config.permissions.externalLinks}
                  onChange={(e) => onChangeConfig({ permissions: { ...config.permissions, externalLinks: e.target.checked } })}
                  className="mt-0.5 w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    <span>Dukungan WhatsApp, Tel & Maps</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Membuka tautan <code>wa.me</code>, telepon, dan peta langsung di aplikasi native terkait.</p>
                </div>
              </label>

              {/* Audio Microphone */}
              <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={config.permissions.microphone}
                  onChange={(e) => onChangeConfig({ permissions: { ...config.permissions, microphone: e.target.checked } })}
                  className="mt-0.5 w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Mic className="w-3.5 h-3.5 text-blue-400" />
                    <span>Mikrofon / Voice Input</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Untuk pencarian suara atau pesan suara di web chat.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 4: KEYSTORE & GOOGLE PLAY STORE */}
        {activeTab === 'keystore' && (
          <div className="space-y-5">
            <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-xl flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Kunci Rilis Keystore Otomatis</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Google Play Store mewajibkan setiap berkas AAB/APK ditandatangani secara digital dengan kunci rilis (Release Keystore). Kami telah membuatkan kunci kriptografi ini secara otomatis.
                </p>
              </div>
            </div>

            {/* Keystore Config Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Key Alias</label>
                <input
                  type="text"
                  value={config.keystore.alias}
                  onChange={(e) => onChangeConfig({ keystore: { ...config.keystore, alias: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Keystore Password</label>
                <input
                  type="text"
                  value={config.keystore.storePassword}
                  onChange={(e) => onChangeConfig({ keystore: { ...config.keystore, storePassword: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Masa Berlaku (Tahun)</label>
                <input
                  type="number"
                  value={config.keystore.validityYears}
                  onChange={(e) => onChangeConfig({ keystore: { ...config.keystore, validityYears: parseInt(e.target.value) || 30 } })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* SHA-256 Fingerprint */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  SHA-256 Certificate Fingerprint
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRegenerateFingerprint}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Acak Ulang</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(config.keystore.sha256, 'fingerprint')}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedFingerprint ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedFingerprint ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 break-all select-all">
                {config.keystore.sha256}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Fingerprint ini dipakai untuk Google Play App Signing dan verifikasi Digital Asset Links.
              </p>
            </div>

            {/* assetlinks.json preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  assetlinks.json (Digital Asset Links)
                </label>
                <button
                  onClick={() => copyToClipboard(assetLinksJson, 'assetlinks')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedAssetLinks ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAssetLinks ? 'Tersalin' : 'Salin JSON'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto">
                {assetLinksJson}
              </pre>
              <p className="text-[11px] text-slate-500 mt-1">
                Unggah file ini ke: <code>https://domain-anda.com/.well-known/assetlinks.json</code> agar aplikasi berjalan tanpa bilah alamat browser.
              </p>
            </div>

            {/* Google Play Listing Text */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white">Informasi Listing Google Play Store</h4>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Deskripsi Singkat (Maks 80 karakter)</label>
                <input
                  type="text"
                  maxLength={80}
                  value={config.playStore.shortDesc}
                  onChange={(e) => onChangeConfig({ playStore: { ...config.playStore, shortDesc: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">URL Kebijakan Privasi (Privacy Policy)</label>
                <input
                  type="url"
                  value={config.playStore.privacyPolicyUrl}
                  onChange={(e) => onChangeConfig({ playStore: { ...config.playStore, privacyPolicyUrl: e.target.value } })}
                  placeholder="https://domain-anda.com/privacy-policy"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">Wajib dicantumkan saat upload ke Google Play Console.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FIREBASE PUSH NOTIFIKASI */}
        {activeTab === 'firebase' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Activation Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Firebase Cloud Messaging (FCM)
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                      SDK 35 Ready
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Memungkinkan website Anda mengirimkan pesan push notifikasi langsung ke status bar smartphone Android pelanggan secara real-time.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={config.firebase.enabled}
                  onChange={(e) => onChangeConfig({
                    firebase: { ...config.firebase, enabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                <span className="ml-2 text-xs font-semibold text-slate-200">
                  {config.firebase.enabled ? 'Aktif' : 'Nonaktif'}
                </span>
              </label>
            </div>

            {/* EDUCATIONAL PUSH NOTIFICATION GUIDE & STATUS */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Panduan: Apakah Push Notifikasi Langsung Aktif Saat Aplikasi Jadi?
                </h4>
              </div>

              {/* Status Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Di Dalam Kode APK: 100% SUDAH AKTIF</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Aplikasi yang dibuat Web2App sudah otomatis menyertakan library resmi Firebase Cloud Messaging, izin sistem Android 13-15 (<code>POST_NOTIFICATIONS</code>), Notification Channel, dan Service background penerima pesan. Begitu pengguna memasang APK di HP, aplikasi langsung siap menerima notifikasi.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>Di Sisi Pengirim (Cloud): Butuh Akun Firebase (Gratis)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Sistem keamanan Google Play mewajibkan setiap aplikasi terdaftar di Firebase Console pribadi milik Anda. Hal ini untuk memastikan hanya Anda sebagai pemilik resmi yang dapat mengirimkan notifikasi kepada para pengguna (mencegah spam ilegal).
                  </p>
                </div>
              </div>

              {/* 3 Step Workflow */}
              <div className="pt-2 border-t border-slate-800">
                <span className="block text-xs font-bold text-white mb-2.5">
                  🚀 3 Langkah Praktis Mengirim Notifikasi ke Semua HP Pengguna:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-400 block text-[11px]">1. Daftar Firebase (Gratis)</span>
                    <p className="text-[11px] text-slate-400">
                      Buka <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">console.firebase.google.com</a>, buat proyek baru, lalu masukkan <code>Project ID</code> & <code>Sender ID</code> Anda ke formulir di bawah.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="font-bold text-blue-400 block text-[11px]">2. Pasang APK di HP</span>
                    <p className="text-[11px] text-slate-400">
                      Instal APK hasil kompilasi di smartphone Android. Saat dibuka pertama kali, sistem Android akan meminta izin notifikasi dan HP otomatis terdaftar.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400 block text-[11px]">3. Kirim Pesan Kapan Saja</span>
                    <p className="text-[11px] text-slate-400">
                      Kirim langsung dari dashboard Firebase menu <b>Messaging &gt; New Campaign</b> tanpa koding, atau otomatis dari backend website via script di bawah.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE TESTER & SENDER COMPOSER */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Uji Coba Push Notifikasi (Kirim ke Ponsel)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">Muncul di Status Bar HP Simulator</span>
              </div>

              {/* Preset Quick Chips */}
              <div>
                <span className="block text-[11px] text-slate-400 mb-1.5">Pilih Template Cepat:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyNotificationPreset({
                      title: '🔥 Flash Sale 50% Dimulai!',
                      body: 'Kupon PROMO50 siap digunakan hari ini. Buruan belanja sebelum kehabisan!'
                    })}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    🛍️ Promo Diskon
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyNotificationPreset({
                      title: '📦 Pesanan Anda Dalam Pengiriman',
                      body: 'Kurir sedang menuju ke alamat Anda. Estimasi tiba dalam 45 menit.'
                    })}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    📦 Status Pengiriman
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyNotificationPreset({
                      title: '💬 Pesan Baru dari Layanan Pelanggan',
                      body: 'Pertanyaan produk Anda telah dibalas. Tap untuk membaca balasan.'
                    })}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    💬 Chat CS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyNotificationPreset({
                      title: '⭐ Pembaruan Fitur Baru Tersedia',
                      body: 'Nikmati navigasi yang lebih cepat dan pembayaran otomatis di versi terbaru!'
                    })}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    ⭐ Info Fitur
                  </button>
                </div>
              </div>

              {/* Form Input Tester */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Judul Notifikasi (Title)
                  </label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    placeholder="Contoh: Diskon Kilat 50% Hari Ini"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Isi Pesan Notifikasi (Body Text)
                  </label>
                  <textarea
                    rows={2}
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                    placeholder="Isi pesan notifikasi yang akan dibaca pengguna pada bar handphone..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Deep Link URL (Saat Notifikasi Di-tap)
                  </label>
                  <input
                    type="url"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder={config.url + '/promo'}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Kosongkan untuk membuka beranda web utama saat pengguna mengetuk notifikasi.</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSendPush}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Notifikasi ke Bar Handphone</span>
                </button>

                {sentSuccess && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-in fade-in">
                    <Check className="w-4 h-4" />
                    <span>Notifikasi berhasil muncul di simulator ponsel!</span>
                  </div>
                )}
              </div>
            </div>

            {/* FIREBASE CREDENTIALS & NOTIFICATION CHANNEL */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                Konfigurasi Proyek Firebase (FCM)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Firebase Project ID
                  </label>
                  <input
                    type="text"
                    value={config.firebase.projectId}
                    onChange={(e) => onChangeConfig({
                      firebase: { ...config.firebase, projectId: e.target.value }
                    })}
                    placeholder="contoh-app-fcm"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sender ID (Project Number)
                  </label>
                  <input
                    type="text"
                    value={config.firebase.messagingSenderId}
                    onChange={(e) => onChangeConfig({
                      firebase: { ...config.firebase, messagingSenderId: e.target.value }
                    })}
                    placeholder="982347102938"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Notification Channel ID (Android 8.0 - 15)
                  </label>
                  <input
                    type="text"
                    value={config.firebase.channelId}
                    onChange={(e) => onChangeConfig({
                      firebase: { ...config.firebase, channelId: e.target.value }
                    })}
                    placeholder="promo_and_updates"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">ID saluran notifikasi Android resmi.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Saluran Notifikasi (Channel Name)
                  </label>
                  <input
                    type="text"
                    value={config.firebase.channelName}
                    onChange={(e) => onChangeConfig({
                      firebase: { ...config.firebase, channelName: e.target.value }
                    })}
                    placeholder="Notifikasi & Promo"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">Nama yang tampil di menu Pengaturan Aplikasi pengguna.</p>
                </div>
              </div>

              {/* Checkboxes: Sound & Vibration */}
              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.firebase.soundEnabled}
                    onChange={(e) => onChangeConfig({
                      firebase: { ...config.firebase, soundEnabled: e.target.checked }
                    })}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                    Bunyikan suara saat notifikasi masuk
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.firebase.vibrateEnabled}
                    onChange={(e) => onChangeConfig({
                      firebase: { ...config.firebase, vibrateEnabled: e.target.checked }
                    })}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Getarkan ponsel</span>
                </label>
              </div>
            </div>

            {/* GOOGLE-SERVICES.JSON & DOWNLOAD */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-400" />
                    Berkas Konfigurasi: google-services.json
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Otomatis dibundel ke dalam file .AAB, .APK, dan Project Source Code ZIP.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadGoogleServices}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(googleServicesJson, 'googleServices')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedGoogleServices ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedGoogleServices ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto border border-slate-800">
                {googleServicesJson}
              </pre>
            </div>

            {/* BACKEND SERVER CODE SNIPPETS */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  <h5 className="text-xs font-bold text-white">
                    Cara Kirim Notifikasi dari Backend Website Anda
                  </h5>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const snippet = snippetType === 'nodejs' 
                      ? generateNodeJsSnippet(config)
                      : snippetType === 'curl'
                      ? generateCurlSnippet(config, testTitle, testBody)
                      : generateFcmPayload(config, testTitle, testBody, testUrl);
                    copyToClipboard(snippet, 'snippet');
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet ? 'Tersalin' : 'Salin Kode'}</span>
                </button>
              </div>

              {/* Snippet Switcher */}
              <div className="flex gap-1.5 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setSnippetType('nodejs')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                    snippetType === 'nodejs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Node.js (Firebase Admin)
                </button>
                <button
                  type="button"
                  onClick={() => setSnippetType('curl')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                    snippetType === 'curl' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  cURL (Terminal / Postman)
                </button>
                <button
                  type="button"
                  onClick={() => setSnippetType('payload')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                    snippetType === 'payload' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  FCM HTTP v1 JSON
                </button>
              </div>

              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56">
                {snippetType === 'nodejs' && generateNodeJsSnippet(config)}
                {snippetType === 'curl' && generateCurlSnippet(config, testTitle, testBody)}
                {snippetType === 'payload' && generateFcmPayload(config, testTitle, testBody, testUrl)}
              </pre>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
