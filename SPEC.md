# KOL Matching Platform - Technical Specifications

## 1. System Specifications

### 1.1 Frontend Specifications

#### 1.1.1 Technology Stack
- **Framework:** React 18.2+ with TypeScript 5.0+
- **Build Tool:** Vite 4.0+ for fast development and optimized production builds
- **UI Library:** Material-UI (MUI) v5 with custom theming
- **State Management:** Redux Toolkit 1.9+ with RTK Query
- **Routing:** React Router v6 for client-side navigation
- **Forms:** React Hook Form with Zod validation
- **Real-time Communication:** Socket.io client 4.7+
- **HTTP Client:** Axios with interceptors for authentication
- **Charts & Visualization:** Recharts for analytics dashboards
- **Testing:** Jest + React Testing Library + Cypress for E2E

#### 1.1.2 Performance Requirements
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms
- **Bundle Size:** < 500KB gzipped for main bundle
- **Lighthouse Score:** > 90 for all metrics

#### 1.1.3 Browser Support
- **Modern Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers:** iOS Safari 14+, Chrome Mobile 90+
- **Fallback Support:** Progressive enhancement for older browsers

### 1.2 Backend Specifications

#### 1.2.1 Technology Stack
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js 4.18+ with TypeScript
- **Database ORM:** Prisma 5.0+ for PostgreSQL
- **Authentication:** JWT with jsonwebtoken 9.0+
- **Validation:** Joi 17.0+ for request validation
- **File Upload:** Multer with cloud storage integration
- **API Documentation:** Swagger/OpenAPI 3.0
- **Testing:** Jest + Supertest for API testing

#### 1.2.2 API Specifications
- **RESTful Design:** Resource-based endpoints with proper HTTP methods
- **Response Format:** JSON with consistent structure
- **Error Handling:** Standardized error responses with codes
- **CORS Policy:** Configurable origins for different environments
- **API Versioning:** Header-based versioning (X-API-Version)

#### 1.2.3 Database Specifications

**PostgreSQL Configuration:**
- **Version:** PostgreSQL 15+
- **Connection Pooling:** Built-in Prisma connection pooling
- **Indexing Strategy:** Composite indexes for common query patterns

### 1.3 External API Specifications

#### 1.3.1 YouTube Data API v3
- **Authentication:** OAuth 2.0 Service Account
- **Quota Limits:** 10,000 units/day (default), upgradeable
- **Key Endpoints:**
  - Channels: list, update
  - Videos: list, insert, update, delete
  - PlaylistItems: list, insert, update, delete
  - Search: list for content discovery
- **Data Refresh Rate:** Every 24 hours for channel statistics

#### 1.3.2 Payment Processing (Stripe)
- **API Version:** Stripe API 2023-10-16
- **Webhook Events:** Payment success, failure, disputes
- **Compliance:** PCI DSS Level 1 compliance
- **Supported Currencies:** 135+ currencies with automatic conversion

## 2. Data Models & Schemas

### 2.1 User Management

#### 2.1.1 User Entity
```typescript
interface User {
  id: string;                    // UUID v4
  email: string;                 // Unique, validated email
  passwordHash: string;          // bcrypt hash
  role: UserRole;               // 'business' | 'kol' | 'admin'
  isVerified: boolean;          // Email verification status
  isActive: boolean;            // Account status
  lastLoginAt?: Date;           // Last login timestamp
  createdAt: Date;              // Account creation
  updatedAt: Date;              // Last update
  profile: UserProfile;         // Role-specific profile
}
```

#### 2.1.2 Business Profile
```typescript
interface BusinessProfile {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  companySize: CompanySize;     // 'small' | 'medium' | 'large'
  website?: string;
  description?: string;
  targetAudience: {
    ageRanges: string[];
    genders: string[];
    interests: string[];
    locations: string[];
  };
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  verificationDocuments?: string[]; // URLs to uploaded documents
}
```

#### 2.1.3 KOL Profile
```typescript
interface KOLProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  categories: string[];         // Content categories
  socialLinks: {
    platform: string;
    url: string;
    isVerified: boolean;
  }[];
  audienceMetrics: {
    totalFollowers: number;
    engagementRate: number;
    averageViews: number;
    demographics: {
      ageDistribution: Record<string, number>;
      genderDistribution: Record<string, number>;
      topLocations: string[];
      topInterests: string[];
    };
  };
  contentStyle: {
    postingFrequency: string;
    contentTypes: string[];
    averageVideoLength?: number;
  };
  verificationStatus: VerificationStatus;
}
```

### 2.2 Campaign Management

#### 2.2.1 Campaign Entity
```typescript
interface Campaign {
  id: string;
  businessId: string;
  title: string;
  description: string;
  objectives: CampaignObjective[];
  requirements: {
    platforms: string[];
    categories: string[];
    minFollowers: number;
    maxFollowers: number;
    targetDemographics: Record<string, any>;
  };
  budget: {
    total: number;
    perKOL: number;
    currency: string;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
    applicationDeadline: Date;
  };
  status: CampaignStatus;       // 'draft' | 'active' | 'completed' | 'cancelled'
  deliverables: Deliverable[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.2.2 Campaign-KOL Relationship
```typescript
interface CampaignKOL {
  id: string;
  campaignId: string;
  kolId: string;
  status: ApplicationStatus;    // 'invited' | 'applied' | 'accepted' | 'declined' | 'completed'
  proposedRate: number;
  agreedRate?: number;
  deliverables: Deliverable[];
  messages: Message[];
  performance: {
    reach: number;
    impressions: number;
    engagement: number;
    conversions: number;
  };
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: Date;
  };
}
```

## 3. API Endpoint Specifications

### 3.1 Authentication Endpoints

#### POST /api/auth/register
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "business|kol",
  "profile": {
    // Role-specific profile data
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* User object */ },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### POST /api/auth/login
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* User object */ },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### 3.2 KOL Search Endpoints

#### GET /api/search/kols
**Query Parameters:**
- `platforms`: string[] - Filter by platforms
- `categories`: string[] - Content categories
- `minFollowers`: number - Minimum follower count
- `maxFollowers`: number - Maximum follower count
- `engagementRate`: number - Minimum engagement rate
- `location`: string - Geographic location
- `sortBy`: string - 'followers' | 'engagement' | 'relevance' | 'rating'
- `sortOrder`: string - 'asc' | 'desc'
- `page`: number - Page number (default: 1)
- `limit`: number - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "kols": [
      {
        "id": "kol_id",
        "displayName": "Tech Reviewer",
        "avatar": "url",
        "platforms": ["youtube"],
        "followers": 50000,
        "engagementRate": 0.045,
        "categories": ["technology", "reviews"],
        "relevanceScore": 0.85
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 3.3 Campaign Management Endpoints

#### POST /api/business/campaigns
**Request Body:**
```json
{
  "title": "Power Bank Promotion Campaign",
  "description": "Promote our new super tech power bank",
  "objectives": [
    {
      "type": "awareness",
      "target": 100000,
      "metric": "impressions"
    }
  ],
  "requirements": {
    "platforms": ["youtube"],
    "categories": ["technology", "gadgets"],
    "minFollowers": 10000,
    "targetDemographics": {
      "ageRange": ["18-24", "25-34"],
      "interests": ["technology", "gadgets"]
    }
  },
  "budget": {
    "total": 5000,
    "perKOL": 500,
    "currency": "USD"
  },
  "timeline": {
    "startDate": "2024-02-01",
    "endDate": "2024-02-28",
    "applicationDeadline": "2024-01-25"
  }
}
```

## 4. Algorithm Specifications

### 4.1 Matching Algorithm

#### 4.1.1 Scoring Components
```typescript
interface MatchingScore {
  audienceMatch: number;        // 0-1 (40% weight)
  contentRelevance: number;     // 0-1 (30% weight)
  engagementQuality: number;    // 0-1 (20% weight)
  historicalPerformance: number; // 0-1 (10% weight)
  finalScore: number;           // Weighted average
}
```

#### 4.1.2 Audience Match Calculation
- **Demographic Overlap:** Jaccard similarity coefficient
- **Interest Alignment:** Cosine similarity of interest vectors
- **Geographic Match:** Location proximity scoring
- **Platform Affinity:** Historical performance on specific platforms

#### 4.1.3 Content Relevance Algorithm
- **Category Matching:** Exact and related category scoring
- **Keyword Analysis:** TF-IDF analysis of content descriptions
- **Semantic Similarity:** BERT-based content embedding comparison
- **Brand Safety:** Content classification for brand compatibility

### 4.2 Recommendation Engine

#### 4.2.1 Collaborative Filtering
- **User-based CF:** Similar businesses get similar KOL recommendations
- **Item-based CF:** KOLs similar to previously successful ones
- **Matrix Factorization:** SVD-based recommendation scoring

#### 4.2.2 Content-based Filtering
- **Feature Extraction:** Content topics, style, quality metrics
- **User Preferences:** Business requirements and past selections
- **Similarity Scoring:** Weighted feature comparison

## 5. Security Specifications

### 5.1 Authentication Security
- **Password Hashing:** bcrypt with salt rounds = 12
- **JWT Configuration:**
  - Access token: 15 minutes expiration
  - Refresh token: 7 days expiration
  - Algorithm: RS256
- **Session Management:** Stateless JWT-based authentication

### 5.2 API Security
- **Input Validation:** Joi schema validation for all endpoints
- **SQL Injection Prevention:** Parameterized queries and ORM usage
- **XSS Protection:** Input sanitization and output encoding
- **CSRF Protection:** Double-submit cookie pattern
- **CORS Configuration:** Environment-specific origin policies

### 5.3 Data Protection
- **Encryption at Rest:** AES-256 for sensitive data
- **Encryption in Transit:** TLS 1.3 for all communications
- **API Key Management:** Secure key rotation and storage
- **GDPR Compliance:** Data minimization and consent management

## 6. Performance Specifications

### 6.1 Performance Targets
- **API Response Time:** < 1 second
- **Search Response Time:** < 3 seconds
- **File Upload:** < 10 seconds for 10MB files

### 6.2 Performance Optimization
- **Database Optimization:** Proper indexing and query optimization

### 6.3 Monitoring & Alerting
- **Application Metrics:** Response times, error rates, throughput
- **Infrastructure Metrics:** CPU, memory, disk usage, network I/O
- **Business Metrics:** User registrations, campaign creation, successful matches
- **Alert Thresholds:** 5xx errors > 1%, response time > 500ms

## 7. Deployment Specifications

### 7.1 Environment Configuration
- **Development:** Local development with hot reload
- **Staging:** Single instance with test data
- **Production:** Multi-region deployment with load balancing

### 7.2 Container Specifications
- **Base Image:** Node.js 18 Alpine Linux
- **Port Configuration:** 3000 (frontend), 8000 (backend)
- **Health Checks:** HTTP endpoints for container orchestration
- **Resource Limits:** CPU and memory limits per service

### 7.3 CI/CD Pipeline
- **Code Quality:** ESLint, Prettier, TypeScript compilation
- **Testing:** Unit tests (80% coverage), integration tests, E2E tests
- **Security Scanning:** SAST, dependency vulnerability scanning
- **Deployment:** Blue-green deployment strategy

---

*This specifications document provides detailed technical requirements for implementation. All specifications are derived from the requirements and design documents.*
