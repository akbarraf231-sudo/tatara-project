import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [{ data: products }, { data: orders }, { data: expenses }] = await Promise.all([
      supabaseServer.from('products').select('id, name, stock, restock_threshold, unit_of_measurement, price'),
      supabaseServer.from('order_items').select('product_id, qty'),
      supabaseServer.from('expenses').select('amount, expense_date, category, quantity, unit_price'),
    ]);

    const productsData = products || [];
    const ordersData = orders || [];
    const expensesData = expenses || [];

    // Calculate product statistics
    const productStats = {};
    productsData.forEach((product) => {
      const productOrders = ordersData.filter((o) => o.product_id === product.id);
      const totalSold = productOrders.reduce((sum, o) => sum + o.qty, 0);
      const hasThreshold = product.restock_threshold && product.restock_threshold > 0;
      const isLowStock = hasThreshold && product.stock < product.restock_threshold;

      productStats[product.id] = {
        id: product.id,
        name: product.name,
        stock: product.stock,
        threshold: product.restock_threshold || 10,
        unit: product.unit_of_measurement || 'pcs',
        price: product.price,
        totalSold,
        isLowStock,
        status: product.stock === 0 ? 'outofstock' : isLowStock ? 'low' : 'normal',
      };
    });

    // Calculate average daily sales (last 30 days)
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    const recentOrders = ordersData.filter((o) => {
      const product = productsData.find((p) => p.id === o.product_id);
      return product;
    });

    const avgDailySalesPerProduct = {};
    productsData.forEach((product) => {
      const productSales = recentOrders
        .filter((o) => o.product_id === product.id)
        .reduce((sum, o) => sum + o.qty, 0);
      avgDailySalesPerProduct[product.id] = productSales > 0 ? Math.ceil(productSales / 30) : 0;
    });

    // Predict stock depletion
    const predictions = [];
    Object.values(productStats).forEach((product) => {
      const dailyAvg = avgDailySalesPerProduct[product.id] || 0;
      if (dailyAvg > 0 && product.stock > 0) {
        const daysUntilEmpty = Math.floor(product.stock / dailyAvg);
        const daysUntilThreshold = Math.max(0, Math.floor((product.stock - product.threshold) / dailyAvg));
        if (daysUntilEmpty < 30) {
          predictions.push({
            productId: product.id,
            productName: product.name,
            stock: product.stock,
            threshold: product.threshold,
            avgDailySales: dailyAvg,
            daysUntilEmpty,
            daysUntilThreshold: Math.max(0, daysUntilThreshold),
            urgency: daysUntilEmpty <= 3 ? 'critical' : daysUntilEmpty <= 7 ? 'high' : 'medium',
          });
        }
      }
    });

    // Calculate purchase expenses last 30 days
    const last30DateStr = last30.toISOString().slice(0, 10);
    const purchaseExpenses = expensesData
      .filter((e) => e.category === 'purchase' && e.expense_date >= last30DateStr)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const purchaseQuantity = expensesData
      .filter((e) => e.category === 'purchase' && e.expense_date >= last30DateStr)
      .reduce((sum, e) => sum + (e.quantity || 0), 0);

    // Stock alerts
    const alerts = [];
    const lowStockProducts = Object.values(productStats).filter((p) => p.isLowStock && p.status !== 'outofstock');
    const outOfStockProducts = Object.values(productStats).filter((p) => p.status === 'outofstock');

    if (outOfStockProducts.length > 0) {
      alerts.push({
        type: 'critical',
        icon: '🚨',
        title: 'Out of Stock',
        count: outOfStockProducts.length,
        message: `${outOfStockProducts.length} produk stok habis! Segera pesan bahan baku.`,
      });
    }

    if (lowStockProducts.length > 0) {
      alerts.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Stock Rendah',
        count: lowStockProducts.length,
        message: `${lowStockProducts.length} produk stok di bawah threshold. Pertimbangkan untuk pesan.`,
      });
    }

    const criticalPredictions = predictions.filter((p) => p.urgency === 'critical');
    if (criticalPredictions.length > 0) {
      alerts.push({
        type: 'warning',
        icon: '⏰',
        title: 'Stock Akan Habis',
        count: criticalPredictions.length,
        message: `${criticalPredictions.length} produk akan habis dalam 3 hari!`,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        productStats: Object.values(productStats),
        predictions: predictions.sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty),
        alerts,
        summary: {
          totalProducts: productsData.length,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          purchaseExpensesLast30: purchaseExpenses,
          purchaseQuantityLast30: purchaseQuantity,
          avgPricePerUnit: purchaseQuantity > 0 ? (purchaseExpenses / purchaseQuantity).toFixed(2) : 0,
        },
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
