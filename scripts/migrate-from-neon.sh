#!/bin/bash

# Migration script from Neon to local PostgreSQL Docker instance
# This script helps migrate data from Neon database to Docker PostgreSQL

set -e

echo "================================================"
echo "E-Learning Platform - Database Migration Script"
echo "Migrating from Neon to Docker PostgreSQL"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create a .env file based on .env.example"
    exit 1
fi

# Load environment variables
source .env

# Neon database URL (old)
NEON_DATABASE_URL="postgresql://my-personal-site_owner:npg_szOt4pqKZ6hr@ep-young-mud-a9pbietm-pooler.gwc.azure.neon.tech/my-personal-site?sslmode=require"

echo -e "${YELLOW}Step 1: Export data from Neon database${NC}"
echo "Exporting schema and data..."

# Export schema and data from Neon
pg_dump "$NEON_DATABASE_URL" \
    --file=./backup/neon_backup_$(date +%Y%m%d_%H%M%S).sql \
    --clean \
    --if-exists \
    --verbose

echo -e "${GREEN}✓ Data exported successfully${NC}"

echo -e "${YELLOW}Step 2: Start Docker PostgreSQL container${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

# Start PostgreSQL container
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Check PostgreSQL health
until docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-techblog}; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

echo -e "${GREEN}✓ PostgreSQL container is ready${NC}"

echo -e "${YELLOW}Step 3: Run Prisma migrations on new database${NC}"

# Update DATABASE_URL to point to Docker PostgreSQL
export DATABASE_URL="postgresql://${POSTGRES_USER:-techblog}:${POSTGRES_PASSWORD:-techblog_password}@localhost:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-techblog}?schema=public"

# Run Prisma migrations
npx prisma migrate deploy

echo -e "${GREEN}✓ Migrations applied successfully${NC}"

echo -e "${YELLOW}Step 4: Import data to Docker PostgreSQL${NC}"

# Get the latest backup file
LATEST_BACKUP=$(ls -t ./backup/neon_backup_*.sql | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo -e "${RED}Error: No backup file found${NC}"
    exit 1
fi

echo "Importing from: $LATEST_BACKUP"

# Import data to Docker PostgreSQL
docker-compose exec -T postgres psql -U ${POSTGRES_USER:-techblog} -d ${POSTGRES_DB:-techblog} < "$LATEST_BACKUP"

echo -e "${GREEN}✓ Data imported successfully${NC}"

echo -e "${YELLOW}Step 5: Verify data migration${NC}"

# Check row counts
echo "Checking data..."
docker-compose exec -T postgres psql -U ${POSTGRES_USER:-techblog} -d ${POSTGRES_DB:-techblog} -c "
    SELECT 'User' as table_name, COUNT(*) as row_count FROM \"User\"
    UNION ALL
    SELECT 'Blog', COUNT(*) FROM \"Blog\"
    UNION ALL
    SELECT 'Subscriber', COUNT(*) FROM \"Subscriber\";
"

echo -e "${GREEN}✓ Migration verification complete${NC}"

echo ""
echo "================================================"
echo -e "${GREEN}Migration completed successfully!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Update your .env file to use the new DATABASE_URL"
echo "2. Test your application with: npm run dev"
echo "3. Once verified, you can decommission the Neon database"
echo ""
echo "New DATABASE_URL:"
echo "DATABASE_URL=postgresql://${POSTGRES_USER:-techblog}:${POSTGRES_PASSWORD:-techblog_password}@localhost:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-techblog}?schema=public"
echo ""
