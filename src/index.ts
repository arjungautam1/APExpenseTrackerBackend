import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { seedDefaultCategories } from './utils/seedDefaultCategories';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import categoryRoutes from './routes/categories';
import investmentRoutes from './routes/investments';
import loanRoutes from './routes/loans';
import transferRoutes from './routes/transfers';
import monthlyExpenseRoutes from './routes/monthlyExpenses';
import userRoutes from './routes/users';
import aiRoutes from './routes/ai';

// Load environment variables
dotenv.config();

// Also load .env.local if it exists (for local development)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local', override: true });
}

const app = express();
const PORT: number = Number(process.env.PORT) || 5051;
// Ensure correct client IP when behind proxies (affects rate limiting)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet()); // Security headers

// Dynamic CORS configuration
const getCorsOrigin = () => {
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL;
  }
  
  // For development, allow common localhost ports
  if (process.env.NODE_ENV !== 'production') {
    return [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
  }
  
  // Fallback for production
  return 'https://yourdomain.com';
};

app.use(cors({
  origin: getCorsOrigin(),
  credentials: true
}));
app.use(compression()); // Compress responses
app.use(morgan('combined')); // Logging
// Apply rate limiting only in production to avoid 429s during local development
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/transfers', transferRoutes);
console.log('Registering monthly expenses routes...');
app.use('/api/monthly-expenses', monthlyExpenseRoutes);
console.log('Monthly expenses routes registered successfully');
// Settings & users endpoints
app.use('/api/users', userRoutes);
app.use('/api/settings', userRoutes);
console.log('Registering AI routes...');
app.use('/api/ai', aiRoutes);
console.log('AI routes registered successfully');

// TODO: Add remaining route handlers
// app.use('/api/users', userRoutes);
// app.use('/api/loans', loanRoutes);
// app.use('/api/transfers', transferRoutes);
// app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    console.log('Starting server...');
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Seeding default categories...');
    await seedDefaultCategories();
    
    console.log('Starting Express server...');
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    server.on('error', (error: any) => {
      console.error('Server error:', error);
    });

  } catch (error: any) {
    console.error('Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

startServer();