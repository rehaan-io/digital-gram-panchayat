import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import sharp from 'sharp';
import { uploadsDir, generateFilename } from '../config/storage';

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File filter to allow only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!') as any, false);
  }
};

// Local disk storage — files saved to UPLOADS_DIR with unique names
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateFilename(file.originalname));
  },
});

// Main upload middleware using local disk storage
export const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * Image compression middleware using Sharp.
 * Runs after multer saves the file to disk. Compresses in-place.
 * Skips gracefully if no file was uploaded.
 */
export const compressImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  const inputPath = req.file.path;
  const tmpPath = `${inputPath}.tmp`;

  try {
    await sharp(inputPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(tmpPath);

    // Replace original with compressed version
    fs.renameSync(tmpPath, inputPath);
  } catch (err) {
    // If compression fails (e.g. animated gif), keep original
    if (fs.existsSync(tmpPath)) {
      try { fs.unlinkSync(tmpPath); } catch {}
    }
  }

  next();
};
