const request = require('supertest');
const express = require('express');
const { securityHeaders, apiLimiter } = require('../../src/middleware/security');

// Create full app for E2E testing
const createE2EApp = () => {
  const app = express();
  
  // Apply security middleware
  app.use(securityHeaders);
  app.use(express.json());
  app.use(apiLimiter);

  // Add all routes
  app.use('/api/auth', require('../../src/routes/auth'));
  app.use('/api/kols', require('../../src/routes/kols'));
  app.use('/api/campaigns', require('../../src/routes/campaigns'));
  app.use('/api/analytics', require('../../src/routes/analytics'));
  app.use('/api/payments', require('../../src/routes/payments'));
  app.use('/api/gdpr', require('../../src/routes/gdpr'));

  // Error handling
  app.use((err, req, res, next) => {
    res.status(500).json({ success: false, message: 'Internal server error' });
  });

  return app;
};

describe('E2E User Journey Tests', () => {
  let app;
  let businessToken;
  let kolToken;

  beforeAll(() => {
    app = createE2EApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Business User Journey', () => {
    it('should complete full business workflow', async () => {
      const pool = require('../../src/config/database');
      const bcrypt = require('bcryptjs');

      // 1. Register business user
      const businessData = {
        email: 'business@e2e.com',
        password: 'BusinessPass123',
        role: 'business',
        profile: {
          companyName: 'E2E Test Company',
          industry: 'Technology',
          companySize: 'medium',
          description: 'E2E testing company',
          targetAudience: { ageRanges: ['25-34'], interests: ['technology'] },
          budgetRange: { min: 1000, max: 5000, currency: 'USD' }
        }
      };

      pool.query
        .mockResolvedValueOnce({ rows: [] }) // No existing user
        .mockResolvedValueOnce({ rows: [{ id: 'business-id', email: businessData.email, role: 'business' }] })
        .mockResolvedValueOnce({ rows: [] }); // Profile creation

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(businessData);

      expect(registerResponse.status).toBe(201);
      businessToken = registerResponse.body.data.token;

      // 2. Login
      const hashedPassword = await bcrypt.hash(businessData.password, 12);
      pool.query
        .mockResolvedValueOnce({
          rows: [{
            id: 'business-id',
            email: businessData.email,
            password_hash: hashedPassword,
            role: 'business'
          }]
        })
        .mockResolvedValueOnce({ rows: [] });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: businessData.email,
          password: businessData.password
        });

      expect(loginResponse.status).toBe(200);

      // 3. Create campaign
      const campaignData = {
        title: 'E2E Test Campaign',
        description: 'Testing campaign creation',
        objectives: [{ type: 'awareness', target: 10000, metric: 'impressions' }],
        requirements: {
          platforms: ['youtube'],
          categories: ['technology'],
          minFollowers: 1000
        },
        budget: { total: 2000, perKOL: 1000, currency: 'USD' },
        timeline: {
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          applicationDeadline: '2024-02-20'
        }
      };

      pool.query.mockResolvedValueOnce({ rows: [{ id: 'campaign-id', ...campaignData }] });

      const campaignResponse = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${businessToken}`)
        .send(campaignData);

      expect(campaignResponse.status).toBe(201);

      // 4. Search KOLs
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // Search results
        .mockResolvedValueOnce({ rows: [{ total: 0 }] }); // Count

      const searchResponse = await request(app)
        .get('/api/kols/search?minFollowers=1000')
        .set('Authorization', `Bearer ${businessToken}`);

      expect(searchResponse.status).toBe(200);

      // 5. Get analytics
      pool.query
        .mockResolvedValueOnce({ rows: [{ total_campaigns: 1, active_campaigns: 1, completed_campaigns: 0, total_budget: 2000 }] })
        .mockResolvedValueOnce({ rows: [{ total_kols: 0, active_collaborations: 0, completed_collaborations: 0, avg_rate: 0 }] })
        .mockResolvedValueOnce({ rows: [{ total_reach: 0, total_impressions: 0, total_engagement: 0, total_conversions: 0, avg_roi: 0 }] })
        .mockResolvedValueOnce({ rows: [] });

      const analyticsResponse = await request(app)
        .get('/api/analytics/business')
        .set('Authorization', `Bearer ${businessToken}`);

      expect(analyticsResponse.status).toBe(200);
    });
  });

  describe('KOL User Journey', () => {
    it('should complete KOL workflow', async () => {
      const pool = require('../../src/config/database');

      // 1. Register KOL
      const kolData = {
        email: 'kol@e2e.com',
        password: 'KOLPass123',
        role: 'kol',
        profile: {
          displayName: 'E2E KOL',
          bio: 'Testing KOL profile',
          categories: ['technology', 'reviews'],
          socialLinks: [{ platform: 'youtube', url: 'https://youtube.com/e2ekol', isVerified: false }],
          audienceMetrics: { totalFollowers: 50000, engagementRate: 0.045 },
          contentStyle: { postingFrequency: 'weekly', contentTypes: ['reviews'] }
        }
      };

      pool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'kol-id', email: kolData.email, role: 'kol' }] })
        .mockResolvedValueOnce({ rows: [] });

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(kolData);

      expect(registerResponse.status).toBe(201);
      kolToken = registerResponse.body.data.token;

      // 2. Get KOL analytics
      pool.query
        .mockResolvedValueOnce({ rows: [{ display_name: 'E2E KOL', verification_status: 'pending', followers: 50000, engagement_rate: 0.045, platform: 'youtube' }] })
        .mockResolvedValueOnce({ rows: [{ total_applications: 0, accepted: 0, completed: 0, total_earnings: 0 }] })
        .mockResolvedValueOnce({ rows: [{ total_reach: 0, total_impressions: 0, total_engagement: 0, avg_roi: 0 }] })
        .mockResolvedValueOnce({ rows: [] });

      const analyticsResponse = await request(app)
        .get('/api/analytics/kol')
        .set('Authorization', `Bearer ${kolToken}`);

      expect(analyticsResponse.status).toBe(200);
    });
  });

  describe('Security & GDPR Journey', () => {
    it('should handle GDPR data export', async () => {
      const pool = require('../../src/config/database');

      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-id', email: 'test@example.com', role: 'business', created_at: new Date() }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/gdpr/export')
        .set('Authorization', `Bearer ${businessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.exportedAt).toBeDefined();
    });

    it('should enforce rate limiting', async () => {
      // Make multiple requests to trigger rate limiting
      const promises = Array(6).fill().map(() => 
        request(app).get('/api/analytics/business')
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponse = responses.find(r => r.status === 429);
      
      expect(rateLimitedResponse).toBeDefined();
    });
  });
});