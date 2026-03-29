import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.REPORTS_API_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { industry_id, market_charts } = await req.json();

    if (!industry_id) {
       return NextResponse.json({ success: false, error: 'Industry ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('industries')
      .update({ market_charts })
      .eq('id', industry_id)
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
