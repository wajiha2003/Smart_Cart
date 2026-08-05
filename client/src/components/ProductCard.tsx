import { Link } from "react-router-dom";
import { Product } from "../lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const lowStock  = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock === 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-surface border border-border transition duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-accent-soft">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-ink-subtle/30">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        {/* Badges */}
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-md bg-brand/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            Sold Out
          </span>
        )}
        {!outOfStock && lowStock && (
          <span className="absolute left-3 top-3 rounded-md bg-warning px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Low Stock
          </span>
        )}

        {/* Quick-view overlay button */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="rounded-full bg-brand/90 px-5 py-2 text-[12px] font-semibold text-white backdrop-blur-sm shadow-lg">
            View Product
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-4 pb-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
          {product.category}
        </span>
        <h3 className="mt-0.5 font-display text-[15px] font-semibold leading-snug text-brand line-clamp-2 transition-colors group-hover:text-accent">
          {product.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="font-display text-lg font-bold text-brand">
            ${product.price.toFixed(2)}
          </p>
          <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ${
            outOfStock
              ? "bg-border text-ink-subtle"
              : "bg-accent-soft text-accent group-hover:bg-brand group-hover:text-white"
          }`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              {outOfStock
                ? <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                : <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              }
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
