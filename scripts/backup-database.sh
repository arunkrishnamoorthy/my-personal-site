#!/bin/bash

# Database backup script
# Creates backups of PostgreSQL database

set -e

echo "================================================"
echo "E-Learning Platform - Database Backup"
echo "================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create backup directory
BACKUP_DIR="./backup"
mkdir -p $BACKUP_DIR

# Timestamp for backup file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/database_backup_$TIMESTAMP.sql"

# Load environment variables
if [ -f .env ]; then
    source .env
fi

POSTGRES_USER=${POSTGRES_USER:-techblog}
POSTGRES_DB=${POSTGRES_DB:-techblog}

echo -e "${YELLOW}Creating database backup...${NC}"

# Create backup using docker-compose
docker-compose exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo -e "${GREEN}✓ Backup created: ${BACKUP_FILE}.gz${NC}"

# List all backups
echo ""
echo "Available backups:"
ls -lh $BACKUP_DIR/*.gz

# Keep only last 10 backups
echo ""
echo "Cleaning old backups (keeping last 10)..."
ls -t $BACKUP_DIR/*.gz | tail -n +11 | xargs -r rm
echo -e "${GREEN}✓ Cleanup complete${NC}"
