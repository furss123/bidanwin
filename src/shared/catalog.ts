import type { BloatApp } from './types'

/** Bump when the bundled catalog changes (used for remote update comparison). */
export const CATALOG_VERSION = '1.0.0'

/** All apps that may be offered for removal (safe + caution). */
export const CATALOG: BloatApp[] = [
  // ── SAFE ──────────────────────────────────────────────────────────────────

  {
    id: '3d-viewer',
    name: '3D Viewer',
    description: 'View and interact with 3D models',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.Microsoft3DViewer'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'mixed-reality-portal',
    name: 'Mixed Reality Portal',
    description: 'Setup and manage Windows Mixed Reality headsets',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.MixedReality.Portal'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'solitaire',
    name: 'Solitaire Collection',
    description: 'Classic Microsoft Solitaire card games',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.MicrosoftSolitaireCollection'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'clipchamp',
    name: 'Clipchamp',
    description: 'Web-based video editor bundled with Windows',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Clipchamp.Clipchamp'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'weather',
    name: 'Weather',
    description: 'Bing-powered weather forecast app',
    category: 'microsoft',
    safety: 'safe',
    packagePatterns: ['Microsoft.BingWeather'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'news',
    name: 'News',
    description: 'Bing-powered news reader',
    category: 'microsoft',
    safety: 'safe',
    packagePatterns: ['Microsoft.BingNews'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'bing-search',
    name: 'Bing Search',
    description: 'Bing search widget and companion app',
    category: 'widgets_ai',
    safety: 'safe',
    packagePatterns: ['Microsoft.BingSearch'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'get-help',
    name: 'Get Help',
    description: 'Windows troubleshooting and support assistant',
    category: 'microsoft',
    safety: 'safe',
    packagePatterns: ['Microsoft.GetHelp'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'tips',
    name: 'Tips',
    description: 'Windows tips and getting-started guide',
    category: 'microsoft',
    safety: 'safe',
    packagePatterns: ['Microsoft.Getstarted'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'office-hub',
    name: 'Microsoft 365 (Office hub)',
    description: 'Launcher for Microsoft 365 and Office apps',
    category: 'microsoft',
    safety: 'safe',
    packagePatterns: ['Microsoft.MicrosoftOfficeHub'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'feedback-hub',
    name: 'Feedback Hub',
    description: 'Send feedback and diagnostics to Microsoft',
    category: 'microsoft',
    safety: 'safe',
    packagePatterns: ['Microsoft.WindowsFeedbackHub'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'maps',
    name: 'Maps',
    description: 'Offline maps and navigation',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.WindowsMaps'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'sound-recorder',
    name: 'Sound Recorder',
    description: 'Simple audio recording app',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.WindowsSoundRecorder'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'people',
    name: 'People',
    description: 'Contacts and address book',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.People'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'mail-calendar',
    name: 'Mail & Calendar',
    description: 'Legacy Mail and Calendar apps',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['microsoft.windowscommunicationsapps'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'movies-tv',
    name: 'Movies & TV',
    description: 'Rent, buy, and play video content',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.ZuneVideo'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'groove-music',
    name: 'Groove Music',
    description: 'Legacy music player (deprecated)',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.ZuneMusic'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'skype',
    name: 'Skype',
    description: 'Voice and video calling',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.SkypeApp'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store or skype.com'
  },
  {
    id: 'xbox-game-bar',
    name: 'Xbox Game Bar',
    description: 'In-game overlay for recording and widgets',
    category: 'games_xbox',
    safety: 'safe',
    packagePatterns: ['Microsoft.XboxGamingOverlay'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'xbox-identity-provider',
    name: 'Xbox Identity Provider',
    description: 'Xbox account sign-in services',
    category: 'games_xbox',
    safety: 'safe',
    packagePatterns: ['Microsoft.XboxIdentityProvider'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'xbox-tcui',
    name: 'Xbox TCUI',
    description: 'Xbox title-callable UI components',
    category: 'games_xbox',
    safety: 'safe',
    packagePatterns: ['Microsoft.Xbox.TCUI'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'xbox-speech-to-text',
    name: 'Xbox Speech To Text',
    description: 'Xbox party chat speech-to-text overlay',
    category: 'games_xbox',
    safety: 'safe',
    packagePatterns: ['Microsoft.XboxSpeechToTextOverlay'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'xbox-app',
    name: 'Xbox App',
    description: 'Xbox console companion and PC Game Pass launcher',
    category: 'games_xbox',
    safety: 'safe',
    packagePatterns: ['Microsoft.GamingApp'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'copilot',
    name: 'Copilot',
    description: 'Windows AI assistant (Copilot)',
    category: 'widgets_ai',
    safety: 'safe',
    packagePatterns: ['Microsoft.Copilot', 'Microsoft.Windows.Ai.Copilot.Provider'],
    removalMethod: 'appx',
    reinstallHint: 'Re-enable via Settings → Personalization → Copilot'
  },
  {
    id: 'cortana',
    name: 'Cortana',
    description: 'Legacy Cortana voice assistant',
    category: 'widgets_ai',
    safety: 'safe',
    packagePatterns: ['Microsoft.549981C3F5F10'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'quick-assist',
    name: 'Quick Assist',
    description: 'Remote desktop help tool',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['MicrosoftCorporationII.QuickAssist'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'to-do',
    name: 'To Do',
    description: 'Task and to-do list manager',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.Todos'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'family-safety',
    name: 'Family Safety',
    description: 'Microsoft Family parental controls',
    category: 'microsoft',
    safety: 'safe',
    packagePatterns: ['MicrosoftCorporationII.MicrosoftFamily'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'power-automate',
    name: 'Power Automate',
    description: 'Desktop workflow automation (Power Automate Desktop)',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.PowerAutomateDesktop'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'teams',
    name: 'Teams (personal)',
    description: 'Microsoft Teams consumer / personal edition',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['MicrosoftTeams', 'MSTeams'],
    removalMethod: 'appx',
    reinstallHint: 'Download from microsoft.com/microsoft-teams'
  },
  {
    id: 'paint-3d',
    name: 'Paint 3D',
    description: '3D modeling companion to classic Paint',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.MSPaint'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'whiteboard',
    name: 'Whiteboard',
    description: 'Digital collaborative whiteboard',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.Whiteboard'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'LinkedIn Windows app',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.LinkedIn'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'phone-link',
    name: 'Phone Link',
    description: 'Sync calls, messages, and photos from your Android phone',
    category: 'apps',
    safety: 'safe',
    packagePatterns: ['Microsoft.YourPhone'],
    removalMethod: 'appx',
    note: 'May be blocked by Windows',
    reinstallHint: 'Reinstall from Microsoft Store'
  },

  // ── CAUTION ───────────────────────────────────────────────────────────────

  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Microsoft cloud storage and sync client',
    category: 'system',
    safety: 'caution',
    packagePatterns: ['Microsoft.OneDriveSync', 'Microsoft.OneDrive'],
    removalMethod: 'special',
    note: 'Uses OneDriveSetup.exe /uninstall — not a standard AppX removal',
    reinstallHint: 'Download from microsoft.com/microsoft-365/onedrive/download'
  },
  {
    id: 'microsoft-store',
    name: 'Microsoft Store',
    description: 'Windows app store and update hub',
    category: 'system',
    safety: 'caution',
    packagePatterns: ['Microsoft.WindowsStore'],
    removalMethod: 'appx',
    note: 'Hard to reinstall',
    reinstallHint: 'Reinstall via wsreset.exe or PowerShell Add-AppxPackage'
  },
  {
    id: 'photos',
    name: 'Photos',
    description: 'Default photo viewer and library manager',
    category: 'system',
    safety: 'caution',
    packagePatterns: ['Microsoft.Windows.Photos'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Built-in calculator with scientific and programmer modes',
    category: 'system',
    safety: 'caution',
    packagePatterns: ['Microsoft.WindowsCalculator'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'camera',
    name: 'Camera',
    description: 'Default webcam capture app',
    category: 'system',
    safety: 'caution',
    packagePatterns: ['Microsoft.WindowsCamera'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'snipping-tool',
    name: 'Snipping Tool',
    description: 'Screenshot and screen-snipping utility',
    category: 'system',
    safety: 'caution',
    packagePatterns: ['Microsoft.ScreenSketch'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'notepad',
    name: 'Notepad',
    description: 'Plain-text editor (Store / packaged version)',
    category: 'system',
    safety: 'caution',
    packagePatterns: ['Microsoft.WindowsNotepad'],
    removalMethod: 'appx',
    reinstallHint: 'Reinstall from Microsoft Store'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Modern multi-tab command-line terminal',
    category: 'system',
    safety: 'caution',
    packagePatterns: ['Microsoft.WindowsTerminal'],
    removalMethod: 'appx',
    wingetId: 'Microsoft.WindowsTerminal',
    reinstallHint: 'Reinstall from Microsoft Store or winget install Microsoft.WindowsTerminal'
  }
]

/**
 * Package name patterns that must never be selectable or removable.
 * Supports `*` as a wildcard (prefix, suffix, or infix).
 */
export const NEVER_REMOVE: string[] = [
  'Microsoft.Edge',
  'Microsoft.WindowsAppRuntime*',
  'Microsoft.VCLibs*',
  'Microsoft.NET*',
  'Microsoft.UI.Xaml*',
  'Microsoft.DesktopAppInstaller',
  'Microsoft.StorePurchaseApp',
  'Microsoft.SecHealthUI',
  '*WindowsShell*',
  '*Foundation*'
]

function matchesWildcard(value: string, rule: string): boolean {
  const v = value.toLowerCase()
  const r = rule.toLowerCase()

  if (r.startsWith('*') && r.endsWith('*') && r.length > 2) {
    return v.includes(r.slice(1, -1))
  }
  if (r.endsWith('*')) {
    return v.startsWith(r.slice(0, -1))
  }
  if (r.startsWith('*')) {
    return v.endsWith(r.slice(1))
  }
  return v === r
}

/** Returns true if a package name matches any NEVER_REMOVE blocklist pattern. */
export function isBlocked(packageName: string): boolean {
  return NEVER_REMOVE.some((rule) => matchesWildcard(packageName, rule))
}

/** Merge remote catalog changes into the in-memory bundled catalog (runtime only). */
export function mergeCatalogUpdates(newApps: BloatApp[], removedIds: string[]): BloatApp[] {
  const existingIds = new Set(CATALOG.map((app) => app.id))

  for (const app of newApps) {
    if (!existingIds.has(app.id)) {
      CATALOG.push(app)
      existingIds.add(app.id)
    }
  }

  if (removedIds.length > 0) {
    const removeSet = new Set(removedIds)
    for (let i = CATALOG.length - 1; i >= 0; i -= 1) {
      if (removeSet.has(CATALOG[i].id)) {
        CATALOG.splice(i, 1)
      }
    }
  }

  return [...CATALOG]
}

/** Original bundled catalog app IDs (compile-time baseline for remote diffing). */
export const BUNDLED_CATALOG_IDS = new Set(CATALOG.map((app) => app.id))

// Blocklist sanity checks (expected results):
//   isBlocked('Microsoft.Edge')                        → true  (exact)
//   isBlocked('Microsoft.VCLibs.140.00.UWP')             → true  (prefix *)
//   isBlocked('Microsoft.NET.Native.Framework.2.2')    → true  (prefix *)
//   isBlocked('MicrosoftWindows.Client.Core')            → true  (*Foundation*)
//   isBlocked('Custom.WindowsShell.ExperienceHost')      → true  (*WindowsShell*)
//   isBlocked('Microsoft.MicrosoftSolitaireCollection')  → false (catalog app)
