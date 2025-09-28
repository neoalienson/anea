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
    console.log('Application withdrawal - Starting...');
    const session = await getServerSession(authOptions);
    console.log('Application withdrawal - Session:', session?.user?.id);
    
    if (!session?.user) {
      console.log('Application withdrawal - No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason } = await request.json();
    const { id } = params;
    console.log('Application withdrawal - ID:', id, 'User:', (session.user as any).id);

    // Verify the application belongs to the current user and can be withdrawn
    const { data: application, error: fetchError } = await supabase
      .from('campaign_kols')
      .select(`
        *,
        campaigns(
          id,
          title,
          status
        )
      `)
      .eq('id', id)
      .eq('kol_id', (session.user as any).id)
      .single();

    console.log('Application withdrawal - Fetch result:', { application, fetchError });

    if (fetchError || !application) {
      console.log('Application withdrawal - Not found');
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if application can be withdrawn
    if (!['applied', 'invited'].includes(application.status)) {
      return NextResponse.json({ 
        error: 'Application cannot be withdrawn at this stage' 
      }, { status: 400 });
    }

    // Update application status to declined (as withdrawn is not in the enum)
    const { error: updateError } = await supabase
      .from('campaign_kols')
      .update({ 
        status: 'declined',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Application withdrawal - Update error:', updateError);
      return NextResponse.json({ error: 'Failed to withdraw application' }, { status: 500 });
    }

    console.log('Application withdrawal - Success');
    return NextResponse.json({ 
      success: true,
      message: `Application for "${application.campaigns.title}" has been withdrawn successfully.`
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}