import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const mockYouTubeMetrics = (channelUrl: string) => {
  const baseFollowers = Math.floor(Math.random() * 500000) + 10000
  const engagementRate = (Math.random() * 0.08) + 0.02
  const averageViews = Math.floor(baseFollowers * (engagementRate + 0.1))

  return {
    totalFollowers: baseFollowers,
    engagementRate: parseFloat(engagementRate.toFixed(4)),
    averageViews,
    platform: 'youtube',
    lastUpdated: new Date().toISOString()
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, youtubeUrl } = await request.json()

    if (!userId || !youtubeUrl) {
      return NextResponse.json({ error: 'User ID and YouTube URL required' }, { status: 400 })
    }

    const metrics = mockYouTubeMetrics(youtubeUrl)

    const { data, error } = await supabase
      .from('kol_analytics')
      .upsert({
        kol_id: userId,
        platform: 'youtube',
        followers: metrics.totalFollowers,
        engagement_rate: metrics.engagementRate,
        average_views: metrics.averageViews,
        audience_demographics: { channelUrl: youtubeUrl },
        last_updated: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Analytics storage error:', error)
      return NextResponse.json({ error: 'Failed to store metrics' }, { status: 500 })
    }

    await supabase
      .from('kol_profiles')
      .update({
        audience_metrics: metrics,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    return NextResponse.json({ success: true, data: metrics })
  } catch (error) {
    console.error('YouTube metrics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}