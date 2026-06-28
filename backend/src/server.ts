import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import tripRoutes from './routes/tripRoutes';

// Load environment variables first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS Configuration ────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://trao-ai.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      
      // Allow any vercel preview or main domain using regex
      const isVercel = /^https?:\/\/.*\.vercel\.app\/?$/.test(origin);
      if (isVercel || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      callback(new Error(`CORS policy violation: Origin '${origin}' is not allowed.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Trao AI Travel Planner API',
    version: '1.0.0',
    deployment: 'v2', // Added to test if Vercel is building the latest commit
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found.',
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('🚨 Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.',
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║     🌍 Trao AI Travel Planner API      ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  🚀 Server running on port ${PORT}        ║`);
    console.log(`║  📡 Environment: ${process.env.NODE_ENV || 'development'}          ║`);
    console.log('╚════════════════════════════════════════╝');
    console.log('');
  });
};

startServer().catch((err) => {
  console.error('🚨 Fatal server startup error:', err);
  process.exit(1);
});

export default app;
