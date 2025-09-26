const express = require('express');
const { 
  createCampaign, 
  getCampaigns, 
  getCampaignById, 
  updateCampaignStatus 
} = require('../controllers/campaignController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, requireRole(['business']), createCampaign);
router.get('/', authenticateToken, requireRole(['business']), getCampaigns);
router.get('/:id', authenticateToken, requireRole(['business']), getCampaignById);
router.patch('/:id/status', authenticateToken, requireRole(['business']), updateCampaignStatus);

module.exports = router;