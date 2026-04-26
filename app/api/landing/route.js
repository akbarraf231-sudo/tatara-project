import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('landing_content')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ success: true, data: data || {} });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const update = { ...body, updated_at: new Date().toISOString() };
    delete update.id;
    delete update.created_at;

    const { data: existing } = await supabaseServer
      .from('landing_content')
      .select('id')
      .limit(1)
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabaseServer
        .from('landing_content')
        .update(update)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabaseServer
        .from('landing_content')
        .insert([update])
        .select()
        .single();
    }
    if (result.error) throw result.error;
    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
