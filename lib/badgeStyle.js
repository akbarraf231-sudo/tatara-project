// Map a free-text badge to an icon + tailwind color class.
// Detects common Indonesian/English keywords; falls back to orange star.
export function getBadgeStyle(text) {
  if (!text) return null;
  const t = String(text).toLowerCase().trim();

  if (/\b(terlaris|best|hot|laris|favorit)\b/.test(t)) {
    return { icon: '🔥', bg: 'bg-red-500' };
  }
  if (/\b(baru|new|fresh)\b/.test(t)) {
    return { icon: '✨', bg: 'bg-green-500' };
  }
  if (/\b(promo|sale|diskon|murah|hemat)\b/.test(t)) {
    return { icon: '💰', bg: 'bg-pink-500' };
  }
  if (/\b(limited|terbatas|eksklusif|exclusive)\b/.test(t)) {
    return { icon: '💎', bg: 'bg-purple-600' };
  }
  if (/\b(khusus|special|premium)\b/.test(t)) {
    return { icon: '🎂', bg: 'bg-purple-600' };
  }
  if (/\b(rekomendasi|recommended|pilihan)\b/.test(t)) {
    return { icon: '👍', bg: 'bg-blue-500' };
  }
  if (/\b(viral|trending)\b/.test(t)) {
    return { icon: '🚀', bg: 'bg-rose-500' };
  }
  if (/\b(flash|kilat)\b/.test(t)) {
    return { icon: '⚡', bg: 'bg-yellow-500' };
  }
  return { icon: '⭐', bg: 'bg-orange-500' };
}
