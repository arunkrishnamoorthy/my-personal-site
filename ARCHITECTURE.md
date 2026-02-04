# E-Learning Platform - Architecture Documentation

**Project Name:** tech-blog
**Author:** Arun Krishnamoorthy
**Purpose:** E-learning platform for publishing course content and blog posts
**Version:** 0.1.0
**Last Updated:** 2026-02-04

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Database Architecture](#database-architecture)
4. [API Architecture](#api-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Content Management](#content-management)
7. [Data Flow](#data-flow)
8. [Deployment Architecture](#deployment-architecture)
9. [Key Files Reference](#key-files-reference)
10. [Known Limitations](#known-limitations)

---

## Technology Stack

### Core Framework
- **Next.js 15.3.3** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe development

### Database & ORM
- **PostgreSQL** - Database (currently Neon-hosted)
- **Prisma 6.8.2** - ORM for database operations

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **lucide-react** - Icon library
- **next-themes** - Dark mode support

### Content & Data
- **MDX** - Markdown with JSX for blog content
- **gray-matter** - Frontmatter parsing
- **SWR 2.3.3** - Data fetching and caching
- **Zod 3.25.51** - Schema validation

### Development & Deployment
- **ESLint 9** - Code linting
- **Jest 29.7.0** - Testing framework
- **PM2** - Process management
- **Vercel** - Current hosting platform

---

## Project Structure

```
tech-blog/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── about/             # About page
│   │   ├── blog/              # Blog functionality
│   │   │   ├── contents/      # MDX blog posts
│   │   │   ├── utils.ts       # Blog utilities
│   │   │   └── [category]/[slug]/  # Blog post pages
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
├── public/                   # Static assets
├── .env                      # Environment variables
├── ecosystem.config.js       # PM2 configuration
├── package.json              # Dependencies
└── tsconfig.json            # TypeScript config
```

---

## Database Architecture

### Current Database Provider
- **Provider:** PostgreSQL (Neon Azure)
- **Connection:** Azure-hosted Neon pooler
- **URL Pattern:** `postgresql://user:pass@host/database?sslmode=require`

### Database Models

#### User Model
```prisma
model User {
  id    Int     @id @default(autoincrement())
  name  String? @db.VarChar(255)
  email String  @unique @db.VarChar(255)
}
```
- Stores user information
- Currently unused (no authentication implemented)

#### Blog Model
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
- Tracks blog post metadata
- Implements view counting system
- Slug used as unique identifier

#### Subscriber Model
```prisma
model Subscriber {
  id            Int     @id @default(autoincrement())
  email         String
  is_subscribed Boolean @default(true)
}
```
- Newsletter subscription management
- Email collection for updates

### Database Client Pattern
Location: `src/db/index.ts`

```typescript
// Cached Prisma client for serverless optimization
const prismaClientSingleton = () => {
  return new PrismaClient()
}
```

---

## API Architecture

### API Routes

#### 1. View Count API (`/api/count`)

**GET Request:**
- Purpose: Fetch all blogs with view counts
- Response: Array of blog entries
- Used by: Analytics and reporting

**POST Request:**
- Purpose: Track blog post views
- Body: `{ slug: string, title: string, category: string }`
- Logic:
  - Check if blog exists by slug
  - If exists: increment view_count
  - If not: create new entry with view_count = 1
- Response: `{ status: "success", message: string }`

#### 2. Popular Posts API (`/api/posts/popular`)

**GET Request:**
- Purpose: Retrieve top 5 most viewed posts
- Query: `Blog.findMany({ orderBy: { view_count: "desc" }, take: 5 })`
- Response: Array of top 5 blog posts
- Used by: Home page sidebar

### Server Actions

Location: `src/lib/actions.ts`

**createSubscriber()**
- Server action for newsletter subscription
- Validation: Zod schema for email format
- Duplicate check: Prevents re-subscription
- Returns: State object with error/success messages

---

## Frontend Architecture

### Page Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `app/page.tsx` | Home page with latest posts and categories |
| `/about` | `app/about/page.tsx` | About page |
| `/blog/[category]/[slug]` | `app/blog/[category]/[slug]/page.tsx` | Blog post reader |
| `/courses` | `app/courses/page.tsx` | Course listing (10 courses) |
| `/courses/[courseId]` | `app/courses/[courseId]/page.tsx` | Course details with units |
| `/courses/[courseId]/[lecture]` | `app/courses/[courseId]/[lecture]/page.tsx` | Lecture player with comments |

### Component Architecture

#### Server Components (Default)
- `page.tsx` - Home page
- `app/blog/[category]/[slug]/page.tsx` - Blog posts
- `app/courses/page.tsx` - Course listing
- Most layout components

#### Client Components ("use client")
- `Footer.tsx` - Form submission handling
- `PopularPosts.tsx` - SWR data fetching
- `ReportViews.tsx` - View tracking
- `LecturePage` - Comment system interactivity

### UI Component Library

**shadcn/ui Components:**
- Accordion (course units)
- Navigation Menu
- Dropdown Menu
- Button, Input, Card
- Skeleton (loading states)

**Custom Components:**
- `Container` - Max-width layout wrapper
- `MainNav` - Navigation with dropdown menu
- `Header` - Page header with breadcrumbs
- `CustomMDX` - MDX renderer with syntax highlighting
- `CardCategory` - Category display cards

### Styling System

**Tailwind CSS Configuration:**
- Mobile-first responsive design
- Dark mode support via `next-themes`
- Custom color palette
- PostCSS for processing

**Theme Provider:**
- Location: `src/components/theme-provider.tsx`
- Enables dark/light mode toggle
- Persists theme preference

---

## Content Management

### Blog Content System

#### Storage
- Location: `src/app/blog/contents/`
- Format: MDX files with frontmatter
- Current posts: 7 blog posts

#### MDX Frontmatter Structure
```yaml
---
title: "Post Title"
publishedAt: "2025-05-26"
summary: "Brief description"
category: "Category Name"
---
```

#### Content Utilities (`src/app/blog/utils.ts`)

**Key Functions:**
- `getMDXFiles()` - List all .mdx files in contents directory
- `readMDXfile(slug)` - Read and parse MDX with gray-matter
- `getBlogPosts()` - Get all posts with metadata and content
- `getLatestPosts()` - Sort posts by publish date descending
- `formatDate(date)` - Format dates (relative and absolute)

#### Content Rendering
- Component: `CustomMDX` (`src/components/mdx.tsx`)
- Syntax highlighting: `sugar-high`
- Custom components: Tables, code blocks, headings with IDs

### Course Content System

#### Current Implementation
- **Status:** Hardcoded data in component files
- **Location:** `src/app/courses/page.tsx` (course list)

#### Course Structure
```typescript
const courseList = [
  {
    id: "abap-beginner",
    title: "ABAP Beginner Course",
    description: "...",
    chapters: 12,
    level: "Beginner",
    imageUrl: "/images/courses/..."
  },
  // ... 9 more courses
]
```

#### Course Features
- 10 pre-configured courses
- Course units with learning objectives
- Lecture/lesson tracking
- YouTube video integration
- Comment system (client-side only, not persisted)
- Chapter-based takeaways

#### Available Courses
1. ABAP Beginner Course (12 chapters)
2. ABAP CDS (8 chapters)
3. ABAP New Syntax (7 chapters)
4. RESTful ABAP Programming Model (10 chapters)
5. SAP ABAP in BTP Environment (6 chapters)
6. SAP BTP Introduction (5 chapters)
7. Beginners Guide to UI5 (9 chapters)
8. Fiori Elements (7 chapters)
9. UI/UX Tooling (4 chapters)
10. Cloud Application Programming Model (8 chapters)

---

## Data Flow

### Blog Post View Flow
```
┌─────────────────────────────────────────────┐
│ User visits /blog/[category]/[slug]         │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Server reads MDX file from contents/        │
│ Parses frontmatter and content              │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ CustomMDX renders content                   │
│ with syntax highlighting                     │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ ReportViews (client) sends POST             │
│ to /api/count with { slug, title, category }│
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Database: Blog.upsert()                     │
│ - If exists: increment view_count           │
│ - If not: create with view_count = 1        │
└─────────────────────────────────────────────┘
```

### Popular Posts Flow
```
┌─────────────────────────────────────────────┐
│ Home page mounted                           │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ PopularPosts component with SWR             │
│ fetches /api/posts/popular                  │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Prisma query:                               │
│ Blog.findMany({                             │
│   orderBy: { view_count: "desc" },          │
│   take: 5                                   │
│ })                                          │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Returns top 5 posts to client               │
│ SWR caches response                         │
└─────────────────────────────────────────────┘
```

### Newsletter Subscription Flow
```
┌─────────────────────────────────────────────┐
│ User enters email in footer form            │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Client submits to server action             │
│ createSubscriber(formData)                  │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Zod validation: email format check          │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Check if email already exists in DB         │
│ - If exists: return error                   │
│ - If not: Subscriber.create()               │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Return success/error state to form          │
│ Display message to user                     │
└─────────────────────────────────────────────┘
```

### Course Navigation Flow
```
┌─────────────────────────────────────────────┐
│ /courses - Course listing page              │
│ (hardcoded courseList array)                │
└────────────────┬────────────────────────────┘
                 ↓ User selects course
┌─────────────────────────────────────────────┐
│ /courses/[courseId] - Course details        │
│ (courseUnits array with accordion)          │
└────────────────┬────────────────────────────┘
                 ↓ Click "Go to learning"
┌─────────────────────────────────────────────┐
│ /courses/[courseId]/[lecture] - Player      │
│ (videoModules array, YouTube embed)         │
│ Comment system (client-side state only)     │
└─────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Current Deployment (Vercel)

**Platform:** Vercel
**URL:** https://my-personal-site-sage-three.vercel.app
**Branch:** course-page

#### Build Configuration
```json
{
  "scripts": {
    "build": "npx prisma generate && next build",
    "start": "next start",
    "dev": "next dev --turbopack"
  }
}
```

**Build Process:**
1. Generate Prisma client
2. Next.js production build
3. Optimized static and server-side rendering

#### PM2 Configuration (`ecosystem.config.js`)
```javascript
{
  name: "lmstest",
  script: "npm",
  args: "start",
  env: {
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://..."
  }
}
```

**Issues with Current Config:**
- Database credentials hardcoded in PM2 config
- Should use environment variables instead
- PM2 config indicates intent for VPS deployment

### Environment Variables

Required variables in `.env`:
```bash
DATABASE_URL=postgresql://...
DOMAIN_NAME=https://my-personal-site-sage-three.vercel.app
```

**Usage:**
- `DATABASE_URL` - Prisma database connection
- `DOMAIN_NAME` - API endpoint resolution
- `NODE_ENV` - Environment detection (dev/production)

---

## Key Files Reference

### Critical Files

| File Path | Purpose | Type |
|-----------|---------|------|
| `src/app/page.tsx` | Home page with latest posts, popular posts, categories | Server Component |
| `src/app/courses/page.tsx` | Course catalog listing (10 courses) | Server Component |
| `src/app/courses/[courseId]/page.tsx` | Course details with accordion units | Server Component |
| `src/app/courses/[courseId]/[lecture]/page.tsx` | Lecture player with video and comments | Client Component |
| `src/app/blog/[category]/[slug]/page.tsx` | Blog post reader with view tracking | Server Component |
| `src/db/index.ts` | Prisma database client singleton | Database |
| `src/lib/actions.ts` | Server actions (newsletter subscription) | Server Action |
| `src/lib/utils.ts` | Utility functions (API URL, fetcher) | Utility |
| `src/app/api/posts/popular/route.ts` | API for top 5 popular posts | API Route |
| `src/app/api/count/route.ts` | View count tracking API | API Route |
| `prisma/schema.prisma` | Database schema definition | Database |
| `src/components/mdx.tsx` | MDX renderer with syntax highlighting | Component |
| `src/app/blog/utils.ts` | Blog content utilities (MDX parsing) | Utility |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `components.json` | shadcn/ui configuration |
| `eslint.config.mjs` | ESLint rules |
| `jest.config.js` | Testing configuration |
| `ecosystem.config.js` | PM2 process management |
| `.env` | Environment variables |

---

## Known Limitations

### Course Management
- **Issue:** Course data is hardcoded in component files
- **Impact:** Cannot dynamically add/edit courses without code changes
- **Recommendation:** Move course data to database with admin interface

### Authentication
- **Issue:** No user authentication system implemented
- **Impact:**
  - No user profiles or personalization
  - No course enrollment tracking
  - No progress tracking per user
  - Public access to all content
- **Recommendation:** Implement NextAuth.js or similar authentication

### Comments System
- **Issue:** Comments are client-side only (not persisted)
- **Impact:** Comments lost on page refresh
- **Recommendation:** Add Comment model to database, persist comments via API

### Course Progress
- **Issue:** No tracking of user progress through courses
- **Impact:** Users cannot see completion status or resume where they left off
- **Recommendation:** Add UserProgress model with enrollment and completion tracking

### Content Management
- **Issue:** Blog posts require manual MDX file creation
- **Impact:** No CMS for non-technical content creators
- **Recommendation:** Consider headless CMS integration or admin panel

### Video Hosting
- **Issue:** Relies on YouTube embeds for course videos
- **Impact:** Dependent on external service, limited control
- **Recommendation:** Consider self-hosted video solution or CDN

### Analytics
- **Issue:** Basic view counting only
- **Impact:** Limited insights into user behavior and content performance
- **Recommendation:** Integrate comprehensive analytics solution

### SEO
- **Issue:** Limited SEO optimization
- **Impact:**
  - No dynamic sitemap generation
  - Limited Open Graph metadata
  - No structured data
- **Recommendation:** Implement next-sitemap and enhance metadata

### Testing
- **Issue:** Jest configured but no test files present
- **Impact:** No automated testing coverage
- **Recommendation:** Add unit and integration tests

### Deployment
- **Issue:** PM2 config has hardcoded credentials
- **Impact:** Security risk, not suitable for VPS deployment
- **Recommendation:** Use environment variables, add deployment documentation

---

## Future Enhancements

### Phase 1: Database Migration
1. Move course data to PostgreSQL database
2. Create Course, Lesson, Unit models
3. Implement enrollment and progress tracking

### Phase 2: Authentication
1. Add NextAuth.js with email/password and OAuth
2. Implement user roles (student, instructor, admin)
3. Protect course routes with middleware

### Phase 3: Features
1. Persist comments to database
2. Add quiz and assessment functionality
3. Implement course completion certificates
4. Add user dashboard with progress tracking

### Phase 4: Content Management
1. Admin panel for course creation
2. CMS integration for blog posts
3. Video upload and management system

### Phase 5: Performance & SEO
1. Optimize images with next/image
2. Implement caching strategies
3. Generate dynamic sitemap
4. Add comprehensive metadata

### Phase 6: VPS Deployment
1. Dockerize application
2. Set up PostgreSQL in Docker
3. Configure Nginx reverse proxy
4. Implement CI/CD pipeline
5. Add monitoring and logging

---

## Architectural Patterns

### Separation of Concerns
- **Presentation Layer:** React components in `src/components/`
- **Business Logic:** Server actions in `src/lib/actions.ts`
- **Data Layer:** Prisma client in `src/db/index.ts`
- **API Layer:** Route handlers in `src/app/api/`

### Server vs Client Components
- Default to Server Components for better performance
- Use Client Components only when:
  - Interactivity required (forms, buttons)
  - Browser APIs needed (localStorage, window)
  - State management needed (useState, useContext)
  - Event handlers required (onClick, onChange)

### Data Fetching Strategy
- **Server Components:** Direct Prisma queries, MDX file reading
- **Client Components:** SWR for caching and revalidation
- **Forms:** React Server Actions with Zod validation

### Code Organization
- **Feature-based routing:** Next.js App Router file-based routing
- **Component co-location:** Components near their usage
- **Utility functions:** Centralized in `src/lib/`
- **Type safety:** TypeScript for all code

---

## Security Considerations

### Current Security Measures
- SSL/TLS for database connection (`sslmode=require`)
- Environment variables for sensitive data
- Zod validation for user inputs
- Unique constraints on database fields

### Security Gaps
- No CSRF protection on forms
- No rate limiting on APIs
- Database credentials exposed in PM2 config
- No input sanitization for comments
- No authentication for course access

### Recommendations
1. Implement authentication and authorization
2. Add rate limiting to API routes
3. Sanitize user inputs (especially comments)
4. Use environment variables exclusively
5. Implement CSRF tokens for forms
6. Add Content Security Policy headers
7. Implement audit logging for admin actions

---

## Performance Optimization

### Current Optimizations
- Prisma client caching for serverless
- SWR for client-side data caching
- Server Components for zero JS bundle
- Turbopack for faster development builds

### Optimization Opportunities
1. Implement ISR (Incremental Static Regeneration) for blog posts
2. Add image optimization with next/image
3. Implement database query optimization
4. Add Redis caching for popular posts
5. Implement CDN for static assets
6. Add lazy loading for course videos
7. Optimize bundle size with dynamic imports

---

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run development server (with Turbopack)
npm run dev

# Access at http://localhost:3000
```

### Database Management
```bash
# Push schema changes to database
npx prisma db push

# Create migration
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Testing
```bash
# Run tests
npm test

# Lint code
npm run lint
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## Maintenance Guidelines

### Database Migrations
1. Never modify `schema.prisma` directly in production
2. Always create migrations in development
3. Test migrations in staging before production
4. Backup database before running migrations

### Content Updates
1. Blog posts: Add MDX files to `src/app/blog/contents/`
2. Ensure frontmatter is complete and valid
3. Test rendering locally before deployment
4. Monitor view counts for popular content

### Dependency Updates
1. Review changelogs before updating major versions
2. Test thoroughly after updates (especially Next.js, React)
3. Update Prisma client after Prisma CLI updates
4. Keep security patches current

### Monitoring
1. Track API response times
2. Monitor database connection pool
3. Watch for 404 errors (broken links)
4. Track view count anomalies
5. Monitor error logs

---

## Contact & Support

**Developer:** Arun Krishnamoorthy
**Repository:** tech-blog (E-learning Platform)
**Version:** 0.1.0
**Last Updated:** 2026-02-04

---

## Glossary

- **MDX:** Markdown with JSX components
- **Prisma:** Next-generation ORM for Node.js and TypeScript
- **SWR:** React Hooks library for data fetching (stale-while-revalidate)
- **Server Components:** React components that render on the server
- **Client Components:** React components that render in the browser
- **Server Actions:** Server-side functions callable from client components
- **ISR:** Incremental Static Regeneration
- **PM2:** Production process manager for Node.js applications

---

**End of Architecture Documentation**
