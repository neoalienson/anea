const pool = require('../config/database');

const getBusinessAnalytics = async (req, res) => {
  try {
    const businessId = req.user.id;

    // Campaign overview
    const campaignStats = await pool.query(`
      SELECT 
        COUNT(*) as total_campaigns,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_campaigns,
        COALESCE(SUM((budget->>'total')::numeric), 0) as total_budget
      FROM campaigns 
      WHERE business_id = $1
    `, [businessId]);

    // KOL collaborations
    const kolStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT ck.kol_id) as total_kols,
        COUNT(CASE WHEN ck.status = 'accepted' THEN 1 END) as active_collaborations,
        COUNT(CASE WHEN ck.status = 'completed' THEN 1 END) as completed_collaborations,
        COALESCE(AVG(ck.agreed_rate), 0) as avg_rate
      FROM campaigns c
      JOIN campaign_kols ck ON c.id = ck.campaign_id
      WHERE c.business_id = $1
    `, [businessId]);

    // Performance metrics
    const performanceStats = await pool.query(`
      SELECT 
        COALESCE(SUM(cp.reach), 0) as total_reach,
        COALESCE(SUM(cp.impressions), 0) as total_impressions,
        COALESCE(SUM(cp.engagement), 0) as total_engagement,
        COALESCE(SUM(cp.conversions), 0) as total_conversions,
        COALESCE(AVG(cp.roi), 0) as avg_roi
      FROM campaigns c
      JOIN campaign_performance cp ON c.id = cp.campaign_id
      WHERE c.business_id = $1
    `, [businessId]);

    // Recent campaigns
    const recentCampaigns = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.status,
        c.created_at,
        (c.budget->>'total')::numeric as budget,
        COUNT(ck.id) as applications
      FROM campaigns c
      LEFT JOIN campaign_kols ck ON c.id = ck.campaign_id
      WHERE c.business_id = $1
      GROUP BY c.id, c.title, c.status, c.created_at, c.budget
      ORDER BY c.created_at DESC
      LIMIT 5
    `, [businessId]);

    res.json({
      success: true,
      data: {
        overview: {
          campaigns: campaignStats.rows[0],
          collaborations: kolStats.rows[0],
          performance: performanceStats.rows[0]
        },
        recentCampaigns: recentCampaigns.rows
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getKOLAnalytics = async (req, res) => {
  try {
    const kolId = req.user.id;

    // Profile stats
    const profileStats = await pool.query(`
      SELECT 
        kp.display_name,
        kp.verification_status,
        ka.followers,
        ka.engagement_rate,
        ka.platform
      FROM kol_profiles kp
      LEFT JOIN kol_analytics ka ON kp.user_id = ka.kol_id
      WHERE kp.user_id = $1
    `, [kolId]);

    // Campaign participation
    const campaignStats = await pool.query(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COALESCE(SUM(agreed_rate), 0) as total_earnings
      FROM campaign_kols
      WHERE kol_id = $1
    `, [kolId]);

    // Performance metrics
    const performanceStats = await pool.query(`
      SELECT 
        COALESCE(SUM(cp.reach), 0) as total_reach,
        COALESCE(SUM(cp.impressions), 0) as total_impressions,
        COALESCE(SUM(cp.engagement), 0) as total_engagement,
        COALESCE(AVG(cp.roi), 0) as avg_roi
      FROM campaign_performance cp
      WHERE cp.kol_id = $1
    `, [kolId]);

    // Recent opportunities
    const opportunities = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.status,
        (c.budget->>'perKOL')::numeric as budget_per_kol,
        ck.status as application_status,
        ck.proposed_rate
      FROM campaigns c
      LEFT JOIN campaign_kols ck ON c.id = ck.campaign_id AND ck.kol_id = $1
      WHERE c.status = 'active'
      ORDER BY c.created_at DESC
      LIMIT 10
    `, [kolId]);

    res.json({
      success: true,
      data: {
        profile: profileStats.rows[0] || {},
        overview: {
          campaigns: campaignStats.rows[0],
          performance: performanceStats.rows[0]
        },
        opportunities: opportunities.rows
      }
    });
  } catch (error) {
    console.error('KOL Analytics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getCampaignAnalytics = async (req, res) => {
  const { campaignId } = req.params;

  try {
    // Campaign details
    const campaign = await pool.query(`
      SELECT * FROM campaigns 
      WHERE id = $1 AND business_id = $2
    `, [campaignId, req.user.id]);

    if (campaign.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // KOL performance
    const kolPerformance = await pool.query(`
      SELECT 
        kp.display_name,
        ck.status,
        ck.agreed_rate,
        cp.reach,
        cp.impressions,
        cp.engagement,
        cp.conversions,
        cp.roi
      FROM campaign_kols ck
      JOIN kol_profiles kp ON ck.kol_id = kp.user_id
      LEFT JOIN campaign_performance cp ON ck.campaign_id = cp.campaign_id AND ck.kol_id = cp.kol_id
      WHERE ck.campaign_id = $1
    `, [campaignId]);

    // Aggregate performance
    const totalPerformance = await pool.query(`
      SELECT 
        COALESCE(SUM(cp.reach), 0) as total_reach,
        COALESCE(SUM(cp.impressions), 0) as total_impressions,
        COALESCE(SUM(cp.engagement), 0) as total_engagement,
        COALESCE(SUM(cp.conversions), 0) as total_conversions,
        COALESCE(AVG(cp.roi), 0) as avg_roi
      FROM campaign_performance cp
      WHERE cp.campaign_id = $1
    `, [campaignId]);

    res.json({
      success: true,
      data: {
        campaign: campaign.rows[0],
        kolPerformance: kolPerformance.rows,
        totalPerformance: totalPerformance.rows[0]
      }
    });
  } catch (error) {
    console.error('Campaign analytics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getBusinessAnalytics,
  getKOLAnalytics,
  getCampaignAnalytics
};