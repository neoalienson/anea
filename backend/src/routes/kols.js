const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Discover KOLs (public endpoint for browsing)
router.get('/discover', authenticateToken, async (req, res) => {
  try {
    const { 
      category, 
      minFollowers, 
      maxFollowers, 
      platform, 
      limit = 20, 
      offset = 0 
    } = req.query;

    let query = supabase
      .from('kol_profiles')
      .select(`
        *,
        users!inner(id, email, role, is_active),
        kol_analytics(*)
      `)
      .eq('users.role', 'kol')
      .eq('users.is_active', true);

    // Apply filters
    if (category) {
      query = query.contains('categories', [category.toLowerCase()]);
    }

    if (platform) {
      query = query.eq('kol_analytics.platform', platform);
    }

    // Execute query
    const { data: kols, error } = await query
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('KOL discovery error:', error);
      return res.status(500).json({ success: false, message: 'Failed to discover KOLs' });
    }

    // Filter by follower count (post-query filtering for simplicity)
    let filteredKols = kols;
    if (minFollowers || maxFollowers) {
      filteredKols = kols.filter(kol => {
        const analytics = kol.kol_analytics[0];
        if (!analytics) return false;
        
        const followers = analytics.followers || 0;
        if (minFollowers && followers < parseInt(minFollowers)) return false;
        if (maxFollowers && followers > parseInt(maxFollowers)) return false;
        return true;
      });
    }

    res.json({
      success: true,
      data: filteredKols,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: filteredKols.length
      }
    });

  } catch (error) {
    console.error('KOL discovery error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Search KOLs
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query: searchQuery, limit = 10 } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const { data: kols, error } = await supabase
      .from('kol_profiles')
      .select(`
        *,
        users!inner(id, email, role, is_active),
        kol_analytics(*)
      `)
      .eq('users.role', 'kol')
      .eq('users.is_active', true)
      .or(`display_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
      .limit(parseInt(limit));

    if (error) {
      console.error('KOL search error:', error);
      return res.status(500).json({ success: false, message: 'Failed to search KOLs' });
    }

    res.json({
      success: true,
      data: kols,
      query: searchQuery,
      results: kols.length
    });

  } catch (error) {
    console.error('KOL search error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

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
      .select(`
        *,
        users!inner(id, email, role, is_active),
        kol_analytics(*)
      `)
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