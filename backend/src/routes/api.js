const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Import controllers
const withdrawalController = require('../controllers/withdrawalController');

// Withdrawal routes
router.get('/withdrawals/my-applications', authenticateToken, withdrawalController.getWithdrawableApplications);
router.get('/withdrawals/my-campaigns', authenticateToken, withdrawalController.getWithdrawableCampaigns);
router.post('/withdrawals/application/:id', authenticateToken, withdrawalController.withdrawApplication);
router.post('/withdrawals/campaign/:id', authenticateToken, withdrawalController.withdrawCampaign);

module.exports = router;