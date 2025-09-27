const request = require('supertest');
const express = require('express');
const { authLimiter, validateInput, emailValidation, passwordValidation } = require('../src/middleware/security');

describe('Security Middleware', () => {
  describe('Rate Limiting', () => {
    let app;

    beforeEach(() => {
      app = express();
      app.use(authLimiter);
      app.post('/test', (req, res) => res.json({ success: true }));
    });

    it('should allow requests within limit', async () => {
      const response = await request(app).post('/test');
      expect(response.status).toBe(200);
    });

    it('should block requests after limit exceeded', async () => {
      // Make 6 requests (limit is 5)
      for (let i = 0; i < 6; i++) {
        await request(app).post('/test');
      }
      
      const response = await request(app).post('/test');
      expect(response.status).toBe(429);
      expect(response.body.message).toContain('Too many authentication attempts');
    });
  });

  describe('Input Validation', () => {
    let app;

    beforeEach(() => {
      app = express();
      app.use(express.json());
    });

    it('should validate email format', async () => {
      app.post('/test', validateInput([emailValidation]), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate password strength', async () => {
      app.post('/test', validateInput([passwordValidation]), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .send({ password: 'weak' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should accept valid email and password', async () => {
      app.post('/test', validateInput([emailValidation, passwordValidation]), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .send({ 
          email: 'test@example.com',
          password: 'StrongPass123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});