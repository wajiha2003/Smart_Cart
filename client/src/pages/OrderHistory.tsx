import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { Order } from "../lib/types";

const STATUS_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
  pending:    { label: "Pending",    classes: "bg-warning/10 text-warning border border-warning/20",    dot: "bg-warning" },
  processing: { label: "Processing", classes: "bg-primary/10 text-primary border border-primary/20",   dot: "bg-primary" },
  shipped:    { label: "Shipped",    classes: "bg-mint-soft text-mint border border-mint/20",           dot: "bg-mint" },
  delivered:  { label: "Delivered",  classes: "bg-mint-soft text-mint border border-mint/20",           dot: "bg-mint" },
  cancelled:  { label: "Cancelled",  classes: "bg-danger/10 text-danger border border-danger/20",       dot: "bg-danger" },
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const confirmedOrderId = (location.state as any)?.confirmedOrderId;

  useEffect(() => {
    api.get("/orders/mine").then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-2xl font-bold text-ink">Order History</h1>
      <p className="mt-1 text-sm text-ink-muted">Track and manage all your past orders.</p>

      {/* Confirmed banner */}
      {confirmedOrderId && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-mint/30 bg-mint-soft px-5 py-4 text-sm font-medium text-mint">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Order <span className="font-bold">#{confirmedOrderId}</span> confirmed! A confirmation email has been sent.
        </div>
      )}

      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-display text-lg font-semibold text-ink">No orders yet</p>
          <p className="text-sm text-ink-muted">You haven't placed any orders. Start shopping!</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, classes: "bg-border text-ink-muted border border-border", dot: "bg-ink-muted" };
            return (
              <div key={order.id} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-canvas px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-display font-bold text-ink">Order #{order.id}</p>
                      <p className="text-xs text-ink-muted">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${cfg.classes}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                    <span className="font-display text-lg font-bold text-primary">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-border px-5">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between py-3 text-sm">
                      <span className="text-ink-muted">{item.title} <span className="text-ink-muted/60">× {item.quantity}</span></span>
                      <span className="font-medium text-ink">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 border-t border-border bg-canvas px-5 py-3 text-xs text-ink-muted">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                      stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Shipping to: {order.shippingAddress}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
