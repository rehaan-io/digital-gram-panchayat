#!/bin/bash
# Database Restore Script
# Requires psql to be installed and available in PATH.

if [ -f ../.env ]; then
  export $(cat ../.env | grep DATABASE_URL | xargs)
elif [ -f .env ]; then
  export $(cat .env | grep DATABASE_URL | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not defined."
  exit 1
fi

if [ -z "$1" ]; then
  echo "Usage: ./db-restore.sh <path_to_backup_file.sql>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file '$BACKUP_FILE' does not exist."
  exit 1
fi

echo "Restoring database from $BACKUP_FILE..."
psql "$DATABASE_URL" -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Database successfully restored from $BACKUP_FILE."
else
  echo "Error: Database restore failed."
  exit 1
fi
