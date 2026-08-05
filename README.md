# SmartCart

A full-stack eCommerce web app implementing the SmartCart workflow document — **without** the AI product-description feature. Built with React + TypeScript (frontend) and Node.js + Express + TypeScript (backend).

## What's included

**Customer**
- Sign up / Login (JWT auth)
- Browse products (search + category filter)
- Product details page
- Shopping cart (add / update / remove)
- Checkout → order placed → confirmation email
- Order history with live status

**Admin dashboard**
- Overview (revenue, orders, products, customers, low-stock alerts)
- Manage products (create / edit / delete)
- Manage orders (update status: pending → processing → shipped → delivered / cancelled)
- Manage users (promote/demote admin, delete)

**Auth flow**
- JWT-based signup/login
- Forgot password → email with reset link → reset password

**Email automation** (Nodemailer)
- Welcome email on signup
- Order confirmation email on checkout
- Password reset email
- Defaults to **console mode**: emails are printed to the server terminal instead of actually sent, so you can test the full flow with zero setup. Switch to real SMTP (Gmail or Mailtrap) any time — see `server/.env.example`.

**Not included (by request):** the "Generate with AI" OpenAI product-description feature from the original doc. Everything else from the workflow document is implemented.

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express, TypeScript, JWT, bcrypt, Nodemailer
- Database: a local JSON file (`server/data/db.json`) via `lowdb` — zero setup required. Swap in PostgreSQL/MongoDB later without changing the API layer if you want to move past prototype stage.

## Project structure

```
smartcart/
├── server/               Express + TypeScript API
│   ├── src/
│   │   ├── controllers/  auth, products, cart, orders, admin
│   │   ├── routes/
│   │   ├── middleware/   JWT auth, admin guard, error handler
│   │   ├── models/       lowdb schema
│   │   ├── services/     email service (Nodemailer)
│   │   └── utils/        JWT helpers, DB seed script
│   └── data/db.json      auto-created local database
└── client/                React + TypeScript app
    └── src/
        ├── pages/         Home, ProductDetail, Cart, Checkout, OrderHistory,
        │                  Login, Signup, ForgotPassword, ResetPassword,
        │                  admin/ (Overview, Products, Orders, Users)
        ├── components/    Navbar, ProductCard, route guards
        ├── context/       AuthContext, CartContext
        └── lib/           axios client, shared types
```

## Getting started

### 1. Backend

```bash
cd server
npm install
cp .env.example .env      # defaults work out of the box
npm run seed               # creates demo admin + customer accounts and sample products
npm run dev                 # starts API on http://localhost:5000
```

Demo accounts created by the seed script:
- Admin: `admin@smartcart.com` / `Admin@123`
- Customer: `customer@smartcart.com` / `Customer@123`

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev                 # starts app on http://localhost:5173
```

Open http://localhost:5173 — the app is already wired to talk to the API at `http://localhost:5000/api` (see `client/.env`).

### 3. Try it out

1. Log in as the customer (or sign up a new account — check the server terminal for the "welcome email").
2. Browse products, add a few to your cart, and check out — check the server terminal for the "order confirmation email".
3. Log in as the admin and visit **Dashboard** to manage products, update order statuses, and manage users.

## Sending real emails

By default `EMAIL_MODE=console` in `server/.env`, so emails are logged to the terminal instead of sent. To send real email:

1. Set `EMAIL_MODE=smtp`
2. Fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — Mailtrap's sandbox SMTP works well for testing, Gmail SMTP (with an app password) works for production.

## Notes / next steps

- The database is a flat JSON file for zero-setup local development, matching the workflow doc's "keep it simple" goal. Swapping to PostgreSQL or MongoDB later only touches `server/src/models/db.ts`.
- Checkout is a demo flow — no real payment gateway is integrated (that's listed as a "Future Improvement" in the original doc).
- Product images use placeholder Unsplash URLs from the seed script; replace with real product photos via the Image URL field in the admin product form.
