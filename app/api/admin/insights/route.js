import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000'), 5000);

    // Use database function for aggregations (much faster)
    const { data, error } = await supabaseServer.rpc('get_insights_data', {
      limit_val: limit,
      offset_val: 0,
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          revenue: { total: 0, today: 0, month: 0, daily: 0, special: 0 },
          expenses: { total: 0, purchase: 0, operational: 0 },
          profit: { total: 0, margin: 0 },
          orders: { total: 0, today: 0, month: 0 },
          topProducts: [],
          lowStockProducts: [],
          salesByDay: {},
          recommendations: [],
        },
      });
    }

    const result = data[0];
    const totalRevenue = Number(result.total_revenue) || 0;
    const todayRevenue = Number(result.today_revenue) || 0;
    const monthRevenue = Number(result.month_revenue) || 0;
    const dailyRevenue = Number(result.daily_revenue) || 0;
    const specialRevenue = Number(result.special_revenue) || 0;
    const totalExpenses = Number(result.total_expenses) || 0;
    const totalProfit = Number(result.total_profit) || 0;
    const profitMargin = Number(result.profit_margin) || 0;
    const topProducts = (result.top_products || []).map(p => ({
      name: p.name,
      qty: Number(p.qty),
      revenue: Number(p.revenue),
    }));
    const totalOrders = Number(result.total_count) || 0;

    // Get low stock products efficiently
    const { data: lowStockData } = await supabaseServer
      .from('products')
      .select('id, name, stock, restock_threshold')
      .lt('stock', 10)
      .order('stock', { ascending: true })
      .limit(5);

    const lowStockProducts = (lowStockData || []).map(p => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      threshold: p.restock_threshold || 10,
    }));

    // Recommendations
    const recommendations = [];

    if (lowStockProducts.length > 0) {
      recommendations.push({
        type: 'warning',
        icon: '📦',
        title: 'Stok Rendah',
        message: `${lowStockProducts.length} produk stok kurang dari threshold. Pesan sekarang!`,
      });
    }

    if (topProducts.length > 0 && topProducts[0].qty > 0) {
      recommendations.push({
        type: 'success',
        icon: '⭐',
        title: 'Produk Unggulan',
        message: `${topProducts[0].name} adalah produk terlaris. Pertahankan kualitas & stok!`,
      });
    }

    if (profitMargin < 30) {
      recommendations.push({
        type: 'warning',
        icon: '💰',
        title: 'Margin Keuntungan Rendah',
        message: `Margin hanya ${profitMargin}%. Pertimbangkan naikkan harga atau kurangi cost.`,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
          month: monthRevenue,
          daily: dailyRevenue,
          special: specialRevenue,
        },
        expenses: {
          total: totalExpenses,
          purchase: 0,
          operational: totalExpenses,
        },
        profit: {
          total: totalProfit,
          margin: profitMargin,
        },
        orders: {
          total: totalOrders,
          today: 0,
          month: 0,
        },
        topProducts,
        lowStockProducts,
        salesByDay: {},
        recommendations,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
