const express = require('express');
const { 
  exportUserData, 
  deleteUserData, 
  getConsentStatus, 
  updateConsent 
} = require('../controllers/gdprController');
const { authenticateToken } = require('../middleware/auth');
const { auditLogger } = require('../middleware/audit');

const router = express.Router();

router.get('/export', authenticateToken, auditLogger('DATA_EXPORT'), exportUserData);
router.delete('/delete', authenticateToken, auditLogger('DATA_DELETION'), deleteUserData);
router.get('/consent', authenticateToken, getConsentStatus);
router.put('/consent', authenticateToken, auditLogger('CONSENT_UPDATE'), updateConsent);

module.exports = router;