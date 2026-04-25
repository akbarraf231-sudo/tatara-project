'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchOrders() {
    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            product_id,
            qty,
            price,
            products(id, name)
          )
        `)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setOrders(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    setUpdatingStatus(orderId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update order');
      }

      await fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingStatus(null);
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      completed: '📦',
      cancelled: '❌',
    };
    return icons[status] || '•';
  };

  if (loading) {
    return <div className="text-amber-700">Loading orders...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-amber-900">Orders</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-amber-700">No orders yet</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg border-2 border-amber-200 overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedOrder(expandedOrder === order.id ? null : order.id)
                }
                className="w-full text-left p-4 hover:bg-amber-50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getStatusIcon(order.status)}</span>
                    <div>
                      <p className="font-bold text-amber-900">
                        {order.customer_name} (#{order.id})
                      </p>
                      <p className="text-sm text-amber-700">
                        {new Date(order.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-900">
                    Rp {order.total.toLocaleString('id-ID')}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </button>

              {expandedOrder === order.id && (
                <div className="bg-amber-50 border-t-2 border-amber-200 p-4 space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-bold text-amber-900 mb-2">Items:</h4>
                    <div className="space-y-2">
                      {order.order_items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm text-amber-900"
                        >
                          <span>
                            {item.products?.name || 'Product'} x{item.qty}
                          </span>
                          <span>
                            Rp {(item.price * item.qty).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Update */}
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div>
                      <h4 className="font-bold text-amber-900 mb-2">Update Status:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['confirmed', 'completed', 'cancelled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order.id, status)}
                            disabled={updatingStatus === order.id}
                            className="px-3 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded font-semibold text-sm transition-colors"
                          >
                            {status === 'confirmed' && '✅ Confirm'}
                            {status === 'completed' && '📦 Complete'}
                            {status === 'cancelled' && '❌ Cancel'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.expires_at && (
                    <p className="text-xs text-amber-700">
                      Expires: {new Date(order.expires_at).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
