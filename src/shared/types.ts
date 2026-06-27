/** How risky it is to remove an app from the system. */
export type SafetyLevel = 'safe' | 'caution' | 'never'

/** Grouping used for filtering and display in the UI. */
export type AppCategory = 'apps' | 'games_xbox' | 'microsoft' | 'widgets_ai' | 'oem' | 'system'

/** How the app should be uninstalled when the user confirms removal. */
export type RemovalMethod = 'appx' | 'winget' | 'special'

/** A removable Windows default app entry in the catalog. */
export interface BloatApp {
  /** Stable slug, e.g. 'solitaire' */
  id: string
  /** Human-readable display name */
  name: string
  /** One-line description of what the app does */
  description: string
  category: AppCategory
  safety: SafetyLevel
  /** Get-AppxPackage wildcard patterns used to detect installed packages */
  packagePatterns: string[]
  removalMethod: RemovalMethod
  /** Winget package ID when winget is used as a fallback uninstaller */
  wingetId?: string
  /** Extra context shown to the user before removal */
  note?: string
  /** How to reinstall the app if the user changes their mind */
  reinstallHint?: string
}
