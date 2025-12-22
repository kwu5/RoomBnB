#!/bin/bash

# Database Backup Script
# Run this on your EC2 server to backup the PostgreSQL database

set -e

BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/roombnb_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🗄️  Creating database backup..."

# Create backup
cd ~/RoomBnB
docker-compose exec -T postgres pg_dump -U roombnb roombnb > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

# Get file size
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo "✅ Backup created: $BACKUP_FILE ($SIZE)"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "roombnb_backup_*.sql.gz" -mtime +7 -delete
echo "🧹 Cleaned up old backups (keeping last 7 days)"

# Optional: Upload to S3 (uncomment if you have AWS CLI configured)
# aws s3 cp "$BACKUP_FILE" s3://your-backup-bucket/roombnb/

echo ""
echo "To restore this backup, run:"
echo "  gunzip -c $BACKUP_FILE | docker-compose exec -T postgres psql -U roombnb roombnb"
