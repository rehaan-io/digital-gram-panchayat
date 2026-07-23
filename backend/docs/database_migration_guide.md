# GGP Digital Panchayat Portal - Database Migration & Portability Guide

This guide details the strategy, scripts, and workflows to migrate, backup, restore, and maintain the PostgreSQL database for the Gorantla Grama Panchayat (GGP) digital portal. The application is designed to be fully portable across different database providers (such as Neon, Supabase, AWS RDS, GCP Cloud SQL, VPS PostgreSQL, or self-hosted servers).

---

## 🏗️ 1. Database Portability Architecture

To ensure the system remains cloud-agnostic and easy to migrate, the database layer follows these principles:
1. **Environment-Driven Configuration**: No connection credentials or provider-specific flags are hardcoded. The connection string is completely driven by the `DATABASE_URL` variable in the `backend/.env` file.
2. **Idempotent Seeds**: The seed script [seed.ts](file:///C:/Users/rehaa/OneDrive/Desktop/scratch/digital-gram-panchayat/backend/prisma/seed.ts) uses Prisma `upsert` and row checks. It can be run multiple times safely without recreating records or creating duplicates.
3. **Data Separation**: Default application configuration data (Panchayat statistics, officials directories, module section parameters, lookup values, and default admin/employee accounts) is separated from dynamic user-generated data (citizens, complaints, comments, notifications, and uploaded ticket attachments). Seed operations will **never** modify or overwrite active citizen complaints or uploads.

---

## 🛠️ 2. Scripts Reference

Four helper scripts are provided in the `backend/scripts/` directory to automate backup and restore operations:

### Unix/Linux/macOS Shell Scripts
* **Backup Script**: [db-backup.sh](file:///C:/Users/rehaa/OneDrive/Desktop/scratch/digital-gram-panchayat/backend/scripts/db-backup.sh)
  * Usage: `./scripts/db-backup.sh`
  * Action: Generates a compressed `.sql` dump in the `backend/backups/` directory using `pg_dump`.
* **Restore Script**: [db-restore.sh](file:///C:/Users/rehaa/OneDrive/Desktop/scratch/digital-gram-panchayat/backend/scripts/db-restore.sh)
  * Usage: `./scripts/db-restore.sh <path_to_sql_file>`
  * Action: Restores tables and records from a SQL dump using `psql`.

### Windows Batch Scripts
* **Backup Script**: [db-backup.bat](file:///C:/Users/rehaa/OneDrive/Desktop/scratch/digital-gram-panchayat/backend/scripts/db-backup.bat)
  * Usage: `.\scripts\db-backup.bat`
* **Restore Script**: [db-restore.bat](file:///C:/Users/rehaa/OneDrive/Desktop/scratch/digital-gram-panchayat/backend/scripts/db-restore.bat)
  * Usage: `.\scripts\db-restore.bat <path_to_sql_file>`

---

## 🔄 3. Core Workflows

### Workflow A: Initial Database Setup (Fresh Provider)
When deploying the application to a completely new, empty database:
1. Open the [backend/.env](file:///C:/Users/rehaa/OneDrive/Desktop/scratch/digital-gram-panchayat/backend/.env) file and update the `DATABASE_URL` to point to the new empty instance.
2. Run database migrations to construct the table schemas:
   ```bash
   npx prisma migrate deploy
   ```
3. Run the seed script to populate default administrative statistics, official registries, and section settings:
   ```bash
   npx prisma db seed
   ```

### Workflow B: Routine Database Backups
To take a snapshot of the live database (e.g. for offline backups or before updates):
1. Navigate to the `backend` directory.
2. Run the backup command:
   * **Windows**: `.\scripts\db-backup.bat`
   * **macOS/Linux**: `./scripts/db-backup.sh`
3. A file named `backup_YYYYMMDD_HHMMSS.sql` will be saved under the `backend/backups/` folder.

### Workflow C: Database Restore (Disaster Recovery)
To recover from data loss or reset to a previous point-in-time snapshot:
1. Identify the backup file under `backend/backups/`.
2. Run the restore command:
   * **Windows**: `.\scripts\db-restore.bat .\backups\backup_example.sql`
   * **macOS/Linux**: `./scripts/db-restore.sh ./backups/backup_example.sql`

---

## 🚀 4. Provider Migration Strategy (Neon ⇄ Supabase ⇄ RDS)

To move the entire live system from one provider (e.g. Neon) to another (e.g. Supabase or AWS RDS) with zero data loss and no manual record recreation:

### Step 1: Export Live Data
Run the backup script on your existing connection to dump all schemas and records:
```bash
.\scripts\db-backup.bat
```
*(This produces the `backups/backup_YYYYMMDD_HHMMSS.sql` dump file).*

### Step 2: Configure the Target Provider
1. Set up a PostgreSQL instance on your target hosting platform (e.g., create a new project in Supabase or RDS database).
2. Obtain the connection string (with SSL mode enabled if required).
3. Open [backend/.env](file:///C:/Users/rehaa/OneDrive/Desktop/scratch/digital-gram-panchayat/backend/.env) and update the `DATABASE_URL` to the new target connection string.

### Step 3: Deploy Schema Migrations
Deploy the database schema to the new target database instance to ensure tables are created:
```bash
npx prisma migrate deploy
```

### Step 4: Import Backup Records
Restore the data from the exported backup file to the target database:
```bash
.\scripts\db-restore.bat .\backups\backup_YYYYMMDD_HHMMSS.sql
```
*(This restores all user accounts, active complaints, leaves, and notifications into the target database).*

### Step 5: Sync Default Settings & Lookup Data
Run the idempotent seed script. Since it uses `upsert`, it will safely synchronize any updated default metadata (Panchayat statistics, directories, homepage sections) without creating duplicates or overwriting user-generated tickets:
```bash
npx prisma db seed
```
Your migration is now complete, and the application can be safely restarted to point to the new provider!
