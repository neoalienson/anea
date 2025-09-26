const express = require('express');
const { searchKOLs, getKOLProfile } = require('../controllers/kolController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/search', authenticateToken, searchKOLs);
router.get('/:id', authenticateToken, getKOLProfile);

module.exports = router;