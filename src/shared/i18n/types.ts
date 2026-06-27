export type Locale = 'ko' | 'en'

export interface TranslationSchema {
  common: {
    confirm: string
    cancel: string
    remove: string
    skip: string
    close: string
    copy: string
    copied: string
    loading: string
    error: string
    open: string
  }
  sidebar: {
    wordmark: string
    wordmarkSub: string
    categories: {
      all: string
      apps: string
      gamesXbox: string
      microsoft: string
      widgetsAi: string
      oem: string
      system: string
    }
    restoreGuide: string
    about: string
    language: {
      ko: string
      en: string
    }
  }
  app: {
    subtitleAllowed: string
    subtitleGated: string
  }
  appCard: {
    remove: string
    removed: string
    cautionBadge: string
    removeTooltip: string
  }
  actionBar: {
    selected: string
    selectRecommended: string
    clear: string
    removeSelected: string
    removing: string
    alreadyRemoved: string
    batchWarn: string
  }
  logPanel: {
    title: string
    ready: string
    removing: string
    clearLog: string
    wingetAvailable: string
    wingetMissing: string
    summary: string
    catalogLoaded: string
    environmentLog: string
    startingRemoval: string
    selectionCleared: string
    selectedRecommended: string
    elevationCancelled: string
    elevationFailed: string
    elevationRequestFailed: string
    envLoadFailed: string
    openLogPanel: string
    closeLogPanel: string
  }
  statusBanner: {
    checkingEnv: string
    adminRequired: string
    relaunch: string
    relaunching: string
    adminOk: string
    previewMode: string
    powershellMissing: string
  }
  confirmModal: {
    title: string
    warning: string
    andMore: string
    confirmBtn: string
  }
  restorePointModal: {
    title: string
    description: string
    createBtn: string
    creating: string
    success: string
    continueAnyway: string
    throttleWarn: string
    createFailed: string
  }
  restoreGuide: {
    title: string
    subtitle: string
    section1Title: string
    section1Steps: readonly [string, string, string, string]
    openSystemRestore: string
    section2Title: string
    noRemovedApps: string
    perAppReinstall: string
    reinstallAll: string
    section3Title: string
    section3Body: string
    openStore: string
    openStoreShort: string
    reinstallHintDefault: string
    sessionTab: string
    allSessionsTab: string
    noRemovedAppsAll: string
  }
  aboutScreen: {
    title: string
    subtitle: string
    description: string
    descriptionEn: string
    copyright: string
    viewLicense: string
    github: string
    version: string
    os: string
    adminStatus: string
    adminYes: string
    adminNo: string
  }
  emptyState: {
    message: string
  }
  closeGuard: {
    message: string
    cancel: string
    quit: string
  }
  history: {
    navLabel: string
    title: string
    empty: string
    clearAll: string
    export: string
    openFile: string
    confirmClear: string
    sessionLabel: string
    succeeded: string
    failed: string
    blocked: string
    filterAll: string
    appVersion: string
    windowsVersion: string
    noPath: string
    exportSuccess: string
    exportFailed: string
    exportCancelled: string
    cleared: string
    errorColumn: string
    timeColumn: string
    appColumn: string
    statusColumn: string
  }
  catalogUpdate: {
    navBanner: string
    newApps: string
    viewNew: string
    dismiss: string
    checkBtn: string
    checking: string
    upToDate: string
    lastChecked: string
    catalogVersion: string
    error: string
    skipped: string
    newBadge: string
    changelog: string
  }
  oem: {
    navLabel: string
    detecting: string
    unknownManufacturer: string
    noAppsFound: string
    detectedAs: string
    wingetScanSkipped: string
    manufacturers: {
      samsung: string
      lg: string
      hp: string
      dell: string
      lenovo: string
      asus: string
      acer: string
      msi: string
      toshiba: string
      sony: string
      microsoft: string
      unknown: string
    }
  }
}
