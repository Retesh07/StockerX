# StockerX – Full-Stack Stock Trading Simulation

This document walks through **every major part** of the StockerX project so you can explain it confidently in an interview.  It covers the overall architecture, key backend modules, the frontend structure, the development workflow, and common interview talking-points.

---

## 1. High-Level Architecture

```
React (Vite) SPA  <--REST-->  Express API  <--->  MongoDB
        |                               |
        |--- axios/fetch -------------->|
        |<-- JSON ----------------------|
```

* **Frontend**: React + Vite + React-Router (client directory)
* **Backend**: Node.js, Express, Mongoose (server directory)
* **Database**: MongoDB (local or Atlas)
* **Authentication**: JWT + http-only cookies
* **Live Data**: Yahoo Finance (yahoo-finance2)

---

## 2. Backend (server/)

### 2.1 Entry Point – `src/index.js`
* Loads environment variables and connects to Mongo.
* Sets up middleware: CORS, JSON parsing, cookie-parser.
* Registers **8 route groups**:
  * `/api/auth` – register / login / logout
  * `/api/stocks` – static stock list (Mongo) **and** live price endpoint
  * `/api/trading` – order placement (future scope)
  * `/api/portfolio` – get/buy/sell positions
  * `/api/transactions` – trade history
  * `/api/leaderboard` – ranking by portfolio value
* Global error handler & 404 handler.

Interview point → *Demonstrate clean separation of concerns and centralised error handling.*

### 2.2 Config – `src/config/db.js`
* Exports `connectDB()` – single responsibility: connect and log status.
* Uses `mongoose.connect(process.env.MONGO_URI)`.

### 2.3 Models (Mongoose Schemas)
* **User** (`src/models/User.js`)
  * Fields: `username`, `email`, `password` (hashed), `virtualBalance`, `portfolio[]`, `createdAt`.
  * Middleware: `pre('save')` to hash passwords.
  * Method: `matchPassword` for login.
* **Stock** (`src/models/Stock.js`)
  * Pure data – symbol, name, OHLC, volume.
* You can mention why embedding `portfolio` in User is good enough for this scale (<= 100 items) and when to normalise.

### 2.4 Controllers
* **stockController** – CRUD for static stock list.
* **portfolioController** –
  * `getPortfolio` – aggregate positions and compute P/L.
  * `buyStock` / `sellStock` – update user portfolio & balance atomically.
* **liveStockController** – fetches real-time price from Yahoo Finance and returns symbol, price, timestamp, market state.
  * Interview bonus → *Why keep live data stateless instead of persisting each tick?*

### 2.5 Routes
Located in `src/routes/`.  Each file is a thin layer that wires path → controller and attaches `protect` middleware where auth is required.

### 2.6 Middleware
* `authMiddleware.js` – verifies JWT in http-only cookie and attaches `req.user`.

### 2.7 Utility / Scripts
* **CSV importer** (`src/utils/importStocks.js`, `src/scripts/importStocks.js`) – bulk-load stocks from `data/stocks.csv`.
* Uses `csv-parser` stream for memory efficiency.

---

## 3. Frontend (client/)

### 3.1 Entry – `src/main.jsx`
```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```
* Bootstraps React in strict mode.
* Vite provides hot-reload and fast builds.

### 3.2 Application component tree
```
<App>
 ├─ <AuthProvider>
 │    └─ <Router>
 │         ├─ <Navbar/>
 │         ├─ Routes
 │         │    ├─ / (Dashboard – portfolio & watchlist)
 │         │    ├─ /stocks (Static list)
 │         │    ├─ /live/:symbol (Live chart)
 │         │    └─ /login /register
```
*(Exact file names may differ – adjust if your client structure changes.)*

### 3.3 State Management
* React Context + useReducer for auth and portfolio state.
* `axios` instance with `withCredentials:true` to send cookies.

### 3.4 Live Price Hook (example)
```js
const useLivePrice = symbol => {
  const [quote, setQuote] = useState(null);
  useEffect(() => {
    const fetchPrice = async () => {
      const { data } = await axios.get(`/api/stocks/live/${symbol}`);
      setQuote(data);
    };
    fetchPrice();
    const id = setInterval(fetchPrice, 15000);
    return () => clearInterval(id);
  }, [symbol]);
  return quote;
};
```

### 3.5 UI / Styling
* TailwindCSS (or plain CSS modules) for responsive design.
* Green/red colour coding to indicate price change.

---

## 4. Security & Best-Practices
* **Environment variables** stored in `.env` and never committed.
* **Password hashing** with bcrypt; tokens stored in http-only cookie to mitigate XSS.
* **CORS** configured for localhost:5173 – interviewer may ask how to set for production.

---

## 5. Running & Development Workflow
1. `npm install` in both `server/` and `client/`.
2. Import stocks: `node src/scripts/importStocks.js`.
3. Start backend: `npm run dev` (nodemon) – `.env` PORT defaults to 5000.
4. Start frontend: `npm run dev` inside `client/` (Vite) – 5173.

---

## 6. Common Interview Questions & Talking Points
| Topic | Key Points |
|-------|-----------|
| **Why MongoDB?** | Flexible schema fits evolving portfolio shape; fast prototyping. |
| **Scaling live data** | Use WebSockets or Server-Sent Events to broadcast price instead of polling. Cache quote results to stay within API rate limits. |
| **Transactions** | For real money you’d use DB transactions to lock user balance and stock qty updates. |
| **Deployment** | Frontend on Netlify/Vercel, backend on Render/EC2, Mongo Atlas cluster. Use environment-specific config. |
| **Testing** | Jest + Supertest for controllers; React Testing Library for components. |

---

## 7. Future Enhancements
* Real-time WebSocket price feed.
* Stop-loss / limit orders.
* OAuth (Google/GitHub) login.
* Docker compose for one-command spin-up.
* CI pipeline with GitHub Actions.

---

## 8. Converting to PDF
The file you are reading (`Project_Documentation.md`) can be converted to PDF via:

1. **VS Code Extension** – install “Markdown PDF” and press `Ctrl+Shift+P` → *Markdown PDF: Export (pdf)*.
2. **Pandoc** (CLI):
   ```bash
   pandoc Project_Documentation.md -o StockerX_Documentation.pdf
   ```
3. **Online tools** like Dillinger → Export as PDF.

---

*Prepared automatically by Cascade AI – tailor any section as needed before exporting.*
