const matchingService = require('../services/matchingService');
const { supabase } = require('../config/supabase');

/**
 * KOL Matching Controller
 * Provides endpoints for different matching strategies
 */

const matchingController = {
  
  /**
   * GET /api/matching/kols/:campaignId
   * Find matching KOLs for a specific campaign using combined strategy
   */
  async getKOLMatches(req, res) {
    try {
      const { campaignId } = req.params;
      const { strategy = 'combined', limit = 10 } = req.query;
      
      // Verify campaign exists and belongs to requesting user
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('business_id', req.user.id)
        .single();

      if (campaignError || !campaign) {
        return res.status(404).json({ 
          success: false, 
          message: 'Campaign not found or unauthorized' 
        });
      }

      // Run matching strategy
      let matchingResult;
      const options = { limit: parseInt(limit) };

      switch (strategy) {
        case 'industry':
          matchingResult = await matchingService.industryMatching(campaign, options);
          break;
        case 'budget':
          matchingResult = await matchingService.audienceBudgetMatching(campaign, options);
          break;
        case 'engagement':
          matchingResult = await matchingService.engagementQualityMatching(campaign, options);
          break;
        case 'combined':
        default:
          matchingResult = await matchingService.combinedMatching(campaign, options);
          break;
      }

      res.json({
        success: true,
        data: {
          campaign: {
            id: campaign.id,
            title: campaign.title,
            industry: campaign.requirements?.industry,
            budget: campaign.budget
          },
          matches: matchingResult.matches,
          strategy: matchingResult.strategy,
          confidence: matchingResult.confidence,
          totalMatches: matchingResult.matches.length,
          strategyBreakdown: matchingResult.strategyBreakdown || null
        }
      });

    } catch (error) {
      console.error('KOL matching error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to find matching KOLs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/matching/strategies
   * Get available matching strategies with descriptions
   */
  async getMatchingStrategies(req, res) {
    try {
      const strategies = [
        {
          id: 'industry',
          name: 'Industry Matching',
          description: 'Match KOLs based on content categories and industry relevance',
          strengths: ['High precision for niche markets', 'Good for brand alignment'],
          confidence: '85%'
        },
        {
          id: 'budget',
          name: 'Budget & Audience Matching', 
          description: 'Match based on audience size and estimated collaboration rates',
          strengths: ['Cost optimization', 'Reach maximization'],
          confidence: '90%'
        },
        {
          id: 'engagement',
          name: 'AI Engagement Quality',
          description: 'Advanced scoring using engagement patterns and historical performance',
          strengths: ['ROI prediction', 'Quality optimization'],
          confidence: '95%'
        },
        {
          id: 'combined',
          name: 'Combined Strategy',
          description: 'Combines all strategies with weighted scoring for optimal results',
          strengths: ['Best overall results', 'Balanced approach'],
          confidence: '95%'
        }
      ];

      res.json({
        success: true,
        data: strategies
      });

    } catch (error) {
      console.error('Get strategies error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get matching strategies'
      });
    }
  },

  /**
   * POST /api/matching/invite-kols
   * Invite matched KOLs to a campaign
   */
  async inviteKOLsToCampaign(req, res) {
    try {
      const { campaignId, kolIds, customMessage } = req.body;

      // Verify campaign belongs to user
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('business_id', req.user.id)
        .single();

      if (campaignError || !campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found or unauthorized'
        });
      }

      // Create invitations
      const invitations = kolIds.map(kolId => ({
        campaign_id: campaignId,
        kol_id: kolId,
        status: 'invited',
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('campaign_kols')
        .insert(invitations)
        .select('*');

      if (error) {
        console.error('Invitation error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send invitations'
        });
      }

      // TODO: Send notification emails to KOLs (future implementation)

      res.json({
        success: true,
        data: {
          invitationsSent: data.length,
          invitations: data
        },
        message: `Successfully invited ${data.length} KOLs to the campaign`
      });

    } catch (error) {
      console.error('Invite KOLs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to invite KOLs to campaign'
      });
    }
  },

  /**
   * GET /api/matching/campaign-invitations/:campaignId
   * Get all invitations for a campaign
   */
  async getCampaignInvitations(req, res) {
    try {
      const { campaignId } = req.params;

      // Verify campaign belongs to user
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('id')
        .eq('id', campaignId)
        .eq('business_id', req.user.id)
        .single();

      if (campaignError || !campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found or unauthorized'
        });
      }

      // Get all invitations with KOL details
      const { data: invitations, error } = await supabase
        .from('campaign_kols')
        .select(`
          *,
          kol_profiles!inner(
            display_name,
            bio,
            categories,
            kol_analytics(followers, engagement_rate, platform)
          ),
          users!inner(email)
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get invitations error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to get campaign invitations'
        });
      }

      res.json({
        success: true,
        data: invitations
      });

    } catch (error) {
      console.error('Get campaign invitations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get campaign invitations'
      });
    }
  }
};

module.exports = matchingController;