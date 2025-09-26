const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Stripe confirm payment error:', error);
      throw error;
    }
  }

  async createCustomer(email, name) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      return customer;
    } catch (error) {
      console.error('Stripe create customer error:', error);
      throw error;
    }
  }

  async processRefund(paymentIntentId, amount = null) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });
      return refund;
    } catch (error) {
      console.error('Stripe refund error:', error);
      throw error;
    }
  }

  calculatePlatformFee(amount, feePercentage = 0.05) {
    return Math.round(amount * feePercentage * 100) / 100;
  }

  async createTransfer(amount, destination, metadata = {}) {
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        destination,
        metadata,
      });
      return transfer;
    } catch (error) {
      console.error('Stripe transfer error:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();