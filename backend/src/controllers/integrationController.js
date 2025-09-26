const pool = require('../config/database');
const youtubeService = require('../services/youtubeService');
const matchingService = require('../services/matchingService');
const Joi = require('joi');

const syncYouTubeChannel = async (req, res) => {
  const schema = Joi.object({
    channelId: Joi.string().required(),
    kolId: Joi.string().uuid().required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { channelId, kolId } = value;

  try {
    // Verify KOL ownership
    const kolCheck = await pool.query('SELECT id FROM users WHERE id = $1 AND role = $2', [kolId, 'kol']);
    if (kolCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'KOL not found' });
    }

    // Get YouTube data
    const channelData = await youtubeService.getChannelData(channelId);
    const engagementRate = youtubeService.calculateEngagementRate(channelData.viewCount, channelData.subscriberCount);

    // Update KOL analytics
    await pool.query(
      `INSERT INTO kol_analytics (kol_id, platform, followers, engagement_rate, average_views, last_updated)
       VALUES ($1, 'youtube', $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (kol_id, platform) 
       DO UPDATE SET 
         followers = EXCLUDED.followers,
         engagement_rate = EXCLUDED.engagement_rate,
         average_views = EXCLUDED.average_views,
         last_updated = CURRENT_TIMESTAMP`,
      [kolId, channelData.subscriberCount, engagementRate, Math.floor(channelData.viewCount / channelData.videoCount)]
    );

    res.json({
      success: true,
      data: {
        channelData,
        engagementRate,
        message: 'YouTube channel synced successfully'
      }
    });
  } catch (error) {
    console.error('YouTube sync error:', error);
    res.status(500).json({ success: false, message: 'Failed to sync YouTube channel' });
  }
};

const getMatchingKOLs = async (req, res) => {
  const { campaignId } = req.params;

  try {
    // Get campaign details
    const campaignResult = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1 AND business_id = $2',
      [campaignId, req.user.id]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const campaign = campaignResult.rows[0];
    const requirements = campaign.requirements;

    // Get business profile for matching
    const businessResult = await pool.query(
      'SELECT * FROM business_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (businessResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Business profile not found' });
    }

    const business = businessResult.rows[0];

    // Get matching KOLs
    let query = `
      SELECT 
        u.id,
        kp.display_name,
        kp.categories,
        kp.audience_metrics,
        ka.followers,
        ka.engagement_rate
      FROM users u
      JOIN kol_profiles kp ON u.id = kp.user_id
      LEFT JOIN kol_analytics ka ON u.id = ka.kol_id
      WHERE u.role = 'kol' AND u.is_active = true
    `;

    const params = [];
    let paramCount = 0;

    if (requirements.minFollowers) {
      paramCount++;
      query += ` AND ka.followers >= $${paramCount}`;
      params.push(requirements.minFollowers);
    }

    if (requirements.maxFollowers) {
      paramCount++;
      query += ` AND ka.followers <= $${paramCount}`;
      params.push(requirements.maxFollowers);
    }

    if (requirements.categories && requirements.categories.length > 0) {
      paramCount++;
      query += ` AND kp.categories ?| $${paramCount}`;
      params.push(requirements.categories);
    }

    const kolsResult = await pool.query(query, params);

    // Calculate matching scores
    const matchedKOLs = kolsResult.rows.map(kol => {
      const score = matchingService.calculateKOLSuitabilityScore(
        { 
          targetAudience: business.target_audience,
          categories: requirements.categories 
        },
        {
          id: kol.id,
          categories: kol.categories,
          audienceMetrics: kol.audience_metrics,
          engagementRate: parseFloat(kol.engagement_rate || 0)
        }
      );

      return {
        ...kol,
        matchingScore: score,
        recommendation: score > 0.7 ? 'highly_recommended' : score > 0.5 ? 'recommended' : 'consider'
      };
    });

    // Sort by matching score
    matchedKOLs.sort((a, b) => b.matchingScore - a.matchingScore);

    res.json({
      success: true,
      data: {
        campaign: campaign.title,
        totalMatches: matchedKOLs.length,
        kols: matchedKOLs.slice(0, 20) // Top 20 matches
      }
    });
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  syncYouTubeChannel,
  getMatchingKOLs
};