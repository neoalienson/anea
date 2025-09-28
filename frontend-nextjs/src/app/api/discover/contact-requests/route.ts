import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    const campaignId = url.searchParams.get('campaignId')

  const query = supabase.from('kol_contact_requests').select('*').neq('status', 'withdrawn')

    if (campaignId) query.eq('campaign_id', campaignId)
    if (userId) query.eq('requester_id', userId)

    const { data, error } = await query.order('requested_at', { ascending: false }) as any

    if (error) {
      // If table missing or other error, return empty list for resilience
      console.warn('contact-requests GET warning:', error.message)
      return NextResponse.json({ success: true, data: [] })
    }

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('contact-requests GET error:', e)
    return NextResponse.json({ error: 'Failed to fetch contact requests' }, { status: 500 })
  }
}
