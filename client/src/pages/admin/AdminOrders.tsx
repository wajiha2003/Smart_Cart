import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Order, OrderStatus } from "../../lib/types";

const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-warning/10 text-warning",
  processing: "bg-primary/10 text-primary",
  shipped:    "bg-mint-soft text-mint",
  delivered:  "bg-mint-soft text-mint",
  cancelled:  "bg-danger/10 text-danger",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    api.get("/orders").then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleStatusChange(id: string, status: OrderStatus) {
    await api.put(`/orders/${id}/status`, { status });
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Manage Orders</h1>
        <p className="mt-1 text-sm text-ink-muted">Update order statuses — customers are notified by email.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-canvas text-left text-xs font-semibold uppercase tracking-wider text-ink-muted/60">
            <tr>
              <th className="px-5 py-3.5">Order</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Total</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 animate-pulse rounded bg-border/60" />
                      </td>
                    ))}
                  </tr>
                ))
              : orders.map((o) => (
                  <tr key={o.id} className="transition hover:bg-primary-soft/20">
                    <td className="px-5 py-4 font-semibold text-ink">#{o.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{o.customerName}</p>
                      <p className="text-xs text-ink-muted">{o.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4 font-bold text-ink">${o.total.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[o.status] ?? "bg-border text-ink-muted"}`}>
                          {o.status}
                        </span>
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                          className="rounded-lg border border-border bg-canvas px-2 py-1.5 text-xs text-ink-muted outline-none transition focus:border-primary focus:text-ink"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-ink-muted/50">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
