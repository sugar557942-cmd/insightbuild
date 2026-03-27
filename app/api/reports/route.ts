import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.REPORTS_API_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('id, title, week, published_at')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.REPORTS_API_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Validate required fields (Simplified)
    if (!body.id || !body.title) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('reports')
      .upsert(body, { onConflict: 'industry_id,week' });

    if (error) throw error;

    // Revalidate trends list and detail page
    revalidatePath('/trends');
    revalidatePath(`/trends/${body.id}`);

    return NextResponse.json({ success: true, id: body.id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.REPORTS_API_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Revalidate paths
    revalidatePath('/trends');
    revalidatePath(`/trends/${id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
