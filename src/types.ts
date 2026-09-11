export type ArchitectureType = 'webview' | 'twa';

export type ScreenOrientation = 'portrait' | 'landscape' | 'unspecified';

export type IconType = 'preset' | 'emoji' | 'uploaded';

export interface AppPermissions {
  camera: boolean;
  location: boolean;
  storage: boolean;
  microphone: boolean;
  notifications: boolean;
  pullToRefresh: boolean;
  offlineCache: boolean;
  externalLinks: boolean;
  fullscreen: boolean;
}

export interface KeystoreConfig {
  alias: string;
  storePassword: string;
  keyPassword: string;
  validityYears: number;
  organization: string;
  countryCode: string;
  sha1: string;
  sha256: string;
}

export interface AppIconConfig {
  type: IconType;
  value: string; // url, emoji, or data URL
  bgColor: string;
  shape: 'circle' | 'squircle' | 'rounded' | 'full';
}

export interface SplashScreenConfig {
  enabled: boolean;
  durationSeconds: number;
  bgColor: string;
  tagline: string;
}

export interface PlayStoreListing {
  shortDesc: string;
  fullDesc: string;
  category: string;
  contactEmail: string;
  privacyPolicyUrl: string;
}

export interface FirebaseConfig {
  enabled: boolean;
  projectId: string;
  appId: string;
  apiKey: string;
  messagingSenderId: string;
  serverKey: string;
  channelId: string;
  channelName: string;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  badgeEnabled: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  targetUrl?: string;
  icon?: string;
  read: boolean;
}

export interface AppConfig {
  url: string;
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  themeColor: string;
  statusBarColor: string;
  navBarColor: string;
  orientation: ScreenOrientation;
  architecture: ArchitectureType;
  targetSdk: number;
  minSdk: number;
  permissions: AppPermissions;
  keystore: KeystoreConfig;
  icon: AppIconConfig;
  splash: SplashScreenConfig;
  playStore: PlayStoreListing;
  firebase: FirebaseConfig;
}

export interface BuildStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}
