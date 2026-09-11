import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Copy, 
  Check, 
  Code2, 
  Smartphone, 
  Radio, 
  Sparkles, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  Volume2, 
  Layers, 
  Zap, 
  Globe, 
  Terminal,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { AppConfig, NotificationItem } from '../types';
import { 
  generateGoogleServicesJson, 
  generateFcmPayload, 
  generateNodeJsSnippet, 
  generateCurlSnippet 
} from '../utils/firebaseHelper';

interface PushNotificationGuideProps {
  config: AppConfig;
  onChangeConfig: (newConfig: Partial<AppConfig>) => void;
  onSendTestNotification?: (notification: NotificationItem) => void;
}

export const PushNotificationGuide: React.FC<PushNotificationGuideProps> = ({
  config,
  onChangeConfig,
  onSendTestNotification,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'onesignal' | 'jsbridge' | 'fcm'>('onesignal');
  
  // OneSignal custom state
  const [oneSignalAppId, setOneSignalAppId] = useState('');
  const [copiedOneSignalCode, setCopiedOneSignalCode] = useState(false);

  // JS Bridge test composer state
  const [testTitle, setTestTitle] = useState('🎉 Pesanan Anda Sedang Dikirim!');
  const [testBody, setTestBody] = useState('Kurir sedang menuju alamat Anda. Estimasi tiba dalam 15-20 menit.');
  const [testDeepLink, setTestDeepLink] = useState('');
  const [copiedJsSnippet, setCopiedJsSnippet] = useState(false);
  const [selectedJsScenario, setSelectedJsScenario] = useState<'order' | 'promo' | 'universal' | 'toast'>('order');
  const [sentSimulatorSuccess, setSentSimulatorSuccess] = useState(false);

  // FCM state
  const [snippetType, setSnippetType] = useState<'nodejs' | 'curl' | 'payload'>('nodejs');
  const [copiedGoogleServices, setCopiedGoogleServices] = useState(false);
  const [copiedFcmSnippet, setCopiedFcmSnippet] = useState(false);

  const copyToClipboard = (text: string, type: 'onesignal' | 'js' | 'googleServices' | 'fcm') => {
    navigator.clipboard.writeText(text);
    if (type === 'onesignal') {
      setCopiedOneSignalCode(true);
      setTimeout(() => setCopiedOneSignalCode(false), 2000);
    } else if (type === 'js') {
      setCopiedJsSnippet(true);
      setTimeout(() => setCopiedJsSnippet(false), 2000);
    } else if (type === 'googleServices') {
      setCopiedGoogleServices(true);
      setTimeout(() => setCopiedGoogleServices(false), 2000);
    } else if (type === 'fcm') {
      setCopiedFcmSnippet(true);
      setTimeout(() => setCopiedFcmSnippet(false), 2000);
    }
  };

  const handleSendToSimulator = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testTitle.trim() || !testBody.trim()) return;

    if (onSendTestNotification) {
      onSendTestNotification({
        id: 'js-bridge-' + Date.now(),
        title: testTitle,
        body: testBody,
        timestamp: Date.now(),
        targetUrl: testDeepLink.trim() || config.url,
        read: false,
      });
      setSentSimulatorSuccess(true);
      setTimeout(() => setSentSimulatorSuccess(false), 3000);
    }
  };

  const effectiveAppId = oneSignalAppId.trim() || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

  const oneSignalCodeSnippet = `<!-- 1. Pasang di dalam tag <head> website ${config.appName} -->
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "${effectiveAppId}",
      safari_web_id: "optional",
      notifyButton: {
        enable: true,
        position: 'bottom-right'
      },
      welcomeNotification: {
        title: "Selamat datang di ${config.appName}!",
        message: "Terima kasih telah mengaktifkan notifikasi kami."
      }
    });
  });
</script>`;

  const getJsScenarioCode = () => {
    switch (selectedJsScenario) {
      case 'order':
        return `// Dipanggil saat transaksi checkout berhasil atau update status pesanan
function notifyOrderStatus(orderId, status) {
  if (window.AndroidApp && typeof window.AndroidApp.showNotification === 'function') {
    // Kirim notifikasi native langsung ke Status Bar Android
    window.AndroidApp.showNotification(
      "Status Pesanan #" + orderId,
      "Pesanan Anda saat ini berstatus: " + status,
      "${config.url}/orders/" + orderId // URL yang dibuka saat notifikasi diketuk
    );
  } else if ('Notification' in window && Notification.permission === 'granted') {
    // Fallback untuk browser desktop biasa
    new Notification("Status Pesanan #" + orderId, {
      body: "Pesanan Anda saat ini berstatus: " + status,
      icon: "${config.url}/icon.png"
    });
  }
}

// Contoh pemanggilan:
notifyOrderStatus("TRX-9821", "Sedang Dikirim oleh Kurir");`;

      case 'promo':
        return `// Dipanggil saat ada promo kilat atau penawaran khusus
function notifyFlashSale(promoTitle, discountText) {
  if (window.AndroidApp) {
    window.AndroidApp.showNotification(
      "🔥 " + promoTitle,
      discountText,
      "${config.url}/promo"
    );
    // Opsional: bunyikan toast pop-up di layar
    window.AndroidApp.showToast("Kupon diskon telah disematkan di bar notifikasi Anda!");
  }
}

// Contoh pemanggilan:
notifyFlashSale("Diskon Kilat 50%", "Gunakan kode HEMAT50 sebelum jam 24:00 malam ini!");`;

      case 'toast':
        return `// Menampilkan pesan pop-up Toast asli Android di layar HP
function showNativeToast(pesan) {
  if (window.AndroidApp && typeof window.AndroidApp.showToast === 'function') {
    window.AndroidApp.showToast(pesan);
  } else {
    alert(pesan); // Fallback browser biasa
  }
}

// Contoh pemanggilan:
showNativeToast("Produk berhasil ditambahkan ke keranjang belanja!");`;

      case 'universal':
      default:
        return `/**
 * Wrapper universal notifikasi Web2App
 * Otomatis mendeteksi apakah website sedang dibuka di aplikasi Android APK
 * atau di peramban Chrome/Safari biasa.
 */
function sendAppNotification(title, message, targetUrl = "") {
  // 1. Cek apakah berjalan di dalam aplikasi Android APK Web2App
  if (window.AndroidApp && typeof window.AndroidApp.showNotification === "function") {
    window.AndroidApp.showNotification(title, message, targetUrl);
    return true;
  }

  // 2. Fallback untuk Browser Web Standar (HTML5 Notification API)
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(title, { body: message });
      return true;
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body: message });
        }
      });
    }
  }

  return false;
}

// Cek status aplikasi:
const isInsideApk = !!(window.AndroidApp && window.AndroidApp.isAndroidApp && window.AndroidApp.isAndroidApp());
console.log("Apakah di dalam APK Web2App:", isInsideApk);`;
    }
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

  const googleServicesJson = generateGoogleServicesJson(config);

  return (
    <div className="space-y-6">
      {/* Overview Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-blue-500/10 border border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Pusat Push Notifikasi Android & Web Bridge
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Android 13-15 Ready
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Pilih metode push notifikasi yang paling cocok untuk website Anda. APK Web2App sudah dilengkapi izin sistem <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">POST_NOTIFICATIONS</code> dan jembatan JavaScript <code className="text-blue-300 bg-slate-900 px-1 py-0.5 rounded">window.AndroidApp</code> secara otomatis.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('onesignal')}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
              activeSubTab === 'onesignal'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-400" />
                1. OneSignal (Web Push)
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                Paling Mudah
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Kirim promo dari dashboard OneSignal tanpa ubah APK.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('jsbridge')}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
              activeSubTab === 'jsbridge'
                ? 'bg-blue-500/15 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-blue-400" />
                2. JavaScript Bridge
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                In-App Native
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Picu notifikasi status bar langsung saat tombol web diklik.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('fcm')}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
              activeSubTab === 'fcm'
                ? 'bg-orange-500/15 border-orange-500 text-orange-300 shadow-md shadow-orange-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-orange-400" />
                3. Firebase FCM
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-semibold">
                Server API
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Kirim notifikasi skala besar dari backend Node.js/PHP.
            </span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ONESIGNAL */}
      {activeSubTab === 'onesignal' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Step By Step Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Langkah Cepat Integrasi OneSignal (Web Push)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">1</span>
                  Daftar di OneSignal
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Buka <a href="https://onesignal.com" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5">onesignal.com <ExternalLink className="w-3 h-3" /></a> (Gratis hingga puluhan ribu pelanggan). Buat App baru dan pilih tipe <strong>Web Push</strong>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">2</span>
                  Masukkan URL Website
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Masukkan domain URL situs Anda: <code className="text-blue-400 bg-slate-950 px-1 rounded">{config.url}</code>. Unggah berkas <code className="text-slate-300">OneSignalSDKWorker.js</code> ke root web server Anda.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">3</span>
                  Salin Script ke Website
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Tempelkan baris kode di bawah ke dalam file <code className="text-slate-200">index.html</code> atau header template website Anda (WordPress, Laravel, React, dll).
                </p>
              </div>
            </div>

            {/* App ID Input & Code Generator */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <span>OneSignal App ID Anda:</span>
                  <input
                    type="text"
                    value={oneSignalAppId}
                    onChange={(e) => setOneSignalAppId(e.target.value)}
                    placeholder="Contoh: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500 w-72"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => copyToClipboard(oneSignalCodeSnippet, 'onesignal')}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow"
                >
                  {copiedOneSignalCode ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedOneSignalCode ? 'Tersalin ke Clipboard!' : 'Salin Kode Script'}</span>
                </button>
              </div>

              {/* Code Box */}
              <pre className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono text-amber-200/90 overflow-x-auto leading-relaxed">
                {oneSignalCodeSnippet}
              </pre>
            </div>

            {/* Why it works note */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Mengapa ini bekerja langsung di APK Anda?</strong>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  WebView Android pada APK Web2App mengizinkan ServiceWorker dan permintaan izin Web Push otomatis (<code className="text-emerald-400">onPermissionRequest</code>). Begitu pengguna membuka APK, mereka akan diminta izin notifikasi. Saat Anda kirim pesan dari OneSignal, HP pengguna akan langsung berdering bahkan saat aplikasi sedang tidak dibuka!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: JAVASCRIPT BRIDGE */}
      {activeSubTab === 'jsbridge' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Interactive Scenario Switcher */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  Pemicu Notifikasi dari Kode Website Anda (JavaScript)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Website Anda dapat memanggil fungsi native Android secara langsung melalui objek <code className="text-blue-300 font-mono">window.AndroidApp</code>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(getJsScenarioCode(), 'js')}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow"
              >
                {copiedJsSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJsSnippet ? 'Kode Tersalin!' : 'Salin Contoh Kode'}</span>
              </button>
            </div>

            {/* Scenario Buttons */}
            <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setSelectedJsScenario('order')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedJsScenario === 'order'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                🛒 Status Pesanan / Checkout
              </button>

              <button
                type="button"
                onClick={() => setSelectedJsScenario('promo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedJsScenario === 'promo'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                🔥 Flash Sale & Promo Alert
              </button>

              <button
                type="button"
                onClick={() => setSelectedJsScenario('toast')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedJsScenario === 'toast'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                💬 Native Android Toast Pop-up
              </button>

              <button
                type="button"
                onClick={() => setSelectedJsScenario('universal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedJsScenario === 'universal'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                🌐 Universal Wrapper (APK + Web)
              </button>
            </div>

            {/* Code Display */}
            <pre className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono text-cyan-200/90 overflow-x-auto leading-relaxed max-h-64">
              {getJsScenarioCode()}
            </pre>
          </div>

          {/* Interactive Live Simulator Tester */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-blue-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Uji Notifikasi Langsung di Simulator Android
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Ketik pesan di bawah dan klik kirim untuk menguji simulasi bunyi notifikasi dan banner di layar handphone.
                  </p>
                </div>
              </div>

              {sentSimulatorSuccess && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  Terkirim ke Simulator!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Notifikasi
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="Judul notifikasi..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deep Link URL (Saat Diketuk)
                </label>
                <input
                  type="text"
                  value={testDeepLink}
                  onChange={(e) => setTestDeepLink(e.target.value)}
                  placeholder={config.url + '/promo'}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Isi Pesan
                </label>
                <textarea
                  rows={2}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  placeholder="Isi pesan notifikasi..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleSendToSimulator}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer transform active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Simulasikan Notifikasi di Simulator Ponsel</span>
              </button>

              <span className="text-[11px] text-slate-400">
                Ponsel akan berdering & banner notifikasi muncul di bilah atas simulator (kanan layar).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FIREBASE FCM */}
      {activeSubTab === 'fcm' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Channel and Settings */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-orange-400" />
              Parameter Saluran Notifikasi Android (Channel ID)
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
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
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
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notification Channel ID
                </label>
                <input
                  type="text"
                  value={config.firebase.channelId}
                  onChange={(e) => onChangeConfig({
                    firebase: { ...config.firebase, channelId: e.target.value }
                  })}
                  placeholder="promo_and_updates"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Saluran (Tampil di Pengaturan HP)
                </label>
                <input
                  type="text"
                  value={config.firebase.channelName}
                  onChange={(e) => onChangeConfig({
                    firebase: { ...config.firebase, channelName: e.target.value }
                  })}
                  placeholder="Notifikasi & Promo"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
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
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-orange-600 focus:ring-0"
                />
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-orange-400" />
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
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-orange-600 focus:ring-0"
                />
                <span>Getarkan ponsel</span>
              </label>
            </div>
          </div>

          {/* google-services.json download */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  google-services.json
                </h5>
                <p className="text-[11px] text-slate-400">
                  Otomatis dibundel ke dalam kompilasi APK, AAB, dan source code ZIP.
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

          {/* Server Snippets */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-orange-400" />
                <h5 className="text-xs font-bold text-white">
                  Contoh Kode Kirim Notifikasi dari Server Backend
                </h5>
              </div>

              <button
                type="button"
                onClick={() => {
                  const snippet = snippetType === 'nodejs' 
                    ? generateNodeJsSnippet(config)
                    : snippetType === 'curl'
                    ? generateCurlSnippet(config, testTitle, testBody)
                    : generateFcmPayload(config, testTitle, testBody, testDeepLink);
                  copyToClipboard(snippet, 'fcm');
                }}
                className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                {copiedFcmSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFcmSnippet ? 'Tersalin' : 'Salin Kode'}</span>
              </button>
            </div>

            {/* Snippet Switcher */}
            <div className="flex gap-1.5 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setSnippetType('nodejs')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                  snippetType === 'nodejs' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Node.js (Firebase Admin)
              </button>
              <button
                type="button"
                onClick={() => setSnippetType('curl')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                  snippetType === 'curl' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                cURL (Terminal / Postman)
              </button>
              <button
                type="button"
                onClick={() => setSnippetType('payload')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                  snippetType === 'payload' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                FCM HTTP v1 JSON
              </button>
            </div>

            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56">
              {snippetType === 'nodejs' && generateNodeJsSnippet(config)}
              {snippetType === 'curl' && generateCurlSnippet(config, testTitle, testBody)}
              {snippetType === 'payload' && generateFcmPayload(config, testTitle, testBody, testDeepLink)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
