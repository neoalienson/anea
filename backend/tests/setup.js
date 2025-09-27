// Test setup and global mocks
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';

// Mock database pool
jest.mock('../src/config/database', () => ({
  query: jest.fn()
}));

// Mock logger
jest.mock('../src/middleware/audit', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  },
  auditLogger: () => (req, res, next) => next(),
  logAuditEvent: jest.fn(),
  logSecurityEvent: jest.fn()
}));

// Global test utilities
global.mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'business'
};

global.mockKOL = {
  id: 'test-kol-id',
  email: 'kol@example.com',
  role: 'kol'
};