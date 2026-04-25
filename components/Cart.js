'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';

export function Cart() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  async function handleCheckout() {
    setSubmitting(true);
    setResult(null);

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
        setResult({ type: 'error', message: data.error || 'Failed to place order' });
        return;
      }

      setResult({
        type: 'success',
        message: `Order placed! ID: ${data.order_id}`,
        order: data,
      });
      clearCart?.();
      setCustomerName('');
    } catch (err) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6 h-fit">
      <h2 className="text-2xl font-bold mb-4">Cart</h2>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>

                <div className="flex items-center gap-2 mx-4">
                  <button
                    onClick={() => updateQty(item.product_id, item.qty - 1)}
                    className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded flex items-center justify-center transition-colors"
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
                    className="w-12 text-center border rounded py-1"
                  />
                  <button
                    onClick={() => updateQty(item.product_id, item.qty + 1)}
                    className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.product_id)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                ${total.toFixed(2)}
              </span>
            </div>

            <input
              type="text"
              placeholder="Your name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border rounded-lg py-2 px-3 mb-3"
              disabled={submitting}
            />

            <button
              onClick={handleCheckout}
              disabled={submitting || !customerName.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {submitting ? 'Placing order...' : 'Checkout'}
            </button>
          </div>
        </>
      )}

      {result && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            result.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
