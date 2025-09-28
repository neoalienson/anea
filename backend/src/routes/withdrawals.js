const express = require('express');
const withdrawalController = require('../controllers/withdrawalController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * Withdrawal Routes
 * Handle application and campaign withdrawals
 */

// KOL withdraws application from campaign
router.post('/application/:applicationId', 
  authenticateToken, 
  requireRole(['kol']), 
  withdrawalController.withdrawApplication
);

// Business withdraws/cancels campaign
router.post('/campaign/:campaignId', 
  authenticateToken, 
  requireRole(['business']), 
  withdrawalController.withdrawCampaign
);

// Get KOL's withdrawable applications
router.get('/my-applications', 
  authenticateToken, 
  requireRole(['kol']), 
  withdrawalController.getWithdrawableApplications
);

// Get business's withdrawable campaigns
router.get('/my-campaigns', 
  authenticateToken, 
  requireRole(['business']), 
  withdrawalController.getWithdrawableCampaigns
);

module.exports = router;