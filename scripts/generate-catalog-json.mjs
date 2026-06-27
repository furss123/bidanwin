/**
 * Generates catalog/catalog.json from the bundled TypeScript catalog.
 * Run: npx tsx scripts/generate-catalog-json.mjs
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const { CATALOG, CATALOG_VERSION } = await import('../src/shared/catalog.ts')

const manifest = {
  version: CATALOG_VERSION,
  updatedAt: new Date().toISOString(),
  minAppVersion: '0.1.0',
  apps: CATALOG,
  changelog: 'Initial remote catalog'
}

const outDir = join(root, 'catalog')
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, 'catalog.json')
writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8')
console.log(`Wrote ${outPath} (${CATALOG.length} apps, v${CATALOG_VERSION})`)
