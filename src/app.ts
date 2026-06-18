import 'express-async-errors';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';

import errorHandler from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';

import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import inventoryRoutes from './routes/inventory';
import reportRoutes from './routes/reports';
import invoiceRoutes from './routes/invoices';
import userRoutes from './routes/users';

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

// Static files for uploads removed

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

export default app;
