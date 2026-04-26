'use client';

import { useEffect, useState } from 'react';

export function FloatingWhatsApp() {
  const [waNumber, setWaNumber] = useState('');

  useEffect(() => {
    try {
      fetch('/api/settings')
        .then((r) => r.json())
        .then((d) => {
          if (d?.data) {
            const n = d.data.cs_whatsapp_number || d.data.whatsapp_number || '';
            setWaNumber(n);
          }
        })
        .catch(() => {});
    } catch (_) {
      // Silently fail
    }
  }, []);

  if (!waNumber) return null;

  const cleaned = waNumber.replace(/\D/g, '');
  const message = encodeURIComponent('Halo Sinar Jaya Bakery, saya mau tanya...');
  const href = `https://wa.me/${cleaned}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat CS via WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#1da851] rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 animate-bounce"
      style={{ animationDuration: '2s' }}
    >
      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.998 1.506c-1.471.806-2.667 1.896-3.425 3.27-1.802 3.335-.555 7.343 2.928 9.142 1.675.906 3.637 1.067 5.589.368l.073-.036 3.976 1.041-.666-3.802c.529-1.466.726-2.88.368-4.266-.713-2.876-3.22-4.9-6.14-4.9l-.015-.001z"/>
      </svg>
    </a>
  );
}
