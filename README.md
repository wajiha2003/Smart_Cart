
SmartCart
A full-stack eCommerce web application featuring an integrated LLM Chatbot and an interactive Voice Agent. Built with React + TypeScript (frontend) and Node.js + Express + TypeScript (backend).
What's included
AI & Voice Features
 * LLM Chatbot: Context-aware assistant to help customers search products, ask questions, and get recommendations.
 * Voice Agent: Hands-free voice interface allowing users to navigate the store, search items, and trigger commands using voice input.
Customer
 * Sign up / Login (JWT auth)
 * Browse products (search + category filter)
 * Product details page
 * Shopping cart (add / update / remove)
 * Checkout → order placed → confirmation email
 * Order history with live status
Admin Dashboard
 * Overview (revenue, orders, products, customers, low-stock alerts)
 * Manage products (create / edit / delete)
 * Manage orders (update status: pending → processing → shipped → delivered / cancelled)
 * Manage users (promote/demote admin, delete)
Auth Flow
 * JWT-based signup/login
 * Forgot password → email with reset link → reset password
Email Automation (Nodemailer)
 * Welcome email on signup
 * Order confirmation email on checkout
 * Password reset email
 * Defaults to console mode: emails are printed to the server terminal instead of actually sent, so you can test the full flow with zero setup. Switch to real SMTP (Gmail or Mailtrap) any time — see server/.env.example.
Tech Stack
 * Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Web Speech API / Voice SDK
 * Backend: Node.js, Express, TypeScript, JWT, bcrypt, Nodemailer, LLM API Integration (OpenAI / LangChain)
 * Database: Local JSON storage (server/data/db.json) via lowdb for zero setup. Easily swappable for PostgreSQL or MongoDB.
Project Structure
smartcart/
├── server/               Express + TypeScript API
│   ├── src/
│   │   ├── controllers/  auth, products, cart, orders, admin, ai, voice
│   │   ├── routes/       
│   │   ├── middleware/   JWT auth, admin guard, error handler
│   │   ├── models/       lowdb schema
│   │   ├── services/     email service (Nodemailer), LLM / Voice services
│   │   └── utils/        JWT helpers, DB seed script
│   └── data/db.json      auto-created local database
└── client/               React + TypeScript app
    └── src/
        ├── pages/        Home, ProductDetail, Cart, Checkout, OrderHistory,
        │                 Login, Signup, ForgotPassword, ResetPassword,
        │                 admin/ (Overview, Products, Orders, Users)
        ├── components/   Navbar, ProductCard, Chatbot, VoiceAgent, route guards
        ├── context/      AuthContext, CartContext, VoiceContext
        └── lib/          axios client, shared types

Getting Started
1. Backend
cd server
npm install
cp .env.example .env      # Set up your environment variables (including LLM/Voice API keys)
npm run seed              # Creates demo admin + customer accounts and sample products
npm run dev               # Starts API on http://localhost:5000

> Note: Make sure to add your AI/LLM service keys to server/.env if you want to enable live model responses for the Chatbot and Voice Agent.
> 
Demo accounts created by the seed script:
 * Admin: admin@smartcart.com / Admin@123
 * Customer: customer@smartcart.com / Customer@123
2. Frontend
In a second terminal:
cd client
npm install
npm run dev               # Starts app on http://localhost:5173

Open http://localhost:5173 — the app is pre-configured to talk to the API at http://localhost:5000/api.
3. Try It Out
 * AI Chatbot & Voice: Click the Chatbot widget in the corner to ask for recommendations, or enable the Voice Agent to speak directly to the store.
 * Shop & Checkout: Log in as the customer, browse products, add items to your cart, and complete a checkout flow.
 * Admin Management: Log in as the admin to manage inventory, update live order statuses, and view user management options.
Sending Real Emails
By default, EMAIL_MODE=console in server/.env, so emails log directly to the terminal. To send real emails:
 * Set EMAIL_MODE=smtp
 * Fill in SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in server/.env.
Notes & Next Steps
 * Database: Flat JSON file for zero-setup local development. Transitioning to PostgreSQL or MongoDB requires updating only server/src/models/db.ts.
 * Checkout: Demo checkout flow; payment gateway integration can be added seamlessly.
 * Microphone Permissions: Ensure browser permissions for audio/microphone access are allowed when testing the Voice Agent locally.
