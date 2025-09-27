const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { register, login } = require('../../src/controllers/authController');
const pool = require('../../src/config/database');

describe('Auth Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new business user successfully', async () => {
      const userData = {
        email: 'test@business.com',
        password: 'Password123',
        role: 'business',
        profile: {
          companyName: 'Test Company',
          industry: 'Technology',
          companySize: 'small',
          description: 'Test description',
          targetAudience: {},
          budgetRange: {}
        }
      };

      req.body = userData;

      // Mock database responses
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing user
        .mockResolvedValueOnce({ rows: [{ id: 'user-id', email: userData.email, role: userData.role }] }) // Create user
        .mockResolvedValueOnce({ rows: [] }); // Create profile

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.any(Object),
            token: expect.any(String),
            refreshToken: expect.any(String)
          })
        })
      );
    });

    it('should return error for existing user', async () => {
      req.body = {
        email: 'existing@example.com',
        password: 'Password123',
        role: 'business',
        profile: {}
      };

      pool.query.mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists'
      });
    });

    it('should validate required fields', async () => {
      req.body = {
        email: 'invalid-email',
        password: 'weak',
        role: 'invalid'
      };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String)
        })
      );
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      req.body = loginData;

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
        .mockResolvedValueOnce({ rows: [] }); // Update last login

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.any(Object),
            token: expect.any(String),
            refreshToken: expect.any(String)
          })
        })
      );
    });

    it('should return error for invalid credentials', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      pool.query.mockResolvedValueOnce({ rows: [] });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });
  });
});