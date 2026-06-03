"use client";

import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((product, unitId, qty) => {
    setItems((prev) => {
      // Check if same product + unit already in cart
      const idx = prev.findIndex(
        (item) => item.product.id === product.id && item.unitId === unitId
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          qty: updated[idx].qty + parseFloat(qty),
        };
        return updated;
      }
      return [...prev, { product, unitId, qty: parseFloat(qty) }];
    });
  }, []);

  const removeItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateItemQty = useCallback((index, qty) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qty: parseFloat(qty) };
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItemQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
