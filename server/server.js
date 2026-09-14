// ==========================================================
// UniMart: Smart Student Marketplace - Main Express Server
// Rajarata University of Sri Lanka - Faculty of Technology
// ==========================================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import listingsRoutes from './routes/listings.js';
import categoriesRoutes from './routes/categories.js';
import messagesRoutes from './routes/messages.js';
import reviewsRoutes from './routes/reviews.js';
import usersRoutes from './routes/users.js';
import { isSupabaseConfigured, memoryDb } from './config/db.js';
import { getAllowedDomains } from './middleware/domainCheck.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow development frontend requests
  credentials: true
}));
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes (supports both /api/* and rewritten /* paths)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/listings', '/listings'], listingsRoutes);
app.use(['/api/categories', '/categories'], categoriesRoutes);
app.use(['/api/messages', '/messages'], messagesRoutes);
app.use(['/api/reviews', '/reviews'], reviewsRoutes);
app.use(['/api/users', '/users'], usersRoutes);

// System Health & Info
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    app: 'UniMart - Smart Student Marketplace',
    institution: 'Rajarata University of Sri Lanka',
    faculty: 'Faculty of Technology',
    mode: isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Local In-Memory Seeded',
    allowedDomains: getAllowedDomains(),
    timestamp: new Date().toISOString()
  });
});

// Demo accounts endpoint for rapid evaluation and testing
app.get('/api/demo-accounts', (req, res) => {
  const accounts = [
    {
      name: 'Kavindu Perera',
      reg_id: 'ICT/2024/001',
      email: 'kavindu.p@student.rjt.ac.lk',
      password: 'Password123',
      role: 'Hardware & Web Design Listings'
    },
    {
      name: 'Anuki De Silva',
      reg_id: 'ICT/2024/002',
      email: 'anuki.d@student.rjt.ac.lk',
      password: 'Password123',
      role: 'Video & Graphic Design Services'
    },
    {
      name: 'Dinuka Fernando',
      reg_id: 'ICT/2024/003',
      email: 'dinuka.f@student.rjt.ac.lk',
      password: 'Password123',
      role: 'IoT Sensors & ESP32 Hardware'
    }
  ];
  res.json({ demoAccounts: accounts });
});

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 UniMart API Server running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`🎓 University Domains: ${getAllowedDomains().join(', ')}`);
    console.log(`💾 Database: ${isSupabaseConfigured ? 'Supabase Cloud' : 'In-Memory Mock Store'}`);
    console.log(`====================================================`);
  });
}

export default app;
