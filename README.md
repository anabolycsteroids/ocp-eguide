# OCP eGuide

Interactive OCP Jorf Lasfar campus guide — Next.js 16 frontend, Express/Prisma API,
PostgreSQL, and a calibrated PNG map used as the authoritative coordinate surface.

## Repository layout

```
freebuff-frontend/   Next.js 16 app (React 19, Tailwind 4) — port 3000
backend/             Express + Prisma REST API (+ Socket.IO) — port 5000
map-calibration/     Source-of-truth calibration artifacts (GPS list, control points, master PNG)
scripts/dev-all.sh   One-command local development
render.yaml          Backend deployment blueprint (Render)
start.sh             Local "production-style" run (built artifacts + ephemeral PostgreSQL)
```

## Quick start (one command)

```bash
npm run dev:all
```

Starts everything: ephemeral PostgreSQL (auto-downloads/restores binaries after a
WSL reboot), Prisma migrations, backend on http://localhost:5000, and the frontend
dev server on http://localhost:3000. Press Ctrl+C to stop both servers.

Individual services:

```bash
npm run dev:frontend    # freebuff-frontend only
npm run dev:backend     # backend only
npm run build           # production build of both
```

First boot copies `.env.example` → `.env` / `.env.local` automatically if missing.
Real secrets live only in those local files and are never committed.

## The map (do not break this)

The calibrated wide screenshot **`freebuff-frontend/public/assets/map/campus-map-wide.png`
(776×942 px)** is the authoritative coordinate surface for the whole application.

- GPS lat/lng is immutable truth (`places.json`, source: `map-calibration/locations_coordinates_corrected.txt`).
- An affine transform (8 control points, RMS 14.44 px ≈ ±100 m) projects GPS → PNG pixels
  (`mapX/mapY` in `public/assets/map/places.json`, v5.0.0, 95 locations).
- `OCPMap.tsx` renders a `MapViewport → MapWorld` tree: the PNG, every marker, label,
  leader line and the A* route polyline live inside one transformed world div, so they
  can never drift relative to the PNG during zoom/pan/resize/fullscreen/browser-zoom.
- Coordinates are normalized (`mapX / width`) before rendering; anything outside the
  PNG bounds is rejected with an on-screen banner + console warning, never silently clamped.
- Search, markers, route endpoints and pathfinding all read the same dataset — there is
  exactly one coordinate system.

Regenerating map data after recalibration:

```bash
npm run map:regen -- --force        # rebuild places/nodes/edges/config from calibration
# calibration tool: http://localhost:3000/calibrate
```

## Environment variables

Frontend (`freebuff-frontend/.env.local`, see `.env.example`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL (local: `http://localhost:5000`; prod: Render URL) |

Backend (`backend/.env`, see `.env.example`): `DATABASE_URL`, `JWT_SECRET`,
`JWT_REFRESH_SECRET`, `PORT`, `CORS_ORIGIN` (**comma-separated** list of allowed
frontend origins: local + preview + production), `FRONTEND_URL`, rate-limit settings.

## Git workflow

- `main` → production branch (auto-deploys to Vercel production once connected).
- `develop` → integration branch; push feature branches off it:
  `feature/<topic>` → preview deployment on Vercel → test → merge to `develop`/`main`.

```bash
git checkout -b feature/map-polish develop
# edit, commit...
git push -u origin feature/map-polish     # creates a Vercel preview URL
```

## Deployment

| Piece | Provider | Config |
|---|---|---|
| Frontend | Vercel | Root directory: `freebuff-frontend`. Env: `NEXT_PUBLIC_API_URL=<render-url>` |
| Backend | Render | Blueprint: `render.yaml` (health check `/api/health`). Env: link a PostgreSQL instance, set `CORS_ORIGIN=<vercel-url>,<preview-domains>`, `FRONTEND_URL` |

Manual steps that require account access (cannot be done from here):

1. Push the repo to GitHub (create an empty repo, then
   `git remote add origin <url> && git push -u origin main && git push origin develop`).
2. On [vercel.com](https://vercel.com): import that repo → set root directory
   `freebuff-frontend` → add env var `NEXT_PUBLIC_API_URL`.
3. On [render.com](https://render.com): New → Blueprint → point at the repo;
   link/create a PostgreSQL database (fills `DATABASE_URL`); set `CORS_ORIGIN`
   and `FRONTEND_URL` to your Vercel URLs; deploy.
4. Run seed/migrations once against the hosted DB if needed:
   `DATABASE_URL=<prod-url> npx prisma migrate deploy` from `backend/`.

Every push afterwards deploys automatically: branch push → preview, `main` push → production.
The repo stays fully editable locally at all times — deployment never freezes the code.
