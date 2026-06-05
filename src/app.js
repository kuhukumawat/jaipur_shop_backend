require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS — allow all origins for now (restrict to domain on production)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// Rate limiting
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later' },
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
