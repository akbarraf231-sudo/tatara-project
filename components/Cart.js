'use client';

import { useState, useEffect } from 'react';
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
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 h-fit border-2 border-amber-100">
        <h2 className="text-2xl font-bold mb-4 text-amber-900">Your Cart</h2>

        {items.length === 0 ? (
          <p className="text-amber-700 text-center py-8">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between border-b border-amber-100 pb-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-amber-900 truncate">{item.name}</p>
                    <p className="text-sm text-amber-700">
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mx-2">
                    <button
                      onClick={() => updateQty(item.product_id, item.qty - 1)}
                      className="bg-amber-100 hover:bg-amber-200 w-7 h-7 rounded flex items-center justify-center transition-colors text-amber-900"
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
                      className="w-10 text-center border border-amber-200 rounded py-1 text-amber-900"
                    />
                    <button
                      onClick={() => updateQty(item.product_id, item.qty + 1)}
                      className="bg-amber-100 hover:bg-amber-200 w-7 h-7 rounded flex items-center justify-center transition-colors text-amber-900"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-red-600 hover:text-red-800 font-semibold text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-amber-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-amber-900">Total:</span>
                <span className="text-2xl font-bold text-amber-700">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>

              <input
                type="text"
                placeholder="Your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border-2 border-amber-200 rounded-lg py-2 px-3 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-600"
                disabled={submitting}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg text-sm mb-3">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={submitting || !customerName.trim()}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {submitting ? 'Processing...' : 'Proceed to Payment'}
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
