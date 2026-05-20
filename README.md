<p align="center">
  <h1 align="center">🏎️ F1 Race Report</h1>
</p>

<p align="center">
  AI-powered Formula 1 race analysis — results, lap charts, and journalist-style reports, all in one place.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-e10600?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/AI-Groq%20LLaMA%203.3-FF4B4B?style=for-the-badge" />
</p>

---

<p align="center">
  <a href="https://f1-race-report-omega.vercel.app/">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-View%20App-e10600?style=for-the-badge" />
  </a>
</p>

---

## 📖 Overview

**F1 Race Report** is a full-stack web application that lets you explore any Formula 1 Grand Prix from any season. Select a race, view full results and lap-by-lap position charts, then generate a professional journalist-style race report powered by Groq's **LLaMA 3.3 70B** model — and export it as a styled PDF.

Race data is sourced from the **Jolpica F1 API** (an Ergast-compatible endpoint) and cached in MySQL to minimise redundant API calls, with an additional in-memory layer for hot data.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🏁 **Race Results** | Full 20-driver classification with grid positions, status, points, and fastest lap |
| 📈 **Lap Position Chart** | Interactive Recharts visualisation tracking every driver's position across all laps |
| 🏆 **Podium Cards** | Highlighted P1/P2/P3 cards with constructor and time gaps |
| 📊 **Championship Standings** | Driver standings after the selected race |
| 🤖 **AI Race Report** | LLaMA-generated markdown report covering race summary, key moments, driver of the day, and title implications |
| 📄 **PDF Export** | Branded, F1-styled PDF report streamed directly from the backend |
| 🗂️ **Reports History** | Browse the last 10 AI-generated reports with quick navigation back to results |
| ⚡ **Smart Caching** | Two-tier cache (in-memory + MySQL) with TTL strategy based on race recency |

---

## 🛠️ Tech Stack

**Frontend**
- [React 18](https://react.dev) + [Vite 5](https://vitejs.dev)
- [Tailwind CSS 3](https://tailwindcss.com)
- [Recharts](https://recharts.org) — lap position & standings charts
- [React Router v6](https://reactrouter.com)
- [Lucide React](https://lucide.dev) — icons
- [React Hot Toast](https://react-hot-toast.com) — notifications

**Backend**
- [Express 5](https://expressjs.com) + Node.js
- [mysql2](https://github.com/sidorares/node-mysql2) — MySQL connection pool
- [node-cache](https://github.com/node-cache/node-cache) — in-memory cache
- [PDFKit](https://pdfkit.org) — server-side PDF generation
- [Axios](https://axios-http.com) — Jolpica & Groq API calls
- [express-validator](https://express-validator.github.io) — input validation

**Data & AI**
- [Jolpica F1 API](https://api.jolpi.ca) — race data (Ergast-compatible)
- [Groq API](https://console.groq.com) — LLaMA 3.3 70B Versatile for report generation

**Database**
- MySQL 8+ with two tables: `race_cache` and `reports`

---

## 🏗️ Architecture

```
Browser (React + Vite)
        │
        │  REST (JSON / PDF blob)
        ▼
Express 5 API  ──►  Jolpica F1 API  (race results, laps, standings)
        │
        ├──►  Groq AI API  (LLaMA 3.3 — report generation)
        │
        ├──►  node-cache   (in-memory, hot path)
        │
        └──►  MySQL        (race_cache + reports tables)
```

**Cache strategy:**
- Past seasons → permanent MySQL cache; long-lived memory TTL
- Current season, race within 3 days → 1-hour memory TTL (stewards still active)
- Current season, 3–7 days → 6-hour TTL
- Current season, 7+ days → 24-hour TTL

---

## 📁 Project Structure

```
F1 Race Report/
├── Backend/
│   ├── server.js                 # Express app entry point
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # MySQL connection pool
│   │   │   └── cache.js          # node-cache wrapper
│   │   ├── middleware/
│   │   │   └── errorHandler.js   # Global error handler
│   │   ├── routes/
│   │   │   ├── seasons.js        # GET /api/seasons
│   │   │   ├── races.js          # GET /api/races
│   │   │   ├── raceData.js       # GET /api/race-data
│   │   │   └── reports.js        # POST/GET /api/generate-report, /api/reports
│   │   └── services/
│   │       ├── ergastService.js  # Jolpica API + caching logic
│   │       ├── groqService.js    # Groq AI prompt & completion
│   │       └── pdfService.js     # PDFKit report renderer
│   └── .env.example
├── Frontend/
│   ├── src/
│   │   ├── pages/                # HomePage, ResultsPage, ReportsPage
│   │   ├── components/           # PodiumCard, PositionChart, ResultsTable, etc.
│   │   ├── hooks/                # useF1Data (data-fetching hooks)
│   │   ├── services/api.js       # Axios client + all API calls
│   │   └── utils/helpers.js
│   └── .env.example
└── Database/
    └── schema.sql                # MySQL table definitions
```

---

## ⚙️ Installation

### Prerequisites

- Node.js 18+
- MySQL 8+
- A [Groq API key](https://console.groq.com) (free tier available)

### 1 — Clone & install dependencies

```bash
git clone https://github.com/Abhii1217/F1-Race-Report.git
cd f1-race-report

# Backend
cd Backend && npm install

# Frontend
cd ../Frontend && npm install
```

### 2 — Set up the database

```bash
mysql -u root -p < Database/schema.sql
```

### 3 — Configure environment variables

```bash
# Backend
cp Backend/.env.example Backend/.env

# Frontend
cp Frontend/.env.example Frontend/.env
```

---

## 🔑 Environment Variables

**Backend — `Backend/.env`**

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `8080` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `f1_race_report` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | *(Your Password)* |
| `GROQ_API_KEY` | **Required** — Groq API key | — |
| `GROQ_MODEL` | LLaMA model ID | `llama-3.3-70b-versatile` |
| `GROQ_MAX_TOKENS` | Max tokens for AI response | `2048` |
| `GROQ_TEMPERATURE` | Generation temperature | `0.75` |
| `ERGAST_BASE_URL` | Jolpica API base URL | `https://api.jolpi.ca/ergast/f1` |
| `ERGAST_TIMEOUT_MS` | Jolpica request timeout (ms) | `10000` |
| `CACHE_TTL_MINUTES` | Default in-memory cache TTL | `360` |

**Frontend — `Frontend/.env`**

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend base URL | `http://localhost:8080` |

---

## 💻 Local Development

```bash
# Terminal 1 — start the backend (with hot reload)
cd Backend && npm run dev

# Terminal 2 — start the frontend dev server
cd Frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Health check: http://localhost:8080/health

---

## 🚀 Usage

1. Open the app and select a **Formula 1 season** from the dropdown.
2. Choose a **Grand Prix** (any round, any year back to 1950).
3. View **race results**, the **lap position chart**, and **championship standings**.
4. Click **Generate AI Report** to produce a journalist-style Markdown report via Groq.
5. **Export as PDF** to download a branded F1-styled report document.
6. Visit the **Reports** page to browse the last 10 generated reports.

---

## 📜 Scripts

| Location | Command | Description |
|---|---|---|
| Backend | `npm run dev` | Start with nodemon (hot reload) |
| Backend | `npm start` | Start production server |
| Frontend | `npm run dev` | Vite dev server |
| Frontend | `npm run build` | Production build |
| Frontend | `npm run preview` | Preview production build |

---

## 🔌 API Overview

All routes are prefixed with `/api`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/seasons` | List all available F1 seasons |
| `GET` | `/races?season=2024` | Races for a given season |
| `GET` | `/race-data?season=2024&round=1` | Full race data (results, laps, standings) |
| `POST` | `/generate-report` | Generate (or fetch cached) AI report |
| `GET` | `/reports` | Last 10 generated reports |
| `GET` | `/reports/:season/:round` | Single report by season/round |
| `GET` | `/reports/:season/:round/pdf` | Download report as PDF |
| `GET` | `/health` | Server health check |

---

## 🗄️ Database Setup

The schema creates two tables:

```sql
race_cache   -- Caches raw Jolpica API responses (JSON column) per season/round
reports      -- Stores AI-generated report content and metadata
```

Both tables use `(season, round)` unique keys for upsert-based caching. Run the schema once:

```bash
mysql -u root -p < Database/schema.sql
```

---

## 🚢 Deployment Overview

| Layer | Provider |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Avian |

> For production, ensure `NODE_ENV=production` on Render, whitelist your Vercel domain in `FRONTEND_URL`, and copy the Aiven MySQL credentials into your Render environment variables.
> 
---

## ⚠️ Known Limitations

- **No authentication** — The API is open; anyone with the backend URL can generate reports and consume Groq API quota.
- **Groq rate limits** — The free Groq tier has request-per-minute limits; rapid successive report generations may hit 429 errors.
- **Ergast API limitation** — Lap data not available for races before ~2012.
- **Render limitation** — Render free tier spins down after inactivity — first request may take ~50 seconds to wake up.
---

## 🗺️ Roadmap

- [ ] Add JWT/API key authentication to protect report generation
- [ ] Docker Compose setup for one-command local start
- [ ] Season comparison mode (driver points across multiple seasons)

---

## 🤝 Contributing

Contributions are welcome! Please open an issue to discuss significant changes before submitting a pull request.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "feat: describe your change"
git push origin feature/your-feature
# Open a Pull Request
```

---

## 🙏 Credits

- **[Jolpica F1 API](https://api.jolpi.ca)** — free, open Formula 1 historical data (Ergast-compatible)
- **[Groq](https://groq.com)** — ultra-fast LLaMA inference powering the AI reports

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Abhishek Anand**

[![GitHub](https://img.shields.io/badge/GitHub-Abhii1217-181717?style=for-the-badge&logo=github)](https://github.com/Abhii1217)
