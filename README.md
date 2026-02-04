# E-Learning Platform (tech-blog)

A modern, full-stack e-learning platform built with Next.js 15, featuring course management, blog publishing, and newsletter subscriptions.

**Author:** Arun Krishnamoorthy
**Version:** 0.1.0
**Status:** In Development

---

## Features

### Current Features
- **Course Catalog** - Browse 10 SAP-focused courses (ABAP, UI5, BTP, CAP)
- **Course Player** - Watch video lectures with integrated YouTube player
- **Blog System** - MDX-based blog posts with syntax highlighting
- **View Tracking** - Automatic view counting for popular content
- **Newsletter** - Email subscription system
- **Dark Mode** - Theme toggle with persistence
- **Responsive Design** - Mobile-first responsive layout

### Planned Features
- User authentication and authorization
- Course enrollment and progress tracking
- Persistent comment system
- Quiz and assessment functionality
- Course completion certificates
- Admin dashboard for content management

---

## Technology Stack

### Core
- **Framework:** Next.js 15.3.3 (App Router, React Server Components)
- **Language:** TypeScript 5
- **Runtime:** Node.js 20+

### Frontend
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Components:** Radix UI primitives
- **Icons:** Lucide React
- **Theme:** next-themes (dark mode support)

### Backend
- **Database:** PostgreSQL 16
- **ORM:** Prisma 6.8.2
- **Data Fetching:** SWR 2.3.3
- **Validation:** Zod 3.25.51

### Content
- **Format:** MDX (Markdown + JSX)
- **Parsing:** gray-matter
- **Syntax Highlighting:** sugar-high

### DevOps
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (reverse proxy)
- **SSL:** Let's Encrypt (Certbot)
- **Process Manager:** PM2

---

## Quick Start

### Prerequisites
- Node.js 20+ and npm
- Docker Desktop (for local development with PostgreSQL)
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd tech-blog
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start Docker PostgreSQL:**
```bash
npm run docker:up
```

5. **Run database migrations:**
```bash
npm run db:migrate
```

6. **Start development server:**
```bash
npm run dev
```

7. **Open your browser:**
```
http://localhost:3000
```

For detailed quick start instructions, see [QUICK_START.md](./QUICK_START.md)

---

## Available Scripts

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test            # Run tests with Jest
```

### Docker
```bash
npm run docker:up       # Start all Docker containers
npm run docker:down     # Stop all Docker containers
npm run docker:build    # Build Docker images
npm run docker:logs     # View application logs
npm run docker:restart  # Restart Docker containers
```

### Database
```bash
npm run db:migrate         # Run migrations (development)
npm run db:migrate:deploy  # Run migrations (production)
npm run db:push           # Push schema changes
npm run db:studio         # Open Prisma Studio
npm run db:backup         # Create database backup
```

### Deployment
```bash
npm run migrate:from-neon  # Migrate from Neon to Docker PostgreSQL
npm run deploy:vps        # Deploy to VPS server
```

---

## Project Structure

```
tech-blog/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Home page
│   │   ├── about/             # About page
│   │   ├── blog/              # Blog system
│   │   │   ├── contents/      # MDX blog posts
│   │   │   └── [category]/[slug]/
│   │   ├── courses/           # Course pages
│   │   │   ├── page.tsx       # Course listing
│   │   │   └── [courseId]/    # Course details & lectures
│   │   └── api/               # API routes
│   │       ├── count/         # View tracking
│   │       └── posts/popular/ # Popular posts
│   ├── components/            # React components
│   │   ├── ui/               # UI primitives (shadcn)
│   │   ├── Container.tsx     # Layout wrapper
│   │   ├── Footer.tsx        # Footer with newsletter
│   │   ├── Header.tsx        # Page header
│   │   ├── MainNav.tsx       # Navigation
│   │   └── mdx.tsx           # MDX renderer
│   ├── db/                   # Database client
│   │   └── index.ts          # Prisma client setup
│   └── lib/                  # Utilities
│       ├── actions.ts        # Server actions
│       └── utils.ts          # Helper functions
├── prisma/
│   └── schema.prisma         # Database schema
├── scripts/                  # Deployment & utility scripts
├── nginx/                    # Nginx configuration
├── public/                   # Static assets
├── docker-compose.yml        # Docker orchestration
├── Dockerfile               # Application container
├── ARCHITECTURE.md          # Architecture documentation
├── MIGRATION_GUIDE.md       # Migration guide
└── claude.md                # Claude Code guidelines
```

---

## Database Schema

### Current Models

#### User
```prisma
model User {
  id    Int     @id @default(autoincrement())
  name  String? @db.VarChar(255)
  email String  @unique @db.VarChar(255)
}
```

#### Blog
```prisma
model Blog {
  id         Int      @id @default(autoincrement())
  slug       String   @unique
  title      String
  category   String
  view_count Int      @default(1)
  updateAt   DateTime @default(now())
}
```

#### Subscriber
```prisma
model Subscriber {
  id            Int     @id @default(autoincrement())
  email         String
  is_subscribed Boolean @default(true)
}
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Comprehensive architecture documentation
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migration from Neon to Docker PostgreSQL
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [claude.md](./claude.md) - Guidelines for Claude Code development

---

## Deployment

### Docker Deployment (Local/VPS)

1. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with production values
```

2. **Build and start:**
```bash
docker-compose build
docker-compose up -d
```

3. **Run migrations:**
```bash
docker-compose exec app npx prisma migrate deploy
```

### VPS Deployment

See detailed instructions in [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

**Quick deployment:**
```bash
export VPS_HOST=your-vps-ip
export VPS_USER=root
export DOMAIN_NAME=yourdomain.com

npm run deploy:vps
```

---

## Roadmap

### Phase 1: Core Features (Current)
- [x] Blog system with MDX
- [x] View counting
- [x] Newsletter subscription
- [x] Dark mode
- [x] Course listing

### Phase 2: Database Migration (In Progress)
- [x] Docker PostgreSQL setup
- [x] Migration scripts
- [x] VPS deployment configuration
- [ ] Data migration from Neon
- [ ] Production deployment

### Phase 3: Authentication & Enrollment
- [ ] User authentication (NextAuth.js)
- [ ] User profiles
- [ ] Course enrollment
- [ ] Progress tracking

### Phase 4: Enhanced Features
- [ ] Persistent comments
- [ ] Quiz system
- [ ] Certificates
- [ ] Admin panel

---

## License

This project is private and proprietary.

---

## Contact

**Developer:** Arun Krishnamoorthy
**Project:** E-Learning Platform (tech-blog)
**Version:** 0.1.0

---

**Built with ❤️ using Next.js 15, React 19, and TypeScript**