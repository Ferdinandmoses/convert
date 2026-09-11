import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  RotateCcw, 
  Smartphone, 
  Layers, 
  WifiOff, 
  ExternalLink,
  ChevronLeft,
  Square,
  Circle,
  Play,
  Bell,
  X,
  Send,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { AppConfig, NotificationItem } from '../types';
import { playNotificationSound } from '../utils/notificationSound';

interface DeviceSimulatorProps {
  config: AppConfig;
  incomingNotification?: NotificationItem | null;
  onClearNotification?: () => void;
  onSendQuickTestNotification?: () => void;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ 
  config, 
  incomingNotification,
  onClearNotification,
  onSendQuickTestNotification
}) => {
  const [viewMode, setViewMode] = useState<'app' | 'splash' | 'offline'>('app');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<NotificationItem[]>([
    {
      id: 'init-1',
      title: 'Selamat Datang di ' + config.appName,
      body: 'Aplikasi terhubung dengan Firebase Cloud Messaging (FCM).',
      timestamp: Date.now() - 1000 * 60 * 5,
      read: false
    }
  ]);
  const [isShadeOpen, setIsShadeOpen] = useState(false);

  // Watch for new incoming notifications from props or quick test
  useEffect(() => {
    if (incomingNotification) {
      setCurrentNotification(incomingNotification);
      setNotificationHistory((prev) => [incomingNotification, ...prev.slice(0, 8)]);
      if (config.firebase.soundEnabled) {
        playNotificationSound();
      }

      // Auto dismiss heads-up banner after 6 seconds
      const timer = setTimeout(() => {
        setCurrentNotification(null);
        if (onClearNotification) onClearNotification();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [incomingNotification, config.firebase.soundEnabled, onClearNotification]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIframeKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  const handleTriggerQuickPush = () => {
    const newNotif: NotificationItem = {
      id: 'quick-' + Date.now(),
      title: '🎉 Promo Kilat Hari Ini!',
      body: 'Kupon diskon 50% siap dipakai di ' + config.appName + '. Tap untuk buka sekarang!',
      timestamp: Date.now(),
      targetUrl: config.url,
      read: false
    };
    setCurrentNotification(newNotif);
    setNotificationHistory((prev) => [newNotif, ...prev.slice(0, 8)]);
    if (config.firebase.soundEnabled) {
      playNotificationSound();
    }
  };

  const handleOpenNotification = (notif: NotificationItem) => {
    setCurrentNotification(null);
    setIsShadeOpen(false);
    setViewMode('app');
    if (onClearNotification) onClearNotification();
  };

  const handleDismissNotification = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentNotification(null);
    if (onClearNotification) onClearNotification();
  };

  const handleClearHistory = () => {
    setNotificationHistory([]);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Simulator Control Bar */}
      <div className="w-full max-w-[340px] flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span>Android Live Simulator</span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
          <button
            onClick={() => setViewMode('app')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              viewMode === 'app'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Web
          </button>
          <button
            onClick={() => setViewMode('splash')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              viewMode === 'splash'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Splash
          </button>
          <button
            onClick={() => setViewMode('offline')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              viewMode === 'offline'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Offline
          </button>
        </div>
      </div>

      {/* Quick Test Push Notification Action Button */}
      <div className="w-full max-w-[340px] mb-2.5 flex items-center justify-between px-1">
        <button
          onClick={handleTriggerQuickPush}
          className="w-full py-1.5 px-3 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          title="Uji coba notifikasi muncul di status bar ponsel simulasi"
        >
          <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>Tes Notifikasi Status Bar Ponsel</span>
        </button>
      </div>

      {/* Realistic Smartphone Frame (Samsung / Pixel style) */}
      <div className="relative w-[310px] sm:w-[330px] h-[640px] sm:h-[660px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 flex flex-col justify-between select-none">
        
        {/* Device Outer Details (Buttons on edge) */}
        <div className="absolute -right-1.5 top-28 w-1 h-12 bg-slate-700 rounded-r" />
        <div className="absolute -right-1.5 top-44 w-1 h-20 bg-slate-700 rounded-r" />

        {/* Device Inner Screen Container */}
        <div className="w-full h-full bg-slate-900 rounded-[34px] overflow-hidden flex flex-col relative border border-slate-800/80 shadow-inner">
          
          {/* Punch-hole camera & Android Status Bar */}
          <div 
            onClick={() => setIsShadeOpen(!isShadeOpen)}
            className="w-full h-8 px-4 flex items-center justify-between text-xs text-white z-40 transition-colors cursor-pointer hover:opacity-95"
            style={{ backgroundColor: config.statusBarColor || '#1E293B' }}
            title="Klik untuk membuka laci notifikasi Android"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider">
              <span>09:41</span>
              {/* Notification icon indicator in Status Bar */}
              {notificationHistory.length > 0 && (
                <div className="flex items-center gap-1 ml-0.5">
                  <span className="w-3 h-3 rounded-full bg-white/20 flex items-center justify-center text-[8px]">
                    {config.icon.type === 'emoji' ? config.icon.value : '🔔'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                </div>
              )}
            </div>

            {/* Front Camera Notch */}
            <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center -ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-[9px] font-mono opacity-80">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* REALISTIC ANDROID HEADS-UP NOTIFICATION BANNER (Drops down below status bar) */}
          {currentNotification && (
            <div 
              onClick={() => handleOpenNotification(currentNotification)}
              className="absolute top-9 left-2 right-2 z-50 animate-in slide-in-from-top-6 duration-300 ease-out cursor-pointer"
            >
              <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 border border-slate-700/80 shadow-2xl ring-1 ring-black/40">
                {/* Notification Top Meta */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-4 h-4 rounded flex items-center justify-center text-[10px] text-white font-bold"
                      style={{ backgroundColor: config.themeColor }}
                    >
                      {config.icon.type === 'emoji' ? config.icon.value : config.appName.charAt(0)}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300 truncate max-w-[130px]">
                      {config.appName}
                    </span>
                    <span className="text-[9px] text-slate-500">• baru saja</span>
                  </div>

                  <button 
                    onClick={handleDismissNotification}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Title and Content */}
                <div className="space-y-0.5 pr-2">
                  <h5 className="text-xs font-bold text-white line-clamp-1">
                    {currentNotification.title}
                  </h5>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                    {currentNotification.body}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/80">
                  <button 
                    onClick={() => handleOpenNotification(currentNotification)}
                    className="flex-1 py-1 rounded-lg text-[10px] font-semibold text-white shadow-sm text-center"
                    style={{ backgroundColor: config.themeColor }}
                  >
                    Buka Aplikasi
                  </button>
                  <button 
                    onClick={handleDismissNotification}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ANDROID NOTIFICATION SHADE / DRAWER (Expands when status bar is tapped) */}
          {isShadeOpen && (
            <div className="absolute inset-x-0 top-8 bottom-9 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col animate-in slide-in-from-top duration-200">
              {/* Shade Header */}
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-bold text-white">Laci Notifikasi</span>
                  <span className="px-1.5 py-0.2 bg-blue-600/30 text-blue-400 rounded-full text-[10px] font-semibold">
                    {notificationHistory.length}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {notificationHistory.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-[10px] text-slate-400 hover:text-rose-400 p-1 flex items-center gap-1"
                      title="Hapus semua"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsShadeOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {notificationHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                    <Bell className="w-8 h-8 stroke-1 mb-2 opacity-40" />
                    <p className="text-xs">Tidak ada notifikasi baru</p>
                    <button
                      onClick={handleTriggerQuickPush}
                      className="mt-3 text-[11px] text-blue-400 hover:underline"
                    >
                      + Kirim notifikasi uji coba
                    </button>
                  </div>
                ) : (
                  notificationHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenNotification(item)}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400">
                        <span className="font-semibold text-blue-400">{config.appName}</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <h6 className="text-xs font-bold text-white mb-0.5">{item.title}</h6>
                      <p className="text-[11px] text-slate-300 leading-snug">{item.body}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Close Shade Footer */}
              <div className="p-2 border-t border-slate-800 text-center">
                <button
                  onClick={() => setIsShadeOpen(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-200"
                >
                  Tutup Laci Notifikasi ▲
                </button>
              </div>
            </div>
          )}

          {/* Optional App Bar / Header */}
          <div 
            className="h-10 px-3 flex items-center justify-between border-b border-black/10 z-20 text-white shadow-sm transition-colors"
            style={{ backgroundColor: config.themeColor }}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                {config.icon.type === 'emoji' ? config.icon.value : config.appName.charAt(0)}
              </div>
              <span className="text-xs font-bold truncate max-w-[170px]">{config.appName}</span>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={handleRefresh}
                title="Muat ulang WebView"
                className="p-1 rounded hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <a 
                href={config.url} 
                target="_blank" 
                rel="noreferrer"
                title="Buka URL asli di tab baru"
                className="p-1 rounded hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Pull to refresh indicator simulation */}
          {isRefreshing && (
            <div className="absolute top-20 left-0 right-0 z-30 flex justify-center">
              <div className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5 animate-bounce">
                <RotateCcw className="w-3 h-3 animate-spin" />
                <span>Memuat ulang...</span>
              </div>
            </div>
          )}

          {/* Screen Content Body */}
          <div className="flex-1 w-full bg-slate-950 relative overflow-hidden flex flex-col">
            {viewMode === 'app' ? (
              <div className="w-full h-full relative">
                {/* Fallback interactive mock in case target site blocks iframe X-Frame-Options */}
                <iframe
                  key={iframeKey}
                  src={config.url}
                  title="Android App Preview"
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />

                {/* Iframe overlay warning hint (in case site blocks embedding) */}
                <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-sm text-[10px] text-slate-300 flex items-center justify-between">
                  <span className="truncate">URL: {config.url}</span>
                  <span className="text-emerald-400 font-medium shrink-0 ml-1">Live WebView</span>
                </div>
              </div>
            ) : viewMode === 'splash' ? (
              /* Splash Screen Preview */
              <div 
                className="w-full h-full flex flex-col items-center justify-center p-6 text-center animate-fadeIn"
                style={{ backgroundColor: config.splash.bgColor || '#0F172A' }}
              >
                <div 
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl mb-4 border border-white/10`}
                  style={{ backgroundColor: config.icon.bgColor || config.themeColor }}
                >
                  {config.icon.value}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{config.appName}</h3>
                <p className="text-xs text-slate-400 max-w-[200px] mb-6">{config.splash.tagline || 'Memuat aplikasi...'}</p>
                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full animate-pulse"
                    style={{ backgroundColor: config.themeColor, width: '70%' }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-4">Durasi: {config.splash.durationSeconds}s</span>
              </div>
            ) : (
              /* Offline Fallback Preview */
              <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-4 border border-slate-700">
                  <WifiOff className="w-7 h-7 text-rose-400" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Koneksi Terputus</h4>
                <p className="text-xs text-slate-400 max-w-[200px] mb-4">
                  Periksa koneksi internet Anda lalu coba muat ulang aplikasi.
                </p>
                <button 
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white shadow-md cursor-pointer transition-transform active:scale-95"
                  style={{ backgroundColor: config.themeColor }}
                >
                  Coba Lagi
                </button>
              </div>
            )}
          </div>

          {/* Android 3-Button Navigation Bar */}
          <div 
            className="w-full h-9 flex items-center justify-around px-8 z-30 transition-colors"
            style={{ backgroundColor: config.navBarColor || '#0F172A' }}
          >
            {/* Back Button */}
            <button className="text-slate-400 hover:text-white p-1">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {/* Home Button */}
            <button className="text-slate-400 hover:text-white p-1">
              <Circle className="w-3.5 h-3.5" />
            </button>
            {/* Recents Button */}
            <button className="text-slate-400 hover:text-white p-1">
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Simulator Info Caption */}
      <div className="mt-3 text-center">
        <p className="text-[11px] text-slate-400">
          Target: <strong className="text-slate-200">Android 10 s/d 15 (API {config.minSdk}-35)</strong> • FCM: <strong className="text-amber-400">Aktif</strong>
        </p>
      </div>
    </div>
  );
};
