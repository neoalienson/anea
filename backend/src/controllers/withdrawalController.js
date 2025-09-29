const { supabase } = require('../config/supabase');

/**
 * Withdrawal Controller
 * Handles withdrawal of applications (KOLs) and campaigns (businesses)
 */

const withdrawalController = {

  /**
   * POST /api/withdrawals/application/:applicationId
   * KOL withdraws their application from a campaign
   */
  async withdrawApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const kolId = req.user.id;

      // Verify the application belongs to this KOL
      const { data: application, error: fetchError } = await supabase
        .from('campaign_kols')
        .select(`
          *,
          campaigns!inner(id, title, business_id, status),
          users!inner(id, email)
        `)
        .eq('id', applicationId)
        .eq('kol_id', kolId)
        .single();

      if (fetchError || !application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or unauthorized'
        });
      }

      // Check if withdrawal is allowed
      const currentStatus = application.status;
      const allowedStatuses = ['invited', 'applied'];
      
      if (!allowedStatuses.includes(currentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Cannot withdraw application with status: ${currentStatus}. Only 'invited' or 'applied' applications can be withdrawn.`
        });
      }

      // Check if campaign is still active
      if (application.campaigns.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Cannot withdraw from inactive campaign'
        });
      }

      // Update application status to 'declined'
      const { data: updatedApplication, error: updateError } = await supabase
        .from('campaign_kols')
        .update({
          status: 'declined',
          updated_at: new Date().toISOString(),
          feedback: {
            withdrawal_reason: req.body.reason || 'Withdrawn by KOL',
            withdrawal_date: new Date().toISOString()
          }
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (updateError) {
        console.error('Application withdrawal error:', updateError);
        return res.status(500).json({
          success: false,
          message: 'Failed to withdraw application'
        });
      }

      // TODO: Send notification to business (future implementation)
      
      res.json({
        success: true,
        message: `Successfully withdrew application from campaign: ${application.campaigns.title}`,
        data: {
          applicationId: updatedApplication.id,
          campaignTitle: application.campaigns.title,
          previousStatus: currentStatus,
          newStatus: 'declined',
          withdrawalDate: updatedApplication.updated_at
        }
      });

    } catch (error) {
      console.error('Withdraw application error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * POST /api/withdrawals/campaign/:campaignId
   * Business withdraws/cancels their campaign
   */
  async withdrawCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const businessId = req.user.id;

      // Verify the campaign belongs to this business
      const { data: campaign, error: fetchError } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_kols(id, status, kol_id)
        `)
        .eq('id', campaignId)
        .eq('business_id', businessId)
        .single();

      if (fetchError || !campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found or unauthorized'
        });
      }

      // Check if withdrawal is allowed
      const currentStatus = campaign.status;
      const allowedStatuses = ['draft', 'active'];
      
      if (!allowedStatuses.includes(currentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel campaign with status: ${currentStatus}. Only 'draft' or 'active' campaigns can be cancelled.`
        });
      }

      // Check for active collaborations
      const activeCollaborations = campaign.campaign_kols?.filter(
        app => app.status === 'accepted'
      ) || [];

      if (activeCollaborations.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel campaign with ${activeCollaborations.length} active collaboration(s). Please complete or terminate collaborations first.`
        });
      }

      // Update campaign status to 'cancelled'
      const { data: updatedCampaign, error: updateError } = await supabase
        .from('campaigns')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          // Add withdrawal info to objectives or create separate field
          objectives: {
            ...campaign.objectives,
            cancellation_info: {
              cancelled_by: businessId,
              cancellation_date: new Date().toISOString(),
              cancellation_reason: req.body.reason || 'Cancelled by business'
            }
          }
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (updateError) {
        console.error('Campaign withdrawal error:', updateError);
        return res.status(500).json({
          success: false,
          message: 'Failed to cancel campaign'
        });
      }

      // Automatically decline all pending applications
      const { error: declineError } = await supabase
        .from('campaign_kols')
        .update({
          status: 'declined',
          updated_at: new Date().toISOString(),
          feedback: {
            auto_declined_reason: 'Campaign cancelled by business',
            decline_date: new Date().toISOString()
          }
        })
        .eq('campaign_id', campaignId)
        .in('status', ['invited', 'applied']);

      if (declineError) {
        console.error('Error declining applications:', declineError);
        // Don't fail the main operation, just log
      }

      // TODO: Send notifications to KOLs with applications (future implementation)

      res.json({
        success: true,
        message: `Successfully cancelled campaign: ${campaign.title}`,
        data: {
          campaignId: updatedCampaign.id,
          campaignTitle: campaign.title,
          previousStatus: currentStatus,
          newStatus: 'cancelled',
          cancellationDate: updatedCampaign.updated_at,
          affectedApplications: campaign.campaign_kols?.length || 0
        }
      });

    } catch (error) {
      console.error('Withdraw campaign error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * GET /api/withdrawals/my-applications
   * Get KOL's applications that can be withdrawn
   */
  async getWithdrawableApplications(req, res) {
    try {
      const kolId = req.user.id;

      const { data: applications, error } = await supabase
        .from('campaign_kols')
        .select(`
          *,
          campaigns!inner(
            id, title, description, status, budget, timeline
          )
        `)
        .eq('kol_id', kolId)
        .in('status', ['invited', 'applied'])
        .eq('campaigns.status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get withdrawable applications error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch applications'
        });
      }

      res.json({
        success: true,
        data: applications,
        count: applications.length
      });

    } catch (error) {
      console.error('Get withdrawable applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * GET /api/withdrawals/my-campaigns
   * Get business's campaigns that can be withdrawn
   */
  async getWithdrawableCampaigns(req, res) {
    try {
      const businessId = req.user.id;

      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_kols(id, status)
        `)
        .eq('business_id', businessId)
        .in('status', ['draft', 'active'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get withdrawable campaigns error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch campaigns'
        });
      }

      // Add withdrawal eligibility info
      const campaignsWithEligibility = campaigns.map(campaign => ({
        ...campaign,
        canWithdraw: !campaign.campaign_kols?.some(app => app.status === 'accepted'),
        activeCollaborations: campaign.campaign_kols?.filter(app => app.status === 'accepted').length || 0,
        totalApplications: campaign.campaign_kols?.length || 0
      }));

      res.json({
        success: true,
        data: campaignsWithEligibility,
        count: campaignsWithEligibility.length
      });

    } catch (error) {
      console.error('Get withdrawable campaigns error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

};

module.exports = withdrawalController;