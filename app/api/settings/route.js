import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || {
        whatsapp_number: '',
        location_link: '',
        qris_image_url: '',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { whatsapp_number, location_link, qris_image_url } = body;

    if (!process.env.ADMIN_PASSWORD || request.headers.get('x-admin-token') !== Buffer.from(process.env.ADMIN_PASSWORD).toString('base64')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: existing } = await supabaseServer
      .from('settings')
      .select('id')
      .limit(1)
      .single();

    const payload = {
      whatsapp_number,
      location_link,
      updated_at: new Date(),
    };
    if (qris_image_url !== undefined) payload.qris_image_url = qris_image_url;

    let result;
    if (existing) {
      result = await supabaseServer
        .from('settings')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabaseServer
        .from('settings')
        .insert([payload])
        .select()
        .single();
    }

    if (result.error && /qris_image_url/i.test(result.error.message || '')) {
      delete payload.qris_image_url;
      if (existing) {
        result = await supabaseServer
          .from('settings')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await supabaseServer
          .from('settings')
          .insert([payload])
          .select()
          .single();
      }
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
