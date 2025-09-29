const express = require('express');
const matchingController = require('../controllers/matchingController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * Matching Routes
 * All routes require authentication and business role (except for KOL application endpoints)
 */

// Get matching KOLs for a campaign
router.get('/kols/:campaignId', 
  authenticateToken, 
  requireRole(['business']), 
  matchingController.getKOLMatches
);

// Get available matching strategies
router.get('/strategies', 
  authenticateToken, 
  matchingController.getMatchingStrategies
);

// Invite KOLs to a campaign
router.post('/invite-kols', 
  authenticateToken, 
  requireRole(['business']), 
  matchingController.inviteKOLsToCampaign
);

// Get campaign invitations
router.get('/campaign-invitations/:campaignId', 
  authenticateToken, 
  requireRole(['business']), 
  matchingController.getCampaignInvitations
);

module.exports = router;