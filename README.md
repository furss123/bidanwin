# BidanWin (비단윈)

## ⬇️ Download / 다운로드

**[→ 최신 버전 다운로드 / Download latest release](https://github.com/hyot/bidanwin/releases/latest)**

Windows 10 / 11 지원 · 관리자 권한 필요

---

Windows desktop app to remove unwanted default apps — Electron + React + TypeScript + Tailwind CSS.

© 2026 HyoT · MIT License

## About BidanWin / 비단윈 소개

**비단윈 (BidanWin)** is a one-click Windows debloat tool that helps you remove pre-installed Microsoft Store apps safely. It catalogs 42 removable apps with safety ratings, offers a system restore point before removal, streams live progress logs, and includes a restore guide for rolling back changes.

Created by **HyoT**. Licensed under the **MIT License** — see [LICENSE](LICENSE).

## Stack

| Layer | Tool |
|---|---|
| Desktop shell | Electron |
| Bundler | [electron-vite](https://electron-vite.org/) |
| UI | React + TypeScript |
| Styling | Tailwind CSS |
| Packaging | electron-builder (NSIS installer) |

## Folder structure

```
BidanWin/
├── build/icons/              # Generated app icons (npm run generate-icon)
├── electron.vite.config.ts
├── LICENSE
├── package.json
├── scripts/generate-icon.mjs
├── src/
│   ├── main/                 # Electron main + removal engine
│   ├── preload/
│   ├── shared/               # Catalog, types, env
│   └── renderer/
└── dist/                     # Packaged installer output
```

## Building from source

### Prerequisites

- **Node.js 18+**
- **Windows** for real app removal (preview UI works on other OSes)
- Administrator privileges for removal and restore points

### Commands

```bash
# Install dependencies
npm install

# Generate app icon (required before packaging)
npm run generate-icon

# Run in development (hot reload)
npm run dev

# Build main + preload + renderer
npm run build

# Build Windows .exe installer (generates icon + build + package)
npm run build:all
```

The packaged installer is written to `dist/` (e.g. `BidanWin Setup 0.1.0.exe`).

### Icon generation

Place your source logo at `src/renderer/public/icon.png` before running `generate-icon`.

```bash
npm run generate-icon
```

Creates `build/icons/icon_{16,32,48,64,128,256}.png`, `icon.png`, and `icon.ico` from that source (white background is removed, content is cropped and centered on a transparent square canvas).

**Note:** `sharp` uses native binaries. If install fails, try:

```bash
npm install --ignore-scripts=false
# or on restrictive networks:
npm install sharp --build-from-source
```

## Disclaimer

**Removal is largely irreversible.** Some apps can be reinstalled from the Microsoft Store, but not all. Always create a **system restore point** before removing apps (BidanWin offers this before each batch). Use at your own risk. HyoT is not responsible for any system issues caused by removing Windows components.

## Verify the app

1. Run `npm run dev` — window title **비단윈 BidanWin**, splash screen, then main UI.
2. Sidebar → **정보** — About screen with icon, version, license link.
3. Relaunch as administrator to test real removal.

---

© 2026 HyoT · MIT License
