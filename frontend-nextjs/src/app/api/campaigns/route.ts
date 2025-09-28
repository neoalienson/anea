import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(request.url);
    const userRole = url.searchParams.get('role');
    const userId = url.searchParams.get('userId');

    // If it's a business user requesting their own campaigns
    if (userRole === 'business' && userId) {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('business_id', userId)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Business campaigns fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    // Default: return all active campaigns for KOLs to browse
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Campaigns fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Campaigns fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}