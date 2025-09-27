# KOL Matching Platform - Simplified

## Quick Start

### Development
```bash
# Install dependencies
npm run setup

# Start development (Windows)
start-dev.bat

# OR manually
cd backend && npm run dev
cd frontend-nextjs && npm run dev
```

### Production
```bash
# Deploy to server
./deployment/setup.sh
./deployment/deploy.sh production
```

## Architecture

- **Frontend**: Next.js 14 + Material-UI (`frontend-nextjs/`)
- **Backend**: Express.js API (`backend/`)
- **Database**: Supabase PostgreSQL
- **Deployment**: PM2 + Nginx
- **Monitoring**: Sentry

## Environment Setup

1. Copy `.env.example` to `.env.local` in `frontend-nextjs/`
2. Update with your Supabase, Stripe, and API keys
3. Run `npm run setup` to install dependencies

## URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Health: http://localhost:8000/health

## Removed
- ❌ Docker/Kubernetes configurations
- ❌ Old React+Vite frontend
- ❌ Redis dependencies
- ❌ Complex CI/CD pipelines

## SaaS Services
- Supabase: Database + Auth + Storage
- Stripe: Payments
- Resend: Email
- Sentry: Monitoring
- YouTube API: KOL data