# Quick Start Guide

Get your e-learning platform up and running in 10 minutes!

---

## Option 1: Local Development (Recommended for Testing)

### Step 1: Install Prerequisites
- Node.js 20+ ([Download](https://nodejs.org/))
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop/))

### Step 2: Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd tech-blog

# Install dependencies
npm install
```

### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env (use default values for local dev)
# No changes needed for quick start!
```

### Step 4: Start Database
```bash
# Start PostgreSQL in Docker
npm run docker:up

# Wait 10 seconds for PostgreSQL to start
```

### Step 5: Set Up Database
```bash
# Run migrations to create tables
npm run db:migrate
```

### Step 6: Start Application
```bash
# Start development server
npm run dev
```

### Step 7: Open Browser
Navigate to: **http://localhost:3000**

**That's it!** Your e-learning platform is now running locally.

---

## Option 2: Full Docker Stack

### Step 1: Prerequisites
- Docker Desktop installed and running

### Step 2: Clone and Configure
```bash
git clone <your-repo-url>
cd tech-blog
cp .env.example .env
```

### Step 3: Start Everything
```bash
# Build and start all containers
docker-compose build
docker-compose up -d

# Wait 30 seconds for everything to start
```

### Step 4: Run Migrations
```bash
docker-compose exec app npx prisma migrate deploy
```

### Step 5: Open Browser
Navigate to: **http://localhost:3000**

---

## Option 3: VPS Production Deployment

### Prerequisites
- VPS server (Ubuntu 20.04+)
- Domain name (optional)
- SSH access to VPS

### Quick Deploy
```bash
# Set your VPS details
export VPS_HOST=1.2.3.4
export VPS_USER=root
export DOMAIN_NAME=yourdomain.com

# Run deployment script
npm run deploy:vps
```

Follow the prompts. The script will:
1. Upload files to VPS
2. Install Docker and dependencies
3. Configure environment
4. Build and start containers
5. Set up Nginx
6. Optionally configure SSL

For detailed instructions, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

---

## What's Included?

After starting, you'll have:

- **Home Page** (/) - Latest blog posts and popular content
- **Blog** (/blog/[category]/[slug]) - MDX-based blog posts
- **Courses** (/courses) - Course catalog
- **Course Player** (/courses/[id]/[lecture]) - Video lectures
- **About** (/about) - About page
- **API** (/api/*) - REST API endpoints

---

## Test Features

### 1. Browse Courses
Visit: http://localhost:3000/courses

Available courses:
- ABAP Beginner Course
- ABAP CDS
- UI5 Development
- BTP Introduction
- And more!

### 2. Read Blog Posts
Visit: http://localhost:3000

Click on any blog post to read. View counts are automatically tracked!

### 3. Subscribe to Newsletter
Scroll to footer, enter email, and click "Subscribe"

### 4. Toggle Dark Mode
Click the moon/sun icon in the navigation bar

---

## Common Commands

### View Logs
```bash
# Application logs
npm run docker:logs

# Or if running with npm run dev
# Check terminal output
```

### Stop Everything
```bash
# Stop Docker containers
npm run docker:down

# Or press Ctrl+C if running npm run dev
```

### Restart
```bash
# Restart Docker containers
npm run docker:restart

# Or restart dev server
npm run dev
```

### Database Management
```bash
# Open Prisma Studio (Database GUI)
npm run db:studio

# Create backup
npm run db:backup

# Connect to database
docker-compose exec postgres psql -U techblog -d techblog
```

---

## Next Steps

### 1. Add Your Content

**Add a blog post:**
```bash
# Create new MDX file
touch src/app/blog/contents/my-first-post.mdx
```

Add frontmatter:
```yaml
---
title: "My First Post"
publishedAt: "2026-02-04"
summary: "This is my first blog post"
category: "Tutorial"
---

# Hello World!

This is my first post on the platform.
```

Visit: http://localhost:3000/blog/Tutorial/my-first-post

### 2. Customize Styling

Edit Tailwind config:
```bash
# Edit colors, fonts, etc.
nano tailwind.config.ts
```

### 3. Update Course Data

Edit course list:
```bash
# For now, courses are hardcoded
nano src/app/courses/page.tsx
```

### 4. Set Up Database Models for Courses

Follow [ARCHITECTURE.md](./ARCHITECTURE.md) to add database models for dynamic course management.

---

## Troubleshooting

### "Cannot connect to database"
```bash
# Make sure PostgreSQL is running
docker-compose ps postgres

# Restart if needed
docker-compose restart postgres
```

### "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
APP_PORT=3001
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### "Prisma client not generated"
```bash
# Generate Prisma client
npx prisma generate
```

---

## Getting Help

- **Architecture Documentation:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Migration Guide:** [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Development Guidelines:** [claude.md](./claude.md)
- **Full README:** [README.md](./README.md)

---

## Quick Reference

### URLs (Local Development)
- Application: http://localhost:3000
- Prisma Studio: http://localhost:5555 (run `npm run db:studio`)

### Default Credentials (Local)
- Database User: `techblog`
- Database Password: `techblog_password` (from .env.example)
- Database Name: `techblog`

### File Locations
- Blog Posts: `src/app/blog/contents/`
- Course Data: `src/app/courses/page.tsx`
- Database Schema: `prisma/schema.prisma`
- Environment: `.env`

---

**You're all set!** Start building your e-learning platform! 🚀

 Quick Reference Commands

  # Start PostgreSQL container
  docker compose up -d postgres

  # Check container status
  docker compose ps

  # View logs
  docker compose logs postgres

  # Stop container
  docker compose stop postgres

  # Access PostgreSQL CLI
  docker exec -it techblog-postgres psql -U techblog -d techblog

  # Run migrations
  npm exec -- prisma migrate dev

  # Start Next.js dev server
  npm run dev