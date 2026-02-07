# Bio-Link Depot Inventory System

Production-ready MVP inventory management system for Bio-Link Depot nonprofit warehouse.

## Quick Start

```powershell
# Bootstrap (from Windows PowerShell)
.\bootstrap.ps1
```

This will:
- Set up WSL dependencies
- Install Node + Python
- Run database migrations
- Start dev server
- Run smoke tests

## Credentials Setup

**IMPORTANT**: Before running, set up your credentials:

1. Copy `.env.example` to `.env`
2. Generate secure secrets (bootstrap does this automatically)
3. Update `DATABASE_URL` if needed
4. See `docs/CREDENTIALS.md` for full details

```powershell
# Check credentials setup
.\.ai\scripts\check-credentials.ps1
```

## Architecture

- **Frontend**: Next.js (TypeScript) - Mobile-friendly warehouse UI
- **Backend**: Node.js (TypeScript) OR Python (FastAPI)
- **Database**: Postgres (local via docker-compose)
- **Storage**: Local dev (filesystem), Deploy (S3-compatible)

## Features

- ✅ Granular containment (arbitrary nesting: boxes→bags→items)
- ✅ Barcode/QR scanning (webcam)
- ✅ Label printing (PDF)
- ✅ Audit ledger (immutable event log)
- ✅ Org/program tracking
- ✅ Public catalog page
- ✅ Role-based access (ADMIN/WAREHOUSE)

## Structure

```
biolink-inventory/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # Backend API
├── packages/
│   └── shared/              # Shared types/schemas
├── .ai/                     # Harness integration
├── docs/                     # PRD, ADRs, runbooks
└── docker-compose.yml       # Postgres + services
```

## Documentation

- `docs/PRD.md` - Product requirements
- `docs/ARCHITECTURE.md` - System architecture
- `docs/DATA_MODEL.md` - Domain model with examples
- `docs/RUNBOOK.md` - Operations guide
- `docs/CREDENTIALS.md` - **Credentials and environment variables**

## Development Workflow

### Launch from Codex CLI

```bash
# Launch all servers
codex exec powershell -File .ai/scripts/launch-dev.ps1

# Monitor logs
codex exec powershell -File .ai/scripts/monitor-logs.ps1

# Full deploy loop
codex exec powershell -File .ai/scripts/deploy-loop.ps1
```

See `.ai/workflows/CODEX_INTEGRATION.md` for full details.

## Deployment

### Railway
1. Create Railway project
2. Add Postgres service
3. Add environment variables in Railway dashboard
4. Push to GitHub (auto-deploys via GitHub Actions)

### Supabase
1. Create Supabase project
2. Get credentials from dashboard
3. Add to environment variables
4. Deploy via Railway or Vercel

See `docs/CREDENTIALS.md` for credential setup.
