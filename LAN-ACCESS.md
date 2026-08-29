# LAN Access — OCP e-Guide

Access the app from other devices (iPad, phone, another laptop) on the same Wi-Fi.

## Quick Start

```bash
# 1. Start Docker (PostgreSQL + Redis)
cd backend && docker compose up -d

# 2. Run migrations
npx prisma migrate deploy

# 3. Start backend (already binds 0.0.0.0:5000)
screen -dmS backend npx tsx src/server.ts

# 4. Start frontend (already binds 0.0.0.0:3000)
cd ../freebuff-frontend && LAN_IP=192.168.1.2 screen -dmS frontend npm run dev
```

## URLs

| Device        | Frontend                | Backend API            |
|---------------|-------------------------|------------------------|
| This laptop   | http://localhost:3000    | http://localhost:5000   |
| iPad / LAN    | http://192.168.1.2:3000 | http://192.168.1.2:5000 |

## How It Works

- Both servers bind to `0.0.0.0` (all network interfaces).
- The frontend detects the API host dynamically from `window.location.hostname`.
  - Laptop: page loaded from `localhost` → API at `localhost:5000`
  - iPad: page loaded from `192.168.1.2` → API at `192.168.1.2:5000`
- Backend CORS allows `localhost:3000`, `127.0.0.1:3000`, and `192.168.1.2:3000`.

## Windows Firewall

Ports **3000** and **5000** must be allowed inbound on your private network.

### Create the rule (run PowerShell as Administrator):

```powershell
New-NetFirewallRule -DisplayName "OCP e-Guide Frontend (3000)" `
  -Direction Inbound -Protocol TCP -LocalPort 3000 `
  -Action Allow -Profile Private

New-NetFirewallRule -DisplayName "OCP e-Guide Backend (5000)" `
  -Direction Inbound -Protocol TCP -LocalPort 5000 `
  -Action Allow -Profile Private
```

### Remove later if needed:

```powershell
Remove-NetFirewallRule -DisplayName "OCP e-Guide Frontend (3000)"
Remove-NetFirewallRule -DisplayName "OCP e-Guide Backend (5000)"
```

## If Your LAN IP Changes

1. Check your IP: `powershell.exe -Command "Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Ethernet'"` (or Wi-Fi)
2. Update `backend/.env` — add the new IP to `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000,http://NEW_IP:3000
   ```
3. Restart the backend.
4. Restart the frontend with the new IP: `LAN_IP=NEW_IP npm run dev`

## Security Notes

- CORS is restricted to specific origins (no wildcard `*`).
- Helmet security headers are active.
- Rate limiting is active on all endpoints.
- JWT authentication is required for protected routes.
- PostgreSQL and Redis are NOT exposed to the LAN (Docker binds them to localhost).
- No secrets are exposed to the frontend.
