# Paint Inventory

プラモデル塗料・資材インベントリ管理 PWA。React + Vite + TypeScript +
TailwindCSS + Zustand + Supabase 構成。

## Stack

| 領域       | 技術                                            |
| ---------- | ----------------------------------------------- |
| Framework  | React 19, Vite 7, TypeScript 5                  |
| UI         | TailwindCSS, Radix Primitives, lucide-react     |
| State      | Zustand (selector hooks)                        |
| Validation | Zod                                             |
| Auth       | Supabase Auth (PKCE) — Email OTP + Google OAuth |
| Database   | Supabase Postgres + RLS                         |
| Camera     | `BarcodeDetector` w/ ZXing fallback             |
| Lookup     | Yahoo Shopping (Vercel serverless proxy)        |
| PWA        | vite-plugin-pwa (Workbox autoUpdate)            |
| Notify     | sonner (toast)                                  |

## Getting Started

```bash
npm install
cp .env.example .env.local       # fill VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev
```

DB マイグレーションは `supabase/migrations/` を `supabase db push` で適用してください。

## Scripts

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Dev server (Vite)                 |
| `npm run build`     | Type-check + production build     |
| `npm run typecheck` | tsc only                          |
| `npm run lint`      | ESLint                            |
| `npm run preview`   | Preview the production build      |

## Architecture

```
src/
  app.tsx              # routes + providers
  main.tsx             # entry
  pages/               # route-level components
  components/
    ui/                # primitives (button, input, dialog, …)
    layout/            # AppShell / Header / BottomNav
    paint/             # domain components (PaintCard / PaintForm / ScanView …)
  lib/                 # supabase client, validators, image, barcode, …
  stores/              # Zustand stores (paints) + Auth context
  types/               # paint domain types
supabase/migrations/   # SQL migrations + RLS policies
api/                   # Vercel serverless functions (yahoo-lookup)
```

## Security

詳細は [SECURITY.md](./SECURITY.md) を参照。

---

> "Everything's in order. Don't embarrass me." — BISCUIT
