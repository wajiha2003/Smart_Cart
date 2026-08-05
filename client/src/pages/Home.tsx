import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Product } from "../lib/types";
import ProductCard from "../components/ProductCard";
import AIRecommendations from "../components/AIRecommendations";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, Sparkles, Mic } from "lucide-react";
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);
    api
      .get(`/products?${params.toString()}`)
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }, [search, category]);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <div className="bg-canvas">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-brand">
        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -right-32 top-0 h-[500px] w-[500px] rounded-full bg-accent opacity-10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-accent opacity-5 blur-2xl" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-32">
          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              AI-Powered Shopping
            </div>

            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.1] text-white md:text-6xl lg:text-7xl">
              Shop Smarter,<br />
              <span className="text-accent">Not Harder.</span>
            </h1>

            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/65">
              Browse 56+ curated products across 7 categories. Our AI recommends the perfect items based on your taste, history, and budget.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={user ? "#products" : "/signup"}
                className="rounded-xl bg-white px-7 py-3.5 text-[13px] font-semibold text-brand shadow-lg transition hover:bg-accent hover:text-white"
              >
                {user ? "Browse Products" : "Get Started Free"}
              </Link>
              {!user && (
                <Link
                  to="/login"
                  className="rounded-xl border border-white/20 bg-transparent px-7 py-3.5 text-[13px] font-semibold text-white/90 transition hover:bg-white/10"
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Stats row */}
            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-8">
              {[
                { value: "56+", label: "Products" },
                { value: "7",   label: "Categories" },
                { value: "AI",  label: "Smart Picks" },
                { value: "∞",   label: "Free Shipping" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-bold text-white">{s.value}</p>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-white/45">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — feature cards */}
        <div className="hidden flex-col gap-4 md:flex">
          {[
            {
              icon: <ShoppingCart size={20} strokeWidth={2} />,
              title: "Smart Cart",
              desc: "Add products, manage quantities, and checkout in seconds.",
            },
            {
              icon: <Sparkles size={20} strokeWidth={2} />,
              title: "AI Recommendations",
              desc: "Personalised picks based on your order history and preferences.",
            },
            {
              icon: <Mic size={20} strokeWidth={2} />,
              title: "Voice Assistant",
              desc: "Ask questions out loud — our voice agent guides you through the store.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:bg-white/10"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                {f.icon}
              </span>

              <div>
                <p className="font-semibold text-white">{f.title}</p>
                <p className="mt-0.5 text-sm text-white/55">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
    </section>
      {/* ── Category strip ── */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle mr-2">
              Browse by
            </span>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`shrink-0 rounded-full border px-5 py-2 text-[13px] font-medium transition ${
                  category === c
                    ? "border-brand bg-brand text-white shadow-sm"
                    : "border-border bg-surface text-ink-muted hover:border-brand hover:text-brand"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Recommendations ── */}
      {user && <AIRecommendations />}

      {/* ── Products grid ── */}
      <section id="products" className="mx-auto max-w-7xl px-6 py-14">
        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-brand">
              {category === "All" ? "All Products" : category}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
              width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 sm:w-72"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="aspect-[4/3] animate-pulse bg-border/80" />
                <div className="space-y-2.5 p-4">
                  <div className="h-2.5 w-16 animate-pulse rounded-full bg-border/80" />
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-border/80" />
                  <div className="h-5 w-1/3 animate-pulse rounded-full bg-border/80" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-28 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-display text-xl font-semibold text-brand">Nothing found</p>
            <p className="mt-2 text-sm text-ink-muted">Try a different search term or category.</p>
            <button
              onClick={() => { setSearch(""); setCategory("All"); }}
              className="mt-5 rounded-lg border border-border px-5 py-2 text-sm font-medium text-ink-muted hover:border-brand hover:text-brand transition"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
