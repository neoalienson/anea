const express = require('express');
const { 
  getBusinessAnalytics, 
  getKOLAnalytics, 
  getCampaignAnalytics 
} = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/business', authenticateToken, requireRole(['business']), getBusinessAnalytics);
router.get('/kol', authenticateToken, requireRole(['kol']), getKOLAnalytics);
router.get('/campaigns/:campaignId', authenticateToken, requireRole(['business']), getCampaignAnalytics);

module.exports = router;