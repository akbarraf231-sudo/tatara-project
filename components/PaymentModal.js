'use client';

import { useState, useEffect } from 'react';
import { useModalBackButton } from '@/lib/useModalBackButton';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function formatPickupSchedule(pickupDate, pickupTime, orderType) {
  const date = pickupDate ? new Date(pickupDate) : new Date();
  const dayName = DAY_NAMES[date.getDay()];
  const dateStr = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = pickupTime ? pickupTime.slice(0, 5) : '-';
  if (orderType === 'special' && pickupDate) {
    return `${dayName}, ${dateStr} • ${timeStr}`;
  }
  return `Hari ini (${dayName}, ${dateStr}) • ${timeStr}`;
}

export function PaymentModal({
  isOpen, onClose, orderId, orderNumber, customerName, customerPhone,
  items, subtotal, discount, total, orderType, pickupDate, pickupTime, notes, voucherCode,
}) {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useModalBackButton(isOpen, onClose);

  useEffect(() => {
    if (isOpen) fetchSettings();
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

  const displayOrderNumber = orderNumber || `#${orderId.slice(0, 8)}`;
  const pickupSchedule = formatPickupSchedule(pickupDate, pickupTime, orderType);

  function handleWhatsAppOrder() {
    if (!settings?.whatsapp_number) {
      alert('WhatsApp number belum di-setup oleh admin');
      return;
    }

    const itemsList = items
      .map((it) => {
        const variantStr = [it.flavor, it.size].filter(Boolean).join(' / ');
        const v = variantStr ? ` (${variantStr})` : '';
        return `• ${it.name}${v} x${it.qty} = Rp ${(it.price * it.qty).toLocaleString('id-ID')}`;
      })
      .join('\n');

    const lines = [
      '🍰 *PESANAN BARU - SINAR JAYA BAKERY*',
      '',
      `*Order ID:* #${displayOrderNumber}`,
      `*Nama:* ${customerName}`,
      customerPhone ? `*HP:* ${customerPhone}` : null,
      `*Tipe:* ${orderType === 'special' ? '🎂 Special Order' : '☀️ Daily Order'}`,
      `*Pickup:* ${pickupSchedule}`,
      '',
      '*Daftar Pesanan:*',
      itemsList,
      '',
      `*Subtotal:* Rp ${subtotal.toLocaleString('id-ID')}`,
      discount > 0 ? `*Diskon (${voucherCode}):* − Rp ${discount.toLocaleString('id-ID')}` : null,
      `*Total Bayar:* Rp ${total.toLocaleString('id-ID')}`,
      `*Metode:* ${paymentMethod === 'qris' ? 'QRIS' : 'Cash (Bayar di Tempat)'}`,
      notes ? `*Catatan:* ${notes}` : null,
      '',
      paymentMethod === 'qris' ? '_Saya sudah melakukan pembayaran via QRIS._' : '_Saya akan bayar saat pickup._',
      '',
      'Terima kasih! 🙏',
    ].filter(Boolean);

    const encodedMessage = encodeURIComponent(lines.join('\n'));
    const waNumber = settings.whatsapp_number.replace(/\D/g, '');
    window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');
    onClose();
  }

  if (!isOpen) return null;

  const qrisImage = settings?.qris_image_url;
  const qrCodeData = `Order ${displayOrderNumber} - Total Rp ${total.toLocaleString('id-ID')}`;
  const fallbackQR = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeData)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-[#fce8e2] rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-[#5a1f2a] text-white p-4 sm:p-6 sticky top-0 rounded-t-2xl sm:rounded-t-3xl z-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">💳 Pembayaran</h2>
          <p className="text-[#e3b9b9] text-sm font-semibold">#{displayOrderNumber}</p>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="bg-white rounded-2xl p-3 sm:p-4 border-2 border-[#e3b9b9]">
            <h3 className="font-bold text-[#5a1f2a] mb-3 text-sm sm:text-base">📋 Detail Pesanan</h3>
            <div className="space-y-2 text-sm text-[#5a1f2a] mb-3">
              <div className="flex justify-between gap-2">
                <span className="font-semibold">Nama:</span>
                <span className="text-right">{customerName}</span>
              </div>
              {customerPhone && (
                <div className="flex justify-between gap-2">
                  <span className="font-semibold">HP:</span>
                  <span className="text-right">{customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span className="font-semibold">Tipe:</span>
                <span className="text-right">{orderType === 'special' ? '🎂 Special' : '☀️ Daily'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="font-semibold">Pickup:</span>
                <span className="text-right text-xs">{pickupSchedule}</span>
              </div>
              <div className="border-t border-[#e3b9b9] pt-2">
                {items.map((it) => (
                  <div key={it.key} className="flex justify-between gap-2">
                    <span className="text-xs sm:text-sm">
                      {it.name} x{it.qty}
                      {(it.flavor || it.size) && (
                        <span className="text-[10px] sm:text-xs text-[#722f37]"> ({[it.flavor, it.size].filter(Boolean).join('/')})</span>
                      )}
                    </span>
                    <span className="text-xs sm:text-sm whitespace-nowrap">Rp {(it.price * it.qty).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#e3b9b9] pt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-green-700">
                    <span>Diskon ({voucherCode})</span>
                    <span>− Rp {discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t-2 border-[#5a1f2a] pt-3 flex justify-between font-bold text-base sm:text-lg text-[#5a1f2a]">
              <span>TOTAL</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#5a1f2a] text-sm sm:text-base">Metode Pembayaran</h3>
              <span className="text-[10px] text-[#722f37] bg-[#fce8e2] px-2 py-0.5 rounded-full">Default: Cash</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`relative p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                  paymentMethod === 'cash' ? 'border-[#5a1f2a] bg-white shadow-md ring-2 ring-[#5a1f2a]/20' : 'border-[#e3b9b9] bg-white hover:bg-[#e3b9b9]/30'
                }`}
              >
                {paymentMethod === 'cash' && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">✓ Dipilih</span>
                )}
                <div className="text-2xl sm:text-3xl mb-1">💵</div>
                <p className="font-bold text-[#5a1f2a] text-sm sm:text-base">Cash</p>
                <p className="text-[10px] sm:text-xs text-[#722f37]">Bayar di tempat</p>
              </button>
              <button
                onClick={() => setPaymentMethod('qris')}
                className={`relative p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                  paymentMethod === 'qris' ? 'border-[#5a1f2a] bg-white shadow-md ring-2 ring-[#5a1f2a]/20' : 'border-[#e3b9b9] bg-white hover:bg-[#e3b9b9]/30'
                }`}
              >
                {paymentMethod === 'qris' && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">✓ Dipilih</span>
                )}
                <div className="text-2xl sm:text-3xl mb-1">📱</div>
                <p className="font-bold text-[#5a1f2a] text-sm sm:text-base">QRIS</p>
                <p className="text-[10px] sm:text-xs text-[#722f37]">Scan & Pay</p>
              </button>
            </div>
          </div>

          {paymentMethod === 'qris' && (
            <div className="bg-white rounded-2xl p-3 sm:p-4 border-2 border-[#e3b9b9]">
              <p className="text-sm text-[#5a1f2a] font-semibold mb-3 text-center">📸 Scan QRIS Code di Bawah</p>
              <div className="bg-[#fce8e2] p-3 sm:p-4 rounded-2xl flex items-center justify-center">
                <img src={qrisImage || fallbackQR} alt="QRIS Payment Code" className="w-48 h-48 sm:w-64 sm:h-64 object-contain" />
              </div>
              <p className="text-xs text-center text-[#722f37] mt-3">
                Bayar Rp <span className="font-bold">{total.toLocaleString('id-ID')}</span>
              </p>
              {!qrisImage && (
                <p className="text-xs text-center text-orange-700 mt-2">ℹ️ QRIS asli akan muncul jika admin sudah upload</p>
              )}
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="bg-white rounded-2xl p-3 sm:p-4 border-2 border-[#e3b9b9]">
              <p className="text-sm text-[#5a1f2a] font-semibold mb-2">💵 Bayar Cash di Tempat</p>
              <p className="text-sm text-[#722f37] mb-3">
                Silakan bayar <span className="font-bold text-[#5a1f2a]">Rp {total.toLocaleString('id-ID')}</span> saat pickup.
              </p>
              {settings?.location_link && (
                <a href={settings.location_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#5a1f2a] hover:text-[#722f37] font-semibold text-sm">
                  📍 Lihat Lokasi Toko
                </a>
              )}
            </div>
          )}

          {!loadingSettings && settings?.whatsapp_number && (
            <button
              onClick={handleWhatsAppOrder}
              className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-3 sm:py-4 px-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.998 1.506c-1.471.806-2.667 1.896-3.425 3.27-1.802 3.335-.555 7.343 2.928 9.142 1.675.906 3.637 1.067 5.589.368l.073-.036 3.976 1.041-.666-3.802c.529-1.466.726-2.88.368-4.266-.713-2.876-3.22-4.9-6.14-4.9l-.015-.001z"/>
              </svg>
              Konfirmasi via WhatsApp
            </button>
          )}

          <button onClick={onClose} className="w-full bg-[#e3b9b9] hover:bg-[#c89292] text-[#5a1f2a] hover:text-white font-semibold py-2 px-4 rounded-full transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
