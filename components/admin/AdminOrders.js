'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

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
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
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

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  if (loading) {
    return <div className="text-[#5a1f2a]">Loading orders...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[#5a1f2a]">📦 Orders ({orders.length})</h2>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                filterStatus === s
                  ? 'bg-[#5a1f2a] text-white'
                  : 'bg-[#fce8e2] text-[#5a1f2a] hover:bg-[#e3b9b9]'
              }`}
            >
              {s === 'all' ? 'All' : `${getStatusIcon(s)} ${s}`}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-12 text-center">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-[#722f37]">Belum ada order {filterStatus !== 'all' && `dengan status "${filterStatus}"`}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg border-2 border-[#e3b9b9] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() =>
                  setExpandedOrder(expandedOrder === order.id ? null : order.id)
                }
                className="w-full text-left p-4 hover:bg-[#fce8e2] transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-3xl">{getStatusIcon(order.status)}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-[#5a1f2a] truncate">
                      {order.customer_name}
                    </p>
                    <p className="text-xs text-[#722f37]">
                      #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#5a1f2a]">
                    Rp {Number(order.total).toLocaleString('id-ID')}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </button>

              {expandedOrder === order.id && (
                <div className="bg-[#fce8e2] border-t-2 border-[#e3b9b9] p-4 space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-bold text-[#5a1f2a] mb-2">📋 Items:</h4>
                    <div className="space-y-2 bg-white p-3 rounded-lg border border-[#e3b9b9]">
                      {order.order_items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm text-[#5a1f2a]"
                        >
                          <span>
                            {item.products?.name || 'Product'} <span className="text-[#722f37]">x{item.qty}</span>
                          </span>
                          <span className="font-semibold">
                            Rp {(Number(item.price) * item.qty).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Update */}
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div>
                      <h4 className="font-bold text-[#5a1f2a] mb-2">Update Status:</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            disabled={updatingStatus === order.id}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded font-semibold text-sm transition-colors"
                          >
                            ✅ Confirm
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            disabled={updatingStatus === order.id}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-semibold text-sm transition-colors"
                          >
                            📦 Complete
                          </button>
                        )}
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          disabled={updatingStatus === order.id}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded font-semibold text-sm transition-colors"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {order.expires_at && order.status === 'pending' && (
                    <p className="text-xs text-[#722f37]">
                      ⏰ Expires: {new Date(order.expires_at).toLocaleString('id-ID')}
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
