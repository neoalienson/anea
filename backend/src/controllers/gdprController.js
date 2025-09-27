const pool = require('../config/database');
const { auditLogger, logAuditEvent } = require('../middleware/audit');

const exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const userData = await pool.query('SELECT id, email, role, created_at FROM users WHERE id = $1', [userId]);
    
    let profileData = {};
    if (req.user.role === 'business') {
      const profile = await pool.query('SELECT * FROM business_profiles WHERE user_id = $1', [userId]);
      profileData = profile.rows[0] || {};
    } else if (req.user.role === 'kol') {
      const profile = await pool.query('SELECT * FROM kol_profiles WHERE user_id = $1', [userId]);
      profileData = profile.rows[0] || {};
    }

    // Get campaigns
    const campaigns = await pool.query(
      'SELECT id, title, status, created_at FROM campaigns WHERE business_id = $1',
      [userId]
    );

    // Get payments
    const payments = await pool.query(
      'SELECT id, amount, status, created_at FROM payments WHERE business_id = $1 OR kol_id = $1',
      [userId]
    );

    const exportData = {
      user: userData.rows[0],
      profile: profileData,
      campaigns: campaigns.rows,
      payments: payments.rows,
      exportedAt: new Date().toISOString()
    };

    logAuditEvent({
      userId,
      action: 'DATA_EXPORT',
      resource: '/api/gdpr/export',
      method: 'GET',
      ip: req.ip,
      success: true,
      statusCode: 200,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check for active campaigns
    const activeCampaigns = await pool.query(
      'SELECT COUNT(*) as count FROM campaigns WHERE business_id = $1 AND status = $2',
      [userId, 'active']
    );

    if (parseInt(activeCampaigns.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with active campaigns'
      });
    }

    // Check for pending payments
    const pendingPayments = await pool.query(
      'SELECT COUNT(*) as count FROM payments WHERE (business_id = $1 OR kol_id = $1) AND status = $2',
      [userId, 'pending']
    );

    if (parseInt(pendingPayments.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with pending payments'
      });
    }

    // Anonymize user data instead of hard delete
    await pool.query(
      'UPDATE users SET email = $1, is_active = false WHERE id = $2',
      [`deleted_${userId}@anonymized.com`, userId]
    );

    // Remove profile data
    if (req.user.role === 'business') {
      await pool.query('DELETE FROM business_profiles WHERE user_id = $1', [userId]);
    } else if (req.user.role === 'kol') {
      await pool.query('DELETE FROM kol_profiles WHERE user_id = $1', [userId]);
    }

    logAuditEvent({
      userId,
      action: 'DATA_DELETION',
      resource: '/api/gdpr/delete',
      method: 'DELETE',
      ip: req.ip,
      success: true,
      statusCode: 200,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Account data has been deleted'
    });
  } catch (error) {
    console.error('Data deletion error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getConsentStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const consent = await pool.query(
      'SELECT * FROM user_consents WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: consent.rows[0] || {
        marketing: false,
        analytics: false,
        necessary: true
      }
    });
  } catch (error) {
    console.error('Get consent error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateConsent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { marketing, analytics } = req.body;

    await pool.query(
      `INSERT INTO user_consents (user_id, marketing, analytics, necessary, updated_at)
       VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) 
       DO UPDATE SET marketing = $2, analytics = $3, updated_at = CURRENT_TIMESTAMP`,
      [userId, marketing, analytics]
    );

    logAuditEvent({
      userId,
      action: 'CONSENT_UPDATE',
      resource: '/api/gdpr/consent',
      method: 'PUT',
      ip: req.ip,
      success: true,
      statusCode: 200,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Consent preferences updated'
    });
  } catch (error) {
    console.error('Update consent error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  exportUserData,
  deleteUserData,
  getConsentStatus,
  updateConsent
};