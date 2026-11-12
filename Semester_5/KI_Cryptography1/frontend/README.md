# Schematics NIC — Frontend (`frontend/`)

React + TypeScript + Vite frontend for the Schematics NIC triple-cipher registration and submission platform.

## Environment Setup

Copy `.env.example` to `.env` for local overrides (optional; defaults use Vite's `/api` proxy to `http://127.0.0.1:5000`):

```bash
cp .env.example .env
npm install
```

## Scripts

- `npm run dev` — Run Vite dev server (`http://127.0.0.1:5173`) proxying `/api/*` to Flask (`http://127.0.0.1:5000`).
- `npm run dev:mock` — Run Vite dev server with opt-in Mock Service Worker (`VITE_ENABLE_MSW=true`).
- `npm run build` — Typecheck (`tsc -b`) and build production bundle.
- `npm run lint` — Run linter (`oxlint`).
- `npm test` — Run unit & component tests once (`vitest run`).
- `npm run test:e2e` — Run Playwright end-to-end tests (`playwright test`).
