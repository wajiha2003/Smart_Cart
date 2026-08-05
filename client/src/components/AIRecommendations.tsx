import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api, getApiErrorMessage } from "../lib/api";
import { Product } from "../lib/types";

interface Recommendation {
  product: Product;
  reason: string;
}

export default function AIRecommendations() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post<{ recommendations: Recommendation[] }>("/ai/recommendations");
      setItems(res.data.recommendations);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (!loading && !error && items.length === 0) return null;

  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
              Personalised
            </span>
            <h2 className="mt-1 font-display text-3xl font-bold text-brand">
              Picked for You
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              AI recommendations based on your shopping history
            </p>
          </div>
          <button
            onClick={fetch}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-4 py-2 text-[13px] font-medium text-ink-muted shadow-sm transition hover:border-brand hover:text-brand disabled:opacity-40"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-brand inline-block" />
                Thinking…
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 px-5 py-4 text-sm text-danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            {error} —{" "}
            <button onClick={fetch} className="underline hover:no-underline">retry</button>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="aspect-[4/3] animate-pulse bg-border/70" />
                <div className="space-y-2.5 p-4">
                  <div className="h-2.5 w-16 animate-pulse rounded-full bg-border/70" />
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-border/70" />
                  <div className="mt-2 h-3 w-full animate-pulse rounded-full bg-border/70" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ product, reason }) => {
              const lowStock  = product.stock > 0 && product.stock <= 5;
              const outOfStock = product.stock === 0;
              return (
                <div key={product.id} className="flex flex-col gap-2.5">
                  <Link
                    to={`/products/${product.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-accent-soft">
                      {product.image ? (
                        <img src={product.image} alt={product.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-subtle/30">No image</div>
                      )}
                      {/* AI Pick badge */}
                      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-brand/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg>
                        AI Pick
                      </span>
                      {outOfStock && <span className="absolute left-3 top-3 rounded-md bg-brand/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">Sold Out</span>}
                      {!outOfStock && lowStock && <span className="absolute left-3 top-3 rounded-md bg-warning px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">Low Stock</span>}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{product.category}</span>
                      <h3 className="font-display text-[15px] font-semibold text-brand group-hover:text-accent transition-colors">{product.title}</h3>
                      <p className="mt-auto pt-2 font-display text-lg font-bold text-brand">${product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                  {/* Reason chip */}
                  <div className="flex items-start gap-2 rounded-xl border border-accent/15 bg-accent-soft px-3.5 py-2.5 text-[12px] leading-relaxed text-ink-muted">
                    <svg className="mt-0.5 shrink-0 text-accent" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg>
                    {reason}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
