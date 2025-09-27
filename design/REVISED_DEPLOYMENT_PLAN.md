# KOL Matching Platform - Revised Deployment Plan

## Architecture Overview

### Technology Stack Changes
- **Frontend**: Next.js 14+ (replacing React + Vite)
- **Backend**: Node.js + Express (unchanged)
- **Database**: Supabase PostgreSQL (SaaS)
- **Authentication**: NextAuth.js + Supabase Auth
- **Payments**: Stripe (SaaS)
- **File Storage**: Supabase Storage
- **Email**: Resend or SendGrid (SaaS)
- **Analytics**: Vercel Analytics + Mixpanel (SaaS)
- **Monitoring**: Sentry (SaaS)
- **Deployment**: Local processes with PM2

### Infrastructure Simplification
- **No Docker/Kubernetes**: Direct local deployment
- **No Redis**: Use in-memory sessions or database sessions
- **No Caching**: Rely on SaaS provider caching
- **SaaS First**: Minimize self-hosted components

## Environment Setup

### Development Environment
```bash
# Local development - all services run locally
npm run dev:backend    # Backend on :8000
npm run dev:frontend   # Next.js on :3000
```

### Staging Environment
```bash
# Staging server - single VPS/EC2 instance
pm2 start ecosystem.staging.config.js
```

### Production Environment
```bash
# Production server - single VPS/EC2 instance
pm2 start ecosystem.production.config.js
```

## Deployment Strategy

### Single Server Deployment
- **Server Requirements**: 4GB RAM, 2 CPU cores, 50GB SSD
- **OS**: Ubuntu 22.04 LTS
- **Process Manager**: PM2 for process management
- **Reverse Proxy**: Nginx for SSL termination and routing
- **SSL**: Let's Encrypt via Certbot

### SaaS Services Integration

#### 1. Supabase (Database + Auth + Storage)
```javascript
// supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

#### 2. NextAuth.js Configuration
```javascript
// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'

export default NextAuth({
  providers: [
    // Email/Password + OAuth providers
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
})
```

#### 3. Stripe Integration (Unchanged)
```javascript
// Existing Stripe integration remains the same
```

#### 4. Resend for Email
```javascript
// lib/email.js
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to, subject, html) {
  return await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to,
    subject,
    html,
  })
}
```

## File Structure Changes

### New Next.js Structure
```
anea/
├── backend/                 # Express API server
│   ├── src/
│   ├── package.json
│   └── ecosystem.config.js
├── frontend/               # Next.js application
│   ├── pages/
│   ├── components/
│   ├── lib/
│   ├── styles/
│   ├── public/
│   ├── next.config.js
│   └── package.json
├── database/              # Supabase migrations
│   ├── migrations/
│   └── seed.sql
└── deployment/           # Deployment scripts
    ├── nginx.conf
    ├── setup.sh
    └── deploy.sh
```

## Environment Configuration

### Development (.env.local)
```env
# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# External Services
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
YOUTUBE_API_KEY=your-youtube-key
RESEND_API_KEY=your-resend-key
SENTRY_DSN=your-sentry-dsn
```

### Production (.env.production)
```env
# Next.js
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-nextauth-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Backend API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# External Services (Live keys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
YOUTUBE_API_KEY=your-youtube-key
RESEND_API_KEY=your-resend-key
SENTRY_DSN=your-sentry-dsn
```

## Process Management with PM2

### PM2 Ecosystem Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'kol-backend',
      script: './backend/src/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 8000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8000
      }
    },
    {
      name: 'kol-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      instances: 1,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
}
```

## Nginx Configuration

### Nginx Setup
```nginx
# /etc/nginx/sites-available/kol-platform
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Deployment Scripts

### Server Setup Script
```bash
#!/bin/bash
# deployment/setup.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create application directory
sudo mkdir -p /var/www/kol-platform
sudo chown $USER:$USER /var/www/kol-platform
```

### Deployment Script
```bash
#!/bin/bash
# deployment/deploy.sh

ENV=${1:-production}

echo "Deploying to $ENV environment..."

# Pull latest code
git pull origin main

# Install dependencies
cd backend && npm ci --production
cd ../frontend && npm ci --production

# Build frontend
npm run build

# Restart services
pm2 restart ecosystem.config.js --env $ENV

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

echo "Deployment complete!"
```

## Monitoring and Logging

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs kol-backend
pm2 logs kol-frontend

# Process status
pm2 status
```

### Sentry Integration
```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig({
  // Next.js config
}, {
  // Sentry config
  silent: true,
  org: 'your-org',
  project: 'kol-platform',
})
```

## Backup Strategy

### Database Backup (Supabase)
- Automatic daily backups included in Supabase Pro plan
- Point-in-time recovery available
- Manual backup via Supabase CLI if needed

### Application Backup
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/kol-platform_$DATE.tar.gz /var/www/kol-platform
```

## Cost Optimization

### SaaS Service Costs (Monthly)
- **Supabase Pro**: $25/month (includes database, auth, storage)
- **Vercel Pro**: $20/month (if using Vercel deployment)
- **Stripe**: 2.9% + 30¢ per transaction
- **Resend**: $20/month for 100k emails
- **Sentry**: $26/month for error tracking
- **VPS**: $20-40/month (DigitalOcean, Linode, AWS EC2)

**Total**: ~$111-131/month (excluding transaction fees)

## Migration from Current Setup

### Phase 1: Frontend Migration to Next.js
1. Create new Next.js project
2. Migrate React components to Next.js pages/components
3. Implement NextAuth.js
4. Update API calls to use Next.js API routes where beneficial

### Phase 2: Database Migration to Supabase
1. Export current PostgreSQL data
2. Set up Supabase project
3. Import data to Supabase
4. Update connection strings

### Phase 3: Deployment Simplification
1. Remove Docker configurations
2. Set up PM2 process management
3. Configure Nginx reverse proxy
4. Implement deployment scripts

### Phase 4: SaaS Integration
1. Replace custom email with Resend
2. Add Sentry for monitoring
3. Implement Vercel Analytics
4. Remove Redis dependencies

## Quick Start Commands

### Development
```bash
# Start development environment
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Production Deployment
```bash
# Initial setup
./deployment/setup.sh

# Deploy application
./deployment/deploy.sh production

# Monitor services
pm2 monit
```

This revised plan eliminates Docker/Kubernetes complexity while maintaining all core functionality through SaaS services and local deployment with PM2.