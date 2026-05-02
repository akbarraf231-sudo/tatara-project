'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const POLL_INTERVAL_MS = 30_000;

/**
 * Keeps product stock fresh in the background so customers never see
 * stale "still in stock" data when an item just sold out.
 *
 * Strategy:
 *  - Poll /api/products/stock every 30s while the tab is visible.
 *  - Pause polling when the tab is hidden (saves battery + Supabase calls).
 *  - Force a fresh fetch the moment the tab becomes visible again
 *    (this is the case the user is asking about: they leave the tab,
 *    come back later expecting to order, but stock has changed).
 *  - Also refetch on window 'focus' for desktop browsers.
 *
 * Returns the products array with `stock` and `flavor_stocks` patched
 * with the latest values from the server.
 */
export function useStockPolling(initialProducts) {
  const [products, setProducts] = useState(initialProducts || []);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const initialRef = useRef(initialProducts || []);
  const inFlightRef = useRef(false);

  // Re-seed local products if the server-rendered list changes (rare, but
  // can happen after a soft navigation).
  useEffect(() => {
    initialRef.current = initialProducts || [];
    setProducts(initialProducts || []);
  }, [initialProducts]);

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const res = await fetch('/api/products/stock', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (!json?.success) return;

      const stockMap = new Map();
      for (const row of json.data || []) stockMap.set(row.id, row);

      setProducts((prev) => {
        // Use the freshest base list (initial server data) so we don't
        // accumulate drift, but only keep products still active.
        const base = initialRef.current;
        return base
          .map((p) => {
            const fresh = stockMap.get(p.id);
            if (!fresh) return null; // product became inactive → drop it
            return {
              ...p,
              stock: fresh.stock,
              flavor_stocks: fresh.flavor_stocks,
            };
          })
          .filter(Boolean);
      });
      setLastUpdated(Date.now());
    } catch {
      /* swallow — next tick will retry */
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    let interval = null;
    function startPolling() {
      stopPolling();
      interval = setInterval(refresh, POLL_INTERVAL_MS);
    }
    function stopPolling() {
      if (interval) { clearInterval(interval); interval = null; }
    }

    function onVisible() {
      if (document.visibilityState === 'visible') {
        refresh();
        startPolling();
      } else {
        stopPolling();
      }
    }

    function onFocus() { refresh(); }

    if (document.visibilityState === 'visible') startPolling();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  return { products, lastUpdated, refresh };
}
