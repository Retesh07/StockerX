# StockerX — Indian Equity Trading Platform

[![GitHub Repo](https://img.shields.io/badge/GitHub-Retesh07%2FStockerX-181717?logo=github)](https://github.com/Retesh07/StockerX)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)

A full-stack Indian equity paper trading application built with **React**, **Express.js**, and **MongoDB**. Supports live-refreshing market data for top Nifty 50 constituents, interactive technical charts, atomic order execution, and a ranked trader leaderboard.

---

## ✨ Features

- **Live-Refreshing Market Data (NSE):** Live quotes for top 20 Nifty 50 stocks (Reliance, TCS, HDFC Bank, Infosys, etc.) with automated 15-second background refresh and visual tick flashes (green/red).
- **Interactive Price Charts:** Area chart supporting **1D**, **1W**, and **1M** timeframes with hover crosshair and real-time price delta inspection.
- **Search & Sector Filtering:** 300ms debounced search with sector filters (IT & Tech, Banking, Auto, Energy, Consumer & Infra) and sorting by volume, price, and % change.
- **Atomic Trade Execution:** Guarded server-side order processing with atomic MongoDB updates preventing double-spending and overselling.
- **Portfolio & Risk Management:** Live tracking of unrealized P&L, position weights, cash balance, and a full transaction audit log.
- **Trader Leaderboard:** Live ranking by total net worth (cash + stock holdings) and return percentages.
- **Brokerage Calculator:** In-app calculator to estimate trading turnover, fees, and net profits.

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS, Framer Motion, Axios
- **Backend:** Node.js, Express.js, MongoDB, Mongoose 8, JWT Authentication
- **Market Data:** Yahoo Finance API integration with in-memory caching (15s TTL) and stale fallback

---

## 📁 Project Structure

```
StockerX/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/Navbar.jsx        # Navigation & balance display
│   │   │   ├── StockCard.jsx            # Memoized card with tick flash feedback
│   │   │   ├── StockChartModal.jsx      # Interactive 1D/1W/1M price chart
│   │   │   └── BrokerageCalculator.jsx  # Trading fee calculator modal
│   │   ├── hooks/
│   │   │   └── useDebounce.js           # Debounce hook for smooth search
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # Live market overview & stock grid
│   │   │   ├── Trade.jsx                # Buy/sell order interface
│   │   │   ├── Portfolio.jsx            # User holdings and returns
│   │   │   ├── TransactionHistory.jsx   # Past trade audit log
│   │   │   └── Leaderboard.jsx          # Ranked trader leaderboard
│   │   └── services/api.js              # Central API client
│   └── vite.config.js                   # Port: 5173
└── server/
    ├── src/
    │   ├── controllers/
    │   │   ├── tradingController.js     # Atomic buy/sell operations
    │   │   ├── liveStockController.js   # Live quotes and chart endpoints
    │   │   ├── stockController.js       # Stock catalog & database sync
    │   │   ├── portfolioController.js   # Portfolio valuation
    │   │   └── leaderboardController.js # Net worth ranking
    │   ├── services/
    │   │   └── quoteCacheService.js     # 15s cache with resilient fallback
    │   └── index.js                     # Server entry point (Port: 5000)
    └── data/stocks.csv                  # Indian stocks seed list
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** (running locally or MongoDB Atlas connection string)

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The client will start on `http://localhost:5173`.

---

## 📄 License
ISC License © 2026 StockerX.
