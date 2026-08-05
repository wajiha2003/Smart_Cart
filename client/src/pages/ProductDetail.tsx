import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, getApiErrorMessage } from "../lib/api";
import { Product } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
  }, [id]);

  async function handleAddToCart() {
    setError(""); setSuccess("");
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    try {
      await addToCart(product!.id, quantity);
      setSuccess("Added to cart successfully!");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  if (!product) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
        <p className="text-sm text-ink-muted">Loading product…</p>
      </div>
    </div>
  );

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 5;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink-muted">
        <Link to="/" className="hover:text-primary transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-mint font-medium">{product.category}</span>
        <span>/</span>
        <span className="text-ink truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border border-border bg-primary-soft shadow-sm">
          {product.image
            ? <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
            : <div className="flex h-80 items-center justify-center text-ink-muted/30">No image</div>
          }
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center rounded-full border border-mint/30 bg-mint-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-mint">
            {product.category}
          </span>

          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
            {product.title}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <p className="font-display text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </p>
            {lowStock && (
              <span className="rounded-lg bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                Only {product.stock} left
              </span>
            )}
            {!inStock && (
              <span className="rounded-lg bg-danger/10 px-3 py-1 text-xs font-semibold text-danger">
                Out of stock
              </span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-ink-muted">{product.description}</p>

          {product.highlights.length > 0 && (
            <ul className="mt-5 space-y-2">
              {product.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-ink-muted">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint-soft text-mint">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 rounded-xl border border-border bg-surface p-4">
            <p className="mb-3 text-sm font-medium text-ink-muted">
              {inStock ? <span className="text-mint font-semibold">✓ In stock</span> : "Out of stock"} — {product.stock} units available
            </p>

            {inStock && (
              <div className="flex items-center gap-3">
                {/* Qty */}
                <div className="flex items-center overflow-hidden rounded-xl border border-border bg-canvas">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-3 text-ink-muted transition hover:bg-primary-soft hover:text-primary">
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-ink">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-4 py-3 text-ink-muted transition hover:bg-primary-soft hover:text-primary">
                    +
                  </button>
                </div>

                {/* Add to cart */}
                <button onClick={handleAddToCart} disabled={adding}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60">
                  {adding ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Adding…</>
                  ) : (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.36 18H18a2 2 0 0 0 1.96-1.6L21.6 8H6"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="9.5" cy="21" r="1.4" fill="currentColor" />
                      <circle cx="17.5" cy="21" r="1.4" fill="currentColor" />
                    </svg> Add to cart</>
                  )}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-mint/20 bg-mint-soft px-4 py-3 text-sm text-mint font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
