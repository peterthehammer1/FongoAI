#!/bin/bash

# Setup Automated Backups for Fongo AI Agent
# This script sets up cron jobs for automated backups

echo "🔧 Setting up automated backup system for Fongo AI Agent..."

# Make backup script executable
chmod +x /var/www/nucleusai/scripts/backup.sh

# Create backup directory
mkdir -p /var/www/nucleusai/backups

# Add cron job for daily backups at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/nucleusai/scripts/backup.sh >> /var/log/nucleusai-backup.log 2>&1") | crontab -

# Add cron job for weekly cleanup on Sundays at 3 AM
(crontab -l 2>/dev/null; echo "0 3 * * 0 /var/www/nucleusai/scripts/backup.sh cleanup >> /var/log/nucleusai-backup.log 2>&1") | crontab -

# Create log directory for backup logs
mkdir -p /var/log/nucleusai

# Set proper permissions
chown -R root:root /var/www/nucleusai/backups
chown -R root:root /var/log/nucleusai

echo "✅ Automated backup system configured!"
echo ""
echo "📋 Backup Schedule:"
echo "   • Daily backups: 2:00 AM"
echo "   • Weekly cleanup: Sunday 3:00 AM"
echo "   • Retention: 7 days"
echo ""
echo "📁 Backup locations:"
echo "   • Database: /var/www/nucleusai/backups/"
echo "   • Logs: /var/log/nucleusai-backup.log"
echo ""
echo "🔍 To view cron jobs: crontab -l"
echo "📊 To monitor backups: Visit /monitoring in the dashboard"
echo ""
echo "🧪 Test backup manually:"
echo "   /var/www/nucleusai/scripts/backup.sh"
