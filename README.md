# KOL Matching Platform

A web-based platform that connects small to medium businesses (SMBs) with Key Opinion Leaders (KOLs) for marketing campaigns.

## Project Status

### ✅ Completed (Phase 1)
- [x] Project structure setup
- [x] Git repository initialization
- [x] Backend foundation with Express.js + TypeScript
- [x] PostgreSQL database schema
- [x] Authentication system (JWT)
- [x] User registration and login
- [x] KOL search and profile endpoints
- [x] Mock data for testing
- [x] Basic unit tests

### 🚧 In Progress
- [ ] Frontend React application
- [ ] Campaign management system
- [ ] YouTube API integration

### 📋 Pending
- [ ] Payment integration
- [ ] Analytics dashboard
- [ ] Deployment setup

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

### KOL Search
- `GET /api/search/kols` - Search KOLs with filters
- `GET /api/kols/:id` - Get KOL profile

### Health Check
- `GET /health` - Server health status

## Technology Stack

### Backend
- Node.js + Express.js
- PostgreSQL with native queries
- JWT authentication
- Joi validation

### Database
- PostgreSQL 15+
- JSONB for flexible data
- Proper indexing for performance

## Testing
```bash
npm test
```

## Environment Variables
```
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/kol_platform
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```