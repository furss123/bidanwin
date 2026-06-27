/**
 * Generates BidanWin app icons from a source PNG logo.
 * Pipeline: remove white background → auto-crop → center on square canvas → resize → ICO.
 *
 * Source: src/renderer/public/icon.png (place your logo there before running).
 */
import { mkdir, writeFile, unlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'build', 'icons')
const inputPath = join(root, 'src', 'renderer', 'public', 'icon.png')
const tempCentered = join(outDir, '.icon-temp-centered.png')

const SIZES = [16, 32, 48, 64, 128, 256]

function removeWhiteBackground(pixels) {
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]

    if (r > 240 && g > 240 && b > 240) {
      pixels[i + 3] = 0
    } else if (r > 200 && g > 200 && b > 200) {
      const whiteness = Math.min(r, g, b)
      pixels[i + 3] = Math.round(255 * (1 - (whiteness - 200) / 55))
    } else if (r < 15 && g < 15 && b < 15) {
      // Near-black background (current BD logo source uses black canvas)
      pixels[i + 3] = 0
    } else if (r < 55 && g < 55 && b < 55) {
      const blackness = Math.max(r, g, b)
      pixels[i + 3] = Math.round(pixels[i + 3] * ((blackness - 15) / 40))
    }
  }
}

function findContentBounds(pixels, width, height) {
  let minX = width
  let maxX = 0
  let minY = height
  let maxY = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = pixels[(y * width + x) * 4 + 3]
      if (alpha > 10) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error('No opaque content found after background removal.')
  }

  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.05)
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(width - 1, maxX + pad)
  maxY = Math.min(height - 1, maxY + pad)

  return { minX, minY, maxX, maxY }
}

await mkdir(outDir, { recursive: true })

const meta = await sharp(inputPath).metadata()
console.log(`  original size: ${meta.width}×${meta.height}`)

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const pixels = new Uint8Array(data)
removeWhiteBackground(pixels)

const { minX, minY, maxX, maxY } = findContentBounds(pixels, info.width, info.height)
const contentW = maxX - minX + 1
const contentH = maxY - minY + 1

console.log(
  `  bounding box: x=${minX}..${maxX}, y=${minY}..${maxY} (${contentW}×${contentH})`
)

const croppedBuffer = await sharp(Buffer.from(pixels), {
  raw: { width: info.width, height: info.height, channels: 4 }
})
  .extract({ left: minX, top: minY, width: contentW, height: contentH })
  .png()
  .toBuffer()

const canvasSize = Math.round(Math.max(contentW, contentH) * 1.1)
const offsetX = Math.round((canvasSize - contentW) / 2)
const offsetY = Math.round((canvasSize - contentH) / 2)

console.log(`  canvas size: ${canvasSize}×${canvasSize} (offset ${offsetX}, ${offsetY})`)

const centeredBuffer = await sharp({
  create: {
    width: canvasSize,
    height: canvasSize,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  }
})
  .composite([{ input: croppedBuffer, left: offsetX, top: offsetY }])
  .png()
  .toBuffer()

await sharp(centeredBuffer).png().toFile(tempCentered)

const pngPaths = []

for (const size of SIZES) {
  const outPath = join(outDir, `icon_${size}.png`)
  await sharp(centeredBuffer).resize(size, size).png().toFile(outPath)
  pngPaths.push(outPath)
  console.log(`  wrote icon_${size}.png (${size}×${size})`)
}

const icon512 = join(outDir, 'icon.png')
await sharp(centeredBuffer).resize(512, 512).png().toFile(icon512)
console.log(`  wrote icon.png (512×512)`)

const icoBuffer = await pngToIco(pngPaths)
const icoPath = join(outDir, 'icon.ico')
await writeFile(icoPath, icoBuffer)
console.log(`  wrote icon.ico`)

await unlink(tempCentered)
console.log('Icon generation complete.')
