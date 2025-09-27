import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('role')

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 })
    }

    let analyticsData = {}

    if (userRole === 'business') {
      // Get business analytics data
      const [campaignsRes, profileRes] = await Promise.all([
        supabase
          .from('campaigns')
          .select('*')
          .eq('business_id', userId),
        supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
      ])

      // Get applications for business campaigns
      const campaignIds = campaignsRes.data?.map(c => c.id) || []
      let applicationsRes = { data: [] }
      
      if (campaignIds.length > 0) {
        applicationsRes = await supabase
          .from('campaign_kols')
          .select(`
            id,
            status,
            created_at,
            campaign_id,
            campaigns!campaign_id (title)
          `)
          .in('campaign_id', campaignIds)
      }

      // Calculate business analytics
      const campaigns = campaignsRes.data || []
      const applications = applicationsRes.data || []
      const profile = profileRes.data

      analyticsData = {
        campaigns: {
          total: campaigns.length,
          active: campaigns.filter(c => c.status === 'active').length,
          draft: campaigns.filter(c => c.status === 'draft').length,
          completed: campaigns.filter(c => c.status === 'completed').length,
          totalBudget: campaigns.reduce((sum, c) => sum + (c.budget?.total || 0), 0)
        },
        applications: {
          total: applications.length,
          applied: applications.filter(a => a.status === 'applied').length,
          accepted: applications.filter(a => a.status === 'accepted').length,
          declined: applications.filter(a => a.status === 'declined').length,
          completed: applications.filter(a => a.status === 'completed').length
        },
        businessMetrics: {
          companyRating: profile?.google_maps_rating || 0,
          reviewCount: profile?.google_maps_review_count || 0,
          websiteTraffic: profile?.website_monthly_visitors || 0,
          linkedinFollowers: profile?.linkedin_followers || 0,
          financialStability: profile?.financial_stability_score || 0,
          sustainabilityRating: profile?.sustainability_rating || 0
        },
        timeSeriesData: campaigns.map(c => ({
          date: c.created_at,
          campaign: c.title,
          budget: c.budget?.total || 0,
          status: c.status
        }))
      }

    } else if (userRole === 'kol') {
      // Get KOL analytics data
      const [applicationsRes, profileRes, analyticsRes] = await Promise.all([
        supabase
          .from('campaign_kols')
          .select(`
            id,
            status,
            created_at,
            campaigns!campaign_id (
              title,
              budget,
              status
            )
          `)
          .eq('kol_id', userId),
        supabase
          .from('kol_profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('kol_analytics')
          .select('*')
          .eq('kol_id', userId)
      ])

      // Calculate KOL analytics
      const applications = applicationsRes.data || []
      const profile = profileRes.data
      const platformAnalytics = analyticsRes.data || []

      analyticsData = {
        applications: {
          total: applications.length,
          applied: applications.filter(a => a.status === 'applied').length,
          accepted: applications.filter(a => a.status === 'accepted').length,
          declined: applications.filter(a => a.status === 'declined').length,
          completed: applications.filter(a => a.status === 'completed').length,
          successRate: applications.length > 0 
            ? ((applications.filter(a => a.status === 'accepted' || a.status === 'completed').length / applications.length) * 100).toFixed(1)
            : '0'
        },
        contentMetrics: {
          youtubeSubscribers: profile?.youtube_subscriber_count || 0,
          instagramFollowers: profile?.instagram_follower_count || 0,
          youtubeEngagement: profile?.youtube_engagement_rate || 0,
          instagramEngagement: profile?.instagram_engagement_rate || 0,
          contentQuality: profile?.content_quality_score || 0,
          nicheAuthority: profile?.niche_authority_score || 0,
          brandSafety: profile?.brand_safety_score || 0,
          authenticity: profile?.content_authenticity_score || 0
        },
        brandCollaborations: {
          totalDeals: profile?.previous_brand_deals?.length || 0,
          averageDealValue: profile?.average_brand_deal_value || 0,
          industriesWorked: profile?.industries_worked_with?.length || 0,
          collaborationReadiness: profile?.collaboration_readiness || false
        },
        platformAnalytics: platformAnalytics.map(p => ({
          platform: p.platform,
          followers: p.followers,
          engagement: p.engagement_rate,
          averageViews: p.average_views,
          demographics: p.audience_demographics
        })),
        performanceMetrics: {
          avgLikes: profile?.average_likes_per_post || 0,
          avgComments: profile?.average_comments_per_post || 0,
          avgShares: profile?.average_shares_per_post || 0,
          viralContent: profile?.viral_content_count || 0
        }
      }
    }

    return NextResponse.json({ success: true, data: analyticsData })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
