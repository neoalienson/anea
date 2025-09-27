# KOL Matching Platform

A web-based platform that connects small to medium businesses (SMBs) with Key Opinion Leaders (KOLs) for marketing campaigns.

## Project Status

### ✅ Completed (Phases 1-7)
- [x] **Phase 1: Foundation** - Project structure, database, authentication
- [x] **Phase 2: User Management** - Registration, login, profiles, RBAC
- [x] **Phase 3: KOL Discovery** - YouTube API, search, matching algorithm
- [x] **Phase 4: Campaign Management** - Creation, matching, collaboration
- [x] **Phase 5: Analytics** - Business dashboards, KOL tracking, reporting
- [x] **Phase 6: Payments** - Stripe integration, commission system
- [x] **Phase 7: Security** - GDPR compliance, audit logging, security hardening
- [x] **Frontend Application** - Complete React TypeScript UI with Material-UI
- [x] **Comprehensive Testing** - Unit, integration, E2E, performance tests

### ✅ Phase 8: Database Migration
- [x] **Supabase Integration** - PostgreSQL SaaS database
- [x] **Schema Migration** - All tables created
- [x] **Mock Data Population** - Test users and campaigns
- [x] **Environment Configuration** - Development setup complete

### 📋 Next Steps
- [ ] Production deployment
- [ ] CI/CD pipeline
- [ ] Monitoring setup

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (configured)

### Setup
1. **Install dependencies:**
```bash
npm install
cd backend && npm install
cd ../frontend-nextjs && npm install
```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update Supabase credentials in `.env` and `frontend-nextjs/.env.local`

3. **Database setup:**
   - Schema already created in Supabase
   - Mock data populated

4. **Start development:**
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend-nextjs && npm run dev
```

### Test Accounts
- Business: `techcorp@example.com` / `password123`
- Business: `fashionbrand@example.com` / `password123`
- KOL: `techreviewer@example.com` / `password123`
- KOL: `beautyguru@example.com` / `password123`
- KOL: `gamingpro@example.com` / `password123`

## Features

- **User Management:** Business and KOL registration/authentication
- **KOL Discovery:** Search and filter KOLs by audience, engagement, categories
- **Campaign Management:** Create, manage, and track marketing campaigns
- **Analytics Dashboard:** Performance metrics and reporting
- **Payment Processing:** Stripe integration with commission system
- **YouTube Integration:** Real-time channel analytics and metrics

## Technology Stack

### Backend
- Node.js 18+ + Express.js
- Supabase PostgreSQL
- JWT authentication with refresh tokens
- Stripe payment processing
- YouTube Data API v3 integration
- Security middleware and rate limiting

### Frontend
- Next.js 14+ with TypeScript
- Material-UI v5 design system
- NextAuth.js for authentication
- Axios for API calls
- Recharts for analytics visualization
- Stripe Elements for payments

### Database
- Supabase PostgreSQL (SaaS)
- JSONB for flexible data
- Proper indexing for performance
- Audit logging tables
- GDPR compliance schema



## Environment Variables

See `.env.example` files in backend and frontend directories for required environment variables.