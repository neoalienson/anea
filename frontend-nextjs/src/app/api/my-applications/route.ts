import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get campaigns the KOL has applied to (excluding declined/withdrawn)
    const { data, error } = await supabase
      .from('campaign_kols')
      .select(`
        id,
        status,
        created_at,
        campaigns (
          id,
          title,
          description,
          budget,
          status,
          requirements,
          created_at,
          business_id
        )
      `)
      .eq('kol_id', userId)
      .not('status', 'eq', 'declined') // Exclude withdrawn applications
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Applications fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
