const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock YouTube API response (replace with real API when available)
const mockYouTubeMetrics = (channelUrl) => {
  const channelId = channelUrl.split('/').pop() || channelUrl.split('@').pop();
  
  // Generate realistic mock data based on channel
  const baseFollowers = Math.floor(Math.random() * 500000) + 10000;
  const engagementRate = (Math.random() * 0.08) + 0.02; // 2-10%
  const averageViews = Math.floor(baseFollowers * (engagementRate + 0.1));

  return {
    totalFollowers: baseFollowers,
    engagementRate: parseFloat(engagementRate.toFixed(4)),
    averageViews,
    platform: 'youtube',
    channelId,
    lastUpdated: new Date().toISOString()
  };
};

// Load YouTube metrics
router.post('/youtube/metrics', authenticateToken, async (req, res) => {
  try {
    const { userId, youtubeUrl } = req.body;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!youtubeUrl) {
      return res.status(400).json({ success: false, message: 'YouTube URL required' });
    }

    // Get metrics (using mock data for now)
    const metrics = mockYouTubeMetrics(youtubeUrl);

    // Store metrics in database
    const { data, error } = await supabase
      .from('kol_analytics')
      .upsert({
        kol_id: userId,
        platform: 'youtube',
        followers: metrics.totalFollowers,
        engagement_rate: metrics.engagementRate,
        average_views: metrics.averageViews,
        audience_demographics: {
          platform: 'youtube',
          channelUrl: youtubeUrl
        },
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Analytics storage error:', error);
      return res.status(500).json({ success: false, message: 'Failed to store metrics' });
    }

    // Update KOL profile with metrics
    await supabase
      .from('kol_profiles')
      .update({
        audience_metrics: metrics,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('YouTube metrics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;