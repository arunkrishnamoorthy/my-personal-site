#!/bin/bash

# Video Backup Script
# Creates incremental backups of video content

set -e  # Exit on error

# Configuration
BACKUP_DIR="${HOME}/backups/videos"
SOURCE_DIR="${VIDEO_STORAGE_PATH:-/var/www/videos}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup-${DATE}"
KEEP_DAYS=7  # Keep backups for 7 days

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "======================================"
echo "Video Backup Script"
echo "======================================"
echo ""

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}✗ Error: Source directory not found: $SOURCE_DIR${NC}"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Calculate source size
SOURCE_SIZE=$(du -sh "$SOURCE_DIR" | cut -f1)
echo -e "${YELLOW}📹 Source:${NC} $SOURCE_DIR ($SOURCE_SIZE)"
echo -e "${YELLOW}💾 Backup:${NC} $BACKUP_DIR/$BACKUP_NAME"
echo ""

# Check available disk space
AVAILABLE=$(df -h "$BACKUP_DIR" | tail -1 | awk '{print $4}')
echo -e "${YELLOW}💿 Available space:${NC} $AVAILABLE"
echo ""

# Confirm backup
read -p "Continue with backup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Backup cancelled."
    exit 0
fi

echo ""
echo "Starting backup..."
echo ""

# Create backup using rsync
rsync -avz --progress \
  --exclude="*.txt" \
  --exclude="keyinfo.txt" \
  "$SOURCE_DIR/" \
  "$BACKUP_DIR/$BACKUP_NAME/" 2>&1 | while IFS= read -r line; do
    # Filter out verbose rsync output, show only important lines
    if [[ $line =~ ^(sent|total|speedup) ]] || [[ $line =~ / ]]; then
        echo "$line"
    fi
done

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Backup completed successfully!${NC}"

    # Show backup size
    BACKUP_SIZE=$(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
    echo -e "${GREEN}  Size:${NC} $BACKUP_SIZE"
    echo -e "${GREEN}  Location:${NC} $BACKUP_DIR/$BACKUP_NAME"
else
    echo -e "${RED}✗ Backup failed!${NC}"
    exit 1
fi

echo ""
echo "Cleaning up old backups (older than $KEEP_DAYS days)..."

# Remove old backups
find "$BACKUP_DIR" -type d -name "backup-*" -mtime +$KEEP_DAYS -exec rm -rf {} \; 2>/dev/null || true

# List remaining backups
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR" | grep "^d" | grep "backup-" | awk '{print "  " $9 " (" $5 ")"}'

echo ""
echo "======================================"
echo "Backup Complete!"
echo "======================================"
