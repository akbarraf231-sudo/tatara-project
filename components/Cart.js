'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cartContext';
import { PaymentModal } from './PaymentModal';

export function Cart({ disabled }) {
  const { items, removeItem, updateQty, total, clearCart, hasSpecialItems } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherInfo, setVoucherInfo] = useState(null);
  const [voucherError, setVoucherError] = useState(null);
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState(null);
  const [leadTime, setLeadTime] = useState(3);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => {
      if (d.data?.special_lead_time_days) setLeadTime(d.data.special_lead_time_days);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setVoucherInfo(null);
    setVoucherError(null);
  }, [items]);

  async function applyVoucher() {
    if (!voucherCode.trim()) return;
    setValidatingVoucher(true);
    setVoucherError(null);
    try {
      const res = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode, subtotal: total }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setVoucherInfo(null);
        setVoucherError(data.error || 'Voucher tidak valid');
        return;
      }
      setVoucherInfo(data);
    } catch (err) {
      setVoucherError(err.message);
    } finally {
      setValidatingVoucher(false);
    }
  }

  function clearVoucher() {
    setVoucherCode('');
    setVoucherInfo(null);
    setVoucherError(null);
  }

  const discount = voucherInfo?.discount || 0;
  const grandTotal = total - discount;

  const minDate = (() => {
    if (!hasSpecialItems) return new Date().toISOString().slice(0, 10);
    const d = new Date();
    d.setDate(d.getDate() + leadTime);
    return d.toISOString().slice(0, 10);
  })();

  async function handleCheckout() {
    if (!customerName.trim()) {
      setError('Mohon isi nama kamu dulu ya 😊');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Mohon isi nomor WA kamu dulu ya 📱');
      return;
    }
    if (hasSpecialItems && !pickupDate) {
      setError(`Mohon pilih tanggal pickup (minimal H-${leadTime})`);
      return;
    }
    if (!pickupTime) {
      setError('Mohon pilih jam pickup-nya 🕐');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((it) => ({
            product_id: it.product_id,
            qty: it.qty,
            flavor: it.flavor,
            size: it.size,
            notes: it.notes,
          })),
          customer_name: customerName,
          customer_phone: customerPhone,
          order_type: hasSpecialItems ? 'special' : 'daily',
          voucher_code: voucherInfo ? voucherCode : null,
          pickup_date: hasSpecialItems ? pickupDate : null,
          pickup_time: pickupTime || null,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to place order');
        return;
      }
      setOrderResult(data);
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
    setCustomerPhone('');
    setPickupDate('');
    setPickupTime('');
    setNotes('');
    clearVoucher();
    setOrderResult(null);
  }

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-[#e3b9b9]">
        {items.length === 0 ? (
          <div className="text-center py-10 sm:py-12">
            <p className="text-5xl sm:text-6xl mb-3">🛒</p>
            <p className="text-[#5a1f2a] text-lg sm:text-xl font-semibold">Keranjang Kosong</p>
            <p className="text-[#722f37] text-sm mt-1">Lagi pengen yang mana? Pilih favorit kamu 😋</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.key} className="flex items-center justify-between bg-[#fce8e2] rounded-2xl p-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#5a1f2a] truncate">
                      {item.name}
                      {item.product_type === 'special' && <span className="text-xs ml-1 text-purple-700">🎂</span>}
                    </p>
                    {(item.flavor || item.size) && (
                      <p className="text-xs text-[#722f37]">
                        {[item.flavor, item.size].filter(Boolean).join(' • ')}
                      </p>
                    )}
                    <p className="text-xs text-[#c89292] font-bold">
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-sm">
                    <button
                      onClick={() => updateQty(item.key, item.qty - 1)}
                      className="w-7 h-7 rounded-full bg-[#e3b9b9] hover:bg-[#c89292] flex items-center justify-center text-white font-bold"
                    >−</button>
                    <span className="w-8 text-center font-bold text-[#5a1f2a]">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.key, item.qty + 1)}
                      className="w-7 h-7 rounded-full bg-[#5a1f2a] hover:bg-[#722f37] flex items-center justify-center text-white font-bold"
                    >+</button>
                  </div>

                  <button onClick={() => removeItem(item.key)} className="text-[#5a1f2a] hover:text-red-600 font-bold text-xl" title="Hapus">
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[#e3b9b9] pt-4 space-y-3">
              <input
                type="text"
                placeholder="Nama kamu..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border-2 border-[#e3b9b9] rounded-full py-3 px-4 focus:outline-none focus:border-[#c89292] text-[#5a1f2a] placeholder-[#c89292] text-base"
                disabled={submitting}
              />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="Nomor WhatsApp (wajib)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border-2 border-[#e3b9b9] rounded-full py-3 px-4 focus:outline-none focus:border-[#c89292] text-[#5a1f2a] placeholder-[#c89292] text-base"
                disabled={submitting}
              />

              {hasSpecialItems ? (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-3 space-y-2">
                  <p className="text-xs text-purple-800 font-semibold">
                    🎂 Pesan Khusus — minimal H-{leadTime} hari
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-purple-700 font-semibold mb-1">📅 Tanggal Pickup</label>
                      <input
                        type="date"
                        value={pickupDate}
                        min={minDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full border-2 border-purple-200 rounded-lg py-2 px-2 text-sm text-[#5a1f2a]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-purple-700 font-semibold mb-1">🕐 Jam Pickup</label>
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full border-2 border-purple-200 rounded-lg py-2 px-2 text-sm text-[#5a1f2a]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-3">
                  <label className="block text-xs text-orange-800 font-semibold mb-2">☀️ Pesan Harian — Jam Pickup Hari Ini</label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full border-2 border-orange-200 rounded-lg py-2 px-3 text-[#5a1f2a]"
                  />
                </div>
              )}

              <textarea
                placeholder="Catatan order (opsional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full border-2 border-[#e3b9b9] rounded-2xl py-2 px-4 text-[#5a1f2a] placeholder-[#c89292]"
                disabled={submitting}
              />

              {/* Voucher */}
              <div className="bg-[#fce8e2] rounded-2xl p-3">
                <p className="text-xs font-semibold text-[#5a1f2a] mb-2">🎟️ Kode Voucher</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan kode"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="flex-1 border-2 border-[#e3b9b9] rounded-full py-2 px-3 text-[#5a1f2a] uppercase"
                  />
                  {voucherInfo ? (
                    <button onClick={clearVoucher} className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                      Hapus
                    </button>
                  ) : (
                    <button
                      onClick={applyVoucher}
                      disabled={validatingVoucher}
                      className="bg-[#5a1f2a] text-white px-4 py-2 rounded-full font-semibold text-sm disabled:bg-gray-400"
                    >
                      {validatingVoucher ? '...' : 'Terapkan'}
                    </button>
                  )}
                </div>
                {voucherError && <p className="text-xs text-red-700 mt-1">⚠️ {voucherError}</p>}
                {voucherInfo && (
                  <p className="text-xs text-green-700 mt-1">
                    ✅ {voucherInfo.voucher.code} — diskon Rp {discount.toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-sm text-[#722f37]">
                  <span>Subtotal:</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700 font-semibold">
                    <span>Diskon ({voucherInfo.voucher.code}):</span>
                    <span>− Rp {discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-[#e3b9b9]">
                  <span className="text-lg font-semibold text-[#5a1f2a]">Total:</span>
                  <span className="text-3xl font-bold text-[#5a1f2a]">Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-sm">
                  ⚠️ {error}
                </div>
              )}

              {disabled ? (
                <button disabled className="w-full bg-gray-400 text-white font-bold py-4 px-4 rounded-full cursor-not-allowed">
                  🔴 Toko Sedang Tutup
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={submitting || !customerName.trim() || !customerPhone.trim()}
                  className="w-full bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-bold py-4 px-4 rounded-full transition-all shadow-md hover:shadow-lg"
                >
                  {submitting ? '⏳ Memproses...' : '💳 Checkout & Bayar'}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {orderResult && (
        <PaymentModal
          isOpen={showPayment}
          onClose={handlePaymentClose}
          orderId={orderResult.order_id}
          orderNumber={orderResult.order_number}
          customerName={customerName}
          customerPhone={customerPhone}
          items={items}
          subtotal={total}
          discount={discount}
          total={grandTotal}
          orderType={hasSpecialItems ? 'special' : 'daily'}
          pickupDate={pickupDate}
          pickupTime={pickupTime}
          notes={notes}
          voucherCode={voucherInfo ? voucherCode : null}
        />
      )}
    </>
  );
}
