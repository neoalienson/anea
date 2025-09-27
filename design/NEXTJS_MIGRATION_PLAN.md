# Next.js Migration Plan

## Migration Overview

### Current State
- React 18.2+ with Vite
- Separate frontend/backend architecture
- Material-UI v5
- JWT authentication

### Target State
- Next.js 14+ with App Router
- Integrated frontend with separate Express API
- NextAuth.js + Supabase Auth
- SaaS-first infrastructure

## Phase 1: Next.js Setup

### 1.1 Create Next.js Project
```bash
cd anea
npx create-next-app@latest frontend-nextjs --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 1.2 Install Dependencies
```bash
cd frontend-nextjs
npm install @mui/material @emotion/react @emotion/styled
npm install @next-auth/supabase-adapter next-auth
npm install @supabase/supabase-js
npm install @stripe/stripe-js stripe
npm install recharts
npm install @sentry/nextjs
npm install resend
```

### 1.3 Configure Next.js
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
}

module.exports = nextConfig
```

## Phase 2: Authentication Migration

### 2.1 NextAuth.js Setup
```javascript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Validate against Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials?.email!,
          password: credentials?.password!,
        })
        
        if (error) return null
        return data.user
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  }
})

export { handler as GET, handler as POST }
```

### 2.2 Supabase Client Setup
```javascript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Phase 3: Component Migration

### 3.1 Layout Migration
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { SessionProvider } from 'next-auth/react'
import { theme } from '@/lib/theme'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
```

### 3.2 Page Migration Strategy
```typescript
// app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import DashboardComponent from '@/components/Dashboard'

export default async function DashboardPage() {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/auth/signin')
  }

  return <DashboardComponent />
}
```

### 3.3 API Routes Migration
```typescript
// app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Proxy to Express API or implement directly
  const response = await fetch(`${process.env.BACKEND_URL}/api/campaigns`, {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
    },
  })
  
  const data = await response.json()
  return NextResponse.json(data)
}
```

## Phase 4: State Management

### 4.1 Context Providers
```typescript
// contexts/AppContext.tsx
'use client'
import { createContext, useContext, useReducer } from 'react'

interface AppState {
  user: any
  campaigns: any[]
  kols: any[]
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<any>
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
```

## Phase 5: Deployment Configuration

### 5.1 PM2 Ecosystem
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
      cwd: './frontend-nextjs',
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

### 5.2 Nginx Configuration
```nginx
# /etc/nginx/sites-available/kol-platform
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Next.js frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Express API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Phase 6: Environment Setup

### 6.1 Environment Variables
```env
# .env.local (development)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_API_URL=http://localhost:8000/api
BACKEND_URL=http://localhost:8000

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

YOUTUBE_API_KEY=your-youtube-key
RESEND_API_KEY=your-resend-key
SENTRY_DSN=your-sentry-dsn
```

### 6.2 Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

## Migration Timeline

### Week 1: Setup & Authentication
- [ ] Create Next.js project
- [ ] Setup NextAuth.js
- [ ] Configure Supabase integration
- [ ] Migrate authentication pages

### Week 2: Core Pages
- [ ] Migrate dashboard components
- [ ] Migrate KOL search and profiles
- [ ] Migrate campaign management
- [ ] Setup API route proxies

### Week 3: Advanced Features
- [ ] Migrate analytics components
- [ ] Setup Stripe integration
- [ ] Implement file uploads with Supabase Storage
- [ ] Add Sentry monitoring

### Week 4: Testing & Deployment
- [ ] Test all functionality
- [ ] Setup PM2 configuration
- [ ] Configure Nginx
- [ ] Deploy to staging/production

## Testing Strategy

### Component Testing
```typescript
// __tests__/Dashboard.test.tsx
import { render, screen } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import Dashboard from '@/app/dashboard/page'

const mockSession = {
  user: { id: '1', email: 'test@example.com' },
  expires: '2024-01-01'
}

test('renders dashboard', () => {
  render(
    <SessionProvider session={mockSession}>
      <Dashboard />
    </SessionProvider>
  )
  
  expect(screen.getByText('Dashboard')).toBeInTheDocument()
})
```

### API Testing
```typescript
// __tests__/api/campaigns.test.ts
import { GET } from '@/app/api/campaigns/route'
import { NextRequest } from 'next/server'

jest.mock('next-auth/next')

test('GET /api/campaigns requires authentication', async () => {
  const request = new NextRequest('http://localhost:3000/api/campaigns')
  const response = await GET(request)
  
  expect(response.status).toBe(401)
})
```

## Rollback Plan

### If Migration Fails
1. Keep current React+Vite setup running
2. Use feature flags to gradually migrate users
3. Maintain both systems until migration is complete
4. Database remains unchanged (Supabase compatible)

### Gradual Migration
```typescript
// Feature flag for Next.js migration
const useNextJS = process.env.NEXT_PUBLIC_USE_NEXTJS === 'true'

if (useNextJS) {
  // Redirect to Next.js app
  window.location.href = 'https://nextjs.yourdomain.com'
}
```

This migration plan ensures a smooth transition from React+Vite to Next.js while maintaining all existing functionality and improving the development experience with SaaS integrations.