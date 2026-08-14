import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

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

// Ensure uploads folder exists
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsPath));

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

// ── DIAGNOSTIC: Multer / Cloudinary error handler ─────────────────────────
// Catches errors thrown by multer (e.g. file too large, Cloudinary rejection)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    console.error('[Multer Error] code:', err.code, '| field:', err.field, '| message:', err.message);
    return res.status(400).json({
      message: `Upload error: ${err.message}`,
      code: err.code,
    });
  }
  if (err && err.message && err.message.toLowerCase().includes('cloudinary')) {
    console.error('[Cloudinary Error] Upload failed:', err.message, err);
    return res.status(500).json({
      message: 'Image upload to Cloudinary failed.',
      detail: err.message,
    });
  }
  if (err && (err.http_code || err.error)) {
    // Cloudinary SDK error shape
    console.error('[Cloudinary SDK Error]', JSON.stringify(err));
    return res.status(500).json({
      message: 'Cloudinary error during upload.',
      detail: err.message || err.error,
    });
  }
  console.error('[App] Unhandled Application Error:', err);
  res.status(500).json({
    message: 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
