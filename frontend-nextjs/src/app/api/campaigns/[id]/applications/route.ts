import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    
    // Get filter parameters
    const minFollowers = searchParams.get('minFollowers')
    const maxFollowers = searchParams.get('maxFollowers')
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Get basic applications for the campaign
    let query = supabase
      .from('campaign_kols')
      .select(`
        id,
        status,
        created_at,
        kol_id
      `)
      .eq('campaign_id', id)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: applications, error } = await query

    if (error) {
      console.error('Applications fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Get KOL user details for all applicants
    const kolIds = applications.map(app => app.kol_id)
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .in('id', kolIds)

    const { data: profiles, error: profilesError } = await supabase
      .from('kol_profiles')
      .select('user_id, display_name, bio, avatar, categories, social_links, audience_metrics, verification_status')
      .in('user_id', kolIds)

    const { data: analytics, error: analyticsError } = await supabase
      .from('kol_analytics')
      .select('kol_id, platform, followers, engagement_rate, average_views, audience_demographics')
      .in('kol_id', kolIds)

    // Combine the data
    const enrichedApplications = applications.map(application => {
      const user = users?.find(u => u.id === application.kol_id)
      const profile = profiles?.find(p => p.user_id === application.kol_id)
      const userAnalytics = analytics?.filter(a => a.kol_id === application.kol_id) || []

      return {
        ...application,
        users: user,
        kol_profiles: profile ? [profile] : [],
        kol_analytics: userAnalytics
      }
    })

    // Apply client-side filters for analytics data
    let filteredData = enrichedApplications

    if (minFollowers || maxFollowers || platform) {
      filteredData = filteredData.filter(application => {
        const appAnalytics = application.kol_analytics || []
        
        // Filter by platform
        if (platform && platform !== 'all') {
          const hasMatchingPlatform = appAnalytics.some(a => a.platform === platform)
          if (!hasMatchingPlatform) return false
        }

        // Filter by followers
        if (minFollowers || maxFollowers) {
          const relevantAnalytics = platform && platform !== 'all' 
            ? appAnalytics.filter(a => a.platform === platform)
            : appAnalytics

          if (relevantAnalytics.length === 0) return false

          const maxFollowersInAnalytics = Math.max(...relevantAnalytics.map(a => a.followers || 0))
          
          if (minFollowers && maxFollowersInAnalytics < parseInt(minFollowers)) return false
          if (maxFollowers && maxFollowersInAnalytics > parseInt(maxFollowers)) return false
        }

        return true
      })
    }

    return NextResponse.json({ success: true, data: filteredData })
  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
