import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const profileType = searchParams.get('type') || 'kol' // default to kol for backward compatibility

    let data, error

    if (profileType === 'business') {
      const response = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      data = response.data
      error = response.error
    } else {
      const response = await supabase
        .from('kol_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      data = response.data
      error = response.error
    }

    if (error && error.code !== 'PGRST116') {
      console.error('Profile fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || {} })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}