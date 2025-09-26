const express = require('express');
const { 
  createPaymentIntent, 
  confirmPayment, 
  getPayments, 
  handleWebhook 
} = require('../controllers/paymentController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/intent', authenticateToken, requireRole(['business']), createPaymentIntent);
router.get('/confirm/:paymentIntentId', authenticateToken, confirmPayment);
router.get('/', authenticateToken, requireRole(['business', 'kol']), getPayments);
router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

module.exports = router;