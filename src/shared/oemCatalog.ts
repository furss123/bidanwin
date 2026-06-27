import { CATALOG, isBlocked } from './catalog'
import type { BloatApp, SafetyLevel } from './types'

export type OemManufacturer =
  | 'samsung'
  | 'lg'
  | 'hp'
  | 'dell'
  | 'lenovo'
  | 'asus'
  | 'acer'
  | 'msi'
  | 'toshiba'
  | 'sony'
  | 'microsoft'
  | 'unknown'

export interface OemApp {
  id: string
  name: string
  description: string
  manufacturer: OemManufacturer
  safety: SafetyLevel
  removalMethod: 'winget' | 'appx' | 'special'
  wingetId?: string
  packagePatterns?: string[]
  reinstallHint?: string
  note?: string
}

export interface OemDetectionResult {
  manufacturer: OemManufacturer
  rawManufacturerString: string
  model: string
  installedOemApps: OemApp[]
  wingetScanSkipped?: boolean
}

/** Maps OemApp → BloatApp for the removal engine (category: 'oem', same removalMethod routing). */
export function oemAppToBloatApp(app: OemApp): BloatApp {
  return {
    id: app.id,
    name: app.name,
    description: app.description,
    category: 'oem',
    safety: app.safety,
    packagePatterns: app.packagePatterns ?? [],
    removalMethod: app.removalMethod,
    wingetId: app.wingetId,
    note: app.note,
    reinstallHint: app.reinstallHint ?? 'Reinstall from manufacturer website or Microsoft Store'
  }
}

/** Merge detected OEM apps into the in-memory CATALOG (passes NEVER_REMOVE check). */
export function mergeOemAppsIntoCatalog(apps: OemApp[]): BloatApp[] {
  const merged: BloatApp[] = []

  for (const oemApp of apps) {
    const bloat = oemAppToBloatApp(oemApp)
    if (bloat.packagePatterns.some((pattern) => isBlocked(pattern))) {
      console.warn('[oemCatalog] Skipping blocked OEM app:', oemApp.id)
      continue
    }
    if (!CATALOG.some((entry) => entry.id === bloat.id)) {
      CATALOG.push(bloat)
    }
    merged.push(bloat)
  }

  return merged
}

export const OEM_CATALOG: OemApp[] = [
  // ── Samsung ───────────────────────────────────────────────────────────────
  {
    id: 'samsung-settings',
    name: 'Samsung Settings',
    description: 'Samsung PC settings and device configuration',
    manufacturer: 'samsung',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Samsung.SamsungSettings'
  },
  {
    id: 'samsung-update',
    name: 'Samsung Update',
    description: 'Samsung software and driver update utility',
    manufacturer: 'samsung',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Samsung.SamsungUpdate'
  },
  {
    id: 'samsung-flow',
    name: 'Samsung Flow',
    description: 'Sync notifications and files between Samsung devices',
    manufacturer: 'samsung',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Samsung.SamsungFlow'
  },
  {
    id: 'samsung-dex',
    name: 'Samsung DeX',
    description: 'Desktop experience for Samsung phones',
    manufacturer: 'samsung',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Samsung.SamsungDeX',
    note: 'Only relevant if using DeX'
  },
  {
    id: 'samsung-studio-plus',
    name: 'Samsung Studio Plus',
    description: 'Samsung media editing suite',
    manufacturer: 'samsung',
    safety: 'safe',
    removalMethod: 'appx',
    packagePatterns: ['SamsungMediaStudio*', 'Samsung.StudioPlus*']
  },
  {
    id: 'samsung-gallery',
    name: 'Samsung Gallery',
    description: 'Samsung photo gallery app',
    manufacturer: 'samsung',
    safety: 'safe',
    removalMethod: 'appx',
    packagePatterns: ['SamsungGallery*', 'Samsung.Gallery*']
  },
  {
    id: 'samsung-security',
    name: 'Samsung Security',
    description: 'Samsung device security and protection',
    manufacturer: 'samsung',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Samsung.SamsungSecurity'
  },

  // ── LG ────────────────────────────────────────────────────────────────────
  {
    id: 'lg-update-center',
    name: 'LG Update Center',
    description: 'LG software and driver updates',
    manufacturer: 'lg',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'LG.UpdateCenter'
  },
  {
    id: 'lg-smart-doctor',
    name: 'LG Smart Doctor',
    description: 'LG system diagnostics and maintenance',
    manufacturer: 'lg',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'LG.SmartDoctor'
  },
  {
    id: 'lg-on-screen-control',
    name: 'LG On Screen Control',
    description: 'LG monitor on-screen display utility',
    manufacturer: 'lg',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'LG.OnScreenControl',
    note: 'Useful for LG monitors; safe to remove if unused'
  },
  {
    id: 'lg-bridge',
    name: 'LG Bridge',
    description: 'LG phone backup and sync utility',
    manufacturer: 'lg',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'LG.LGBridge'
  },

  // ── HP ────────────────────────────────────────────────────────────────────
  {
    id: 'hp-support-assistant',
    name: 'HP Support Assistant',
    description: 'HP troubleshooting and support tool',
    manufacturer: 'hp',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'HP.HPSupportAssistant'
  },
  {
    id: 'hp-smart',
    name: 'HP Smart',
    description: 'HP printer setup and management',
    manufacturer: 'hp',
    safety: 'caution',
    removalMethod: 'winget',
    wingetId: 'HP.HPSmart',
    note: 'Used for printer setup'
  },
  {
    id: 'hp-audio-switch',
    name: 'HP Audio Switch',
    description: 'HP audio device switching utility',
    manufacturer: 'hp',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'HP.HPAudioSwitch'
  },
  {
    id: 'hp-wolf-security',
    name: 'HP Wolf Security',
    description: 'HP Sure Sense / Wolf Security suite',
    manufacturer: 'hp',
    safety: 'caution',
    removalMethod: 'winget',
    wingetId: 'HP.WolfSecurity',
    note: 'Security-related software'
  },
  {
    id: 'hp-connection-optimizer',
    name: 'HP Connection Optimizer',
    description: 'HP network connection optimization',
    manufacturer: 'hp',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'HP.HPConnectionOptimizer'
  },
  {
    id: 'hp-myhp',
    name: 'myHP',
    description: 'HP companion app for device management',
    manufacturer: 'hp',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'HP.myHP'
  },

  // ── Dell ──────────────────────────────────────────────────────────────────
  {
    id: 'dell-supportassist',
    name: 'Dell SupportAssist',
    description: 'Dell diagnostics and support assistant',
    manufacturer: 'dell',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Dell.DellSupportAssist'
  },
  {
    id: 'dell-update',
    name: 'Dell Update',
    description: 'Dell driver and firmware updates',
    manufacturer: 'dell',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Dell.DellUpdate'
  },
  {
    id: 'dell-digital-delivery',
    name: 'Dell Digital Delivery',
    description: 'Dell software delivery service',
    manufacturer: 'dell',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Dell.DellDigitalDelivery'
  },
  {
    id: 'dell-mobile-connect',
    name: 'Dell Mobile Connect',
    description: 'Sync phone notifications to Dell PC',
    manufacturer: 'dell',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Dell.DellMobileConnect'
  },
  {
    id: 'dell-optimizer',
    name: 'Dell Optimizer',
    description: 'Dell battery, thermal, and performance tuning',
    manufacturer: 'dell',
    safety: 'caution',
    removalMethod: 'winget',
    wingetId: 'Dell.DellOptimizer',
    note: 'May manage battery/thermal'
  },
  {
    id: 'dell-command-update',
    name: 'Dell Command Update',
    description: 'Enterprise Dell update manager',
    manufacturer: 'dell',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Dell.CommandUpdate'
  },

  // ── Lenovo ────────────────────────────────────────────────────────────────
  {
    id: 'lenovo-vantage',
    name: 'Lenovo Vantage',
    description: 'Lenovo system settings and updates',
    manufacturer: 'lenovo',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Lenovo.LenovoVantage'
  },
  {
    id: 'lenovo-vantage-appx',
    name: 'Lenovo Vantage (Store)',
    description: 'Lenovo Vantage Microsoft Store app',
    manufacturer: 'lenovo',
    safety: 'safe',
    removalMethod: 'appx',
    packagePatterns: ['E0469640.LenovoCompanion*', '9WZDNCRFJ4MV*']
  },
  {
    id: 'lenovo-service-bridge',
    name: 'Lenovo Service Bridge',
    description: 'Lenovo support and service connectivity',
    manufacturer: 'lenovo',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Lenovo.ServiceBridge'
  },
  {
    id: 'lenovo-smart-appearance',
    name: 'Lenovo Smart Appearance',
    description: 'Lenovo camera appearance enhancement',
    manufacturer: 'lenovo',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Lenovo.SmartAppearance'
  },
  {
    id: 'lenovo-now',
    name: 'Lenovo Now',
    description: 'Lenovo news and tips companion',
    manufacturer: 'lenovo',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Lenovo.LenovoNow'
  },
  {
    id: 'lenovo-system-update',
    name: 'Lenovo System Update',
    description: 'Lenovo driver and BIOS update tool',
    manufacturer: 'lenovo',
    safety: 'caution',
    removalMethod: 'winget',
    wingetId: 'Lenovo.SystemUpdate',
    note: 'Used for driver updates'
  },

  // ── ASUS ──────────────────────────────────────────────────────────────────
  {
    id: 'asus-smart-gesture',
    name: 'ASUS Smart Gesture',
    description: 'ASUS touchpad gesture driver',
    manufacturer: 'asus',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'ASUS.SmartGesture'
  },
  {
    id: 'asus-live-update',
    name: 'ASUS Live Update',
    description: 'ASUS driver and firmware updates',
    manufacturer: 'asus',
    safety: 'caution',
    removalMethod: 'winget',
    wingetId: 'ASUS.LiveUpdate',
    note: 'Used for driver/firmware updates'
  },
  {
    id: 'asus-myasus',
    name: 'MyASUS',
    description: 'ASUS device support and services',
    manufacturer: 'asus',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'ASUS.MyASUS'
  },
  {
    id: 'asus-myasus-appx',
    name: 'MyASUS (Store)',
    description: 'MyASUS Microsoft Store app',
    manufacturer: 'asus',
    safety: 'safe',
    removalMethod: 'appx',
    packagePatterns: ['B9ECED6F.ASUSPCAssistant*']
  },
  {
    id: 'asus-giftbox',
    name: 'ASUS GiftBox',
    description: 'ASUS promotional software bundle',
    manufacturer: 'asus',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'ASUS.GiftBox'
  },
  {
    id: 'asus-armoury-crate',
    name: 'Armoury Crate',
    description: 'ASUS ROG system control and RGB',
    manufacturer: 'asus',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'ASUS.ArmouryCrate',
    note: 'Required for ROG RGB/fan control; safe to remove if unused'
  },

  // ── Acer ──────────────────────────────────────────────────────────────────
  {
    id: 'acer-care-center',
    name: 'Acer Care Center',
    description: 'Acer system maintenance and support',
    manufacturer: 'acer',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Acer.CareCentre'
  },
  {
    id: 'acer-quick-access',
    name: 'Acer Quick Access',
    description: 'Acer quick settings utility',
    manufacturer: 'acer',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Acer.QuickAccess'
  },
  {
    id: 'acer-configuration-manager',
    name: 'Acer Configuration Manager',
    description: 'Acer system configuration tool',
    manufacturer: 'acer',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Acer.ConfigurationManager'
  },
  {
    id: 'acer-launch-manager',
    name: 'Acer Launch Manager',
    description: 'Acer keyboard shortcut manager',
    manufacturer: 'acer',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'Acer.LaunchManager'
  },

  // ── MSI ───────────────────────────────────────────────────────────────────
  {
    id: 'msi-center',
    name: 'MSI Center',
    description: 'MSI system control, RGB, and performance',
    manufacturer: 'msi',
    safety: 'caution',
    removalMethod: 'winget',
    wingetId: 'Micro-Star.MSICenter',
    note: 'Controls RGB/fan/overclocking'
  },
  {
    id: 'msi-app-player',
    name: 'MSI App Player',
    description: 'MSI Android emulator for gaming',
    manufacturer: 'msi',
    safety: 'safe',
    removalMethod: 'winget',
    wingetId: 'MSI.MSIAppPlayer'
  },
  {
    id: 'msi-dragon-center',
    name: 'Dragon Center',
    description: 'Legacy MSI system utility (pre-MSI Center)',
    manufacturer: 'msi',
    safety: 'caution',
    removalMethod: 'winget',
    wingetId: 'MSI.DragonCenter',
    note: 'Legacy utility; superseded by MSI Center on newer devices'
  },

  // ── Microsoft Surface ─────────────────────────────────────────────────────
  {
    id: 'surface-app',
    name: 'Surface App',
    description: 'Microsoft Surface device settings',
    manufacturer: 'microsoft',
    safety: 'safe',
    removalMethod: 'appx',
    packagePatterns: ['Microsoft.Surface*', 'Microsoft.SurfaceApp*']
  },
  {
    id: 'surface-diagnostic-toolkit',
    name: 'Surface Diagnostic Toolkit',
    description: 'Surface hardware diagnostics',
    manufacturer: 'microsoft',
    safety: 'safe',
    removalMethod: 'appx',
    packagePatterns: ['Microsoft.SurfaceDiagnosticToolkit*']
  },
  {
    id: 'surface-audio',
    name: 'Surface Audio',
    description: 'Surface audio device management',
    manufacturer: 'microsoft',
    safety: 'safe',
    removalMethod: 'appx',
    packagePatterns: ['Microsoft.SurfaceAudio*']
  }
]

export function getOemAppsForManufacturer(manufacturer: OemManufacturer): OemApp[] {
  if (manufacturer === 'unknown') return []
  return OEM_CATALOG.filter((app) => app.manufacturer === manufacturer)
}
