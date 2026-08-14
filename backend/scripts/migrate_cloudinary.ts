import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as crypto from 'crypto';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

// Configuration
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
const UPLOADS_BASE_URL = process.env.UPLOADS_BASE_URL || 'https://api.grampanchayat.digital';
const CLOUDINARY_URL_PATTERN = 'https://res.cloudinary.com/';

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  console.log(`[INIT] Creating uploads directory at ${UPLOADS_DIR}`);
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Downloads a file from a given URL and saves it to a specified local path.
 */
function downloadImage(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlinkSync(destPath);
        return reject(new Error(`Failed to download image. Status Code: ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

/**
 * Generates a unique filename while preserving the extension.
 */
function generateUniqueFilename(originalUrl: string): string {
  // Try to extract original extension, default to .jpg if missing
  let ext = '.jpg';
  try {
    const parsed = new URL(originalUrl);
    const pathname = parsed.pathname;
    const pathExt = path.extname(pathname);
    if (pathExt) ext = pathExt.toLowerCase();
  } catch (e) {
    // Ignore URL parse error
  }
  const uniqueId = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${uniqueId}${ext}`;
}

async function performDatabaseBackup() {
  console.log('\n[BACKUP] Attempting to create a database backup...');
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.warn('⚠️  DATABASE_URL is not set. Skipping pg_dump backup. PLEASE ENSURE YOU HAVE A MANUAL BACKUP.');
      return;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(__dirname, `../db_backup_${timestamp}.sql`);
    
    console.log(`[BACKUP] Running pg_dump to ${backupFile}...`);
    // Note: This requires pg_dump to be installed on the VPS
    execSync(`pg_dump "${dbUrl}" > "${backupFile}"`);
    console.log(`✅ Database successfully backed up to ${backupFile}`);
  } catch (error: any) {
    console.error(`❌ Database backup failed: ${error.message}`);
    console.log('⚠️  PLEASE MANUALLY BACKUP YOUR DATABASE BEFORE RUNNING THIS SCRIPT AGAIN.');
    console.log('To bypass this safely if you already have a backup, comment out the backup step in the script.');
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Starting Cloudinary to VPS Local Storage Migration...');
  console.log(`📂 Target Directory: ${UPLOADS_DIR}`);
  console.log(`🌐 Base URL: ${UPLOADS_BASE_URL}`);

  await performDatabaseBackup();

  const stats = {
    found: 0,
    downloaded: 0,
    converted: 0,
    failed: 0,
    tablesModified: new Set<string>(),
  };

  const tasks: Array<{ table: string; id: string; column: string; originalUrl: string }> = [];

  // 1. Gather Employees
  const employees = await prisma.employee.findMany({
    where: { photo: { contains: CLOUDINARY_URL_PATTERN } },
  });
  employees.forEach(emp => {
    if (emp.photo) tasks.push({ table: 'Employee', id: emp.id, column: 'photo', originalUrl: emp.photo });
  });

  // 2. Gather Officials
  const officials = await prisma.official.findMany({
    where: { photo: { contains: CLOUDINARY_URL_PATTERN } },
  });
  officials.forEach(off => {
    if (off.photo) tasks.push({ table: 'Official', id: off.id, column: 'photo', originalUrl: off.photo });
  });

  // 3. Gather Tickets (issueImage and completionImage)
  const ticketsIssue = await prisma.ticket.findMany({
    where: { issueImage: { contains: CLOUDINARY_URL_PATTERN } },
  });
  ticketsIssue.forEach(tkt => {
    if (tkt.issueImage) tasks.push({ table: 'Ticket', id: tkt.id, column: 'issueImage', originalUrl: tkt.issueImage });
  });

  const ticketsCompletion = await prisma.ticket.findMany({
    where: { completionImage: { contains: CLOUDINARY_URL_PATTERN } },
  });
  ticketsCompletion.forEach(tkt => {
    if (tkt.completionImage) tasks.push({ table: 'Ticket', id: tkt.id, column: 'completionImage', originalUrl: tkt.completionImage });
  });

  stats.found = tasks.length;
  console.log(`\n🔍 Found ${stats.found} Cloudinary URLs to migrate.`);

  // Process each task sequentially to avoid overwhelming the server or DB
  for (let index = 0; index < tasks.length; index++) {
    const task = tasks[index];
    console.log(`\n[${index + 1}/${tasks.length}] Processing ${task.table} (${task.id}) - Column: ${task.column}`);
    console.log(`   Original URL: ${task.originalUrl}`);

    try {
      // Generate paths
      const filename = generateUniqueFilename(task.originalUrl);
      const localFilePath = path.join(UPLOADS_DIR, filename);
      const newPublicUrl = `${UPLOADS_BASE_URL}/uploads/${filename}`;

      // Download
      console.log(`   Downloading to: ${localFilePath}`);
      await downloadImage(task.originalUrl, localFilePath);

      // Verify file exists and is readable
      if (!fs.existsSync(localFilePath)) {
        throw new Error('File download succeeded but file does not exist on disk.');
      }
      fs.accessSync(localFilePath, fs.constants.R_OK); // Throws if not readable
      stats.downloaded++;

      // Update Database
      console.log(`   Updating database with new URL: ${newPublicUrl}`);
      
      if (task.table === 'Employee') {
        await prisma.employee.update({ where: { id: task.id }, data: { photo: newPublicUrl } });
      } else if (task.table === 'Official') {
        await prisma.official.update({ where: { id: task.id }, data: { photo: newPublicUrl } });
      } else if (task.table === 'Ticket') {
        const updateData: any = {};
        updateData[task.column] = newPublicUrl;
        await prisma.ticket.update({ where: { id: task.id }, data: updateData });
      }

      stats.converted++;
      stats.tablesModified.add(task.table);
      console.log(`   ✅ Success`);

    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}`);
      stats.failed++;
    }
  }

  // Count files in uploads directory
  let filesInUploads = 0;
  try {
    filesInUploads = fs.readdirSync(UPLOADS_DIR).length;
  } catch (e) {
    // Ignore
  }

  // Final Summary
  console.log('\n======================================================');
  console.log('🎉 MIGRATION COMPLETE SUMMARY');
  console.log('======================================================');
  console.log(`Total Cloudinary URLs Found:       ${stats.found}`);
  console.log(`Successfully Downloaded:           ${stats.downloaded}`);
  console.log(`Successfully Updated in DB:        ${stats.converted}`);
  console.log(`Failed Migrations:                 ${stats.failed}`);
  console.log(`Tables Modified:                   ${Array.from(stats.tablesModified).join(', ') || 'None'}`);
  console.log(`Total Files in /uploads directory: ${filesInUploads}`);
  
  if (stats.failed > 0) {
    console.log('\n⚠️  WARNING: Some images failed to migrate. Review the logs above.');
    console.log('You can safely run this script again. It will only pick up the remaining Cloudinary URLs.');
  } else {
    console.log('\n✅ All targeted images were migrated successfully!');
  }
}

main()
  .catch(e => {
    console.error('Fatal Script Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
