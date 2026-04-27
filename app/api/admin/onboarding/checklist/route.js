import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const authHeader = request.headers.get('x-admin-token');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Admin token required' }, { status: 400 });
    }

    const { data: checklist, error: checklistError } = await supabaseServer
      .from('owner_checklist')
      .select('*')
      .order('priority', { ascending: false });

    if (checklistError) throw checklistError;

    const { data: progress, error: progressError } = await supabaseServer
      .from('owner_checklist_progress')
      .select('checklist_id, completed, completed_at')
      .eq('owner_id', authHeader);

    if (progressError && progressError.code !== 'PGRST116') throw progressError;

    const progressMap = {};
    (progress || []).forEach((p) => {
      progressMap[p.checklist_id] = {
        completed: p.completed,
        completedAt: p.completed_at,
      };
    });

    const enrichedChecklist = (checklist || []).map((item) => ({
      ...item,
      ...progressMap[item.id],
      completed: progressMap[item.id]?.completed || false,
    }));

    return NextResponse.json({
      success: true,
      data: enrichedChecklist,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { checklistId, completed } = await request.json();
    const authHeader = request.headers.get('x-admin-token');

    if (!checklistId) {
      return NextResponse.json({ success: false, error: 'Checklist ID required' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('owner_checklist_progress')
      .upsert(
        {
          owner_id: authHeader,
          checklist_id: checklistId,
          completed: completed === true,
          completed_at: completed === true ? new Date().toISOString() : null,
        },
        { onConflict: 'owner_id,checklist_id' }
      )
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data?.[0],
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
