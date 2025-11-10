/**
 * Case Archives Backend Server
 * Express + SQLite + JWT Authentication
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const casesRoutes = require('./routes/cases');
const targetsRoutes = require('./routes/targets');
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✓ Created uploads directory');
}

// Initialize database
initializeDatabase();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN 
    : 'http://localhost:8080',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { ok: false, message: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(uploadDir, {
  maxAge: '1d', // Cache images for 1 day
  etag: true,
  lastModified: true
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/targets', targetsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    ok: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, '::', () => {
  console.log(`
╔═══════════════════════════════════════╗
║   Case Archives Backend Server       ║
║   Running on http://localhost:${PORT}  ║
╚═══════════════════════════════════════╝
  `);
});

module.exports = app;
