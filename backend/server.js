import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import expenseRoutes from './routes/expenses.js';
import serviceRoutes from './routes/services.js';
import analyticsRoutes from './routes/analytics.js';
import ghostwriterRoutes from './routes/ghostwriter.js';
import auditLogRoutes from './routes/auditLogs.js';
import leadRoutes from './routes/leads.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'mikon_oss';
    
    await mongoose.connect(`${mongoUrl}/${dbName}`);
    console.log(`✅ Connected to MongoDB: ${dbName}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ghostwriter', ghostwriterRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/leads', leadRoutes);

// Health check
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Mikon Insights OSS API v1.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Mikon Insights OSS Server running on port ${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
  });
};

startServer();
