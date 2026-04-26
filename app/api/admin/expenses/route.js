import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { data, error } = await supabaseServer
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })
      .limit(500);
    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { category, description, amount, expense_date } = body;
    if (!description || amount == null) {
      return NextResponse.json({ success: false, error: 'Description and amount required' }, { status: 400 });
    }
    const { data, error } = await supabaseServer
      .from('expenses')
      .insert([{
        category: category || 'purchase',
        description,
        amount: parseFloat(amount),
        expense_date: expense_date || new Date().toISOString().slice(0, 10),
      }])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
