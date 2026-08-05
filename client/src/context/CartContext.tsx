import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { api, getApiErrorMessage } from "../lib/api";
import { Cart } from "../lib/types";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  cart: Cart;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const emptyCart: Cart = { items: [], total: 0 };

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>(emptyCart);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(emptyCart);
      return;
    }
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch {
      setCart(emptyCart);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addToCart(productId: string, quantity = 1) {
    try {
      const res = await api.post("/cart", { productId, quantity });
      setCart(res.data);
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    try {
      const res = await api.put(`/cart/${productId}`, { quantity });
      setCart(res.data);
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  }

  async function removeFromCart(productId: string) {
    try {
      const res = await api.delete(`/cart/${productId}`);
      setCart(res.data);
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  }

  async function clearCart() {
    try {
      const res = await api.delete("/cart");
      setCart(res.data);
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  }

  return (
    <CartContext.Provider
      value={{ cart, refreshCart, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
