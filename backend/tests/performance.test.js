const request = require('supertest');
const express = require('express');

// Simple performance testing
describe('Performance Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Mock auth middleware
    app.use((req, res, next) => {
      req.user = { id: 'test-user', role: 'business' };
      next();
    });

    app.use('/api/auth', require('../src/routes/auth'));
    app.use('/api/kols', require('../src/routes/kols'));
  });

  it('should handle concurrent requests efficiently', async () => {
    const pool = require('../src/config/database');
    pool.query
      .mockResolvedValue({ rows: [] })
      .mockResolvedValue({ rows: [{ total: 0 }] });

    const startTime = Date.now();
    
    // Simulate 10 concurrent requests
    const promises = Array(10).fill().map(() =>
      request(app)
        .get('/api/kols/search')
        .set('Authorization', 'Bearer test-token')
    );

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    // Should complete within reasonable time (adjust threshold as needed)
    expect(duration).toBeLessThan(5000); // 5 seconds for 10 requests
  });

  it('should respond quickly to simple requests', async () => {
    const pool = require('../src/config/database');
    pool.query.mockResolvedValue({ rows: [] });

    const startTime = Date.now();
    
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should respond within 1 second
    expect(duration).toBeLessThan(1000);
  });

  it('should handle large payloads efficiently', async () => {
    const pool = require('../src/config/database');
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'user-id', email: 'test@example.com', role: 'business' }] })
      .mockResolvedValueOnce({ rows: [] });

    // Create large profile data
    const largeProfile = {
      companyName: 'Test Company',
      industry: 'Technology',
      companySize: 'large',
      description: 'A'.repeat(1000), // 1KB description
      targetAudience: {
        ageRanges: Array(50).fill('25-34'),
        interests: Array(100).fill('technology'),
        locations: Array(200).fill('US')
      },
      budgetRange: { min: 1000, max: 10000, currency: 'USD' }
    };

    const userData = {
      email: 'test@example.com',
      password: 'Password123',
      role: 'business',
      profile: largeProfile
    };

    const startTime = Date.now();
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.status).toBe(201);
    expect(duration).toBeLessThan(2000); // Should handle large payload within 2 seconds
  });
});