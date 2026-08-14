import path from 'path';
import { Request } from 'express';
import crypto from 'crypto';

// UPLOADS_DIR env var: in production, set to /var/www/digital-gram-panchayat/uploads
// Default fallback for development: <project-root>/uploads (one level above dist/)
export const uploadsDir: string = process.env.UPLOADS_DIR
  ? process.env.UPLOADS_DIR
  : path.join(__dirname, '../../uploads');

// Base URL for constructing public image URLs
// UPLOADS_BASE_URL env var: https://api.grampanchayat.digital
const uploadsBaseUrl: string = process.env.UPLOADS_BASE_URL || 'https://api.grampanchayat.digital';

/**
 * Generates a unique filename for an uploaded file.
 * Format: <timestamp>-<uuid>.<ext>
 */
export function generateFilename(originalname: string): string {
  const ext = path.extname(originalname).toLowerCase() || '.jpg';
  const unique = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${unique}${ext}`;
}

/**
 * Constructs the public-facing URL for an uploaded file.
 * E.g. "https://api.grampanchayat.digital/uploads/1234567890-abc.jpg"
 */
export function getUploadUrl(filename: string): string {
  return `${uploadsBaseUrl}/uploads/${filename}`;
}

/**
 * Extracts the local filesystem path of an uploaded file from its public URL.
 * E.g. "https://api.grampanchayat.digital/uploads/foo.jpg" => "/var/www/.../uploads/foo.jpg"
 */
export function urlToLocalPath(publicUrl: string): string | null {
  if (!publicUrl) return null;
  const filename = publicUrl.split('/uploads/').pop();
  if (!filename) return null;
  return path.join(uploadsDir, filename);
}
