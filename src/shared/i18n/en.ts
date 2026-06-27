import type { TranslationSchema } from './types'

export const en: TranslationSchema = {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    remove: 'Remove',
    skip: 'Skip',
    close: 'Close',
    copy: 'Copy',
    copied: 'Copied!',
    loading: 'Loading…',
    error: 'Error',
    open: 'Open'
  },
  sidebar: {
    wordmark: '비단윈',
    wordmarkSub: 'BidanWin',
    categories: {
      all: 'All',
      apps: 'Apps',
      gamesXbox: 'Games & Xbox',
      microsoft: 'Microsoft',
      widgetsAi: 'Widgets & AI',
      oem: 'OEM',
      system: 'System'
    },
    restoreGuide: 'Restore Guide',
    about: 'About',
    themeToggle: {
      light: 'Light mode',
      dark: 'Dark mode'
    },
    language: {
      ko: '한국어',
      en: 'English'
    }
  },
  app: {
    subtitleAllowed:
      'Select apps and remove them. A restore point is offered before each batch.',
    subtitleGated:
      'Select apps to remove. Removal is gated until prerequisites are met.'
  },
  appCard: {
    remove: 'Remove',
    removed: 'Removed ✓',
    cautionBadge: 'Caution',
    removeTooltip: 'Administrator required'
  },
  actionBar: {
    selected: '{n} selected',
    selectRecommended: 'Select recommended',
    clear: 'Clear',
    removeSelected: 'Remove Selected',
    removing: 'Removing…',
    alreadyRemoved: 'All selected apps have already been removed.',
    batchWarn: '⚠ {n} apps selected — consider removing in smaller batches.'
  },
  logPanel: {
    title: 'Log',
    ready: 'Ready.',
    removing: 'Removing…',
    clearLog: 'Clear log',
    wingetAvailable: 'winget: available',
    wingetMissing: 'winget: not found',
    summary: '✓ {succeeded} removed · ✗ {failed} failed · ⊘ {blocked} blocked',
    catalogLoaded: 'Catalog loaded — 42 apps available',
    environmentLog:
      'Environment: {windowsVersion} · admin={isAdmin} · ps={powershellAvailable} · winget={wingetAvailable}',
    startingRemoval: 'Starting removal of {n} app(s)…',
    selectionCleared: 'Selection cleared',
    selectedRecommended: 'Selected {n} recommended apps in current view',
    elevationCancelled: 'UAC elevation cancelled — continuing without admin',
    elevationFailed: 'Elevation failed: {error}',
    elevationRequestFailed: 'Elevation request failed',
    envLoadFailed: 'Failed to read environment info',
    openLogPanel: 'Open log panel',
    closeLogPanel: 'Close log panel'
  },
  statusBanner: {
    checkingEnv: 'Checking environment…',
    adminRequired: 'Administrator required',
    relaunch: 'Relaunch as administrator',
    relaunching: 'Requesting…',
    adminOk: 'Running as administrator',
    previewMode: 'Preview mode — removal not supported on this OS',
    powershellMissing: 'PowerShell not found — removal unavailable'
  },
  confirmModal: {
    title: 'Confirm removal',
    warning: '⚠ This action is hard to undo',
    andMore: '+ {n} more',
    confirmBtn: 'Remove'
  },
  restorePointModal: {
    title: 'Create Restore Point',
    description:
      'We recommend creating a restore point before removal. You can roll back if something goes wrong.',
    createBtn: 'Create & Continue',
    creating: 'Creating…',
    success: '✓ Restore point created',
    continueAnyway: 'Continue anyway',
    throttleWarn:
      'A restore point was created within the last 24 hours — skipping.',
    createFailed: 'Failed to create restore point'
  },
  restoreGuide: {
    title: 'Restore Guide',
    subtitle: 'How to roll back changes or reinstall removed apps',
    section1Title: 'Roll back via System Restore',
    section1Steps: [
      'Open the Start menu',
      'Search for "restore point" or "System Restore"',
      'Select System Restore and follow the wizard',
      'Choose the restore point created by BidanWin'
    ],
    openSystemRestore: 'Open System Restore',
    section2Title: 'Reinstall individual apps',
    noRemovedApps: 'No apps removed in this session.',
    perAppReinstall: 'Per-app Appx reinstall:',
    reinstallAll: 'Reinstall all remaining Appx packages:',
    section3Title: 'Reinstall from Microsoft Store',
    section3Body:
      'Open the Microsoft Store and search for the app name, or use the reinstall hints above.',
    openStore: 'Open Microsoft Store',
    openStoreShort: 'Open Store',
    reinstallHintDefault: 'Reinstall from Microsoft Store',
    sessionTab: 'This session',
    allSessionsTab: 'All sessions',
    noRemovedAppsAll: 'No apps in removal history.'
  },
  aboutScreen: {
    title: '비단윈',
    subtitle: 'BidanWin',
    description: 'Windows 기본 앱 원클릭 제거 도구',
    descriptionEn: 'One-click Windows bloatware remover',
    copyright: '© 2026 HyoT · MIT License',
    viewLicense: 'View MIT License',
    github: 'GitHub',
    version: 'Version',
    os: 'OS',
    adminStatus: 'Privileges',
    adminYes: 'Administrator',
    adminNo: 'Standard user'
  },
  emptyState: {
    message: 'All apps in this category have been removed ✓'
  },
  closeGuard: {
    message: 'Removal in progress. Are you sure you want to quit?',
    cancel: 'Cancel',
    quit: 'Quit'
  },
  history: {
    navLabel: 'History',
    title: 'Removal History',
    empty: 'No removal history yet.',
    clearAll: 'Clear all history',
    export: 'Export as JSON',
    openFile: 'Open file location',
    confirmClear: 'Clear all history? This cannot be undone.',
    sessionLabel: '{date} — {n} apps',
    succeeded: 'Succeeded',
    failed: 'Failed',
    blocked: 'Blocked',
    filterAll: 'All',
    appVersion: 'App version',
    windowsVersion: 'Windows version',
    noPath: 'Path unavailable',
    exportSuccess: 'History exported to {path}',
    exportFailed: 'Failed to export history',
    exportCancelled: 'Export cancelled',
    cleared: 'All removal history cleared',
    errorColumn: 'Error',
    timeColumn: 'Time',
    appColumn: 'App',
    statusColumn: 'Status'
  },
  catalogUpdate: {
    navBanner: '🆕 Catalog updated',
    newApps: '{n} new apps added',
    viewNew: 'View new apps',
    dismiss: 'Dismiss',
    checkBtn: 'Check for catalog updates',
    checking: 'Checking…',
    upToDate: 'Up to date.',
    lastChecked: 'Last checked: {time}',
    catalogVersion: 'Catalog version',
    error: 'Update check failed: {error}',
    skipped: 'Catalog requires a newer app version.',
    newBadge: 'NEW',
    changelog: 'Changelog'
  },
  oem: {
    navLabel: 'OEM',
    detecting: 'Detecting manufacturer…',
    unknownManufacturer: 'Manufacturer could not be detected.',
    noAppsFound: 'No OEM apps found on this device.',
    detectedAs: 'Detected manufacturer: {manufacturer} ({model})',
    wingetScanSkipped: 'winget not available — OEM app scan skipped',
    manufacturers: {
      samsung: 'Samsung',
      lg: 'LG',
      hp: 'HP',
      dell: 'Dell',
      lenovo: 'Lenovo',
      asus: 'ASUS',
      acer: 'Acer',
      msi: 'MSI',
      toshiba: 'Toshiba',
      sony: 'Sony',
      microsoft: 'Microsoft Surface',
      unknown: 'Unknown'
    }
  }
}
