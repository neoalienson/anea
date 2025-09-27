import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, title, description, budget, requirements } = await request.json()

    if (!userId || !title) {
      return NextResponse.json({ error: 'User ID and title required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        business_id: userId,
        title,
        description,
        budget,
        requirements,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Campaign creation error:', error)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Campaign creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}