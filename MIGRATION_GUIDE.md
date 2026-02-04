# Migration Guide: Neon to Docker PostgreSQL + VPS Deployment

This guide walks you through migrating your e-learning platform from Neon database to Docker PostgreSQL and deploying to a VPS server instead of Vercel.

**Author:** Arun Krishnamoorthy
**Date:** 2026-02-04
**Estimated Time:** 2-3 hours

---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Local Development Setup](#phase-1-local-development-setup)
4. [Phase 2: Database Migration](#phase-2-database-migration)
5. [Phase 3: VPS Deployment](#phase-3-vps-deployment)
6. [Phase 4: Post-Deployment](#phase-4-post-deployment)
7. [Rollback Plan](#rollback-plan)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What's Changing?
- **Database:** Neon PostgreSQL → Docker PostgreSQL
- **Hosting:** Vercel → VPS (Virtual Private Server)
- **Deployment:** Git push → Docker Compose

### Benefits
1. Full control over database and infrastructure
2. No vendor lock-in
3. Cost predictability
4. Better for learning and experimentation
5. Consistent development and production environments

### Architecture Comparison

**Before (Current):**
```
┌─────────────┐     ┌──────────────┐
│   Vercel    │────▶│ Neon DB      │
│  (Next.js)  │     │ (PostgreSQL) │
└─────────────┘     └──────────────┘
```

**After (New):**
```
┌─────────────┐
│     VPS     │
│  ┌───────┐  │
│  │ Nginx │  │ ◀── HTTPS
│  └───┬───┘  │
│      │      │
│  ┌───▼───┐  │
│  │  App  │  │ (Docker Container - Next.js)
│  └───┬───┘  │
│      │      │
│  ┌───▼───┐  │
│  │ PostgreSQL│ (Docker Container)
│  └───────┘  │
└─────────────┘
```

---

## Prerequisites

### Required Software
- [ ] Docker Desktop installed and running
- [ ] Docker Compose (included with Docker Desktop)
- [ ] Node.js 20+ and npm
- [ ] Git
- [ ] PostgreSQL client tools (`pg_dump`, `psql`)
- [ ] SSH client (for VPS access)

### VPS Requirements
- [ ] Ubuntu 20.04+ or Debian 11+ server
- [ ] At least 2GB RAM (4GB recommended)
- [ ] 20GB disk space (40GB+ recommended)
- [ ] Root or sudo access
- [ ] Public IP address
- [ ] Domain name (optional but recommended)

### Install PostgreSQL Client Tools

**macOS:**
```bash
brew install postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql-client
```

**Windows:**
Download from: https://www.postgresql.org/download/windows/

---

## Phase 1: Local Development Setup

### Step 1.1: Backup Current Database

Before making any changes, create a backup of your Neon database:

```bash
# Create backup directory
mkdir -p backup

# Export current database
pg_dump "postgresql://my-personal-site_owner:npg_szOt4pqKZ6hr@ep-young-mud-a9pbietm-pooler.gwc.azure.neon.tech/my-personal-site?sslmode=require" \
  --file=./backup/neon_backup_$(date +%Y%m%d_%H%M%S).sql \
  --clean \
  --if-exists

echo "Backup created successfully!"
```

**Important:** Keep this backup safe. You'll need it for migration and as a rollback option.

### Step 1.2: Set Up Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and configure for local Docker:
```bash
# Database Configuration
POSTGRES_USER=techblog
POSTGRES_PASSWORD=your_secure_local_password
POSTGRES_DB=techblog
POSTGRES_PORT=5432

# Database URL for Prisma (local Docker)
DATABASE_URL=postgresql://techblog:your_secure_local_password@localhost:5432/techblog?schema=public

# Application
NODE_ENV=development
APP_PORT=3000
DOMAIN_NAME=http://localhost:3000
```

**Security Note:** Use a strong password for `POSTGRES_PASSWORD`. Generate one:
```bash
openssl rand -base64 32
```

### Step 1.3: Start Docker PostgreSQL

Start the PostgreSQL container:

```bash
# Start only PostgreSQL (not the app yet)
docker-compose up -d postgres

# Check if it's running
docker-compose ps

# View logs
docker-compose logs postgres
```

Wait for PostgreSQL to be ready (about 10-15 seconds).

### Step 1.4: Verify PostgreSQL Connection

Test the connection:

```bash
# Using docker-compose
docker-compose exec postgres psql -U techblog -d techblog -c "SELECT version();"

# Or using local psql client
psql "postgresql://techblog:your_secure_local_password@localhost:5432/techblog" -c "SELECT version();"
```

You should see PostgreSQL version information.

---

## Phase 2: Database Migration

### Step 2.1: Apply Prisma Schema to New Database

Run Prisma migrations on the new Docker PostgreSQL:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or use migrations (recommended for production)
npx prisma migrate dev --name initial_migration
```

Verify the schema:
```bash
npx prisma studio
```

This opens Prisma Studio at http://localhost:5555 where you can see your empty database tables.

### Step 2.2: Import Data from Neon

#### Option A: Using the Migration Script (Recommended)

```bash
# Make script executable
chmod +x scripts/migrate-from-neon.sh

# Run migration script
npm run migrate:from-neon
```

The script will:
1. Export data from Neon
2. Start Docker PostgreSQL
3. Apply Prisma migrations
4. Import data to Docker
5. Verify migration

#### Option B: Manual Migration

1. Get the latest backup file:
```bash
ls -t backup/neon_backup_*.sql | head -n 1
```

2. Import to Docker PostgreSQL:
```bash
docker-compose exec -T postgres psql -U techblog -d techblog < backup/neon_backup_TIMESTAMP.sql
```

### Step 2.3: Verify Data Migration

Check that all data was imported correctly:

```bash
# Connect to database
docker-compose exec postgres psql -U techblog -d techblog

# Inside psql, run:
-- Check table counts
SELECT 'User' as table_name, COUNT(*) FROM "User"
UNION ALL
SELECT 'Blog', COUNT(*) FROM "Blog"
UNION ALL
SELECT 'Subscriber', COUNT(*) FROM "Subscriber";

-- Sample some data
SELECT * FROM "Blog" ORDER BY view_count DESC LIMIT 5;

-- Exit psql
\q
```

Compare the counts with your Neon database to ensure all data was migrated.

### Step 2.4: Test Application Locally with Docker Database

```bash
# Start development server
npm run dev

# Application should be running at http://localhost:3000
```

**Test the following:**
- [ ] Home page loads correctly
- [ ] Blog posts display with correct view counts
- [ ] Popular posts sidebar works
- [ ] Course pages load
- [ ] Newsletter subscription works
- [ ] View counting increments properly

### Step 2.5: Test Full Docker Stack

```bash
# Stop development server (Ctrl+C)

# Build and start full Docker stack
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs
```

Access the application at http://localhost:3000

If everything works correctly, you're ready for VPS deployment!

---

## Phase 3: VPS Deployment

### Step 3.1: Prepare VPS Server

#### SSH into your VPS:
```bash
ssh root@your-vps-ip
```

#### Update system:
```bash
apt-get update
apt-get upgrade -y
```

#### Install Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Verify installation
docker --version
```

#### Install Docker Compose:
```bash
apt-get install -y docker-compose-plugin

# Verify installation
docker compose version
```

#### Install Nginx:
```bash
apt-get install -y nginx

# Verify installation
nginx -v
```

#### Configure Firewall:
```bash
# Allow SSH (important!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

### Step 3.2: Configure DNS (If Using Domain)

In your domain registrar's DNS settings:

```
A Record:  yourdomain.com      → your-vps-ip
A Record:  www.yourdomain.com  → your-vps-ip
```

Wait 5-10 minutes for DNS propagation. Verify:
```bash
dig yourdomain.com +short
```

### Step 3.3: Deploy Application

#### Option A: Using Deployment Script (Recommended)

From your local machine:

```bash
# Set VPS connection details
export VPS_HOST=your-vps-ip
export VPS_USER=root
export DOMAIN_NAME=yourdomain.com

# Run deployment script
npm run deploy:vps
```

The script will:
1. Package the application
2. Upload to VPS
3. Install dependencies
4. Configure environment
5. Build Docker containers
6. Start services
7. Configure Nginx
8. Optionally set up SSL

#### Option B: Manual Deployment

1. **Create app directory on VPS:**
```bash
ssh root@your-vps-ip "mkdir -p /opt/techblog"
```

2. **Upload application files:**
```bash
rsync -avz --exclude='node_modules' --exclude='.next' --exclude='.git' \
  ./ root@your-vps-ip:/opt/techblog/
```

3. **SSH into VPS and set up:**
```bash
ssh root@your-vps-ip
cd /opt/techblog

# Create .env file
cp .env.example .env
nano .env  # Edit with production values
```

4. **Production .env configuration:**
```bash
POSTGRES_USER=techblog
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
POSTGRES_DB=techblog
POSTGRES_PORT=5432

DATABASE_URL=postgresql://techblog:${POSTGRES_PASSWORD}@postgres:5432/techblog?schema=public

NODE_ENV=production
APP_PORT=3000
DOMAIN_NAME=https://yourdomain.com

NEXT_TELEMETRY_DISABLED=1
```

5. **Build and start containers:**
```bash
# Build application
docker-compose build

# Start PostgreSQL
docker-compose up -d postgres

# Wait for PostgreSQL
sleep 15

# Run migrations
docker-compose run --rm app npx prisma migrate deploy

# Start application
docker-compose up -d app

# Check status
docker-compose ps
docker-compose logs app
```

### Step 3.4: Configure Nginx

1. **Copy Nginx configuration:**
```bash
cp /opt/techblog/nginx/nginx.conf /etc/nginx/sites-available/techblog
```

2. **Update domain name:**
```bash
sed -i 's/yourdomain.com/your-actual-domain.com/g' /etc/nginx/sites-available/techblog
```

3. **For initial setup without SSL, use this simple config:**
```bash
cat > /etc/nginx/sites-available/techblog << 'EOF'
server {
    listen 80;
    server_name your-actual-domain.com www.your-actual-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

4. **Enable site and reload Nginx:**
```bash
ln -sf /etc/nginx/sites-available/techblog /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 3.5: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: yes)

# Verify auto-renewal
certbot renew --dry-run

# Set up automatic renewal
systemctl enable certbot.timer
systemctl start certbot.timer
```

### Step 3.6: Verify Deployment

1. **Check container status:**
```bash
cd /opt/techblog
docker-compose ps
```

All services should be "Up" and healthy.

2. **Check application logs:**
```bash
docker-compose logs --tail=50 app
```

Look for "Ready on port 3000" or similar.

3. **Test endpoints:**
```bash
# Health check
curl http://localhost:3000/api/count

# From your local machine
curl https://yourdomain.com/api/count
```

4. **Access the application:**
Open browser and navigate to:
- http://yourdomain.com (should redirect to HTTPS if SSL is set up)
- https://yourdomain.com

---

## Phase 4: Post-Deployment

### Step 4.1: Import Production Data

If you haven't already imported data during deployment:

```bash
# On VPS
cd /opt/techblog

# Copy your backup file to VPS first
# From local: scp backup/neon_backup_*.sql root@vps-ip:/opt/techblog/backup/

# Import data
docker-compose exec -T postgres psql -U techblog -d techblog < backup/neon_backup_*.sql
```

### Step 4.2: Set Up Automated Backups

1. **Create backup script on VPS:**
```bash
cat > /opt/techblog/backup-cron.sh << 'EOF'
#!/bin/bash
cd /opt/techblog
./scripts/backup-database.sh
EOF

chmod +x /opt/techblog/backup-cron.sh
```

2. **Add to crontab:**
```bash
crontab -e
```

Add this line to run daily backups at 2 AM:
```
0 2 * * * /opt/techblog/backup-cron.sh >> /var/log/techblog-backup.log 2>&1
```

### Step 4.3: Set Up Monitoring

1. **Install monitoring tools:**
```bash
apt-get install -y htop iotop
```

2. **Monitor Docker containers:**
```bash
# Real-time stats
docker stats

# Container health
docker-compose ps
```

3. **Monitor logs:**
```bash
# Application logs
docker-compose logs -f app

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Step 4.4: Configure Log Rotation

```bash
cat > /etc/logrotate.d/techblog << 'EOF'
/opt/techblog/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
EOF
```

### Step 4.5: Update Application Configuration

Update your `.env` on VPS with production values:

```bash
cd /opt/techblog
nano .env
```

Update `DOMAIN_NAME` to your actual domain:
```bash
DOMAIN_NAME=https://yourdomain.com
```

Restart the application:
```bash
docker-compose restart app
```

### Step 4.6: Decommission Neon Database (Optional)

**Only do this after thoroughly testing production!**

1. Create a final backup from Neon
2. Wait at least 1 week to ensure everything works
3. Delete the Neon database from Neon dashboard

---

## Rollback Plan

If something goes wrong, you can quickly rollback:

### Quick Rollback to Neon

1. **Stop Docker containers:**
```bash
docker-compose down
```

2. **Update .env to use Neon:**
```bash
DATABASE_URL=postgresql://my-personal-site_owner:npg_szOt4pqKZ6hr@ep-young-mud-a9pbietm-pooler.gwc.azure.neon.tech/my-personal-site?sslmode=require
```

3. **Deploy to Vercel:**
```bash
# If you still have Vercel configured
vercel --prod

# Or use git push to deploy branch
git push origin main
```

### Restore from Backup

If you need to restore the database:

```bash
# Stop application
docker-compose down

# Remove volumes (destructive!)
docker volume rm techblog_postgres_data

# Start fresh PostgreSQL
docker-compose up -d postgres
sleep 15

# Restore from backup
docker-compose exec -T postgres psql -U techblog -d techblog < backup/neon_backup_TIMESTAMP.sql

# Start application
docker-compose up -d app
```

---

## Troubleshooting

### Issue: Cannot Connect to Database

**Symptoms:**
- "Connection refused" errors
- Application can't start

**Solutions:**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify DATABASE_URL is correct
cat .env | grep DATABASE_URL

# Test connection
docker-compose exec postgres psql -U techblog -d techblog -c "SELECT 1;"
```

### Issue: Application Container Exits Immediately

**Symptoms:**
- App container shows "Exited (1)"
- Logs show errors

**Solutions:**
```bash
# View detailed logs
docker-compose logs app

# Common issues:
# 1. DATABASE_URL incorrect
# 2. Prisma client not generated
# 3. Build errors

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Nginx 502 Bad Gateway

**Symptoms:**
- Browser shows "502 Bad Gateway"

**Solutions:**
```bash
# Check if app is running
docker-compose ps app

# Check app logs
docker-compose logs app

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Verify upstream (should return JSON)
curl http://localhost:3000/api/count

# Restart services
docker-compose restart app
systemctl restart nginx
```

### Issue: SSL Certificate Errors

**Symptoms:**
- "Certificate not valid" errors
- Let's Encrypt fails

**Solutions:**
```bash
# Check DNS is pointing to VPS
dig yourdomain.com +short

# Ensure port 80 is accessible
curl -I http://yourdomain.com

# Remove old certificates and try again
certbot delete --cert-name yourdomain.com
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Issue: Database Migration Fails

**Symptoms:**
- Prisma migrate errors
- Missing tables

**Solutions:**
```bash
# Reset database (DESTRUCTIVE!)
docker-compose down
docker volume rm techblog_postgres_data
docker-compose up -d postgres
sleep 15

# Apply migrations
npx prisma migrate deploy

# Or push schema
npx prisma db push

# Import data
docker-compose exec -T postgres psql -U techblog -d techblog < backup/your_backup.sql
```

### Issue: Application Running Slowly

**Solutions:**
```bash
# Check resource usage
docker stats

# Check VPS resources
htop

# Check database connections
docker-compose exec postgres psql -U techblog -d techblog -c "SELECT count(*) FROM pg_stat_activity;"

# Restart services if needed
docker-compose restart
```

### Issue: Lost Data After Update

**Solutions:**
```bash
# Restore from backup
docker-compose exec -T postgres psql -U techblog -d techblog < backup/database_backup_LATEST.sql

# If backup is compressed
gunzip -c backup/database_backup_LATEST.sql.gz | docker-compose exec -T postgres psql -U techblog -d techblog
```

---

## Maintenance Tasks

### Daily
- [ ] Check application is running: `docker-compose ps`
- [ ] Monitor disk space: `df -h`

### Weekly
- [ ] Review logs: `docker-compose logs --tail=100 app`
- [ ] Check backups: `ls -lh backup/`
- [ ] Verify SSL certificate expiry: `certbot certificates`

### Monthly
- [ ] Update Docker images: `docker-compose pull && docker-compose up -d`
- [ ] Review security updates: `apt-get update && apt-get upgrade`
- [ ] Test restore from backup
- [ ] Review access logs for unusual activity

---

## Useful Commands Reference

### Docker Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f app

# Check status
docker-compose ps

# Rebuild
docker-compose build --no-cache

# Remove everything (CAREFUL!)
docker-compose down -v
```

### Database Management
```bash
# Connect to database
docker-compose exec postgres psql -U techblog -d techblog

# Backup database
npm run db:backup

# Run migrations
npm run db:migrate:deploy

# Open Prisma Studio
npm run db:studio
```

### Application Management
```bash
# View application logs
docker-compose logs -f app

# Restart application
docker-compose restart app

# Execute command in container
docker-compose exec app npm run <command>
```

### Nginx Management
```bash
# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# View access logs
tail -f /var/log/nginx/access.log

# View error logs
tail -f /var/log/nginx/error.log
```

---

## Success Criteria

Your migration is successful when:

- [ ] Application accessible via domain name (HTTP/HTTPS)
- [ ] All pages load correctly
- [ ] Blog posts display with correct data
- [ ] View counting works
- [ ] Newsletter subscription works
- [ ] Database backups running automatically
- [ ] SSL certificate installed and valid
- [ ] No errors in application logs
- [ ] All data migrated from Neon
- [ ] Performance is acceptable (page load < 3s)

---

## Support Resources

### Documentation
- Docker: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Nginx: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/docs/
- Prisma: https://www.prisma.io/docs/

### Internal Documentation
- `ARCHITECTURE.md` - Application architecture
- `claude.md` - Development guidelines
- `README.md` - Project overview

### Logs Location
- Application: `docker-compose logs app`
- PostgreSQL: `docker-compose logs postgres`
- Nginx: `/var/log/nginx/`

---

## Next Steps After Migration

1. **Optimize Performance**
   - Set up CDN for static assets
   - Implement Redis caching
   - Optimize database queries

2. **Enhance Security**
   - Set up fail2ban
   - Configure firewall rules
   - Implement rate limiting
   - Add security headers

3. **Implement Features**
   - User authentication (NextAuth.js)
   - Course enrollment system
   - Progress tracking
   - Admin dashboard

4. **Set Up CI/CD**
   - GitHub Actions for automated deployment
   - Automated testing
   - Database migration automation

---

**Migration Guide Complete**
**Last Updated:** 2026-02-04
**Version:** 1.0.0

For questions or issues, refer to the troubleshooting section or create an issue in the repository.
