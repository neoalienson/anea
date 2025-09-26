const express = require('express');
const { syncYouTubeChannel, getMatchingKOLs } = require('../controllers/integrationController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/youtube/sync', authenticateToken, requireRole(['kol', 'admin']), syncYouTubeChannel);
router.get('/campaigns/:campaignId/matches', authenticateToken, requireRole(['business']), getMatchingKOLs);

module.exports = router;