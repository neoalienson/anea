const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth');
const kolRoutes = require('../../src/routes/kols');
const campaignRoutes = require('../../src/routes/campaigns');
const { authenticateToken } = require('../../src/middleware/auth');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Mock auth middleware for protected routes
  app.use((req, res, next) => {
    if (req.headers.authorization) {
      req.user = global.mockUser;
    }
    next();
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/kols', kolRoutes);
  app.use('/api/campaigns', campaignRoutes);
  
  return app;
};

describe('API Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should handle complete registration flow', async () => {
      const userData = {
        email: 'integration@test.com',
        password: 'Password123',
        role: 'business',
        profile: {
          companyName: 'Integration Test Co',
          industry: 'Technology',
          companySize: 'small',
          description: 'Test company',
          targetAudience: {},
          budgetRange: {}
        }
      };

      // Mock successful registration
      const pool = require('../../src/config/database');
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // No existing user
        .mockResolvedValueOnce({ rows: [{ id: 'new-user-id', email: userData.email, role: userData.role }] })
        .mockResolvedValueOnce({ rows: [] }); // Profile creation

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should handle login flow', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const pool = require('../../src/config/database');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(loginData.password, 12);

      pool.query
        .mockResolvedValueOnce({
          rows: [{
            id: 'user-id',
            email: loginData.email,
            password_hash: hashedPassword,
            role: 'business'
          }]
        })
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('Protected Routes', () => {
    it('should require authentication for KOL search', async () => {
      const response = await request(app)
        .get('/api/kols/search');

      expect(response.status).toBe(401);
    });

    it('should allow authenticated KOL search', async () => {
      const pool = require('../../src/config/database');
      pool.query.mockResolvedValueOnce({ rows: [] }); // Search results
      pool.query.mockResolvedValueOnce({ rows: [{ total: 0 }] }); // Count

      const response = await request(app)
        .get('/api/kols/search')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should require business role for campaign creation', async () => {
      const campaignData = {
        title: 'Test Campaign',
        description: 'Test description',
        objectives: [{ type: 'awareness', target: 1000, metric: 'impressions' }],
        requirements: {
          platforms: ['youtube'],
          categories: ['technology'],
          minFollowers: 1000
        },
        budget: { total: 1000, perKOL: 500, currency: 'USD' },
        timeline: {
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          applicationDeadline: '2024-02-20'
        }
      };

      const pool = require('../../src/config/database');
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'campaign-id' }] });

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', 'Bearer valid-token')
        .send(campaignData);

      expect(response.status).toBe(201);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors consistently', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      const pool = require('../../src/config/database');
      pool.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Password123' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});