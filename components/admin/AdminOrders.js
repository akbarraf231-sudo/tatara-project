'use client';

import { useState, useEffect } from 'react';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const dayName = DAY_NAMES[date.getDay()];
  return `${dayName}, ${date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`;
}

function formatTime(timeStr) {
  if (!timeStr) return '-';
  return String(timeStr).slice(0, 5);
}

function getOrderNumber(order) {
  return order.order_number || `#${order.id.slice(0, 8)}`;
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [showArchived]);

  async function fetchOrders() {
    try {
      const token = localStorage.getItem('adminToken');
      const query = showArchived ? '?includeArchived=true' : '';
      const res = await fetch(`/api/admin/orders${query}`, {
        headers: { 'x-admin-token': token },
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Gagal load orders');
      }

      setOrders(result.data || []);
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

  async function archiveOrder(orderId) {
    if (!confirm('Archive order ini? Ordernya tetap ada tapi tersembunyi dari list utama.')) {
      return;
    }
    setUpdatingStatus(orderId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ action: 'archive' }),
      });

      if (!res.ok) {
        throw new Error('Failed to archive order');
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
        <h2 className="text-xl sm:text-2xl font-bold text-[#5a1f2a]">📦 Orders ({orders.length})</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
              showArchived
                ? 'bg-purple-600 text-white'
                : 'bg-[#fce8e2] text-[#5a1f2a] hover:bg-[#e3b9b9]'
            }`}
          >
            {showArchived ? '📁 Tampilkan Aktif' : '📦 Lihat Archived'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
              filterStatus === s
                ? 'bg-[#5a1f2a] text-white'
                : 'bg-[#fce8e2] text-[#5a1f2a] hover:bg-[#e3b9b9]'
            }`}
          >
            {s === 'all' ? 'Semua' : `${getStatusIcon(s)} ${s}`}
          </button>
        ))}
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
          {filteredOrders.map((order) => {
            const orderNum = getOrderNumber(order);
            const createdDay = DAY_NAMES[new Date(order.created_at).getDay()];
            const isExpanded = expandedOrder === order.id;
            return (
              <div
                key={order.id}
                className="bg-white rounded-lg border-2 border-[#e3b9b9] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full text-left p-3 sm:p-4 hover:bg-[#fce8e2] transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl sm:text-3xl">{getStatusIcon(order.status)}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-[#5a1f2a] truncate text-sm sm:text-base">
                        #{orderNum} • {order.customer_name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-[#722f37]">
                        {createdDay} • {new Date(order.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {order.order_type === 'special' ? ' • 🎂 Special' : ' • ☀️ Daily'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#5a1f2a] text-sm sm:text-base">
                      Rp {Number(order.total).toLocaleString('id-ID')}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="bg-[#fce8e2] border-t-2 border-[#e3b9b9] p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {/* Customer Info Card (WA style) */}
                    <div className="bg-white rounded-lg border border-[#e3b9b9] p-3 sm:p-4 text-sm space-y-1.5">
                      <div className="grid grid-cols-[100px_1fr] gap-2 text-[#5a1f2a]">
                        <span className="font-semibold">Order ID:</span>
                        <span className="font-bold text-[#722f37]">#{orderNum}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] gap-2 text-[#5a1f2a]">
                        <span className="font-semibold">Nama:</span>
                        <span>{order.customer_name}</span>
                      </div>
                      {order.customer_phone && (
                        <div className="grid grid-cols-[100px_1fr] gap-2 text-[#5a1f2a]">
                          <span className="font-semibold">HP/WA:</span>
                          <a
                            href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-700 hover:underline"
                          >
                            {order.customer_phone} 💬
                          </a>
                        </div>
                      )}
                      <div className="grid grid-cols-[100px_1fr] gap-2 text-[#5a1f2a]">
                        <span className="font-semibold">Tipe:</span>
                        <span>{order.order_type === 'special' ? '🎂 Special Order' : '☀️ Daily Order'}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] gap-2 text-[#5a1f2a]">
                        <span className="font-semibold">Order pada:</span>
                        <span className="text-xs">
                          {DAY_NAMES[new Date(order.created_at).getDay()]}, {new Date(order.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                      {order.order_type === 'special' && order.pickup_date && (
                        <div className="grid grid-cols-[100px_1fr] gap-2 text-[#5a1f2a]">
                          <span className="font-semibold">Pickup tgl:</span>
                          <span className="text-xs font-semibold text-purple-800">{formatDate(order.pickup_date)}</span>
                        </div>
                      )}
                      {order.pickup_time && (
                        <div className="grid grid-cols-[100px_1fr] gap-2 text-[#5a1f2a]">
                          <span className="font-semibold">Jam pickup:</span>
                          <span className="font-semibold text-orange-700">🕐 {formatTime(order.pickup_time)}</span>
                        </div>
                      )}
                      {order.notes && (
                        <div className="grid grid-cols-[100px_1fr] gap-2 text-[#5a1f2a]">
                          <span className="font-semibold">Catatan:</span>
                          <span className="italic text-xs">{order.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-bold text-[#5a1f2a] mb-2 text-sm">📋 Items:</h4>
                      <div className="space-y-2 bg-white p-3 rounded-lg border border-[#e3b9b9]">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="text-sm text-[#5a1f2a] border-b border-[#fce8e2] last:border-0 pb-1.5 last:pb-0">
                            <div className="flex justify-between gap-2">
                              <span className="font-semibold">
                                {item.products?.name || 'Product'} <span className="text-[#722f37] font-normal">x{item.qty}</span>
                              </span>
                              <span className="font-semibold whitespace-nowrap">
                                Rp {(Number(item.price) * item.qty).toLocaleString('id-ID')}
                              </span>
                            </div>
                            {(item.flavor || item.size) && (
                              <p className="text-xs text-[#722f37]">
                                {[item.flavor, item.size].filter(Boolean).join(' • ')}
                              </p>
                            )}
                            {item.notes && <p className="text-xs italic text-[#722f37]">📝 {item.notes}</p>}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 bg-white p-3 rounded-lg border border-[#e3b9b9] text-sm">
                        {order.subtotal !== null && order.subtotal !== undefined && (
                          <div className="flex justify-between text-xs text-[#722f37]">
                            <span>Subtotal:</span>
                            <span>Rp {Number(order.subtotal).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        {order.discount > 0 && (
                          <div className="flex justify-between text-xs text-green-700 font-semibold">
                            <span>Diskon ({order.voucher_code}):</span>
                            <span>− Rp {Number(order.discount).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-[#5a1f2a] border-t border-[#fce8e2] pt-1 mt-1">
                          <span>TOTAL:</span>
                          <span>Rp {Number(order.total).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Update */}
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <div>
                        <h4 className="font-bold text-[#5a1f2a] mb-2 text-sm">Update Status:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              disabled={updatingStatus === order.id}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded font-semibold text-xs sm:text-sm transition-colors"
                            >
                              ✅ Confirm
                            </button>
                          )}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              disabled={updatingStatus === order.id}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-semibold text-xs sm:text-sm transition-colors"
                            >
                              📦 Complete
                            </button>
                          )}
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            disabled={updatingStatus === order.id}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded font-semibold text-xs sm:text-sm transition-colors"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Archive Button - show for all completed/cancelled orders */}
                    {(order.status === 'completed' || order.status === 'cancelled') && !order.archived_at && (
                      <button
                        onClick={() => archiveOrder(order.id)}
                        disabled={updatingStatus === order.id}
                        className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded font-semibold text-xs sm:text-sm transition-colors"
                      >
                        📦 Archive Order
                      </button>
                    )}

                    {order.expires_at && order.status === 'pending' && (
                      <p className="text-xs text-[#722f37]">
                        ⏰ Expires: {new Date(order.expires_at).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
