import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { uploadsDir } from './config/storage';

// Routes imports
import authRoutes from './routes/auth.routes';
import ticketRoutes from './routes/ticket.routes';
import adminRoutes from './routes/admin.routes';
import homepageRoutes from './routes/homepage.routes';
import notificationRoutes from './routes/notification.routes';
import modulesRoutes from './routes/modules.routes';

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists (uses UPLOADS_DIR env var in production)
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// API Routers
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/modules', modulesRoutes);

// Base route for connectivity checks
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    message: 'Digital Gram Panchayat Management System Backend API is active.',
    timestamp: new Date(),
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    message: 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
