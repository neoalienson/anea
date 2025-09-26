const pool = require('../config/database');
const Joi = require('joi');

const createCampaign = async (req, res) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    objectives: Joi.array().items(Joi.object({
      type: Joi.string().required(),
      target: Joi.number().required(),
      metric: Joi.string().required()
    })).required(),
    requirements: Joi.object({
      platforms: Joi.array().items(Joi.string()).required(),
      categories: Joi.array().items(Joi.string()).required(),
      minFollowers: Joi.number().min(0).required(),
      maxFollowers: Joi.number().min(0).optional(),
      targetDemographics: Joi.object().optional()
    }).required(),
    budget: Joi.object({
      total: Joi.number().min(0).required(),
      perKOL: Joi.number().min(0).required(),
      currency: Joi.string().default('USD')
    }).required(),
    timeline: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      applicationDeadline: Joi.date().required()
    }).required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const result = await pool.query(
      `INSERT INTO campaigns (business_id, title, description, objectives, requirements, budget, timeline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft') RETURNING *`,
      [
        req.user.id,
        value.title,
        value.description,
        JSON.stringify(value.objectives),
        JSON.stringify(value.requirements),
        JSON.stringify(value.budget),
        JSON.stringify(value.timeline)
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM campaigns WHERE business_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getCampaignById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.*, 
       COUNT(ck.id) as applications_count,
       COALESCE(json_agg(
         json_build_object(
           'id', ck.id,
           'kol_id', ck.kol_id,
           'status', ck.status,
           'proposed_rate', ck.proposed_rate,
           'kol_name', kp.display_name
         )
       ) FILTER (WHERE ck.id IS NOT NULL), '[]') as applications
       FROM campaigns c
       LEFT JOIN campaign_kols ck ON c.id = ck.campaign_id
       LEFT JOIN kol_profiles kp ON ck.kol_id = kp.user_id
       WHERE c.id = $1 AND c.business_id = $2
       GROUP BY c.id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateCampaignStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['draft', 'active', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      `UPDATE campaigns SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND business_id = $3 RETURNING *`,
      [status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update campaign status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaignStatus
};