# Database Setup Guide - E-Learning Platform

This guide will help you set up the database for your e-learning platform with the comprehensive schema we've designed.

## 📋 What's Been Created

### 1. **Prisma Schema** (`prisma/schema.prisma`)
A comprehensive database schema with 25 models including:
- **Content Models**: Category, Course, Unit, Lesson, Instructor
- **Blog System**: BlogPost, BlogRepository (GitHub integration), BlogSyncLog
- **Assessment**: Quiz, QuizQuestion, QuizOption, QuizAnswer
- **Progress Tracking**: Enrollment, LessonProgress, QuizAttempt
- **Community**: Comment (with threading), CourseReview
- **Analytics**: SearchQuery

### 2. **Migration SQL** (`prisma/migrations/20260205174616_elearning_comprehensive_schema/migration.sql`)
A complete migration that:
- Transforms your Blog table into BlogPost with GitHub sync support
- Adds all course-related tables
- Adds assessment and progress tracking
- Adds community features
- Migrates existing blog categories to the Category table

### 3. **Seed Script** (`prisma/seed.ts`)
Sample data including:
- 5 categories (Tutorial, ABAP, UI5, BTP, CAP)
- Your instructor profile (Arun Krishnamoorthy)
- Complete "Beginners Guide to SAP UI5" course with 5 units and 21 lessons
- Sample quizzes and blog posts

---

## 🚀 Setup Instructions

### Step 1: Start Docker Database

```bash
# Start the PostgreSQL container
docker-compose up -d postgres

# Verify the database is running
docker-compose ps

# Check database health
docker-compose exec postgres pg_isready -U techblog
```

### Step 2: Install Dependencies

```bash
# Install tsx for running TypeScript seed script
npm install

# Generate Prisma Client
npx prisma generate
```

### Step 3: Run Migration

```bash
# Apply the database migration
npx prisma migrate deploy

# Or for development (creates migration if needed)
npx prisma migrate dev
```

### Step 4: Seed the Database

```bash
# Run the seed script to populate sample data
npm run db:seed

# Or directly with prisma
npx prisma db seed
```

### Step 5: Verify Setup

```bash
# Open Prisma Studio to explore your data
npm run db:studio

# Or directly
npx prisma studio
```

This will open a browser at `http://localhost:5555` where you can view all your tables and data.

---

## 🔍 Verifying the Migration

### Check Table Creation

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U techblog -d techblog

# List all tables
\dt

# You should see 25 tables:
# Category, User, BlogPost, BlogRepository, BlogSyncLog, Subscriber,
# Instructor, CourseInstructor, Course, CoursePrerequisite,
# CourseTargetRole, CourseLearningObjective, Unit, UnitObjective,
# Lesson, LessonTakeaway, LessonResource, CourseSyncLog,
# Quiz, QuizQuestion, QuizOption, Enrollment, LessonProgress,
# QuizAttempt, QuizAnswer, Comment, CourseReview, SearchQuery

# Exit psql
\q
```

### Check Sample Data

```sql
-- Count courses
SELECT COUNT(*) FROM "Course";
-- Expected: 1 (UI5 course)

-- Count lessons
SELECT COUNT(*) FROM "Lesson";
-- Expected: ~21 lessons

-- Count categories
SELECT COUNT(*) FROM "Category";
-- Expected: 5 categories

-- View course structure
SELECT
  c.title as course,
  u.title as unit,
  COUNT(l.id) as lesson_count
FROM "Course" c
JOIN "Unit" u ON u.course_id = c.id
JOIN "Lesson" l ON l.unit_id = u.id
GROUP BY c.title, u.title
ORDER BY c.title, u.sequence_order;
```

---

## 📊 Database Schema Overview

### Key Features

#### 1. **GitHub Blog Integration**
- `BlogRepository` table stores GitHub repo configuration
- `BlogPost` tracks commits and sync status
- `BlogSyncLog` maintains sync history
- Automatic sync support (webhook or scheduled)

#### 2. **Multi-Instructor Support**
- `Instructor` profiles
- `CourseInstructor` junction table for many-to-many relationships
- Support for Lead Instructors, Co-Instructors, Guest Lecturers

#### 3. **MkDocs Course Support**
- `Course.course_type` can be "video", "mkdocs", or "hybrid"
- `Course.mkdocs_site_url` for hosted mkdocs sites
- `Lesson.mkdocs_content` for synced markdown content
- `Lesson.external_url` for iframe embeds

#### 4. **Interactive Code Editors**
- `Lesson.has_code_editor` flag
- `Lesson.editor_type`: "jupyter", "typescript", "javascript"
- `Lesson.editor_content` stores initial code/notebook

#### 5. **Comprehensive Progress Tracking**
- Watch duration and resume position
- Replay count and speed preferences
- Drop-off analytics
- Quiz pass requirements

#### 6. **Advanced Quiz System**
- Multiple question types (multiple choice, true/false, short answer)
- Passing scores and attempt limits
- Time limits
- Detailed analytics (times_answered, times_correct, avg_time_secs)

#### 7. **Community Features**
- Threaded comments (parent-child relationships)
- Video timestamp linking
- Moderation flags (pinned, flagged, hidden)
- Course reviews with ratings

#### 8. **Analytics & Insights**
- Search query tracking
- Click-through analytics
- Question difficulty analysis
- Engagement metrics

---

## 🔧 Common Operations

### Adding a New Course

```typescript
import prisma from '@/db'

const course = await prisma.course.create({
  data: {
    slug: 'my-new-course',
    title: 'My New Course',
    description: 'Course description',
    overview: 'Detailed overview',
    difficulty_level: 'Intermediate',
    icon_text: 'NEW',
    tailwind_color: 'border-green-500',
    course_type: 'video',
    is_free: true,
    is_published: true,
    category_id: 1, // UI5 category
  },
})
```

### Adding a Lesson with Quiz

```typescript
// Create lesson
const lesson = await prisma.lesson.create({
  data: {
    course_id: courseId,
    unit_id: unitId,
    slug: 'introduction-to-topic',
    title: 'Introduction to Topic',
    sequence_order: 0,
    youtube_id: 'VIDEO_ID',
    lesson_type: 'video',
    is_published: true,
  },
})

// Add quiz
const quiz = await prisma.quiz.create({
  data: {
    lesson_id: lesson.id,
    title: 'Test Your Knowledge',
    passing_score: 70,
    max_attempts: 3,
    questions: {
      create: [
        {
          question_text: 'What is...?',
          question_type: 'multiple_choice',
          options: {
            create: [
              { option_text: 'Correct Answer', is_correct: true },
              { option_text: 'Wrong Answer', is_correct: false },
            ],
          },
        },
      ],
    },
  },
})
```

### Syncing Blog from GitHub

```typescript
// Create blog repository configuration
const repo = await prisma.blogRepository.create({
  data: {
    repo_owner: 'yourusername',
    repo_name: 'blog-content',
    branch: 'main',
    content_path: '/posts',
    is_public: true,
    auto_sync: true,
    sync_interval_mins: 60,
  },
})

// Implement sync logic in src/lib/github-sync.ts (to be created)
```

---

## 🎯 Next Steps

### 1. Update Application Code

You'll need to update your Next.js pages and components to use the database instead of hardcoded data:

#### Update Blog Pages
- `src/app/blog/page.tsx` - Fetch from BlogPost table
- `src/app/blog/[category]/[slug]/page.tsx` - Query by slug
- Remove hardcoded MDX files or migrate them to database

#### Update Course Pages
- `src/app/courses/page.tsx` - Fetch from Course table
- `src/app/courses/[courseId]/page.tsx` - Fetch course + units
- `src/app/courses/[courseId]/[lecture]/page.tsx` - Fetch lesson data

#### Example Database Queries

```typescript
// Fetch all published courses
const courses = await prisma.course.findMany({
  where: { is_published: true },
  include: {
    category: true,
    instructors: {
      include: { instructor: true },
    },
  },
  orderBy: { sequence_order: 'asc' },
})

// Fetch course with all content
const course = await prisma.course.findUnique({
  where: { slug: 'beginners-guide-to-sapui5' },
  include: {
    category: true,
    instructors: {
      include: { instructor: true },
    },
    units: {
      include: {
        lessons: {
          include: {
            takeaways: true,
            resources: true,
            quizzes: {
              include: {
                questions: {
                  include: { options: true },
                },
              },
            },
          },
        },
        unit_objectives: true,
      },
      orderBy: { sequence_order: 'asc' },
    },
    prerequisites: true,
    target_roles: true,
    learning_objectives: true,
  },
})
```

### 2. Implement GitHub Blog Sync

Create `src/lib/github-sync.ts` to:
- Fetch markdown files from GitHub
- Parse frontmatter
- Upsert to BlogPost table
- Handle webhooks

### 3. Implement MkDocs Integration

For mkdocs courses:
- Host mkdocs site separately (GitHub Pages, Vercel, etc.)
- Store URL in `Course.mkdocs_site_url`
- Embed using iframe with `Lesson.external_url`

### 4. Add Authentication

When ready to add auth:
- Use Clerk for Personal edition → populate `User.clerk_id`
- Use Azure AD for Enterprise → populate `User.azure_oid`
- Implement enrollment and progress tracking
- Enable comments and reviews

---

## 🐛 Troubleshooting

### Migration Fails

```bash
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Or manually drop tables
docker-compose exec postgres psql -U techblog -d techblog -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then rerun migration
npx prisma migrate dev
```

### Seed Fails

```bash
# Check TypeScript compilation
npx tsc --noEmit prisma/seed.ts

# Run seed with detailed errors
npx tsx prisma/seed.ts
```

### Connection Issues

```bash
# Check Docker container status
docker-compose ps

# View database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U techblog

# Check .env file
cat .env | grep DATABASE_URL
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## ✅ Verification Checklist

- [ ] Docker PostgreSQL container is running
- [ ] Migration applied successfully (25 tables created)
- [ ] Seed data populated (1 course, 5 units, ~21 lessons)
- [ ] Prisma Studio opens and shows data
- [ ] Can query courses from database
- [ ] Existing blog data migrated to BlogPost table
- [ ] Categories created and linked

---

**Created:** 2026-02-05
**Database Version:** PostgreSQL 16
**Prisma Version:** 6.8.2
**Total Tables:** 25
**Total Models:** 25

---

Need help? Check the troubleshooting section or review the generated migration SQL file for details.
