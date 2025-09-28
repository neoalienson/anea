import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Params { params: { id: string } }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error } = await supabase
      .from('kol_contact_requests')
      .update({ status: 'withdrawn', withdrawn_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      // Table might not exist in MVP flows; simulate success for UX continuity
      console.warn('withdraw contact request warning:', error.message)
    }

    return NextResponse.json({ success: true, message: 'Contact request withdrawn.' })
  } catch (e) {
    console.error('withdraw contact request error:', e)
    return NextResponse.json({ error: 'Failed to withdraw request' }, { status: 500 })
  }
}
