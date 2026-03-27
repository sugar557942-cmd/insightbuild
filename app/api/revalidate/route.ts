import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.REVALIDATE_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paths } = await req.json();
    
    if (!paths || !Array.isArray(paths)) {
      return NextResponse.json({ success: false, error: 'Invalid paths' }, { status: 400 });
    }

    paths.forEach((path) => {
      revalidatePath(path);
    });

    return NextResponse.json({ revalidated: true, paths });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
