import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { cloudinaryStorage } from '../config/cloudinary';

// File filter to allow only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!') as any, false);
  }
};

// Main upload middleware pointing directly to Cloudinary
export const upload = multer({
  storage: cloudinaryStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (Cloudinary handles large uploads gracefully, but we keep this as a sane default)
  },
});

// Since Cloudinary handles compression and writing on the fly, 
// we no longer need the local compressImage middleware. 
// We provide a dummy passthrough to prevent breaking existing routes that import it.
export const compressImage = async (req: Request, res: Response, next: NextFunction) => {
  // If no file was uploaded, just proceed
  if (!req.file) {
    return next();
  }
  
  // The file is already uploaded to Cloudinary by Multer at this point.
  // req.file.path contains the secure Cloudinary URL.
  next();
};
