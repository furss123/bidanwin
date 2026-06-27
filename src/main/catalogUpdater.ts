import { app } from 'electron'
import { existsSync } from 'fs'
import { readFile, rename, writeFile } from 'fs/promises'
import { join } from 'path'
import { CATALOG, CATALOG_VERSION, BUNDLED_CATALOG_IDS, isBlocked, mergeCatalogUpdates } from '../shared/catalog'
import type {
  CatalogCache,
  CatalogUpdateResult,
  DismissedCatalogUpdates,
  RemoteCatalogManifest
} from '../shared/catalogUpdate'
import type { BloatApp } from '../shared/types'

export const REMOTE_CATALOG_URL =
  'https://raw.githubusercontent.com/hyot/bidanwin/main/catalog/catalog.json'

const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000
const FETCH_TIMEOUT_MS = 10_000

let lastCatalogUpdateResult: CatalogUpdateResult | null = null

function cachePath(): string {
  return join(app.getPath('userData'), 'catalog-cache.json')
}

function dismissedPath(): string {
  return join(app.getPath('userData'), 'dismissed-updates.json')
}

function compareSemver(a: string, b: string): number {
  const parse = (v: string): number[] => v.split('.').map((part) => Number(part) || 0)
  const pa = parse(a)
  const pb = parse(b)
  const len = Math.max(pa.length, pb.length, 3)

  for (let i = 0; i < len; i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

function isValidBloatApp(entry: unknown): entry is BloatApp {
  if (!entry || typeof entry !== 'object') return false
  const appEntry = entry as Record<string, unknown>
  return (
    typeof appEntry.id === 'string' &&
    typeof appEntry.name === 'string' &&
    Array.isArray(appEntry.packagePatterns) &&
    appEntry.packagePatterns.length > 0 &&
    appEntry.packagePatterns.every((pattern) => typeof pattern === 'string')
  )
}

function sanitizeApps(apps: unknown[]): BloatApp[] {
  const valid: BloatApp[] = []

  for (const entry of apps) {
    if (!isValidBloatApp(entry)) {
      console.warn('[catalogUpdater] Skipping invalid remote app entry:', entry)
      continue
    }
    valid.push(entry)
  }

  return valid
}

function validateManifest(data: unknown): RemoteCatalogManifest {
  if (!data || typeof data !== 'object') {
    throw new Error('Remote catalog is not a JSON object')
  }

  const manifest = data as Record<string, unknown>

  if (typeof manifest.version !== 'string' || !manifest.version.trim()) {
    throw new Error('Remote catalog missing version')
  }
  if (typeof manifest.updatedAt !== 'string') {
    throw new Error('Remote catalog missing updatedAt')
  }
  if (typeof manifest.minAppVersion !== 'string') {
    throw new Error('Remote catalog missing minAppVersion')
  }
  if (!Array.isArray(manifest.apps)) {
    throw new Error('Remote catalog missing apps array')
  }
  if (typeof manifest.changelog !== 'string') {
    throw new Error('Remote catalog missing changelog')
  }

  return {
    version: manifest.version,
    updatedAt: manifest.updatedAt,
    minAppVersion: manifest.minAppVersion,
    apps: sanitizeApps(manifest.apps),
    changelog: manifest.changelog,
    removedIds: Array.isArray(manifest.removedIds)
      ? manifest.removedIds.filter((id): id is string => typeof id === 'string')
      : undefined
  }
}

export async function loadCatalogCache(): Promise<CatalogCache | null> {
  const path = cachePath()
  if (!existsSync(path)) return null

  try {
    const raw = await readFile(path, 'utf-8')
    const parsed = JSON.parse(raw) as CatalogCache
    if (!parsed?.manifest || typeof parsed.fetchedAt !== 'number') {
      return null
    }
    const manifest = validateManifest(parsed.manifest)
    return { fetchedAt: parsed.fetchedAt, manifest }
  } catch {
    return null
  }
}

export async function saveCatalogCache(cache: CatalogCache): Promise<void> {
  const dir = app.getPath('userData')
  const path = join(dir, 'catalog-cache.json')
  const tmpPath = join(dir, 'catalog-cache.tmp.json')
  const content = JSON.stringify(cache, null, 2)
  await writeFile(tmpPath, content, 'utf-8')
  await rename(tmpPath, path)
}

export async function fetchRemoteCatalog(): Promise<RemoteCatalogManifest> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(REMOTE_CATALOG_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data: unknown = await response.json()
    return validateManifest(data)
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Catalog fetch timed out')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export function computeUpdate(
  _bundled: BloatApp[],
  remote: RemoteCatalogManifest,
  currentAppVersion: string
): CatalogUpdateResult {
  if (compareSemver(remote.minAppVersion, currentAppVersion) > 0) {
    return {
      status: 'skipped',
      newApps: [],
      removedIds: [],
      remoteVersion: remote.version,
      changelog: remote.changelog
    }
  }

  if (compareSemver(remote.version, CATALOG_VERSION) <= 0) {
    return {
      status: 'up-to-date',
      newApps: [],
      removedIds: [],
      remoteVersion: remote.version,
      changelog: remote.changelog
    }
  }

  const newApps = remote.apps.filter((app) => {
    if (BUNDLED_CATALOG_IDS.has(app.id)) return false
    if (CATALOG.some((existing) => existing.id === app.id)) return false
    return !app.packagePatterns.some((pattern) => isBlocked(pattern))
  })

  const removedIds = (remote.removedIds ?? []).filter((id) => BUNDLED_CATALOG_IDS.has(id))

  return {
    status: 'updated',
    newApps,
    removedIds,
    remoteVersion: remote.version,
    changelog: remote.changelog
  }
}

function applyUpdateResult(result: CatalogUpdateResult): CatalogUpdateResult {
  if (result.status === 'updated' && (result.newApps.length > 0 || result.removedIds.length > 0)) {
    mergeCatalogUpdates(result.newApps, result.removedIds)
  }
  lastCatalogUpdateResult = result
  return result
}

export async function checkForUpdates(
  currentAppVersion: string,
  options?: { force?: boolean }
): Promise<CatalogUpdateResult> {
  try {
    const force = options?.force ?? false
    const cache = await loadCatalogCache()
    let manifest: RemoteCatalogManifest
    let fetchedAt: number

    if (!force && cache && Date.now() - cache.fetchedAt < CACHE_MAX_AGE_MS) {
      manifest = cache.manifest
      fetchedAt = cache.fetchedAt
    } else {
      manifest = await fetchRemoteCatalog()
      fetchedAt = Date.now()
      await saveCatalogCache({ fetchedAt, manifest })
    }

    const result = applyUpdateResult(
      computeUpdate(CATALOG, manifest, currentAppVersion)
    )
    return { ...result, cacheFetchedAt: fetchedAt }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[catalogUpdater] Update check failed:', message)
    const result: CatalogUpdateResult = {
      status: 'error',
      newApps: [],
      removedIds: [],
      error: message
    }
    lastCatalogUpdateResult = result
    return result
  }
}

export function getLastCatalogUpdateResult(): CatalogUpdateResult | null {
  return lastCatalogUpdateResult
}

export async function getDismissedCatalogVersion(): Promise<string | null> {
  const path = dismissedPath()
  if (!existsSync(path)) return null

  try {
    const raw = await readFile(path, 'utf-8')
    const parsed = JSON.parse(raw) as DismissedCatalogUpdates
    return parsed.dismissedVersion ?? null
  } catch {
    return null
  }
}

export async function dismissCatalogUpdate(): Promise<void> {
  const version = lastCatalogUpdateResult?.remoteVersion
  if (!version) return

  const dir = app.getPath('userData')
  const path = join(dir, 'dismissed-updates.json')
  const tmpPath = join(dir, 'dismissed-updates.tmp.json')
  const content = JSON.stringify({ dismissedVersion: version } satisfies DismissedCatalogUpdates, null, 2)
  await writeFile(tmpPath, content, 'utf-8')
  await rename(tmpPath, path)
}

export async function runStartupCatalogCheck(
  currentAppVersion: string,
  onResult: (result: CatalogUpdateResult) => void
): Promise<void> {
  const cache = await loadCatalogCache()
  if (cache) {
    const cachedResult = applyUpdateResult(
      computeUpdate(CATALOG, cache.manifest, currentAppVersion)
    )
    onResult({ ...cachedResult, cacheFetchedAt: cache.fetchedAt })
  }

  const result = await checkForUpdates(currentAppVersion)
  onResult(result)
}
