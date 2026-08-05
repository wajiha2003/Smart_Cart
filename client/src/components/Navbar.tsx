import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function NLink({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink to={to} end={end}
      className={({ isActive }) =>
        `relative text-[13px] font-medium tracking-wide transition-colors ${
          isActive
            ? "text-brand after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-accent after:rounded-full"
            : "text-ink-muted hover:text-brand"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function MLink({ to, end, onClick, children }: { to: string; end?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <NavLink to={to} end={end} onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-brand text-white"
            : "text-ink-muted hover:bg-accent-soft hover:text-brand"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const isAdmin = user?.role === "admin";
  const isCustomer = user && !isAdmin;

  function handleLogout() {
    logout();
    navigate("/");
    setMobileOpen(false);
  }

  return (
    <div className="sticky top-0 z-40">
      {/* ── Announcement bar ── */}
      {announcementVisible && (
        <div className="relative bg-brand px-4 py-2 text-center text-[12px] font-medium tracking-wide text-white">
          <span>✨ Free shipping on all orders · AI-powered recommendations · </span>
          <Link to={user ? "/" : "/signup"} className="underline underline-offset-2 hover:text-accent transition-colors">
            {user ? "Shop now" : "Create account"}
          </Link>
          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
            aria-label="Dismiss"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      {/* ── Main nav ── */}
      <header className="border-b border-border bg-surface/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm transition group-hover:bg-brand-hover">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="font-display text-xl font-bold text-brand tracking-tight">
              Smart<span className="text-accent">Cart</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <NLink to="/" end>Shop</NLink>
            {isCustomer && (
              <>
                <NLink to="/orders">My Orders</NLink>
                <NLink to="/cart">Cart</NLink>
                <NLink to="/checkout">Checkout</NLink>
              </>
            )}
            {isAdmin && (
              <>
                <NLink to="/admin" end>Overview</NLink>
                <NLink to="/admin/products">Products</NLink>
                <NLink to="/admin/orders">Orders</NLink>
                <NLink to="/admin/users">Users</NLink>
              </>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart badge */}
            {isCustomer && (
              <Link to="/cart" aria-label="Cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-accent-soft hover:text-brand">
                <CartIcon />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Search button (decorative — visual parity with SoleStyle) */}
            <button aria-label="Search"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-accent-soft hover:text-brand md:flex">
              <SearchIcon />
            </button>

            {/* Auth */}
            {user ? (
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white text-xs font-semibold select-none">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-[13px] font-medium text-ink-muted lg:inline">
                  {user.name.split(" ")[0]}
                </span>
                <button onClick={handleLogout}
                  className="rounded-lg border border-border px-3.5 py-1.5 text-[13px] font-medium text-ink-muted transition hover:border-brand hover:text-brand">
                  Log out
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login"
                  className="px-3.5 py-1.5 text-[13px] font-medium text-ink-muted transition hover:text-brand">
                  Log in
                </Link>
                <Link to="/signup"
                  className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-brand-hover">
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile burger */}
            <button onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-accent-soft hover:text-brand md:hidden">
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="border-t border-border bg-surface px-4 pb-5 pt-3 md:hidden">
            <nav className="flex flex-col gap-0.5">
              <MLink to="/" end onClick={() => setMobileOpen(false)}>Shop</MLink>
              {isCustomer && (
                <>
                  <MLink to="/orders" onClick={() => setMobileOpen(false)}>My Orders</MLink>
                  <MLink to="/cart" onClick={() => setMobileOpen(false)}>
                    Cart
                    {itemCount > 0 && (
                      <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                        {itemCount}
                      </span>
                    )}
                  </MLink>
                  <MLink to="/checkout" onClick={() => setMobileOpen(false)}>Checkout</MLink>
                </>
              )}
              {isAdmin && (
                <>
                  <MLink to="/admin" end onClick={() => setMobileOpen(false)}>Overview</MLink>
                  <MLink to="/admin/products" onClick={() => setMobileOpen(false)}>Products</MLink>
                  <MLink to="/admin/orders" onClick={() => setMobileOpen(false)}>Orders</MLink>
                  <MLink to="/admin/users" onClick={() => setMobileOpen(false)}>Users</MLink>
                </>
              )}
            </nav>
            <div className="mt-3 border-t border-border pt-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{user.name}</p>
                      <p className="text-xs text-ink-muted">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink-muted hover:border-brand hover:text-brand">
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-lg border border-border py-2 text-center text-sm font-medium text-ink-muted hover:border-brand hover:text-brand">
                    Log in
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-lg bg-brand py-2 text-center text-sm font-semibold text-white hover:bg-brand-hover">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
