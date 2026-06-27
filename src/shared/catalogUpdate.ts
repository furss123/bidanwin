import type { BloatApp } from './types'

export interface RemoteCatalogManifest {
  version: string
  updatedAt: string
  minAppVersion: string
  apps: BloatApp[]
  changelog: string
  removedIds?: string[]
}

export interface CatalogUpdateResult {
  status: 'up-to-date' | 'updated' | 'error' | 'skipped'
  newApps: BloatApp[]
  removedIds: string[]
  remoteVersion?: string
  changelog?: string
  error?: string
  cacheFetchedAt?: number
}

export interface CatalogCache {
  fetchedAt: number
  manifest: RemoteCatalogManifest
}

export interface DismissedCatalogUpdates {
  dismissedVersion: string | null
}
