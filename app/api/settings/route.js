import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

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
        cs_whatsapp_number: '',
        special_lead_time_days: 3,
        site_logo_url: '',
        store_status: 'open',
        closed_message: 'Toko sedang tutup. Terima kasih!',
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
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const {
      whatsapp_number,
      location_link,
      qris_image_url,
      cs_whatsapp_number,
      special_lead_time_days,
      site_logo_url,
      store_status,
      closed_message,
    } = body;

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
    if (cs_whatsapp_number !== undefined) payload.cs_whatsapp_number = cs_whatsapp_number;
    if (special_lead_time_days !== undefined) {
      payload.special_lead_time_days = parseInt(special_lead_time_days) || 3;
    }
    if (site_logo_url !== undefined) payload.site_logo_url = site_logo_url;
    if (store_status !== undefined) payload.store_status = store_status === 'closed' ? 'closed' : 'open';
    if (closed_message !== undefined) payload.closed_message = closed_message || 'Toko sedang tutup. Terima kasih!';

    async function tryWrite(p) {
      if (existing) {
        return supabaseServer.from('settings').update(p).eq('id', existing.id).select().single();
      }
      return supabaseServer.from('settings').insert([p]).select().single();
    }

    let result = await tryWrite(payload);
    // Handle missing-column errors gracefully
    const droppable = ['qris_image_url', 'cs_whatsapp_number', 'special_lead_time_days', 'site_logo_url'];
    let attempt = 0;
    while (result.error && attempt < droppable.length) {
      const dropped = droppable.find((k) => new RegExp(k, 'i').test(result.error.message || ''));
      if (!dropped) break;
      delete payload[dropped];
      result = await tryWrite(payload);
      attempt++;
    }

    if (result.error) throw result.error;

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
