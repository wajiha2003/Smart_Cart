import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.36 18H18a2 2 0 0 0 1.96-1.6L21.6 8H6"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9.5" cy="21" r="1.4" fill="currentColor" />
            <circle cx="17.5" cy="21" r="1.4" fill="currentColor" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-ink">Your cart is empty</h1>
        <p className="mt-2 text-ink-muted">Browse our products and add something you like.</p>
        <Link to="/" className="mt-6 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Your Cart</h1>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
          {cart.items.reduce((s, i) => s + i.quantity, 0)} items
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="divide-y divide-border">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 p-5">
              <img src={item.image} alt={item.title}
                className="h-20 w-20 rounded-xl object-cover border border-border shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate">{item.title}</p>
                <p className="mt-0.5 text-sm text-ink-muted">${item.price.toFixed(2)} each</p>
              </div>
              {/* Qty */}
              <div className="flex items-center overflow-hidden rounded-xl border border-border bg-canvas">
                <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                  className="px-3 py-2 text-sm text-ink-muted transition hover:bg-primary-soft hover:text-primary">−</button>
                <span className="w-8 text-center text-sm font-semibold text-ink">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
                  className="px-3 py-2 text-sm text-ink-muted transition hover:bg-primary-soft hover:text-primary">+</button>
              </div>
              <p className="w-20 text-right font-bold text-ink">${item.lineTotal.toFixed(2)}</p>
              <button onClick={() => removeFromCart(item.productId)} aria-label="Remove"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted/50 transition hover:bg-danger/10 hover:text-danger">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-canvas px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted">Order total</p>
              <p className="font-display text-3xl font-bold text-ink">${cart.total.toFixed(2)}</p>
            </div>
            <button onClick={() => navigate("/checkout")}
              className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark">
              Proceed to Checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
