import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('Fetching campaign with ID:', id)

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Debug: List available campaigns
    const { data: availableCampaigns } = await supabase
      .from('campaigns')
      .select('id, title, status')
      .limit(5)
    console.log('Available campaigns in DB:', availableCampaigns)

    // First check if campaign exists
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Campaign fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 })
    }

    if (!data) {
      console.log('Campaign not found with ID:', id)
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    console.log('Campaign data found:', data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Campaign fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST endpoint for applying to a campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { userId, message } = body

    console.log('Application request - Campaign ID:', id, 'User ID:', userId)

    if (!id || !userId) {
      return NextResponse.json({ error: 'Campaign ID and User ID are required' }, { status: 400 })
    }

    // Debug: Check if user exists
    const { data: userExists, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', userId)
      .maybeSingle()
    
    console.log('User lookup result:', userExists)
    if (userError) {
      console.log('User lookup error:', userError)
    }
    
    if (!userExists) {
      // Debug: Show what users actually exist
      const { data: allUsers } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(5)
      console.log('Available users in database:', allUsers)
      
      return NextResponse.json({ 
        error: 'User not found in database',
        debug: {
          sessionUserId: userId,
          availableUsers: allUsers?.map(u => ({ id: u.id, email: u.email, role: u.role }))
        }
      }, { status: 400 })
    }

    // Check if user already applied
    const { data: existingApplication } = await supabase
      .from('campaign_kols')
      .select('id')
      .eq('campaign_id', id)
      .eq('kol_id', userId)
      .maybeSingle()

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied to this campaign' }, { status: 400 })
    }

    // Create application
    const { data, error } = await supabase
      .from('campaign_kols')
      .insert({
        campaign_id: id,
        kol_id: userId,
        status: 'applied'
      })
      .select()
      .single()

    if (error) {
      console.error('Application creation error:', error)
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Application creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
