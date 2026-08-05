import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import { ProtectedRoute, AdminRoute, GuestRoute } from "./components/RouteGuards";
import ChatWidget from "./components/ChatWidget";
import VoiceAgent from "./components/VoiceAgent";

import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products/:id" element={<ProductDetail />} />

                <Route element={<GuestRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<OrderHistory />} />
                </Route>

                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminOverview />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <ChatWidget />
            <VoiceAgent />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-ink">404</h1>
      <p className="mt-2 text-ink-light/70">This page doesn't exist.</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-brand text-white">
      {/* Main columns */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16 10a4 4 0 0 1-8 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="font-display text-xl font-bold tracking-tight">
                Smart<span className="text-accent">Cart</span>
              </span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-white/50">
              A modern AI-powered eCommerce platform. Browse smarter, checkout faster, and get personalised picks every visit.
            </p>
            {/* Social icons */}
            <div className="mt-6 flex gap-3">
              {[
                { label: "Twitter", path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
                { label: "GitHub", path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" },
                { label: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
              ].map((s) => (
                <button key={s.label} aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-accent hover:text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d={s.path} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Shop</p>
            <ul className="space-y-2.5">
              {[
                { label: "All Products", to: "/" },
                { label: "Electronics",  to: "/?category=Electronics" },
                { label: "Home & Kitchen", to: "/?category=Home+%26+Kitchen" },
                { label: "Fashion",       to: "/?category=Fashion" },
                { label: "Sports & Outdoors", to: "/?category=Sports+%26+Outdoors" },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.to}
                    className="text-[13px] text-white/55 transition hover:text-white hover:translate-x-0.5 inline-block">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Account</p>
            <ul className="space-y-2.5">
              {[
                { label: "Sign Up",       to: "/signup" },
                { label: "Log In",        to: "/login" },
                { label: "My Orders",     to: "/orders" },
                { label: "Cart",          to: "/cart" },
                { label: "Checkout",      to: "/checkout" },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.to}
                    className="text-[13px] text-white/55 transition hover:text-white hover:translate-x-0.5 inline-block">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Features */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Features</p>
            <ul className="space-y-3">
              {[
                { icon: "✨", label: "AI Recommendations", desc: "Personalised picks" },
                { icon: "💬", label: "Shopping Chatbot",   desc: "Chat to find products" },
                { icon: "🎙️", label: "Voice Assistant",    desc: "Speak to navigate" },
                { icon: "📧", label: "Email Automation",   desc: "Order & status emails" },
              ].map((f) => (
                <li key={f.label} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-base leading-none">{f.icon}</span>
                  <div>
                    <p className="text-[13px] font-medium text-white/80">{f.label}</p>
                    <p className="text-[11px] text-white/35">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <p className="text-[12px] text-white/35">
            © {new Date().getFullYear()} SmartCart AI. Built with React, TypeScript, Node.js &amp; Express.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Use", "Contact"].map((l) => (
              <a key={l} href="#"
                className="text-[12px] text-white/35 transition hover:text-white/70">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
