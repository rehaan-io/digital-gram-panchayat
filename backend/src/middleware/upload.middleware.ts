import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { cloudinaryStorage } from '../config/cloudinary';

// File filter to allow only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log('[Upload] fileFilter called — field:', file.fieldname, '| mimetype:', file.mimetype, '| originalname:', file.originalname);
  if (file.mimetype.startsWith('image/')) {
    console.log('[Upload] File accepted by fileFilter');
    cb(null, true);
  } else {
    console.warn('[Upload] File REJECTED by fileFilter — not an image:', file.mimetype);
    cb(new Error('Only image files are allowed!') as any, false);
  }
};

// Main upload middleware pointing directly to Cloudinary
export const upload = multer({
  storage: cloudinaryStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Since Cloudinary handles compression and writing on the fly,
// we no longer need the local compressImage middleware.
// We provide a dummy passthrough to prevent breaking existing routes that import it.
export const compressImage = async (req: Request, res: Response, next: NextFunction) => {
  // If no file was uploaded, just proceed
  if (!req.file) {
    console.log('[Upload] compressImage: no file in request, proceeding');
    return next();
  }

  // The file is already uploaded to Cloudinary by Multer at this point.
  // req.file.path contains the secure Cloudinary URL.
  console.log('[Upload] compressImage: file present after multer.');
  console.log('[Upload]   filename   :', req.file.filename);
  console.log('[Upload]   size       :', req.file.size, 'bytes');
  console.log('[Upload]   mimetype   :', req.file.mimetype);
  console.log('[Upload]   path/url   :', req.file.path);
  next();
};
