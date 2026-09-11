import { AppConfig } from '../types';
import { generateFingerprint } from '../utils/cryptoKeystore';

export interface PresetItem {
  id: string;
  name: string;
  category: string;
  url: string;
  appName: string;
  packageName: string;
  themeColor: string;
  iconBg: string;
  iconEmoji: string;
}

export const DEMO_PRESETS: PresetItem[] = [
  {
    id: 'ecommerce',
    name: 'Toko Online / Marketplace',
    category: 'E-Commerce',
    url: 'https://tokoonline-store.com',
    appName: 'Toko Online Store',
    packageName: 'com.tokoonline.store',
    themeColor: '#2563EB',
    iconBg: '#1E40AF',
    iconEmoji: '🛍️',
  },
  {
    id: 'news',
    name: 'Portal Berita & Media',
    category: 'News & Media',
    url: 'https://berita-nusantara.id',
    appName: 'Berita Nusantara',
    packageName: 'id.beritanusantara.app',
    themeColor: '#DC2626',
    iconBg: '#991B1B',
    iconEmoji: '📰',
  },
  {
    id: 'saas',
    name: 'SaaS Dashboard & Bisnis',
    category: 'Productivity',
    url: 'https://bisniskita-app.com',
    appName: 'BisnisKita Dashboard',
    packageName: 'com.bisniskita.dashboard',
    themeColor: '#059669',
    iconBg: '#065F46',
    iconEmoji: '💼',
  },
  {
    id: 'portfolio',
    name: 'Portofolio / Komunitas',
    category: 'Community',
    url: 'https://komunitas-kreatif.id',
    appName: 'Komunitas Kreatif',
    packageName: 'id.kreatif.community',
    themeColor: '#7C3AED',
    iconBg: '#5B21B6',
    iconEmoji: '🚀',
  },
];

export function getInitialAppConfig(presetUrl: string = 'https://tokoonline-store.com'): AppConfig {
  const defaultPackage = 'com.tokoonline.store';
  const defaultAlias = 'release-key';

  return {
    url: presetUrl,
    appName: 'Toko Online Store',
    packageName: defaultPackage,
    versionName: '1.0.0',
    versionCode: 1,
    themeColor: '#2563EB',
    statusBarColor: '#1D4ED8',
    navBarColor: '#0F172A',
    orientation: 'portrait',
    architecture: 'webview',
    targetSdk: 35, // Android 15 required for Google Play
    minSdk: 29,    // Android 10.0+ (Dukungan penuh Android 10 ke atas)
    permissions: {
      camera: true,
      location: true,
      storage: true,
      microphone: false,
      notifications: true,
      pullToRefresh: true,
      offlineCache: true,
      externalLinks: true,
      fullscreen: false,
    },
    keystore: {
      alias: defaultAlias,
      storePassword: 'Password123!',
      keyPassword: 'Password123!',
      validityYears: 30,
      organization: 'Digital App Studio',
      countryCode: 'ID',
      sha1: generateFingerprint(defaultPackage, defaultAlias, 'sha1'),
      sha256: generateFingerprint(defaultPackage, defaultAlias, 'sha256'),
    },
    icon: {
      type: 'emoji',
      value: '🛍️',
      bgColor: '#2563EB',
      shape: 'squircle',
    },
    splash: {
      enabled: true,
      durationSeconds: 2,
      bgColor: '#0F172A',
      tagline: 'Belanja Cepat & Mudah',
    },
    playStore: {
      shortDesc: 'Aplikasi resmi untuk pengalaman belanja yang cepat, aman, dan nyaman.',
      fullDesc: 'Selamat datang di aplikasi resmi kami! Nikmati kemudahan berbelanja online langsung dari perangkat Android Anda dengan dukungan notifikasi promo, pelacakan pesanan real-time, dan navigasi yang sangat cepat.',
      category: 'SHOPPING',
      contactEmail: 'support@tokoonline-store.com',
      privacyPolicyUrl: 'https://tokoonline-store.com/privacy-policy',
    },
    firebase: {
      enabled: true,
      projectId: 'tokoonline-fcm-app',
      appId: '1:982347102938:android:72834b92c81d',
      apiKey: 'AIzaSyD-X92kL10mNq947-fcmKeyDemo',
      messagingSenderId: '982347102938',
      serverKey: 'AAAA9zK3LxM:APA91bF8p...SAMPLE_KEY',
      channelId: 'promo_and_updates',
      channelName: 'Notifikasi & Info Promo',
      soundEnabled: true,
      vibrateEnabled: true,
      badgeEnabled: true,
    },
  };
}

/**
 * Validates domain and generates package name automatically
 */
export function urlToPackageName(rawUrl: string): { packageName: string; appName: string } {
  try {
    let clean = rawUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const urlObj = new URL(clean);
    const host = urlObj.hostname.replace(/^www\./, '');
    const parts = host.split('.').filter(Boolean);

    let pkg = 'com.myapp.app';
    if (parts.length >= 2) {
      const tld = parts[parts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '');
      const domain = parts[parts.length - 2].toLowerCase().replace(/[^a-z0-9]/g, '');
      pkg = `${tld}.${domain}.app`;
    } else if (parts.length === 1) {
      pkg = `com.${parts[0].toLowerCase().replace(/[^a-z0-9]/g, '')}.app`;
    }

    // Capitalize domain name for App Title
    const namePart = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || 'My App';
    const appName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    return { packageName: pkg, appName };
  } catch {
    return { packageName: 'com.mycompany.app', appName: 'My Web App' };
  }
}
