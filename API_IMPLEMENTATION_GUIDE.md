# API Implementation Guide

## ✅ Completed Work

### 1. API Endpoints Created

#### Course Enrollment API
**Location:** `src/app/api/courses/[courseId]/enroll/route.ts`

**Endpoints:**
- `POST /api/courses/[courseId]/enroll` - Enroll user in a course
- `GET /api/courses/[courseId]/enroll?userId={id}` - Check enrollment status

**Features:**
- Validates course availability and enrollment limits
- Prevents duplicate enrollments
- Auto-increments student count
- Creates user if doesn't exist (with email)

**Example Usage:**
```typescript
// Enroll in a course
const response = await fetch('/api/courses/1/enroll', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 1,
    email: 'user@example.com',
    name: 'John Doe'
  })
})

// Check enrollment status
const status = await fetch('/api/courses/1/enroll?userId=1')
const { enrolled, enrollment } = await status.json()
```

---

#### Course Progress API
**Location:** `src/app/api/courses/[courseId]/progress/route.ts`

**Endpoints:**
- `GET /api/courses/[courseId]/progress?userId={id}` - Get user's course progress

**Features:**
- Returns overall course progress percentage
- Breaks down progress by unit and lesson
- Auto-updates enrollment status (active → completed)
- Includes last accessed timestamps

**Response Structure:**
```json
{
  "course_id": 1,
  "course_title": "Beginners Guide to SAP UI5",
  "enrollment_status": "active",
  "overall_progress": {
    "total_lessons": 21,
    "completed_lessons": 5,
    "progress_percentage": 24
  },
  "unit_progress": [
    {
      "unit_id": 1,
      "unit_title": "Introduction",
      "total_lessons": 3,
      "completed_lessons": 2,
      "progress_percentage": 67,
      "lessons": [...]
    }
  ]
}
```

---

#### Lesson Progress API
**Location:** `src/app/api/lessons/[lessonId]/progress/route.ts`

**Endpoints:**
- `POST /api/lessons/[lessonId]/progress` - Update lesson progress
- `GET /api/lessons/[lessonId]/progress?userId={id}` - Get lesson progress

**Features:**
- Tracks watch duration and resume position
- Records video speed preference
- Detects replays (when position resets to 0)
- Updates enrollment last_accessed_at
- Tracks quiz attempts

**Example Usage:**
```typescript
// Update progress as user watches video
await fetch('/api/lessons/1/progress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 1,
    last_position_secs: 125,
    watch_duration_secs: 180,
    speed_preference: 1.5,
    completion_percentage: 70
  })
})

// Mark lesson as completed
await fetch('/api/lessons/1/progress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 1,
    is_completed: true,
    completion_percentage: 100
  })
})
```

---

#### Quiz Attempt API
**Location:** `src/app/api/quizzes/[quizId]/attempt/route.ts`

**Endpoints:**
- `POST /api/quizzes/[quizId]/attempt` - Submit quiz attempt
- `GET /api/quizzes/[quizId]/attempt?userId={id}` - Get user's quiz attempts

**Features:**
- Auto-grades multiple choice questions
- Enforces max attempts limit
- Updates question analytics (times_answered, times_correct)
- Marks lesson as completed if quiz passes
- Tracks attempt history

**Example Usage:**
```typescript
// Submit quiz
const response = await fetch('/api/quizzes/1/attempt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 1,
    answers: [
      { question_id: 1, selected_option_id: 3 },
      { question_id: 2, selected_option_id: 7 },
      { question_id: 3, answer_text: "ABAP is..." }
    ],
    time_taken_mins: 8
  })
})

const { passed, percentage, answers, can_retake } = await response.json()
```

**Response Structure:**
```json
{
  "status": "success",
  "message": "Quiz passed!",
  "attempt": {
    "id": 1,
    "attempt_number": 1,
    "score": 8,
    "max_score": 10,
    "percentage": 80,
    "passed": true,
    "passing_score": 70
  },
  "answers": [
    {
      "question_id": 1,
      "question_text": "What is...",
      "is_correct": true,
      "points_earned": 1,
      "explanation": "..."
    }
  ],
  "can_retake": true,
  "attempts_remaining": 2
}
```

---

### 2. UI Components Updated

#### Courses Listing Page
**Location:** `src/app/courses/page.tsx`

**Changes:**
- ✅ Converted to async server component
- ✅ Fetches courses from database with `db.course.findMany()`
- ✅ Includes category and instructors
- ✅ Displays course metadata (units, lessons, price, difficulty)
- ✅ Shows instructor names
- ✅ Shows student enrollment count
- ✅ Dynamic "Start Learning" vs "View Course" based on is_free

---

### 3. Database Export Fix
**Location:** `src/db/index.ts`

**Changes:**
- ✅ Added default export: `export default prisma`
- ✅ Kept named export: `export const db`
- ✅ Both imports now work:
  - `import prisma from "@/db"`
  - `import { db } from "@/db"`

---

## 🚧 Remaining Work

### 1. Update Course Detail Page
**Location:** `src/app/courses/[courseId]/page.tsx`

**Current State:** Hardcoded course data

**Required Changes:**
```typescript
// Add async server component
async function getCourseData(slug: string) {
  const course = await db.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructors: { include: { instructor: true } },
      units: {
        include: {
          lessons: {
            where: { is_published: true },
            orderBy: { sequence_order: 'asc' }
          },
          unit_objectives: true,
        },
        orderBy: { sequence_order: 'asc' },
      },
      prerequisites: { orderBy: { sequence_order: 'asc' } },
      target_roles: true,
      learning_objectives: { orderBy: { sequence_order: 'asc' } },
    },
  })

  return course
}

export default async function CourseLanding({
  params
}: {
  params: { courseId: string }
}) {
  const course = await getCourseData(params.courseId)

  if (!course) {
    notFound()
  }

  // Render with course data...
}
```

---

### 2. Update Lesson/Lecture Page
**Location:** `src/app/courses/[courseId]/[lecture]/page.tsx`

**Current State:** Hardcoded video modules

**Required Changes:**
```typescript
async function getLessonData(courseSlug: string, lessonSlug: string) {
  const lesson = await db.lesson.findFirst({
    where: {
      slug: lessonSlug,
      course: { slug: courseSlug },
      is_published: true,
    },
    include: {
      course: {
        select: {
          title: true,
          slug: true,
        },
      },
      unit: {
        select: {
          title: true,
          slug: true,
        },
      },
      takeaways: {
        orderBy: { sequence_order: 'asc' },
      },
      resources: true,
      quizzes: {
        include: {
          questions: {
            include: { options: true },
            orderBy: { sequence_order: 'asc' },
          },
        },
      },
      comments: {
        where: { parent_comment_id: null },
        include: {
          replies: {
            orderBy: { created_at: 'asc' },
          },
        },
        orderBy: { created_at: 'desc' },
      },
    },
  })

  return lesson
}
```

---

### 3. Update Blog Pages
**Location:**
- `src/app/blog/page.tsx` - Blog listing
- `src/app/blog/[category]/page.tsx` - Category filtering
- `src/app/blog/[category]/[slug]/page.tsx` - Individual post

**Required Changes:**

**Blog Listing:**
```typescript
async function getBlogPosts() {
  const posts = await db.blogPost.findMany({
    where: { is_published: true },
    include: { category: true },
    orderBy: { published_at: 'desc' },
  })

  return posts
}
```

**Individual Post:**
```typescript
async function getBlogPost(slug: string) {
  const post = await db.blogPost.findUnique({
    where: { slug },
    include: { category: true },
  })

  // Increment view count
  if (post) {
    await db.blogPost.update({
      where: { id: post.id },
      data: { view_count: { increment: 1 } },
    })
  }

  return post
}
```

**Note:** Blog content is still stored in `content` field, not separate files. You'll need to render MDX from the database string.

---

### 4. Client-Side Components Needed

#### Enroll Button Component
**Location:** `src/components/EnrollButton.tsx` (create new)

```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function EnrollButton({
  courseId,
  userId,
}: {
  courseId: number
  userId: number
}) {
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEnroll = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (data.status === "success" || data.enrollment) {
        setEnrolled(true)
      }
    } catch (error) {
      console.error("Enrollment error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleEnroll}
      disabled={enrolled || loading}
      className="w-full"
    >
      {loading ? "Enrolling..." : enrolled ? "Enrolled ✓" : "Enroll Now"}
    </Button>
  )
}
```

#### Video Progress Tracker Component
**Location:** `src/components/VideoProgressTracker.tsx` (create new)

```typescript
"use client"

import { useEffect, useRef } from "react"

export function VideoProgressTracker({
  lessonId,
  userId,
  youtubeId,
}: {
  lessonId: number
  userId: number
  youtubeId: string
}) {
  const progressInterval = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Track progress every 10 seconds
    progressInterval.current = setInterval(async () => {
      // Get current video position from YouTube Player API
      const position = 0 // Get from player
      const duration = 0 // Get from player

      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          last_position_secs: position,
          completion_percentage: Math.round((position / duration) * 100),
        }),
      })
    }, 10000)

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [lessonId, userId, youtubeId])

  return null
}
```

#### Quiz Component
**Location:** `src/components/Quiz.tsx` (create new)

```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface QuizProps {
  quizId: number
  userId: number
  questions: Array<{
    id: number
    question_text: string
    question_type: string
    options: Array<{
      id: number
      option_text: string
    }>
  }>
}

export function Quiz({ quizId, userId, questions }: QuizProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleSubmit = async () => {
    const response = await fetch(`/api/quizzes/${quizId}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        answers: Object.entries(answers).map(([qId, optId]) => ({
          question_id: parseInt(qId),
          selected_option_id: optId,
        })),
      }),
    })

    const data = await response.json()
    setResults(data)
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
      {questions.map((q) => (
        <div key={q.id} className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-3">{q.question_text}</h3>
          <div className="space-y-2">
            {q.options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={opt.id}
                  onChange={() => setAnswers({ ...answers, [q.id]: opt.id })}
                  disabled={submitted}
                />
                <span>{opt.option_text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {!submitted && (
        <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== questions.length}>
          Submit Quiz
        </Button>
      )}

      {submitted && results && (
        <div className={`p-4 rounded-lg ${results.passed ? "bg-green-50" : "bg-red-50"}`}>
          <h3 className="font-bold text-lg mb-2">
            {results.passed ? "🎉 Congratulations!" : "Keep Trying!"}
          </h3>
          <p>Score: {results.attempt.percentage}%</p>
          <p>Passing Score: {results.attempt.passing_score}%</p>
        </div>
      )}
    </div>
  )
}
```

---

## 📋 Implementation Checklist

### Immediate Next Steps

- [ ] Update course detail page (`src/app/courses/[courseId]/page.tsx`)
- [ ] Update lesson/lecture page (`src/app/courses/[courseId]/[lecture]/page.tsx`)
- [ ] Create EnrollButton component
- [ ] Create VideoProgressTracker component
- [ ] Create Quiz component
- [ ] Update blog listing page
- [ ] Update blog post page

### Testing Checklist

Once database is set up:

- [ ] Test course enrollment flow
- [ ] Test lesson progress tracking
- [ ] Test quiz submission and grading
- [ ] Test course progress calculation
- [ ] Verify data appears correctly in UI
- [ ] Test with multiple users

### Future Enhancements

- [ ] Add search functionality (use SearchQuery table)
- [ ] Add comment system to lessons
- [ ] Add course reviews
- [ ] Implement GitHub blog sync
- [ ] Add MkDocs course support
- [ ] Add authentication (Clerk/Azure AD)
- [ ] Add admin dashboard for content management

---

## 🔧 How to Use the APIs

### Frontend Integration Pattern

```typescript
// 1. Check if user is enrolled
const checkEnrollment = async (courseId: number, userId: number) => {
  const response = await fetch(`/api/courses/${courseId}/enroll?userId=${userId}`)
  const { enrolled } = await response.json()
  return enrolled
}

// 2. Enroll user in course
const enrollUser = async (courseId: number, userId: number) => {
  const response = await fetch(`/api/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
  return response.json()
}

// 3. Track lesson progress
const updateProgress = async (lessonId: number, userId: number, position: number) => {
  await fetch(`/api/lessons/${lessonId}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      last_position_secs: position,
    })
  })
}

// 4. Get course progress
const getProgress = async (courseId: number, userId: number) => {
  const response = await fetch(`/api/courses/${courseId}/progress?userId=${userId}`)
  return response.json()
}
```

---

## 🎯 Key Points

1. **All APIs are ready to use** - Just integrate them into your UI components
2. **Database schema is complete** - Run migration and seed to populate data
3. **Progress tracking is automatic** - APIs handle all calculations
4. **Type-safe** - All endpoints validate input with Zod schemas
5. **Error handling** - Comprehensive error responses with proper status codes

---

**Created:** 2026-02-05
**Status:** Phase 1 Complete (APIs), Phase 2 In Progress (UI)
**Next:** Update course/lesson pages to use database
