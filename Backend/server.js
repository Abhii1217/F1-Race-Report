require('dotenv').config();
require('./src/config/db');

const express = require('express');
const cors    = require('cors');

const seasonRoutes   = require('./src/routes/seasons');
const raceRoutes     = require('./src/routes/races');
const raceDataRoutes = require('./src/routes/raceData');
const reportRoutes   = require('./src/routes/reports');
const errorHandler   = require('./src/middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5500',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true,
}));

app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

app.use('/api', seasonRoutes);
app.use('/api', raceRoutes);
app.use('/api', raceDataRoutes);
app.use('/api', reportRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
    statusCode: 404,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🏎️  F1 Race Report Backend running on http://localhost:${PORT}`);
  console.log(`📊  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️   Database:    ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}\n`);
});

module.exports = app;