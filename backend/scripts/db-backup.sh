#!/bin/bash
# Database Backup Script
# Requires pg_dump to be installed and available in PATH.

if [ -f ../.env ]; then
  # Load env variables including DATABASE_URL
  export $(cat ../.env | grep DATABASE_URL | xargs)
elif [ -f .env ]; then
  export $(cat .env | grep DATABASE_URL | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not defined."
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "Backing up database to $BACKUP_FILE..."
pg_dump "$DATABASE_URL" --no-owner --no-acl > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup successfully completed: $BACKUP_FILE"
else
  echo "Error: Database backup failed."
  exit 1
fi
