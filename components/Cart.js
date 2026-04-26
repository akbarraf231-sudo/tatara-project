'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { PaymentModal } from './PaymentModal';

export function Cart() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);

  async function handleCheckout() {
    if (!customerName.trim()) {
      setError('Mohon isi nama lo dulu');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product_id,
            qty: item.qty,
          })),
          customer_name: customerName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to place order');
        return;
      }

      setOrderId(data.order_id);
      setShowPayment(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handlePaymentClose() {
    setShowPayment(false);
    clearCart();
    setCustomerName('');
    setOrderId(null);
  }

  return (
    <>
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-[#e3b9b9]">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-6xl mb-3">🛒</p>
            <p className="text-[#5a1f2a] text-xl font-semibold">Keranjang Kosong</p>
            <p className="text-[#722f37] text-sm mt-1">Pilih cake favorit lo dari Gallery!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between bg-[#fce8e2] rounded-2xl p-3 gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#5a1f2a] truncate">{item.name}</p>
                    <p className="text-xs text-[#c89292] font-bold">
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-sm">
                    <button
                      onClick={() => updateQty(item.product_id, item.qty - 1)}
                      className="w-7 h-7 rounded-full bg-[#e3b9b9] hover:bg-[#c89292] flex items-center justify-center text-white font-bold transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold text-[#5a1f2a]">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.product_id, item.qty + 1)}
                      className="w-7 h-7 rounded-full bg-[#5a1f2a] hover:bg-[#722f37] flex items-center justify-center text-white font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-[#5a1f2a] hover:text-red-600 font-bold text-xl"
                    title="Hapus"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[#e3b9b9] pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-[#5a1f2a]">Total:</span>
                <span className="text-3xl font-bold text-[#5a1f2a]">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>

              <input
                type="text"
                placeholder="Nama lo..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border-2 border-[#e3b9b9] rounded-full py-3 px-4 mb-3 focus:outline-none focus:border-[#c89292] text-[#5a1f2a] placeholder-[#c89292]"
                disabled={submitting}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-sm mb-3">
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={submitting || !customerName.trim()}
                className="w-full bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-bold py-4 px-4 rounded-full transition-all shadow-md hover:shadow-lg"
              >
                {submitting ? '⏳ Memproses...' : '💳 Checkout & Bayar'}
              </button>
            </div>
          </>
        )}
      </div>

      {orderId && (
        <PaymentModal
          isOpen={showPayment}
          onClose={handlePaymentClose}
          orderId={orderId}
          customerName={customerName}
          items={items}
          total={total}
        />
      )}
    </>
  );
}
