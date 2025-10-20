#!/bin/bash

# Automated Backup Script for Fongo AI Agent
# This script creates daily backups of the database and logs

# Configuration
BACKUP_DIR="/var/www/nucleusai/backups"
DB_PATH="/var/www/nucleusai/database/calls.db"
LOG_DIR="/root/.pm2/logs"
RETENTION_DAYS=7
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$BACKUP_DIR/backup.log"
}

log_message "Starting automated backup process..."

# Create database backup
if [ -f "$DB_PATH" ]; then
    DB_BACKUP="$BACKUP_DIR/calls-db-$TIMESTAMP.db"
    cp "$DB_PATH" "$DB_BACKUP"
    
    if [ $? -eq 0 ]; then
        log_message "Database backup created: $(basename "$DB_BACKUP")"
        
        # Compress the backup
        gzip "$DB_BACKUP"
        log_message "Database backup compressed: $(basename "$DB_BACKUP.gz")"
    else
        log_message "ERROR: Failed to create database backup"
        exit 1
    fi
else
    log_message "WARNING: Database file not found at $DB_PATH"
fi

# Create logs backup
LOG_BACKUP="$BACKUP_DIR/logs-$TIMESTAMP.tar.gz"
if [ -d "$LOG_DIR" ]; then
    tar -czf "$LOG_BACKUP" -C "$LOG_DIR" .
    if [ $? -eq 0 ]; then
        log_message "Logs backup created: $(basename "$LOG_BACKUP")"
    else
        log_message "ERROR: Failed to create logs backup"
    fi
else
    log_message "WARNING: Logs directory not found at $LOG_DIR"
fi

# Create application files backup (excluding node_modules)
APP_BACKUP="$BACKUP_DIR/app-$TIMESTAMP.tar.gz"
cd /var/www/nucleusai
tar -czf "$APP_BACKUP" \
    --exclude='node_modules' \
    --exclude='backups' \
    --exclude='*.log' \
    --exclude='database/*.db' \
    .

if [ $? -eq 0 ]; then
    log_message "Application backup created: $(basename "$APP_BACKUP")"
else
    log_message "ERROR: Failed to create application backup"
fi

# Cleanup old backups
log_message "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.gz" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.db" -type f -mtime +$RETENTION_DAYS -delete

# Count remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "*.gz" -type f | wc -l)
log_message "Backup process completed. $BACKUP_COUNT backup files remaining."

# Send backup status to application (optional)
curl -s -X POST "http://localhost:3000/monitoring/backup" \
    -H "Content-Type: application/json" \
    -d "{\"timestamp\":\"$(date -Iseconds)\",\"status\":\"completed\",\"count\":$BACKUP_COUNT}" \
    > /dev/null 2>&1 || true

log_message "Automated backup process finished successfully."
