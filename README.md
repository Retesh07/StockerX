# StockerX — Full-Stack Trading Platform & Market Dashboard

[![Live Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://stockerx.vercel.app)
[![Live Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://stockerx-api.onrender.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

> A modern trading simulation dashboard built with **React (Vite)**, **Express.js**, and **MongoDB**. Features live-refreshing market quotes via Yahoo Finance with in-memory caching, atomic order execution, interactive price charts, and performance-optimized rendering.

---

## 🚀 Live Demo & Links
* **Frontend (Vercel):** `https://stockerx.vercel.app` *(Replace with your deployed URL)*
* **Backend API (Render):** `https://stockerx-api.onrender.com` *(Replace with your deployed URL)*
* **Health Check:** `https://stockerx-api.onrender.com/api/health`

---

## ✨ Features (Actual Implemented Scope)

* **Live-Refreshing Market Quotes (Indian Equities - NSE)**
  * Automated 15-second background refresh polling using `AbortController` cleanup.
  * Quotes fetched via Yahoo Finance proxy on the Express backend using `.NS` ticker mappings (zero client-side API exposure).
  * Backend in-memory quote cache with 15-second TTL and stale fallback resilience.
* **Visual Price Feedback**
  * Color-coded price tick flashes (green ring on tick up, red ring on tick down).
  * Directional arrows (`▲` / `▼`) with absolute Rupee (₹) change and 24h percentage delta.
  * High / low day range progress bar and formatted volume metrics.
* **Interactive Financial Charts**
  * Multi-timeframe area price chart (**1D**, **1W**, **1M**) for Indian stocks (Reliance, TCS, HDFC Bank, etc.).
  * Interactive hover crosshair updating price and timestamp in real-time.
  * Period gain/loss delta calculations with dynamic gradient fills.
* **Search, Filters & Layout Modes**
  * **Debounced search (300ms)** by symbol or company name.
  * Sector filters (IT & Tech, Banking, Auto, Energy, Consumer & Infra).
  * Trend filters (All, Top Gainers, Top Losers).
  * Sorting by Volume, % Gainers, Price (High to Low / Low to High), and Alphabetical.
  * Dual view modes: Responsive Grid Cards view and High-Density Table view.
* **Atomic Order Execution**
  * Server-side price enforcement (never trusts client-supplied price).
  * Guarded atomic MongoDB updates (`findOneAndUpdate` with `$gte: totalCost` for buy and `$gte: quantity` for sell).
  * Prevents concurrent race conditions, double-spending of cash, and overselling of shares.
* **Portfolio & Risk Tracking**
  * Real-time calculation of unrealized P&L, position weights, and cash balance.
  * Historical audit log of all executed buy/sell transactions.
* **Trader Leaderboard & Tools**
  * Ranked leaderboard of traders by total equity and profit/loss.
  * In-app brokerage calculator modal estimating fees (0.1%) and net P&L.

---

## 🛠 Tech Stack

* **Frontend:**
  * **Framework:** React 18, Vite 5
  * **Styling:** Tailwind CSS 3, PostCSS, Autoprefixer
  * **Animations & Micro-interactions:** Framer Motion, GSAP
  * **HTTP Client:** Axios with credentials (`withCredentials: true`)
  * **Routing:** React Router DOM 7 with animated page transitions
* **Backend:**
  * **Runtime:** Node.js, Express.js
  * **Database & ODM:** MongoDB, Mongoose 8
  * **Authentication:** JWT stored in secure HTTP-only cookies
  * **Data Engine:** Yahoo Finance (`yahoo-finance2`) with 15s in-memory caching and stale fallback
  * **Security:** `trust proxy`, dynamic CORS validation, input sanitization

---

## 📦 Project Structure

```
StockerX/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/Navbar.jsx        # Navigation bar with live balance
│   │   │   ├── StockCard.jsx            # Memoized card with green/red tick flashes
│   │   │   ├── StockChartModal.jsx      # Interactive 1D/1W/1M financial chart
│   │   │   └── BrokerageCalculator.jsx  # In-app fee calculator
│   │   ├── hooks/
│   │   │   └── useDebounce.js           # 300ms search input debounce hook
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # Market overview with filters & polling
│   │   │   ├── Trade.jsx                # Order entry screen
│   │   │   ├── Portfolio.jsx            # User holdings and P&L
│   │   │   ├── TransactionHistory.jsx   # Trade audit log
│   │   │   └── Leaderboard.jsx          # Ranked trader leaderboard
│   │   └── services/api.js              # Centralized Axios client (reads VITE_API_URL)
│   ├── vercel.json                      # Single-page application rewrites
│   └── vite.config.js                   # Port: 5173
└── server/
    ├── src/
    │   ├── config/db.js                 # MongoDB connection
    │   ├── controllers/
    │   │   ├── tradingController.js     # Guarded atomic buy/sell operations
    │   │   ├── liveStockController.js   # Live quotes and chart history
    │   │   └── portfolioController.js   # Holdings & performance calculations
    │   ├── services/
    │   │   └── quoteCacheService.js     # 15-second TTL cache with stale fallback
    │   └── index.js                     # Express entry point (Port: 5000)
    └── data/stocks.csv                  # Seed data
```

---

## 🏃 Quick Start (Local Development)

### 1. Prerequisites
* **Node.js** (v18+)
* **MongoDB** (running locally on port 27017 or a MongoDB Atlas URI)

### 2. Setup Backend
```bash
cd server
npm install
npm run import-stocks   # Seeds stocks from data/stocks.csv into MongoDB
npm run dev             # Starts backend on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev             # Starts frontend on http://localhost:5173
```

* Open your browser to **`http://localhost:5173`**.

---

## 🌐 Production Deployment

### 1. Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com) pointing to the `server/` directory.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Set Environment Variables:
   * `NODE_ENV` = `production`
   * `PORT` = `5000`
   * `MONGO_URI` = `<Your MongoDB Atlas connection string>`
   * `JWT_SECRET` = `<Your secure secret>`
   * `CLIENT_URL` = `https://your-stockerx-app.vercel.app`

### 2. Frontend (Vercel)
1. Import repository on [Vercel](https://vercel.com) and set Root Directory to `client`.
2. Framework Preset: `Vite`
3. Environment Variables:
   * `VITE_API_URL` = `https://your-render-backend.onrender.com/api`
4. Deploy! *(Routing is automatically handled by `vercel.json`)*

---

## 💡 Technical Interview Talking Points

### 1. Why live-refreshing with 15s caching instead of raw polling?
> Directly polling Yahoo Finance on every client request triggers rate-limiting and introduces high latency. By maintaining an in-memory cache on the Express backend with a 15-second TTL, 1,000 concurrent clients hit the server cache instead of spamming upstream servers. If the upstream provider experiences network degradation, the stale fallback cache preserves continuity without failing the UI.

### 2. How did you optimize rendering performance?
> When streaming frequent price updates, updating state at the top level causes React to re-render the entire table or card grid. We wrapped `StockCard` in `React.memo` with a custom comparison function that checks whether `currentPrice`, `volume`, or day ranges have actually changed. Combined with `useMemo` for filtering and `useDebounce(300ms)` on the search input, rendering remains silky-smooth at 60 FPS.

### 3. How do you prevent double-spending and overselling?
> A naive implementation reads the user balance in memory, calculates the difference, and saves (`user.save()`). Under high concurrency, two parallel requests could read the same balance and double-spend. We use guarded atomic MongoDB operations (`findOneAndUpdate` with `{ virtualBalance: { $gte: totalCost } }` on buy and `{ 'portfolio.quantity': { $gte: quantity } }` on sell). If two requests arrive simultaneously, only one matches the condition, completely eliminating race conditions.

---

## 📄 License
ISC License © 2026 StockerX.
