'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

function makeKey(productId, flavor, size) {
  return `${productId}__${flavor || ''}__${size || ''}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((product, options = {}) => {
    const flavor = options.flavor || null;
    const size = options.size || null;
    const sizePriceDelta = options.sizePriceDelta || 0;
    const notes = options.notes || null;
    const key = makeKey(product.id, flavor, size);

    setItems((prev) => {
      const existing = prev.find((it) => it.key === key);
      if (existing) {
        return prev.map((it) => (it.key === key ? { ...it, qty: it.qty + 1 } : it));
      }
      return [
        ...prev,
        {
          key,
          product_id: product.id,
          name: product.name,
          price: Number(product.price) + Number(sizePriceDelta || 0),
          qty: 1,
          flavor,
          size,
          notes,
          product_type: product.product_type || 'daily',
        },
      ];
    });
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }, []);

  const updateQty = useCallback((key, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((it) => it.key !== key));
      return;
    }
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, qty } : it)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const hasSpecialItems = items.some((it) => it.product_type === 'special');

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, total, hasSpecialItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
