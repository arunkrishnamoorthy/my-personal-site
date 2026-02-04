# Claude Code Guidelines for E-Learning Platform

**Purpose:** This document provides comprehensive guidelines for Claude Code when working on the tech-blog e-learning platform. It ensures consistency, best practices, and proper understanding of the codebase.

---

## Project Overview

### What is this project?
An e-learning platform built with Next.js 15 for publishing course content and blog posts. Created by Arun Krishnamoorthy to share educational content on SAP technologies (ABAP, UI5, BTP, CAP).

### Core Functionality
1. **Course Management** - Display and organize learning courses with units, lessons, and video content
2. **Blog Publishing** - MDX-based blog posts with view tracking and categories
3. **Newsletter** - Email subscription system for updates
4. **Analytics** - Basic view counting for popular content

### Technology Stack
- Next.js 15.3.3 with App Router
- React 19 with TypeScript 5
- PostgreSQL with Prisma ORM 6.8.2
- Tailwind CSS 4 with Radix UI components
- MDX for content management
- SWR for client-side data fetching

---

## Architecture Principles

### Server-First Approach
- **Default to Server Components** for better performance
- Only use Client Components when absolutely necessary:
  - Forms with interactivity
  - Client-side state management
  - Browser API usage
  - Event handlers

### File-Based Routing
- Next.js App Router structure under `src/app/`
- Dynamic routes: `[courseId]`, `[category]`, `[slug]`
- API routes: `src/app/api/`

### Data Flow Patterns
1. **Server Components:** Direct Prisma queries, file system reads
2. **Client Components:** SWR for data fetching with caching
3. **Forms:** React Server Actions with Zod validation
4. **APIs:** Route handlers for public endpoints

---

## Code Organization Rules

### File Structure Conventions

```
src/
├── app/              # Pages and API routes (Next.js App Router)
│   ├── page.tsx     # Must be Server Component by default
│   ├── api/         # API route handlers only
│   └── [dynamic]/   # Dynamic route segments
├── components/       # Reusable React components
│   └── ui/          # shadcn/ui primitives only
├── db/              # Database client (Prisma)
├── lib/             # Utility functions and server actions
└── app/blog/contents/ # MDX blog post files
```

### Naming Conventions
- **Components:** PascalCase (e.g., `MainNav.tsx`, `PopularPosts.tsx`)
- **Utilities:** camelCase (e.g., `formatDate`, `getBlogPosts`)
- **API Routes:** `route.ts` (Next.js convention)
- **Server Actions:** camelCase with descriptive names (e.g., `createSubscriber`)

### Import Path Aliases
- Use `@/` prefix for all internal imports
- Example: `import { Button } from "@/components/ui/button"`

---

## Database Guidelines

### Current Database Setup
- **Provider:** PostgreSQL (migrating from Neon to Docker)
- **ORM:** Prisma 6.8.2
- **Connection:** Environment variable `DATABASE_URL`

### Database Models

#### Existing Models (3)
1. **User** - User information (currently unused)
2. **Blog** - Blog post metadata with view counting
3. **Subscriber** - Newsletter subscriptions

#### Future Models (To Be Added)
1. **Course** - Course information and metadata
2. **Unit** - Course units/modules
3. **Lesson** - Individual lessons within units
4. **Enrollment** - User course enrollments
5. **Progress** - User progress through courses
6. **Comment** - Persisted comments on lectures

### Database Best Practices

#### Always Follow These Rules:
1. **Use Prisma Client Singleton** from `src/db/index.ts`
   ```typescript
   import prisma from "@/db"
   ```

2. **Never Create Multiple Prisma Instances** - Use the cached singleton

3. **Run Migrations Properly**
   ```bash
   # Development
   npx prisma migrate dev --name descriptive_name

   # Production
   npx prisma migrate deploy
   ```

4. **Always Generate Client After Schema Changes**
   ```bash
   npx prisma generate
   ```

5. **Use Transactions for Multi-Step Operations**
   ```typescript
   await prisma.$transaction([
     prisma.enrollment.create({ data: ... }),
     prisma.progress.create({ data: ... })
   ])
   ```

6. **Handle Unique Constraint Violations**
   ```typescript
   try {
     await prisma.subscriber.create({ data: { email } })
   } catch (error) {
     if (error.code === 'P2002') {
       return { error: "Email already subscribed" }
     }
   }
   ```

### Schema Design Principles
- Use `@db.VarChar(255)` for string fields with known max length
- Always include `@unique` for identifier fields
- Use `@default(autoincrement())` for integer primary keys
- Include timestamps: `createdAt` and `updatedAt DateTime @default(now()) @updatedAt`
- Use descriptive field names: `view_count` not `views`

---

## Component Development Guidelines

### Server vs Client Components

#### When to Use Server Components (Default)
- Pages with static or server-fetched data
- Blog post rendering
- Course listing pages
- Layouts and static UI

#### When to Use Client Components
Mark with `"use client"` directive at top of file when:
- Using React hooks (useState, useEffect, useContext)
- Browser APIs (window, localStorage, navigator)
- Event handlers (onClick, onChange, onSubmit)
- Third-party libraries requiring browser environment
- SWR data fetching

### Component Patterns

#### Server Component Example
```typescript
// src/app/courses/page.tsx
import { courseList } from "@/data/courses"

export default function CoursesPage() {
  return (
    <Container>
      {courseList.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </Container>
  )
}
```

#### Client Component Example
```typescript
"use client"

import { useState } from "react"
import useSWR from "swr"

export function PopularPosts() {
  const { data, error } = useSWR("/api/posts/popular", fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <Skeleton />

  return <PostList posts={data} />
}
```

### Styling Guidelines

#### Tailwind CSS
- Use Tailwind utility classes for all styling
- Mobile-first approach: `class="text-sm md:text-base lg:text-lg"`
- Dark mode: Use `dark:` prefix for dark mode variants
- Custom colors defined in `tailwind.config.ts`

#### Component Composition
- Prefer composition over prop drilling
- Use `cn()` utility from `@/lib/utils` for conditional classes
  ```typescript
  import { cn } from "@/lib/utils"

  <div className={cn(
    "base-class",
    isActive && "active-class",
    className
  )} />
  ```

---

## API Route Guidelines

### Route Handler Structure

#### File Location
- All API routes in `src/app/api/[endpoint]/route.ts`

#### Standard Pattern
```typescript
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/db"

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.model.findMany()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate with Zod
    const validatedData = schema.parse(body)

    const result = await prisma.model.create({
      data: validatedData
    })

    return NextResponse.json({
      status: "success",
      data: result
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### API Best Practices
1. **Always use try-catch blocks**
2. **Return proper HTTP status codes**
3. **Validate all inputs with Zod**
4. **Never expose sensitive data** (passwords, tokens)
5. **Use TypeScript for type safety**
6. **Log errors for debugging** (use proper logging service in production)

---

## Content Management Guidelines

### Blog Post Management

#### MDX File Structure
- Location: `src/app/blog/contents/[slug].mdx`
- Naming: Use kebab-case (e.g., `introduction-to-sapui5.mdx`)

#### Frontmatter Requirements
```yaml
---
title: "Required: Post title"
publishedAt: "Required: YYYY-MM-DD"
summary: "Required: Brief description"
category: "Required: Category name"
---
```

#### Content Writing Rules
1. Use proper Markdown headings (##, ###, not #)
2. Include code blocks with language identifiers
   ```typescript
   // TypeScript code here
   ```
3. Use relative dates in content (will be formatted by `formatDate()`)
4. Keep images in `/public/images/` directory
5. Reference images with absolute paths: `/images/post-name/image.png`

### Course Content Management

#### Current State (Hardcoded)
- Course data in `src/app/courses/page.tsx`
- Units and lessons in component files
- Video URLs hardcoded

#### Future State (Database-Driven)
When implementing database-driven courses:
1. Create Course, Unit, Lesson models
2. Store video URLs or upload to storage service
3. Implement admin interface for course creation
4. Add enrollment and progress tracking

---

## Form Handling Guidelines

### Server Actions Pattern

#### Location
All server actions in `src/lib/actions.ts`

#### Standard Structure
```typescript
"use server"

import { z } from "zod"
import prisma from "@/db"

// Define schema
const subscriberSchema = z.object({
  email: z.string().email("Invalid email address")
})

// Server action with state management
export async function createSubscriber(
  prevState: { error?: string; message?: string },
  formData: FormData
) {
  try {
    // Extract and validate
    const rawData = {
      email: formData.get("email")
    }

    const validatedData = subscriberSchema.parse(rawData)

    // Check for duplicates
    const existing = await prisma.subscriber.findFirst({
      where: { email: validatedData.email }
    })

    if (existing) {
      return { error: "Email already subscribed" }
    }

    // Create record
    await prisma.subscriber.create({
      data: validatedData
    })

    return { message: "Successfully subscribed!" }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong" }
  }
}
```

#### Client Component Usage
```typescript
"use client"

import { useFormState } from "react-dom"
import { createSubscriber } from "@/lib/actions"

export function NewsletterForm() {
  const [state, formAction] = useFormState(createSubscriber, {})

  return (
    <form action={formAction}>
      <input type="email" name="email" required />
      <button type="submit">Subscribe</button>
      {state.error && <p className="text-red-500">{state.error}</p>}
      {state.message && <p className="text-green-500">{state.message}</p>}
    </form>
  )
}
```

### Form Validation Rules
1. **Always use Zod** for schema validation
2. **Never trust client-side validation alone**
3. **Validate on the server** with server actions
4. **Provide clear error messages** to users
5. **Handle loading states** in UI
6. **Prevent duplicate submissions** with disabled states

---

## Testing Guidelines

### Current State
- Jest 29.7.0 configured but no tests written
- ts-jest for TypeScript support

### Testing Strategy (To Implement)

#### Unit Tests
Test individual functions and utilities:
```typescript
// src/app/blog/utils.test.ts
import { formatDate, getBlogPosts } from "./utils"

describe("formatDate", () => {
  it("should format date correctly", () => {
    const result = formatDate("2025-01-15")
    expect(result).toBeTruthy()
  })
})
```

#### Integration Tests
Test API routes and database operations:
```typescript
// src/app/api/count/route.test.ts
import { POST } from "./route"

describe("POST /api/count", () => {
  it("should increment view count", async () => {
    const request = new Request("http://localhost/api/count", {
      method: "POST",
      body: JSON.stringify({
        slug: "test-post",
        title: "Test Post",
        category: "Testing"
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.status).toBe("success")
  })
})
```

#### Component Tests
Test React components with React Testing Library:
```typescript
// src/components/Footer.test.tsx
import { render, screen } from "@testing-library/react"
import Footer from "./Footer"

describe("Footer", () => {
  it("should render newsletter form", () => {
    render(<Footer />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
  })
})
```

### When to Write Tests
1. Before refactoring existing code
2. When adding new utility functions
3. When creating new API endpoints
4. When building reusable components
5. When fixing bugs (write failing test first)

---

## Performance Guidelines

### Optimization Strategies

#### 1. Component Optimization
- Use Server Components by default (zero JS to client)
- Lazy load heavy client components
  ```typescript
  const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
    loading: () => <Skeleton />
  })
  ```

#### 2. Data Fetching
- Use SWR for client-side caching
- Configure revalidation intervals appropriately
  ```typescript
  useSWR("/api/posts/popular", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 300000 // 5 minutes
  })
  ```

#### 3. Database Queries
- Always select only needed fields
  ```typescript
  const posts = await prisma.blog.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      // Don't select unused fields
    }
  })
  ```

- Use pagination for large datasets
  ```typescript
  const posts = await prisma.blog.findMany({
    take: 10,
    skip: (page - 1) * 10,
    orderBy: { view_count: "desc" }
  })
  ```

#### 4. Image Optimization
- Use Next.js `<Image>` component (not yet implemented)
  ```typescript
  import Image from "next/image"

  <Image
    src="/images/course.jpg"
    alt="Course thumbnail"
    width={400}
    height={300}
    placeholder="blur"
  />
  ```

#### 5. Static Generation
- Use `generateStaticParams` for dynamic routes
  ```typescript
  export async function generateStaticParams() {
    const posts = await getBlogPosts()
    return posts.map(post => ({
      slug: post.slug,
      category: post.category
    }))
  }
  ```

---

## Security Guidelines

### Authentication & Authorization
**Current State:** No authentication implemented
**Future Implementation:** Use NextAuth.js or similar

#### When Implementing Auth:
1. Use environment variables for secrets
2. Implement CSRF protection
3. Use secure session management
4. Implement role-based access control (RBAC)
5. Hash passwords with bcrypt (never store plain text)

### Input Validation
1. **Always validate server-side** with Zod
2. **Sanitize user inputs** before storing
3. **Escape output** when rendering user content
4. **Use parameterized queries** (Prisma handles this)

### Environment Variables
- Never commit `.env` to git (in `.gitignore`)
- Use `.env.example` for documentation
- Access with `process.env.VARIABLE_NAME`
- Validate required env vars at startup

### API Security
1. Implement rate limiting (not yet done)
2. Use CORS properly for public APIs
3. Never expose database credentials
4. Log security events for monitoring

---

## Error Handling Guidelines

### Error Handling Pattern

#### API Routes
```typescript
try {
  const result = await riskyOperation()
  return NextResponse.json(result)
} catch (error) {
  console.error("Operation failed:", error)

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicate entry" },
        { status: 409 }
      )
    }
  }

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  )
}
```

#### Server Actions
```typescript
try {
  await operation()
  return { message: "Success" }
} catch (error) {
  if (error instanceof z.ZodError) {
    return { error: error.errors[0].message }
  }
  console.error("Action failed:", error)
  return { error: "Operation failed" }
}
```

#### Client Components
```typescript
const { data, error } = useSWR("/api/endpoint", fetcher)

if (error) {
  return <ErrorMessage message="Failed to load data" />
}

if (!data) {
  return <Skeleton />
}

return <DataDisplay data={data} />
```

### Error Logging
- Use `console.error()` for development
- Implement proper logging service for production (e.g., Sentry, LogRocket)
- Never log sensitive information (passwords, tokens, PII)

---

## Deployment Guidelines

### Current Deployment (Vercel)
- Platform: Vercel
- Auto-deploy from git pushes
- Environment variables in Vercel dashboard

### Future Deployment (VPS with Docker)

#### Docker Setup Required:
1. **Application Dockerfile**
2. **PostgreSQL Docker container**
3. **docker-compose.yml** for orchestration
4. **Nginx** reverse proxy configuration
5. **SSL/TLS** with Let's Encrypt

#### Environment Management
```bash
# Development
DATABASE_URL=postgresql://user:pass@localhost:5432/techblog_dev

# Production (Docker)
DATABASE_URL=postgresql://user:pass@postgres:5432/techblog_prod
```

#### Build Process
```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build Next.js
npm run build

# Start production server
npm start
```

---

## Development Workflow

### Getting Started
```bash
# Clone repository
git clone <repository-url>
cd tech-blog

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Making Changes

#### 1. Create Feature Branch
```bash
git checkout -b feature/new-feature-name
```

#### 2. Make Changes
- Follow code organization rules
- Write tests if applicable
- Update documentation if needed

#### 3. Test Locally
```bash
npm run lint
npm test
npm run build
```

#### 4. Commit Changes
```bash
git add .
git commit -m "feat: descriptive commit message"
```

#### 5. Push and Create PR
```bash
git push origin feature/new-feature-name
```

### Commit Message Convention
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

---

## Common Tasks & Patterns

### Adding a New Blog Post
```bash
# 1. Create MDX file
touch src/app/blog/contents/my-new-post.mdx

# 2. Add frontmatter
---
title: "My New Post"
publishedAt: "2026-02-04"
summary: "Brief description"
category: "Tutorial"
---

# 3. Write content in Markdown
# 4. Test locally at /blog/Tutorial/my-new-post
```

### Adding a New API Endpoint
```typescript
// 1. Create route.ts file
// src/app/api/my-endpoint/route.ts

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/db"

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.model.findMany()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// 2. Test at http://localhost:3000/api/my-endpoint
```

### Adding a New Database Model
```prisma
// 1. Edit prisma/schema.prisma
model NewModel {
  id        Int      @id @default(autoincrement())
  field     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 2. Create migration
npx prisma migrate dev --name add_new_model

// 3. Generate client
npx prisma generate

// 4. Use in code
import prisma from "@/db"
const record = await prisma.newModel.create({ data: {...} })
```

### Adding a New Page
```typescript
// 1. Create page.tsx in appropriate directory
// src/app/new-page/page.tsx

export default function NewPage() {
  return (
    <Container>
      <Header title="New Page" />
      {/* Page content */}
    </Container>
  )
}

// 2. Add navigation link in MainNav component
// 3. Test at http://localhost:3000/new-page
```

---

## Troubleshooting Guide

### Common Issues

#### 1. Prisma Client Not Found
```bash
# Solution: Generate Prisma client
npx prisma generate
```

#### 2. Database Connection Error
```bash
# Check .env file has correct DATABASE_URL
# Test connection:
npx prisma db pull
```

#### 3. Build Fails on Vercel
```bash
# Ensure build command includes Prisma generation
"build": "npx prisma generate && next build"
```

#### 4. Module Not Found Error
```typescript
// Check tsconfig.json has correct path alias
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 5. Hydration Errors
- Ensure Server and Client component HTML matches
- Don't use browser APIs in Server Components
- Check for conditional rendering differences

---

## Best Practices Summary

### DO:
1. Use Server Components by default
2. Validate all inputs with Zod
3. Use Prisma for all database operations
4. Follow TypeScript strict mode
5. Use environment variables for config
6. Write descriptive commit messages
7. Keep components small and focused
8. Use semantic HTML elements
9. Implement proper error handling
10. Test locally before pushing

### DON'T:
1. Create new Prisma instances (use singleton)
2. Hardcode credentials or secrets
3. Skip input validation
4. Use inline styles (use Tailwind)
5. Make components do too much
6. Expose sensitive data in APIs
7. Skip error handling
8. Commit .env files
9. Use `any` type in TypeScript
10. Make breaking changes without documentation

---

## Resources & References

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Internal Documentation
- `ARCHITECTURE.md` - Comprehensive architecture documentation
- `README.md` - Project overview and setup instructions
- `prisma/schema.prisma` - Database schema
- `package.json` - Dependencies and scripts

### Key Configuration Files
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `ecosystem.config.js` - PM2 deployment configuration

---

## Updating This Document

When making significant changes to the codebase:
1. Update relevant sections in this document
2. Update `ARCHITECTURE.md` if architecture changes
3. Keep examples up-to-date with current patterns
4. Document new best practices or patterns
5. Remove outdated information

---

**Last Updated:** 2026-02-04
**Version:** 1.0.0
**Maintained By:** Arun Krishnamoorthy

---

**End of Claude Code Guidelines**
