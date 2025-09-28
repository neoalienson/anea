import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    console.log('Campaign withdrawal - Starting...');
    const session = await getServerSession(authOptions);
    console.log('Campaign withdrawal - Session:', session?.user?.id);
    
    if (!session?.user) {
      console.log('Campaign withdrawal - No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason } = await request.json();
    const { id } = params;
    console.log('Campaign withdrawal - ID:', id, 'User:', (session.user as any).id);

    // Verify the campaign belongs to the current user and can be cancelled
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('business_id', (session.user as any).id)
      .single();

    console.log('Campaign withdrawal - Fetch result:', { campaign, fetchError });

    if (fetchError || !campaign) {
      console.log('Campaign withdrawal - Not found');
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check if campaign can be cancelled
    if (!['active', 'draft'].includes(campaign.status)) {
      return NextResponse.json({ 
        error: 'Campaign cannot be cancelled at this stage' 
      }, { status: 400 });
    }

    // Update campaign status to cancelled
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Campaign withdrawal - Update error:', updateError);
      return NextResponse.json({ error: 'Failed to cancel campaign' }, { status: 500 });
    }

    console.log('Campaign withdrawal - Success');
    // Optionally, update all pending applications to declined
    await supabase
      .from('campaign_kols')
      .update({ 
        status: 'declined',
        updated_at: new Date().toISOString()
      })
      .eq('campaign_id', id)
      .in('status', ['applied', 'invited']);

    return NextResponse.json({ 
      success: true,
      message: `Campaign "${campaign.title}" has been cancelled successfully.`
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}