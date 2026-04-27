import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [{ data: orders }, { data: items }, { data: products }, { data: expenses }] = await Promise.all([
      supabaseServer.from('orders').select('id, total, status, created_at, order_type'),
      supabaseServer.from('order_items').select('product_id, qty, price, products(name, price)'),
      supabaseServer.from('products').select('id, name, price, stock, product_type'),
      supabaseServer.from('expenses').select('amount, expense_date, category, quantity, unit_price'),
    ]);

    const ordersData = orders || [];
    const itemsData = items || [];
    const productsData = products || [];
    const expensesData = expenses || [];

    // Calculate metrics
    const confirmedOrders = ordersData.filter((o) => o.status === 'confirmed' || o.status === 'completed');
    const totalRevenue = confirmedOrders.reduce((sum, o) => sum + Number(o.total), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = confirmedOrders.filter((o) => new Date(o.created_at) >= today);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);

    const monthStart = new Date(today);
    monthStart.setDate(1);
    const monthOrders = confirmedOrders.filter((o) => new Date(o.created_at) >= monthStart);
    const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.total), 0);

    // Top products
    const productSales = {};
    itemsData.forEach((item) => {
      const pId = item.product_id;
      const pName = item.products?.name || 'Unknown';
      if (!productSales[pId]) {
        productSales[pId] = { name: pName, qty: 0, revenue: 0 };
      }
      productSales[pId].qty += item.qty;
      productSales[pId].revenue += Number(item.price) * item.qty;
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by day of week (last 30 days)
    const salesByDay = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const last30 = new Date(today);
    last30.setDate(today.getDate() - 30);
    confirmedOrders.filter((o) => new Date(o.created_at) >= last30).forEach((o) => {
      const day = new Date(o.created_at).getDay();
      salesByDay[day] += Number(o.total);
    });

    // Daily vs Special breakdown
    const dailyRevenue = confirmedOrders
      .filter((o) => o.order_type !== 'special')
      .reduce((sum, o) => sum + Number(o.total), 0);
    const specialRevenue = confirmedOrders
      .filter((o) => o.order_type === 'special')
      .reduce((sum, o) => sum + Number(o.total), 0);

    // Expenses breakdown
    const totalExpenses = expensesData.reduce((sum, e) => sum + Number(e.amount), 0);
    const purchaseExpenses = expensesData
      .filter((e) => e.category === 'purchase')
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const operationalExpenses = totalExpenses - purchaseExpenses;

    // Profit calculation
    const totalProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

    // Low stock products
    const lowStockProducts = productsData
      .filter((p) => p.stock < (p.restock_threshold || 10))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

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

    const avgDailySales = Math.max(...Object.values(salesByDay));
    const peakDay = Object.keys(salesByDay).find((d) => salesByDay[d] === avgDailySales);
    if (peakDay) {
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      recommendations.push({
        type: 'info',
        icon: '📈',
        title: 'Puncak Penjualan',
        message: `${dayNames[peakDay]} adalah hari terpadat. Stock lebih banyak di hari itu!`,
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
          purchase: purchaseExpenses,
          operational: operationalExpenses,
        },
        profit: {
          total: totalProfit,
          margin: profitMargin,
        },
        orders: {
          total: confirmedOrders.length,
          today: todayOrders.length,
          month: monthOrders.length,
        },
        topProducts,
        lowStockProducts,
        salesByDay,
        recommendations,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
