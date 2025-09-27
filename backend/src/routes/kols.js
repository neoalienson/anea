const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Update KOL profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { userId, display_name, bio, social_links, language } = req.body;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('kol_profiles')
      .upsert({
        user_id: userId,
        display_name,
        bio,
        social_links,
        content_style: { language },
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get KOL profile
router.get('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('kol_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Profile fetch error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }

    res.json({ success: true, data: data || {} });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;