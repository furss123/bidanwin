import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  Bot,
  Building2,
  Cpu,
  Gamepad2,
  LayoutGrid,
  Package
} from 'lucide-react'
import type { AppCategory } from '@shared/types'
import type { OemDetectionResult, OemManufacturer } from '@shared/oemCatalog'

/** Sidebar filter — all apps or a single catalog category. */
export type CategoryFilter = 'all' | AppCategory

/** Sidebar view — catalog filter, restore guide, history, or about. */
export type SidebarView = CategoryFilter | 'restore_guide' | 'history' | 'about'

export interface CategoryNavItem {
  id: CategoryFilter
  icon: LucideIcon
}

export const CATEGORY_NAV: CategoryNavItem[] = [
  { id: 'all', icon: LayoutGrid },
  { id: 'apps', icon: Package },
  { id: 'games_xbox', icon: Gamepad2 },
  { id: 'microsoft', icon: Building2 },
  { id: 'widgets_ai', icon: Bot },
  { id: 'oem', icon: Cpu },
  { id: 'system', icon: AlertTriangle }
]

const CATEGORY_ICONS: Record<AppCategory, LucideIcon> = {
  apps: Package,
  games_xbox: Gamepad2,
  microsoft: Building2,
  widgets_ai: Bot,
  oem: Cpu,
  system: AlertTriangle
}

export function getCategoryIcon(category: AppCategory): LucideIcon {
  return CATEGORY_ICONS[category]
}

export function getCategoryLabelKey(
  id: CategoryFilter
): keyof import('@shared/i18n').TranslationSchema['sidebar']['categories'] {
  const map = {
    all: 'all',
    apps: 'apps',
    games_xbox: 'gamesXbox',
    microsoft: 'microsoft',
    widgets_ai: 'widgetsAi',
    oem: 'oem',
    system: 'system'
  } as const
  return map[id]
}

export function getOemNavLabel(
  oemResult: OemDetectionResult | null,
  manufacturers: Record<OemManufacturer, string>,
  fallback: string
): string {
  if (!oemResult || oemResult.manufacturer === 'unknown') {
    return fallback
  }
  return manufacturers[oemResult.manufacturer]
}
