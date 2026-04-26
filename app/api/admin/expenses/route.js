import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

function computeTotals(rows) {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + '-01';

  const init = () => ({ total: 0, today: 0, month: 0 });
  const buckets = { purchase: init(), operational: init(), all: init() };

  for (const r of rows) {
    const amt = Number(r.amount) || 0;
    const cat = r.category === 'purchase' ? 'purchase' : 'operational';
    buckets[cat].total += amt;
    buckets.all.total += amt;
    if (r.expense_date === today) {
      buckets[cat].today += amt;
      buckets.all.today += amt;
    }
    if (r.expense_date >= monthStart) {
      buckets[cat].month += amt;
      buckets.all.month += amt;
    }
  }
  return buckets;
}

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
    const rows = data || [];
    const totals = computeTotals(rows);
    return NextResponse.json({ success: true, data: rows, totals });
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
    const { category, description, expense_date } = body;
    const cat = category || 'purchase';
    if (!description) {
      return NextResponse.json({ success: false, error: 'Description is required' }, { status: 400 });
    }

    const payload = {
      category: cat,
      description,
      expense_date: expense_date || new Date().toISOString().slice(0, 10),
    };

    if (cat === 'purchase') {
      const quantity = parseFloat(body.quantity);
      const unit_price = parseFloat(body.unit_price);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return NextResponse.json({ success: false, error: 'Quantity harus lebih dari 0' }, { status: 400 });
      }
      if (!Number.isFinite(unit_price) || unit_price < 0) {
        return NextResponse.json({ success: false, error: 'Unit price tidak valid' }, { status: 400 });
      }
      // Subtotal computed server-side
      const subtotal = Math.round(quantity * unit_price * 100) / 100;
      payload.quantity = quantity;
      payload.unit_price = unit_price;
      payload.amount = subtotal;
    } else {
      const amount = parseFloat(body.amount);
      if (!Number.isFinite(amount) || amount < 0) {
        return NextResponse.json({ success: false, error: 'Amount tidak valid' }, { status: 400 });
      }
      payload.amount = amount;
    }

    const { data, error } = await supabaseServer
      .from('expenses')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
