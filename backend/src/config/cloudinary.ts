import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Cloudinary Storage for Multer
export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'panchayat_uploads',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
      // Cloudinary automatically transforms/compresses images if configured
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto:eco' }]
    };
  },
});

export default cloudinary;
