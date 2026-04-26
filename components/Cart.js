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
      <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 h-fit border-2 border-[#e8d5c4]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🛒</span>
          <h2 className="text-2xl font-bold text-[#6b4423]">Keranjang</h2>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-5xl mb-2">🥐</p>
            <p className="text-[#8b6f47]">Keranjang kosong</p>
            <p className="text-xs text-[#8b6f47] mt-1">Pilih produk dulu yuk!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between border-b border-[#e8d5c4] pb-3 gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#6b4423] truncate text-sm">{item.name}</p>
                    <p className="text-xs text-[#c8794a] font-bold">
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.product_id, item.qty - 1)}
                      className="bg-[#f7e9d7] hover:bg-[#e8d5c4] w-7 h-7 rounded flex items-center justify-center transition-colors text-[#6b4423] font-bold"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        updateQty(item.product_id, parseInt(e.target.value) || 1)
                      }
                      className="w-10 text-center border border-[#e8d5c4] rounded py-1 text-[#6b4423] text-sm"
                    />
                    <button
                      onClick={() => updateQty(item.product_id, item.qty + 1)}
                      className="bg-[#f7e9d7] hover:bg-[#e8d5c4] w-7 h-7 rounded flex items-center justify-center transition-colors text-[#6b4423] font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-red-600 hover:text-red-800 font-bold text-lg ml-1"
                    title="Hapus"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[#c8794a] pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-[#6b4423]">Total:</span>
                <span className="text-2xl font-bold text-[#c8794a]">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>

              <input
                type="text"
                placeholder="Nama lo..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border-2 border-[#e8d5c4] rounded-lg py-2 px-3 mb-3 focus:outline-none focus:ring-2 focus:ring-[#c8794a] text-[#6b4423]"
                disabled={submitting}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg text-sm mb-3">
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={submitting || !customerName.trim()}
                className="w-full bg-[#c8794a] hover:bg-[#b6663a] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
              >
                {submitting ? '⏳ Memproses...' : '💳 Lanjut Bayar'}
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
