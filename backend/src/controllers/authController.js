const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const pool = require('../config/database');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('business', 'kol').required(),
    profile: Joi.object().required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { email, password, role, profile } = value;

  try {
    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, passwordHash, role]
    );

    const user = userResult.rows[0];

    // Create profile based on role
    if (role === 'business') {
      await pool.query(
        'INSERT INTO business_profiles (user_id, company_name, industry, company_size, description, target_audience, budget_range) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [user.id, profile.companyName, profile.industry, profile.companySize, profile.description, JSON.stringify(profile.targetAudience), JSON.stringify(profile.budgetRange)]
      );
    } else if (role === 'kol') {
      await pool.query(
        'INSERT INTO kol_profiles (user_id, display_name, bio, categories, social_links, audience_metrics, content_style) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [user.id, profile.displayName, profile.bio, JSON.stringify(profile.categories), JSON.stringify(profile.socialLinks), JSON.stringify(profile.audienceMetrics), JSON.stringify(profile.contentStyle)]
      );
    }

    const tokens = generateTokens(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, role: user.role },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { email, password } = value;

  try {
    const result = await pool.query('SELECT id, email, password_hash, role FROM users WHERE email = $1 AND is_active = true', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, role: user.role },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { register, login };