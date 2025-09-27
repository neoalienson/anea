import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, display_name, bio, youtubeUrl, twitterHandle, language } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const socialLinks = []
    if (youtubeUrl) socialLinks.push({ platform: 'youtube', url: youtubeUrl })
    if (twitterHandle) socialLinks.push({ platform: 'twitter', handle: twitterHandle })

    // Try to update first
    const { data: updateData, error: updateError } = await supabase
      .from('kol_profiles')
      .update({
        display_name,
        bio,
        social_links: socialLinks,
        content_style: { language },
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()

    let data, error
    
    if (updateError || !updateData || updateData.length === 0) {
      // If update failed or no rows affected, insert new record
      const { data: insertData, error: insertError } = await supabase
        .from('kol_profiles')
        .insert({
          user_id: userId,
          display_name,
          bio,
          social_links: socialLinks,
          content_style: { language },
          updated_at: new Date().toISOString()
        })
        .select()
      
      data = insertData
      error = insertError
    } else {
      data = updateData
      error = updateError
    }

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}