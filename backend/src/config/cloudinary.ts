import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// ── DIAGNOSTIC: log which env vars are present (never log values) ──────────
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey    = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
console.log('[Cloudinary] Config check:',
  'cloud_name=', cloudName ? `${cloudName.substring(0, 3)}***` : 'MISSING',
  '| api_key=',  apiKey    ? 'SET' : 'MISSING',
  '| api_secret=', apiSecret ? 'SET' : 'MISSING',
);

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: cloudName,
  api_key:    apiKey,
  api_secret: apiSecret,
});

// Setup Cloudinary Storage for Multer
export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log('[Cloudinary] CloudinaryStorage.params called for file:', file.originalname, file.mimetype);
    return {
      folder: 'panchayat_uploads',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
      // Cloudinary automatically transforms/compresses images if configured
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto:eco' }]
    };
  },
});

export default cloudinary;
