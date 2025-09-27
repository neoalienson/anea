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

### 🚧 In Progress (Phase 8)
- [ ] Final deployment configuration
- [ ] Production environment setup
- [ ] CI/CD pipeline implementation

### 📋 Next Steps
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Monitoring and alerting setup

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Database Setup
```bash
cd database
npm install
npm run setup
```

### Test Accounts
- Business: `techcorp@example.com` / `password123`
- KOL: `techreviewer@example.com` / `password123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### KOL Management
- `GET /api/kols` - Search KOLs with filters
- `GET /api/kols/:id` - Get KOL profile
- `PUT /api/kols/:id` - Update KOL profile
- `GET /api/kols/:id/analytics` - Get KOL analytics

### Campaign Management
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `POST /api/campaigns/:id/apply` - Apply to campaign

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `GET /api/payments/history` - Payment history
- `POST /api/payments/webhook` - Stripe webhook

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/campaigns/:id` - Campaign analytics
- `GET /api/analytics/performance` - Performance metrics

### GDPR Compliance
- `GET /api/gdpr/data-export` - Export user data
- `DELETE /api/gdpr/data-deletion` - Request data deletion
- `GET /api/gdpr/privacy-settings` - Get privacy settings

### Integrations
- `GET /api/integrations/youtube/channel/:id` - YouTube channel data
- `GET /api/integrations/youtube/analytics/:id` - YouTube analytics

### Health Check
- `GET /health` - Server health status

## Technology Stack

### Backend
- Node.js 18+ + Express.js
- PostgreSQL with native queries
- JWT authentication with refresh tokens
- Joi validation + Express Validator
- Stripe payment processing
- YouTube Data API v3 integration
- Winston logging
- Helmet security middleware
- Rate limiting and CORS

### Frontend
- React 18+ with TypeScript
- Material-UI v5 design system
- Redux Toolkit for state management
- React Router for navigation
- Axios for API calls
- Recharts for analytics visualization
- Stripe Elements for payments
- Vite build tool

### Database
- PostgreSQL 15+
- JSONB for flexible data
- Proper indexing for performance
- Audit logging tables
- GDPR compliance schema

### Testing
- Jest for unit testing
- Supertest for API testing
- React Testing Library
- Vitest for frontend testing
- NYC for coverage reporting

## Testing
```bash
npm test
```

## Environment Variables
```
# Server Configuration
NODE_ENV=development
PORT=8000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/kol_platform

# Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# External APIs
YOUTUBE_API_KEY=your-youtube-api-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# GDPR Compliance
DATA_RETENTION_DAYS=2555
COOKIE_CONSENT_REQUIRED=true
```