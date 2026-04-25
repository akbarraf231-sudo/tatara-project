'use client';

import { useState, useEffect } from 'react';

export function PaymentModal({ isOpen, onClose, orderId, customerName, items, total }) {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('qris');

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data.data || {});
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  }

  function handleWhatsAppOrder() {
    if (!settings?.whatsapp_number) {
      alert('WhatsApp number not configured');
      return;
    }

    const itemsList = items
      .map((item) => `${item.name} x${item.qty} = Rp ${(item.price * item.qty).toLocaleString('id-ID')}`)
      .join('\n');

    const message = `Pesanan Baru:
Nama: ${customerName}
Nomor Pesanan: ${orderId}

Daftar Item:
${itemsList}

Total: Rp ${total.toLocaleString('id-ID')}
Metode Pembayaran: ${paymentMethod === 'qris' ? 'QRIS' : 'Cash'}

Saya sudah melakukan pembayaran.`;

    const encodedMessage = encodeURIComponent(message);
    const waNumber = settings.whatsapp_number.replace(/\D/g, '');
    window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-amber-600 text-white p-6 sticky top-0">
          <h2 className="text-2xl font-bold mb-1">Payment</h2>
          <p className="text-amber-100 text-sm">Order #{orderId}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="font-bold text-amber-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm text-amber-900 mb-3">
              {items.map((item) => (
                <div key={item.product_id} className="flex justify-between">
                  <span>{item.name} x{item.qty}</span>
                  <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-amber-200 pt-3 flex justify-between font-bold text-amber-900">
              <span>Total</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <label className="block">
              <div className="flex items-center p-4 border-2 border-amber-200 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors" style={{ borderColor: paymentMethod === 'qris' ? '#b45309' : '#fcd34d' }}>
                <input
                  type="radio"
                  name="payment"
                  value="qris"
                  checked={paymentMethod === 'qris'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-amber-900">QRIS</p>
                  <p className="text-sm text-amber-700">Scan QR code to pay</p>
                </div>
              </div>
            </label>

            <label className="block">
              <div className="flex items-center p-4 border-2 border-amber-200 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors" style={{ borderColor: paymentMethod === 'cash' ? '#b45309' : '#fcd34d' }}>
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-amber-900">Cash</p>
                  <p className="text-sm text-amber-700">Pay at pickup</p>
                </div>
              </div>
            </label>
          </div>

          {/* Payment Details */}
          {paymentMethod === 'qris' && (
            <div className="space-y-3">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-amber-900 font-semibold mb-3">QRIS Payment Code</p>
                <div className="bg-white p-4 rounded border-2 border-dashed border-amber-300 flex items-center justify-center min-h-64">
                  <div className="text-center">
                    <p className="text-2xl mb-2">📱</p>
                    <p className="text-sm text-amber-700">
                      QR Code would be displayed here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-sm text-amber-900 font-semibold mb-2">Cash Payment</p>
              <p className="text-sm text-amber-900">
                Please pay <span className="font-bold">Rp {total.toLocaleString('id-ID')}</span> at pickup.
              </p>
              {settings?.location_link && (
                <a
                  href={settings.location_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-700 font-semibold text-sm mt-2 inline-block"
                >
                  📍 View Location
                </a>
              )}
            </div>
          )}

          {/* WhatsApp Button */}
          {!loadingSettings && settings?.whatsapp_number && (
            <button
              onClick={handleWhatsAppOrder}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.998 1.506c-1.471.806-2.667 1.896-3.425 3.27-1.802 3.335-.555 7.343 2.928 9.142 1.675.906 3.637 1.067 5.589.368l.073-.036 3.976 1.041-.666-3.802c.529-1.466.726-2.88.368-4.266-.713-2.876-3.22-4.9-6.14-4.9l-.015-.001z"/>
              </svg>
              Konfirmasi via WhatsApp
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
