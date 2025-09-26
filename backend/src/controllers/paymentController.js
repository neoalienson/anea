const pool = require('../config/database');
const paymentService = require('../services/paymentService');
const Joi = require('joi');

const createPaymentIntent = async (req, res) => {
  const schema = Joi.object({
    campaignId: Joi.string().uuid().required(),
    kolId: Joi.string().uuid().required(),
    amount: Joi.number().min(1).required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { campaignId, kolId, amount } = value;

  try {
    // Verify campaign ownership
    const campaign = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1 AND business_id = $2',
      [campaignId, req.user.id]
    );

    if (campaign.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Verify KOL collaboration
    const collaboration = await pool.query(
      'SELECT * FROM campaign_kols WHERE campaign_id = $1 AND kol_id = $2 AND status = $3',
      [campaignId, kolId, 'accepted']
    );

    if (collaboration.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Collaboration not found' });
    }

    // Calculate platform fee
    const platformFee = paymentService.calculatePlatformFee(amount);
    const kolAmount = amount - platformFee;

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent(amount, 'usd', {
      campaignId,
      kolId,
      businessId: req.user.id,
      platformFee: platformFee.toString(),
      kolAmount: kolAmount.toString()
    });

    // Store payment record
    await pool.query(
      `INSERT INTO payments (id, campaign_id, kol_id, business_id, amount, platform_fee, kol_amount, status, stripe_payment_intent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)`,
      [paymentIntent.id, campaignId, kolId, req.user.id, amount, platformFee, kolAmount, paymentIntent.id]
    );

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        platformFee,
        kolAmount
      }
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const confirmPayment = async (req, res) => {
  const { paymentIntentId } = req.params;

  try {
    const paymentIntent = await paymentService.confirmPayment(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update payment status
      await pool.query(
        'UPDATE payments SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE stripe_payment_intent_id = $2',
        ['completed', paymentIntentId]
      );

      // Update collaboration status
      const payment = await pool.query(
        'SELECT campaign_id, kol_id FROM payments WHERE stripe_payment_intent_id = $1',
        [paymentIntentId]
      );

      if (payment.rows.length > 0) {
        await pool.query(
          'UPDATE campaign_kols SET status = $1 WHERE campaign_id = $2 AND kol_id = $3',
          ['completed', payment.rows[0].campaign_id, payment.rows[0].kol_id]
        );
      }
    }

    res.json({
      success: true,
      data: {
        status: paymentIntent.status,
        paymentIntentId
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getPayments = async (req, res) => {
  try {
    let query, params;

    if (req.user.role === 'business') {
      query = `
        SELECT 
          p.*,
          c.title as campaign_title,
          kp.display_name as kol_name
        FROM payments p
        JOIN campaigns c ON p.campaign_id = c.id
        JOIN kol_profiles kp ON p.kol_id = kp.user_id
        WHERE p.business_id = $1
        ORDER BY p.created_at DESC
      `;
      params = [req.user.id];
    } else if (req.user.role === 'kol') {
      query = `
        SELECT 
          p.*,
          c.title as campaign_title,
          bp.company_name as business_name
        FROM payments p
        JOIN campaigns c ON p.campaign_id = c.id
        JOIN business_profiles bp ON p.business_id = bp.user_id
        WHERE p.kol_id = $1
        ORDER BY p.created_at DESC
      `;
      params = [req.user.id];
    } else {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await pool.query(
          'UPDATE payments SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE stripe_payment_intent_id = $2',
          ['completed', paymentIntent.id]
        );
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await pool.query(
          'UPDATE payments SET status = $1 WHERE stripe_payment_intent_id = $2',
          ['failed', failedPayment.id]
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ success: false, message: 'Webhook handling failed' });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPayments,
  handleWebhook
};