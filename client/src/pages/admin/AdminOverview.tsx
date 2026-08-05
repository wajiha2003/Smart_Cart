import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { DashboardStats, Order } from "../../lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-warning/10 text-warning",
  processing: "bg-primary/10 text-primary",
  shipped:    "bg-mint-soft text-mint",
  delivered:  "bg-mint-soft text-mint",
  cancelled:  "bg-danger/10 text-danger",
};

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get("/admin/overview").then((res) => {
      setStats(res.data.stats);
      setRecentOrders(res.data.recentOrders);
    });
  }, []);

  const cards = stats
    ? [
        {
          label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`,
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
          color: "bg-primary text-white", soft: "bg-primary-soft text-primary",
        },
        {
          label: "Orders", value: stats.totalOrders,
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2"/></svg>,
          color: "bg-mint text-white", soft: "bg-mint-soft text-mint",
        },
        {
          label: "Products", value: stats.totalProducts,
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="2"/></svg>,
          color: "bg-primary text-white", soft: "bg-primary-soft text-primary",
        },
        {
          label: "Customers", value: stats.totalCustomers,
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>,
          color: "bg-mint text-white", soft: "bg-mint-soft text-mint",
        },
        {
          label: "Low Stock", value: stats.lowStock,
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
          color: "bg-warning text-white", soft: "bg-warning-soft text-warning",
        },
      ]
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-ink-muted">Welcome back — here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.length === 0
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-surface" />
            ))
          : cards.map((c) => (
              <div key={c.label} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${c.soft}`}>
                  {c.icon}
                </div>
                <p className="text-xs font-medium text-ink-muted">{c.label}</p>
                <p className="mt-0.5 font-display text-2xl font-bold text-ink">{c.value}</p>
              </div>
            ))}
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Recent Orders</h2>
          <Link to="/admin/orders"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-canvas text-left text-xs font-semibold uppercase tracking-wider text-ink-muted/60">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.map((o) => (
                <tr key={o.id} className="transition hover:bg-primary-soft/30">
                  <td className="px-5 py-3.5 font-semibold text-ink">#{o.id}</td>
                  <td className="px-5 py-3.5 text-ink-muted">{o.customerName}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[o.status] ?? "bg-border text-ink-muted"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-ink">${o.total.toFixed(2)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-ink-muted/50">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
