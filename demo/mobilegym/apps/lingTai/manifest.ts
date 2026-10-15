import type { AppManifest } from '@/os/types/manifest';
import { IcLauncher } from './res/icons';

/**
 * LingTai as an app on the simulated phone.
 *
 * The app is a thin shell: it shows the LingTai web app (served by `lingtai serve` on the
 * host) full-screen, and mirrors what the server wants from you — approvals, questions,
 * background results — into the simulator's notification shade.
 */
export const manifest: AppManifest = {
  id: 'lingtai',
  packageName: 'org.lingtai.app',
  displayName: 'LingTai',
  displayNameEn: 'LingTai',
  aliases: ['muse', 'open muse', 'personal agent', 'assistant'],
  version: '0.2.0',
  versionCode: 2,
  type: 'plugin',
  icon: IcLauncher,
  iconBackground: '#ffffff', // the Android app's light tile; the mark keeps its own colours
  iconForeground: '#4F46E5',
  designViewportWidth: 360,
  // the web app's palette (web/src/index.css) and the Android app's action purple (MuseTones)
  theme: {
    colors: {
      primary: '#4F46E5',
      primaryDark: '#4338CA',
      onPrimary: '#ffffff',
      accent: '#4F46E5',
      background: '#fcfcfc',
      surface: '#ffffff',
      textPrimary: '#111112',
      textSecondary: '#6b6b71',
      border: '#e5e5ea',
      statusBarForeground: 'dark',
      navigationBarForeground: 'dark',
    },
    colorsDark: {
      primary: '#6366F1',
      primaryDark: '#818CF8',
      onPrimary: '#ffffff',
      accent: '#6366F1',
      background: '#181819',
      surface: '#1c1c1e',
      textPrimary: '#ffffff',
      textSecondary: '#9d9da4',
      border: '#3a3a3c',
      statusBarForeground: 'light',
      navigationBarForeground: 'light',
    },
  },
  // the system splash — the icon on the app's background, as Android's — nothing added
};
