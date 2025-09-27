# Migration to Next.js - Quick Start Guide

## Current Status
✅ **Next.js Frontend Created**: `frontend-nextjs/` directory with basic setup
✅ **PM2 Configuration Updated**: Points to Next.js frontend
✅ **Deployment Scripts Updated**: Uses Next.js build process

## Next Steps

### 1. Install Dependencies
```bash
cd frontend-nextjs
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

### 3. Start Development
```bash
# From root directory
npm run dev
# OR individually
npm run dev:backend  # Backend on :8000
npm run dev:frontend # Next.js on :3000
```

### 4. Test Basic Functionality
- Visit http://localhost:3000
- Test sign-in page at http://localhost:3000/auth/signin
- Verify dashboard redirect after authentication

## Migration Progress

### ✅ Completed
- [x] Next.js 14 setup with App Router
- [x] Material-UI v5 integration
- [x] NextAuth.js configuration
- [x] Supabase client setup
- [x] Basic authentication pages
- [x] PM2 process management
- [x] Deployment scripts

### 🔄 In Progress
- [ ] Migrate existing React components
- [ ] Setup API route proxies
- [ ] Implement dashboard components
- [ ] Add Stripe integration
- [ ] Configure Sentry monitoring

### 📋 Todo
- [ ] Migrate KOL search functionality
- [ ] Migrate campaign management
- [ ] Migrate analytics components
- [ ] Setup file uploads with Supabase Storage
- [ ] Add comprehensive testing

## Key Changes Made

### 1. Technology Stack
- **Old**: React + Vite + JWT
- **New**: Next.js + NextAuth.js + Supabase Auth

### 2. Authentication
- **Old**: Custom JWT implementation
- **New**: NextAuth.js with Supabase adapter

### 3. Database
- **Old**: Self-hosted PostgreSQL
- **New**: Supabase PostgreSQL (SaaS)

### 4. Deployment
- **Old**: Docker + Kubernetes
- **New**: PM2 + Nginx (local processes)

## File Structure
```
anea/
├── backend/                    # Express API (unchanged)
├── frontend/                   # Old React frontend (keep for reference)
├── frontend-nextjs/            # New Next.js frontend
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── lib/               # Utilities (Supabase, theme)
│   │   └── components/        # React components
│   ├── package.json
│   └── next.config.js
├── deployment/                 # Deployment scripts
├── ecosystem.config.js         # PM2 configuration
└── package.json               # Root scripts
```

## Environment Variables Required

### Next.js (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Backend (.env)
```env
NODE_ENV=development
PORT=8000
# Add Supabase connection if needed
```

## Testing the Setup

### 1. Backend Health Check
```bash
curl http://localhost:8000/health
```

### 2. Frontend Access
```bash
curl http://localhost:3000
```

### 3. Authentication Flow
1. Visit http://localhost:3000
2. Click "Sign In"
3. Enter credentials
4. Should redirect to dashboard

## Rollback Plan
If issues occur:
1. Keep old `frontend/` directory intact
2. Update `ecosystem.config.js` to point back to old frontend
3. Revert deployment scripts
4. Continue using React + Vite setup

## Production Deployment
Once migration is complete:
```bash
# Build and deploy
npm run build
./deployment/deploy.sh production

# Monitor
pm2 monit
```

The infrastructure is now simplified and ready for SaaS-first deployment!