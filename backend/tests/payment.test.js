const paymentService = require('../src/services/paymentService');

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
        amount: 5000,
        currency: 'usd'
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded'
      })
    },
    customers: {
      create: jest.fn().mockResolvedValue({
        id: 'cus_test_123',
        email: 'test@example.com'
      })
    }
  }));
});

describe('Payment Service', () => {
  describe('createPaymentIntent', () => {
    it('should create payment intent with correct amount', async () => {
      const result = await paymentService.createPaymentIntent(50, 'usd', { test: 'metadata' });
      
      expect(result.id).toBe('pi_test_123');
      expect(result.client_secret).toBe('pi_test_123_secret');
    });
  });

  describe('calculatePlatformFee', () => {
    it('should calculate 5% platform fee by default', () => {
      const fee = paymentService.calculatePlatformFee(100);
      expect(fee).toBe(5);
    });

    it('should calculate custom fee percentage', () => {
      const fee = paymentService.calculatePlatformFee(100, 0.1);
      expect(fee).toBe(10);
    });

    it('should handle decimal amounts correctly', () => {
      const fee = paymentService.calculatePlatformFee(123.45, 0.05);
      expect(fee).toBe(6.17);
    });
  });

  describe('confirmPayment', () => {
    it('should retrieve payment intent status', async () => {
      const result = await paymentService.confirmPayment('pi_test_123');
      
      expect(result.id).toBe('pi_test_123');
      expect(result.status).toBe('succeeded');
    });
  });

  describe('createCustomer', () => {
    it('should create Stripe customer', async () => {
      const result = await paymentService.createCustomer('test@example.com', 'Test User');
      
      expect(result.id).toBe('cus_test_123');
      expect(result.email).toBe('test@example.com');
    });
  });
});