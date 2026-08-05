import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../lib/api";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!address.trim()) { setError("Please enter a shipping address"); return; }
    setPlacing(true);
    try {
      const res = await api.post("/orders/checkout", { shippingAddress: address });
      await refreshCart();
      navigate("/orders", { state: { confirmedOrderId: res.data.order.id } });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-ink-muted">Your cart is empty.</div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 font-display text-2xl font-bold text-ink">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
          <h2 className="mb-5 font-display text-lg font-semibold text-ink flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">1</span>
            Shipping Information
          </h2>
          <form onSubmit={handlePlaceOrder} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Delivery address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={4}
                placeholder="Street address, city, state, ZIP code"
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={placing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60">
              {placing ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Placing order…</>
              ) : (
                <>Place order · ${cart.total.toFixed(2)}</>
              )}
            </button>

            <p className="text-center text-xs text-ink-muted">
              Demo checkout — no real payment processed. A confirmation email will be sent.
            </p>
          </form>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-primary text-xs font-bold">2</span>
            Order Summary
          </h2>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <img src={item.image} alt={item.title} className="h-12 w-12 rounded-lg object-cover border border-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-xs text-ink-muted">× {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-ink">${item.lineTotal.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-border pt-4">
            <div className="flex justify-between text-sm text-ink-muted">
              <span>Subtotal</span><span>${cart.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-ink-muted">
              <span>Shipping</span><span className="text-mint font-medium">Free</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-display text-lg font-bold text-ink">
              <span>Total</span><span className="text-primary">${cart.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
