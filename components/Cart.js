'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cartContext';
import { PaymentModal } from './PaymentModal';

export function Cart({ disabled }) {
  const { items, removeItem, updateQty, total, clearCart, hasSpecialItems } = useCart();
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
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
  const [showPickupOptions, setShowPickupOptions] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => {
      if (d.data?.special_lead_time_days) setLeadTime(d.data.special_lead_time_days);
    }).catch(() => {});
  }, []);

  // Auto-set default pickup time = waktu sekarang + 1.5 jam (WIB) untuk daily order
  useEffect(() => {
    if (hasSpecialItems) return;
    if (pickupTime) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + 90);
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setPickupTime(`${hh}:${mm}`);
  }, [hasSpecialItems, pickupTime]);

  function formatTimeWIB(time) {
    if (!time) return '';
    return `${time} WIB`;
  }

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
    if (!customerPhone.trim()) {
      setError('Mohon isi nomor WA kamu dulu ya 📱');
      return;
    }
    if (!customerName.trim()) {
      setError('Mohon isi nama kamu ya 😊 (untuk panggil saat ambil pesanan)');
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
            {/* Progress Indicator */}
            <div className="mb-6 bg-[#fce8e2] rounded-2xl p-4">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mb-1">✓</div>
                  <p className="font-semibold text-[#5a1f2a]">Dipilih</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#5a1f2a] text-white flex items-center justify-center font-bold mb-1">2</div>
                  <p className="font-semibold text-[#5a1f2a]">Data Diri</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold mb-1">3</div>
                  <p className="font-semibold text-[#722f37]">Bayar</p>
                </div>
              </div>
            </div>

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
              {/* UTAMA: NOMOR WHATSAPP & NAMA */}
              <div className="space-y-2">
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Nomor WhatsApp (wajib)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  autoFocus
                  className="w-full border-2 border-[#5a1f2a] rounded-full py-3 px-4 focus:outline-none focus:border-[#722f37] text-[#5a1f2a] placeholder-[#c89292] text-base font-semibold"
                  disabled={submitting}
                />
                <input
                  type="text"
                  placeholder="Nama kamu (untuk panggil saat ambil)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border-2 border-[#e3b9b9] rounded-full py-3 px-4 focus:outline-none focus:border-[#c89292] text-[#5a1f2a] placeholder-[#c89292] text-base"
                  disabled={submitting}
                />
              </div>

              {/* PICKUP TIME */}
              {hasSpecialItems ? (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-3 space-y-2">
                  <p className="text-xs text-purple-800 font-semibold">🎂 Pesan Khusus — minimal H-{leadTime} hari</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-purple-700 font-semibold mb-1">📅 Tanggal</label>
                      <input type="date" value={pickupDate} min={minDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full border-2 border-purple-200 rounded-lg py-2 px-2 text-sm text-[#5a1f2a]" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-purple-700 font-semibold mb-1">🕐 Jam (WIB)</label>
                      <input type="time" step="60" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full border-2 border-purple-200 rounded-lg py-2 px-2 text-sm text-[#5a1f2a] font-bold" style={{ fontVariantNumeric: 'tabular-nums' }} />
                    </div>
                  </div>
                  <p className="text-[10px] text-purple-700">Format 24 jam (contoh: 14:30 = jam 2 siang)</p>
                </div>
              ) : (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-orange-800 font-semibold">☀️ Jam Pickup Hari Ini</p>
                    <button onClick={() => setShowPickupOptions(!showPickupOptions)} className="text-xs bg-orange-200 hover:bg-orange-300 text-orange-800 font-bold px-2 py-1 rounded">
                      {showPickupOptions ? 'Tutup' : 'Ubah Jam'}
                    </button>
                  </div>
                  {showPickupOptions ? (
                    <>
                      <input
                        type="time"
                        step="60"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full border-2 border-orange-200 rounded-lg py-2 px-3 text-[#5a1f2a] text-base font-bold"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      />
                      <p className="text-[10px] text-orange-700 mt-1">Format 24 jam (WIB)</p>
                    </>
                  ) : (
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <p className="text-xl font-bold text-orange-900">
                        🕐 {formatTimeWIB(pickupTime)}
                      </p>
                      <p className="text-[11px] text-orange-700 mt-0.5">≈ 1.5 jam dari sekarang. Klik "Ubah Jam" jika ingin ganti.</p>
                    </div>
                  )}
                </div>
              )}

              {/* OPTIONAL: CATATAN */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-[#5a1f2a] font-semibold py-2 px-2 rounded hover:bg-[#fce8e2]">
                  + Tambahkan Catatan (opsional)
                </summary>
                <textarea placeholder="Contoh: tanpa topping, packing terpisah" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border-2 border-[#e3b9b9] rounded-2xl py-2 px-4 text-[#5a1f2a] placeholder-[#c89292] mt-2" disabled={submitting} />
              </details>

              {/* OPTIONAL: VOUCHER */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-[#5a1f2a] font-semibold py-2 px-2 rounded hover:bg-[#fce8e2]">
                  🎁 Punya Kode Promo?
                </summary>
                <div className="flex gap-2 mt-2">
                  <input type="text" placeholder="Masukkan kode" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} className="flex-1 border-2 border-[#e3b9b9] rounded-full py-2 px-3 text-[#5a1f2a] uppercase" />
                  {voucherInfo ? (
                    <button onClick={clearVoucher} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-semibold text-sm">Hapus</button>
                  ) : (
                    <button onClick={applyVoucher} disabled={validatingVoucher} className="bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white px-4 py-2 rounded-full font-semibold text-sm">
                      {validatingVoucher ? '...' : 'Gunakan'}
                    </button>
                  )}
                </div>
                {voucherError && <p className="text-xs text-red-700 mt-1.5">⚠️ {voucherError}</p>}
                {voucherInfo && <p className="text-xs text-green-700 mt-1.5">✅ {voucherInfo.voucher.code} — diskon Rp {discount.toLocaleString('id-ID')}</p>}
              </details>

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
                  disabled={submitting || !customerPhone.trim() || !customerName.trim()}
                  className="w-full bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-bold py-4 px-4 rounded-full transition-all shadow-md hover:shadow-lg"
                >
                  {submitting ? '⏳ Memproses...' : '💳 Pesan Sekarang'}
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
