const pool = require('../config/database');
const Joi = require('joi');

const searchKOLs = async (req, res) => {
  const schema = Joi.object({
    platforms: Joi.array().items(Joi.string()).optional(),
    categories: Joi.array().items(Joi.string()).optional(),
    minFollowers: Joi.number().min(0).optional(),
    maxFollowers: Joi.number().min(0).optional(),
    engagementRate: Joi.number().min(0).max(1).optional(),
    location: Joi.string().optional(),
    sortBy: Joi.string().valid('followers', 'engagement', 'relevance', 'rating').default('followers'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(50).default(20)
  });

  const { error, value } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { platforms, categories, minFollowers, maxFollowers, engagementRate, location, sortBy, sortOrder, page, limit } = value;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT 
        u.id,
        kp.display_name,
        kp.avatar,
        kp.categories,
        ka.followers,
        ka.engagement_rate,
        ka.platform
      FROM users u
      JOIN kol_profiles kp ON u.id = kp.user_id
      LEFT JOIN kol_analytics ka ON u.id = ka.kol_id
      WHERE u.role = 'kol' AND u.is_active = true
    `;

    const params = [];
    let paramCount = 0;

    if (minFollowers) {
      paramCount++;
      query += ` AND ka.followers >= $${paramCount}`;
      params.push(minFollowers);
    }

    if (maxFollowers) {
      paramCount++;
      query += ` AND ka.followers <= $${paramCount}`;
      params.push(maxFollowers);
    }

    if (engagementRate) {
      paramCount++;
      query += ` AND ka.engagement_rate >= $${paramCount}`;
      params.push(engagementRate);
    }

    if (platforms && platforms.length > 0) {
      paramCount++;
      query += ` AND ka.platform = ANY($${paramCount})`;
      params.push(platforms);
    }

    if (categories && categories.length > 0) {
      paramCount++;
      query += ` AND kp.categories ?| $${paramCount}`;
      params.push(categories);
    }

    // Add sorting
    const sortColumn = sortBy === 'followers' ? 'ka.followers' : 
                      sortBy === 'engagement' ? 'ka.engagement_rate' : 
                      'ka.followers';
    query += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;

    // Add pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      JOIN kol_profiles kp ON u.id = kp.user_id
      LEFT JOIN kol_analytics ka ON u.id = ka.kol_id
      WHERE u.role = 'kol' AND u.is_active = true
    `;

    const countParams = params.slice(0, -2); // Remove limit and offset
    if (countParams.length > 0) {
      // Rebuild count query with same filters
      let countParamCount = 0;
      if (minFollowers) {
        countParamCount++;
        countQuery += ` AND ka.followers >= $${countParamCount}`;
      }
      if (maxFollowers) {
        countParamCount++;
        countQuery += ` AND ka.followers <= $${countParamCount}`;
      }
      if (engagementRate) {
        countParamCount++;
        countQuery += ` AND ka.engagement_rate >= $${countParamCount}`;
      }
      if (platforms && platforms.length > 0) {
        countParamCount++;
        countQuery += ` AND ka.platform = ANY($${countParamCount})`;
      }
      if (categories && categories.length > 0) {
        countParamCount++;
        countQuery += ` AND kp.categories ?| $${countParamCount}`;
      }
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        kols: result.rows.map(row => ({
          id: row.id,
          displayName: row.display_name,
          avatar: row.avatar,
          platforms: [row.platform],
          followers: row.followers,
          engagementRate: parseFloat(row.engagement_rate),
          categories: row.categories,
          relevanceScore: 0.85 // Placeholder for matching algorithm
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search KOLs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getKOLProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        kp.display_name,
        kp.bio,
        kp.avatar,
        kp.categories,
        kp.social_links,
        kp.audience_metrics,
        kp.content_style,
        kp.verification_status,
        ka.followers,
        ka.engagement_rate,
        ka.average_views,
        ka.platform
      FROM users u
      JOIN kol_profiles kp ON u.id = kp.user_id
      LEFT JOIN kol_analytics ka ON u.id = ka.kol_id
      WHERE u.id = $1 AND u.role = 'kol' AND u.is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'KOL not found' });
    }

    const kol = result.rows[0];

    res.json({
      success: true,
      data: {
        id: kol.id,
        displayName: kol.display_name,
        bio: kol.bio,
        avatar: kol.avatar,
        categories: kol.categories,
        socialLinks: kol.social_links,
        audienceMetrics: kol.audience_metrics,
        contentStyle: kol.content_style,
        verificationStatus: kol.verification_status,
        analytics: {
          followers: kol.followers,
          engagementRate: parseFloat(kol.engagement_rate),
          averageViews: kol.average_views,
          platform: kol.platform
        }
      }
    });
  } catch (error) {
    console.error('Get KOL profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { searchKOLs, getKOLProfile };