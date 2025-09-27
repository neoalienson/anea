import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('kol_profiles')
      .select(`
        *,
        users!inner(id, email, role)
      `)
      .eq('users.role', 'kol')
      .eq('verification_status', 'verified')

    if (error) {
      console.error('KOLs fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch KOLs' }, { status: 500 })
    }

    const formattedData = data?.map(kol => ({
      id: kol.user_id,
      display_name: kol.display_name,
      bio: kol.bio,
      categories: kol.categories || [],
      audience_metrics: kol.audience_metrics,
      social_links: kol.social_links || []
    })) || []

    return NextResponse.json({ success: true, data: formattedData })
  } catch (error) {
    console.error('KOLs fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}