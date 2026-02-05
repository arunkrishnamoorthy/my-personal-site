# Jupyter Notebook Integration Guide

## Executive Summary

**Recommendation: Use JupyterLite with @datalayer/jupyter-react**

This provides:
- ✅ **Zero backend costs** - Runs entirely in browser using WebAssembly
- ✅ **Offline-first** - Students can code without internet after initial load
- ✅ **Production-ready** - Actively maintained React components
- ✅ **Full Python stack** - NumPy, Pandas, Matplotlib, scikit-learn included
- ✅ **Next.js 15 compatible** - Official integration example available
- ✅ **Scalable** - Static files scale infinitely on CDN

---

## Comparison of Integration Options

| Approach | Monthly Cost | Backend? | Python Speed | Complexity | Best For |
|----------|-------------|----------|--------------|------------|----------|
| **JupyterLite** ⭐ | **$0-20** | ❌ No | Fast (WASM) | Low-Medium | **E-learning platforms** |
| @datalayer/jupyter-react | $0-20 | ❌ No | Fast (WASM) | Medium | Production React apps |
| JupyterHub | $50-5,000+ | ✅ Yes | Native | High-Very High | Enterprise/Research |
| MyBinder | $0 (public) | ✅ Yes | Native | Low (public) / Very High (self-host) | Public content only |
| Google Colab | $0-50/user | ✅ Yes | Native + GPU | Very Low | Cannot embed in iframe |
| Thebe + Binder | $0 | ✅ Yes | Native | Low | Documentation sites |
| Thebe-lite | $0-20 | ❌ No | Fast (WASM) | Low-Medium | Simple interactive docs |
| Custom Pyodide | $0-20 | ❌ No | Fast (WASM) | Very High | Unique requirements |

---

## Option 1: JupyterLite (Recommended)

### What is JupyterLite?

A full Jupyter distribution that runs **entirely in the browser** using:
- **WebAssembly (WASM)** - Near-native performance
- **Pyodide** - Python compiled to WebAssembly (CPython → WASM)
- **JupyterLab UI** - Familiar notebook interface

### How It Works

```
Student's Browser
├── JupyterLab UI (JavaScript)
├── Pyodide (Python in WebAssembly)
│   ├── Python Standard Library
│   ├── NumPy, Pandas, Matplotlib
│   ├── SciPy, scikit-learn
│   └── Your custom packages
└── Browser Storage (saves notebooks)
```

**No server required!** Everything runs client-side.

### Pros & Cons

**Pros:**
- ✅ Zero backend infrastructure costs
- ✅ Instant startup (no waiting for containers)
- ✅ Works offline after initial load
- ✅ Scales infinitely (static CDN hosting)
- ✅ Includes scientific Python stack
- ✅ Progressive Web App capable
- ✅ Easy deployment (just static files)

**Cons:**
- ❌ Large initial download (~6.4 MB core, up to 172 MB with all packages)
- ❌ Slower than native Python for heavy computations
- ❌ Browser memory limits
- ❌ Not all Python packages available (C extensions may have issues)
- ❌ No multiprocessing/threading
- ❌ First page load can be slow

### When to Use

Perfect for:
- Python programming courses
- Data analysis tutorials
- Algorithm visualization
- Basic machine learning (scikit-learn)
- Educational content

Not suitable for:
- Deep learning training (use JupyterHub with GPUs)
- Large dataset processing (>1GB)
- Packages requiring C extensions not compiled to WASM
- Heavy computational work

---

## Option 2: @datalayer/jupyter-react

### What is it?

Official React components for embedding Jupyter notebooks in React/Next.js apps.

**GitHub:** https://github.com/datalayer/jupyter-ui
**Docs:** https://jupyter-ui.datalayer.tech/

### Features

- ✅ Full JupyterLab visuals as React components
- ✅ `<Jupyter>`, `<Notebook>`, `<Cell>` components
- ✅ IPyWidgets support
- ✅ Real-time collaboration (pluggable)
- ✅ Bi-directional state management (React ↔ Jupyter)
- ✅ **JupyterLite support** on roadmap
- ✅ **Next.js example available**

### Installation

**Important:** Requires **Yarn V3** (npm/pnpm don't work currently)

```bash
# Install Yarn V3
npm install -g yarn
yarn set version stable

# Install dependencies
yarn add @datalayer/jupyter-react
```

### Next.js Integration Example

#### 1. Create Notebook Component

```typescript
// src/components/JupyterNotebook.tsx
'use client'

import { Jupyter, Notebook } from '@datalayer/jupyter-react'
import '@datalayer/jupyter-react/lib/index.css'

interface NotebookProps {
  notebookPath: string
  onCellExecute?: (cellIndex: number) => void
}

export function JupyterNotebook({
  notebookPath,
  onCellExecute
}: NotebookProps) {
  return (
    <Jupyter>
      <Notebook
        path={notebookPath}
        CellSidebar={null}
        onCellExecuted={(cell, cellIndex) => {
          onCellExecute?.(cellIndex)
        }}
      />
    </Jupyter>
  )
}
```

#### 2. Use in Next.js Page (Disable SSR)

```typescript
// src/app/courses/[courseId]/lessons/[lessonId]/page.tsx
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const JupyterNotebook = dynamic(
  () => import('@/components/JupyterNotebook').then(mod => mod.JupyterNotebook),
  {
    ssr: false,
    loading: () => <NotebookSkeleton />
  }
)

export default async function LessonPage({ params }) {
  const lesson = await getLessonData(params.lessonId)

  return (
    <Container>
      {/* Video on left, notebook on right */}
      <div className="grid md:grid-cols-2 gap-4">
        <VideoPlayer videoId={lesson.youtube_id} />

        <JupyterNotebook
          notebookPath={`/notebooks/${lesson.notebook_file}`}
          onCellExecute={(cellIndex) => {
            trackProgress(params.lessonId, cellIndex)
          }}
        />
      </div>
    </Container>
  )
}
```

#### 3. Configure Next.js

```typescript
// next.config.ts
const config: NextConfig = {
  webpack: (config) => {
    // Required for Jupyter components
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
}

export default config
```

#### 4. Add RequireJS for IPyWidgets (Optional)

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Required for IPyWidgets support */}
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## Option 3: Standalone JupyterLite Deployment

Instead of embedding, deploy JupyterLite as a separate site and link to it.

### Setup

```bash
# Install JupyterLite CLI
pip install jupyterlite

# Create your notebooks directory
mkdir notebooks
# Add your .ipynb files to notebooks/

# Build JupyterLite site
jupyter lite build

# Deploy _output folder
# Can use: Vercel, GitHub Pages, Netlify, S3, etc.
```

### Link from Next.js

```typescript
// In your lesson page
<Button asChild>
  <a
    href="https://notebooks.yourdomain.com/lab/index.html?path=lesson-1.ipynb"
    target="_blank"
  >
    Open Interactive Notebook
  </a>
</Button>
```

**Pros:**
- Simplest setup
- No Next.js integration complexity
- Students get full JupyterLab experience

**Cons:**
- Takes students away from your platform
- Can't track progress as easily
- Less integrated UX

---

## Option 4: Direct Pyodide Integration (Custom)

Build your own code editor with Pyodide for Python execution.

### Installation

```bash
npm install pyodide monaco-editor
```

### Implementation

```typescript
'use client'

import { useEffect, useState } from 'react'
import { loadPyodide } from 'pyodide'
import Editor from '@monaco-editor/react'

export function PythonEditor({ initialCode }: { initialCode: string }) {
  const [pyodide, setPyodide] = useState(null)
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')

  useEffect(() => {
    loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
    }).then(py => {
      setPyodide(py)
      // Load packages
      py.loadPackage(['numpy', 'pandas', 'matplotlib'])
    })
  }, [])

  const runCode = async () => {
    if (!pyodide) return

    try {
      // Redirect stdout
      await pyodide.runPythonAsync(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `)

      // Run user code
      await pyodide.runPythonAsync(code)

      // Get output
      const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()')
      setOutput(stdout)
    } catch (err) {
      setOutput(`Error: ${err.message}`)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Editor
        height="400px"
        language="python"
        value={code}
        onChange={setCode}
        theme="vs-dark"
      />

      <button
        onClick={runCode}
        disabled={!pyodide}
        className="my-2 px-4 py-2 bg-blue-600 text-white"
      >
        {pyodide ? 'Run Python' : 'Loading Python...'}
      </button>

      <pre className="bg-black text-green-400 p-4 rounded">
        {output}
      </pre>
    </div>
  )
}
```

**Pros:**
- Full control over UX
- Customizable to your needs
- Integrated with your design system

**Cons:**
- High development effort
- You maintain everything
- Missing Jupyter notebook features (markdown cells, cell outputs, etc.)

---

## Database Schema for Notebook Integration

Add these models to your Prisma schema:

```prisma
// prisma/schema.prisma

model Notebook {
  id            Int      @id @default(autoincrement())
  lesson_id     Int
  title         String   @db.VarChar(255)
  description   String?  @db.Text
  file_path     String   @db.VarChar(500)  // Path to .ipynb file
  content       Json?    // Or store .ipynb JSON directly
  version       Int      @default(1)
  is_published  Boolean  @default(false)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  lesson        Lesson   @relation(fields: [lesson_id], references: [id], onDelete: Cascade)
  progress      NotebookProgress[]
  submissions   NotebookSubmission[]

  @@index([lesson_id])
}

model NotebookProgress {
  id               Int       @id @default(autoincrement())
  user_id          Int
  notebook_id      Int
  last_cell_run    Int       @default(0)   // Last cell executed (0-indexed)
  total_cells      Int       @default(0)
  completed_cells  Int       @default(0)
  is_completed     Boolean   @default(false)
  cell_states      Json?     // Track which cells executed successfully
  time_spent_mins  Int       @default(0)
  last_accessed_at DateTime  @default(now())
  completed_at     DateTime?
  created_at       DateTime  @default(now())
  updated_at       DateTime  @updatedAt

  user             User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  notebook         Notebook  @relation(fields: [notebook_id], references: [id], onDelete: Cascade)

  @@unique([user_id, notebook_id])
  @@index([user_id])
  @@index([notebook_id])
}

model NotebookSubmission {
  id           Int      @id @default(autoincrement())
  user_id      Int
  notebook_id  Int
  content      Json     // Student's notebook state (.ipynb JSON)
  score        Float?   // Auto-graded score (0-100)
  passed       Boolean  @default(false)
  feedback     String?  @db.Text
  submitted_at DateTime @default(now())

  user         User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  notebook     Notebook @relation(fields: [notebook_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([notebook_id])
}
```

### Update Lesson Model

```prisma
model Lesson {
  id                  Int       @id @default(autoincrement())
  // ... existing fields

  // Update code editor fields
  has_code_editor     Boolean   @default(false)
  editor_type         String?   // "javascript", "typescript", "jupyter"
  editor_content      String?   @db.Text

  // Add notebook support
  has_notebook        Boolean   @default(false)

  // Relations
  notebooks           Notebook[]

  // ... existing relations
}
```

---

## Progress Tracking Implementation

### Server Action to Track Progress

```typescript
// src/lib/actions/notebook.ts
'use server'

import { z } from 'zod'
import prisma from '@/db'

const progressSchema = z.object({
  userId: z.number(),
  notebookId: z.number(),
  lastCellRun: z.number(),
  totalCells: z.number(),
  completedCells: z.number(),
  cellStates: z.record(z.boolean()),
  timeSpentMins: z.number()
})

export async function updateNotebookProgress(
  data: z.infer<typeof progressSchema>
) {
  const validated = progressSchema.parse(data)

  const isCompleted = validated.completedCells === validated.totalCells

  await prisma.notebookProgress.upsert({
    where: {
      user_id_notebook_id: {
        user_id: validated.userId,
        notebook_id: validated.notebookId
      }
    },
    update: {
      last_cell_run: validated.lastCellRun,
      total_cells: validated.totalCells,
      completed_cells: validated.completedCells,
      is_completed: isCompleted,
      cell_states: validated.cellStates,
      time_spent_mins: validated.timeSpentMins,
      last_accessed_at: new Date(),
      completed_at: isCompleted ? new Date() : null,
      updated_at: new Date()
    },
    create: {
      user_id: validated.userId,
      notebook_id: validated.notebookId,
      last_cell_run: validated.lastCellRun,
      total_cells: validated.totalCells,
      completed_cells: validated.completedCells,
      is_completed: isCompleted,
      cell_states: validated.cellStates,
      time_spent_mins: validated.timeSpentMins,
      completed_at: isCompleted ? new Date() : null
    }
  })

  return { success: true, completed: isCompleted }
}

export async function submitNotebook(
  userId: number,
  notebookId: number,
  notebookContent: any
) {
  const submission = await prisma.notebookSubmission.create({
    data: {
      user_id: userId,
      notebook_id: notebookId,
      content: notebookContent,
      submitted_at: new Date()
    }
  })

  // TODO: Implement auto-grading logic here

  return { success: true, submissionId: submission.id }
}
```

### Client Component with Progress Tracking

```typescript
// src/components/TrackedNotebook.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { JupyterNotebook } from './JupyterNotebook'
import { updateNotebookProgress } from '@/lib/actions/notebook'
import { useAuth } from '@clerk/nextjs' // or your auth solution

export function TrackedNotebook({
  notebookId,
  notebookPath,
  totalCells
}: {
  notebookId: number
  notebookPath: string
  totalCells: number
}) {
  const { userId } = useAuth()
  const [completedCells, setCompletedCells] = useState<Set<number>>(new Set())
  const [startTime] = useState(Date.now())

  const handleCellExecute = useCallback(async (cellIndex: number) => {
    if (!userId) return

    // Mark cell as completed
    setCompletedCells(prev => new Set([...prev, cellIndex]))

    // Calculate time spent
    const timeSpentMins = Math.round((Date.now() - startTime) / 60000)

    // Update progress in database
    await updateNotebookProgress({
      userId: parseInt(userId),
      notebookId,
      lastCellRun: cellIndex,
      totalCells,
      completedCells: completedCells.size + 1,
      cellStates: Object.fromEntries(
        Array.from(completedCells).map(idx => [idx, true])
      ),
      timeSpentMins
    })
  }, [userId, notebookId, totalCells, completedCells, startTime])

  return (
    <div className="relative">
      {/* Progress indicator */}
      <div className="mb-2 text-sm text-gray-600">
        Progress: {completedCells.size} / {totalCells} cells completed
        {completedCells.size === totalCells && (
          <span className="ml-2 text-green-600">✓ Complete!</span>
        )}
      </div>

      {/* Notebook */}
      <JupyterNotebook
        notebookPath={notebookPath}
        onCellExecute={handleCellExecute}
      />
    </div>
  )
}
```

---

## Creating Notebook Content

### Notebook File Structure

```json
// public/notebooks/python-basics-lesson-1.ipynb
{
  "cells": [
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "# Python Basics - Lesson 1: Variables\n",
        "\n",
        "In this lesson, you'll learn about Python variables and data types."
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "## What are Variables?\n",
        "\n",
        "Variables store data that can be used later in your program."
      ]
    },
    {
      "cell_type": "code",
      "execution_count": null,
      "metadata": {},
      "outputs": [],
      "source": [
        "# Example: Creating a variable\n",
        "name = \"Student\"\n",
        "age = 25\n",
        "is_learning = True\n",
        "\n",
        "print(f\"Hello, {name}!\")\n",
        "print(f\"You are {age} years old.\")\n",
        "print(f\"Learning Python: {is_learning}\")"
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {
        "tags": ["exercise"]
      },
      "source": [
        "## Exercise 1: Create Your Own Variables\n",
        "\n",
        "Create three variables:\n",
        "1. `favorite_color` - Your favorite color (string)\n",
        "2. `lucky_number` - Your lucky number (integer)\n",
        "3. `likes_python` - Whether you like Python (boolean)"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": null,
      "metadata": {
        "tags": ["exercise", "student-code"]
      },
      "outputs": [],
      "source": [
        "# Your code here:\n",
        "favorite_color = \n",
        "lucky_number = \n",
        "likes_python = \n",
        "\n",
        "# Test your code (don't modify this part)\n",
        "print(f\"Favorite color: {favorite_color}\")\n",
        "print(f\"Lucky number: {lucky_number}\")\n",
        "print(f\"Likes Python: {likes_python}\")"
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "## Data Types\n",
        "\n",
        "Python has several built-in data types:\n",
        "- `str` - String (text)\n",
        "- `int` - Integer (whole numbers)\n",
        "- `float` - Floating point (decimals)\n",
        "- `bool` - Boolean (True/False)"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": null,
      "metadata": {},
      "outputs": [],
      "source": [
        "# Check data types\n",
        "print(type(\"Hello\"))      # str\n",
        "print(type(42))           # int\n",
        "print(type(3.14))         # float\n",
        "print(type(True))         # bool"
      ]
    }
  ],
  "metadata": {
    "kernelspec": {
      "display_name": "Python 3",
      "language": "python",
      "name": "python3"
    },
    "language_info": {
      "name": "python",
      "version": "3.11.0"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 4
}
```

### Seed Script to Add Notebooks

```typescript
// prisma/seed.ts

// Add after creating lessons
async function seedNotebooks() {
  console.log('\n📓 Seeding notebooks...')

  // Python basics lesson
  const pythonLesson = await prisma.lesson.findFirst({
    where: { slug: 'python-basics-lesson-1' }
  })

  if (pythonLesson) {
    await prisma.notebook.create({
      data: {
        lesson_id: pythonLesson.id,
        title: 'Python Basics - Variables',
        description: 'Learn about Python variables and data types',
        file_path: '/notebooks/python-basics-lesson-1.ipynb',
        is_published: true
      }
    })

    // Update lesson to indicate it has a notebook
    await prisma.lesson.update({
      where: { id: pythonLesson.id },
      data: { has_notebook: true }
    })

    console.log('  ✅ Created Python basics notebook')
  }
}

// Call in main()
await seedNotebooks()
```

---

## Auto-Grading Implementation

### Using nbgrader Pattern

Mark cells with special comments:

```python
# Cell with tag "exercise"
def calculate_area(radius):
    """Calculate the area of a circle."""
    ### BEGIN SOLUTION
    import math
    return math.pi * radius ** 2
    ### END SOLUTION
    # Students will replace this with their solution
```

### Validation Cell

```python
# Cell with tag "tests"
# This cell runs tests on student code

assert 'calculate_area' in dir(), "Function calculate_area not defined"
assert callable(calculate_area), "calculate_area must be a function"

# Test with known values
result = calculate_area(5)
expected = 78.53981633974483
assert abs(result - expected) < 0.01, f"Expected ~78.54, got {result}"

print("✓ All tests passed!")
```

### Auto-Grading API

```typescript
// src/app/api/notebooks/grade/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { loadPyodide } from 'pyodide'

export async function POST(request: NextRequest) {
  const { notebookContent, tests } = await request.json()

  const pyodide = await loadPyodide()

  let score = 0
  let maxScore = 0
  const results = []

  try {
    // Execute all code cells
    for (const cell of notebookContent.cells) {
      if (cell.cell_type === 'code' && !cell.metadata?.tags?.includes('tests')) {
        await pyodide.runPythonAsync(cell.source.join('\n'))
      }
    }

    // Run test cells
    for (const test of tests) {
      maxScore += test.points
      try {
        await pyodide.runPythonAsync(test.code)
        score += test.points
        results.push({
          name: test.name,
          passed: true,
          feedback: '✓ Passed'
        })
      } catch (error) {
        results.push({
          name: test.name,
          passed: false,
          feedback: error.message
        })
      }
    }

    const percentage = (score / maxScore) * 100

    return NextResponse.json({
      score,
      maxScore,
      percentage,
      passed: percentage >= 70,
      results
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

---

## Implementation Roadmap

### Phase 1: Proof of Concept (1-2 weeks)

**Goal:** Validate JupyterLite integration

Tasks:
- [ ] Set up Yarn V3 in project
- [ ] Install @datalayer/jupyter-react
- [ ] Create basic JupyterNotebook component
- [ ] Test with one sample notebook
- [ ] Verify Pyodide loads and runs Python
- [ ] Check bundle size and performance

**Deliverable:** Working notebook in one lesson

---

### Phase 2: Database Integration (1-2 weeks)

**Goal:** Add notebook storage and progress tracking

Tasks:
- [ ] Add Notebook, NotebookProgress, NotebookSubmission models
- [ ] Run migration
- [ ] Create server actions for progress tracking
- [ ] Build TrackedNotebook component
- [ ] Test progress persistence
- [ ] Add progress indicators to UI

**Deliverable:** Notebooks with progress tracking

---

### Phase 3: Content Creation (2-3 weeks)

**Goal:** Create notebook content for courses

Tasks:
- [ ] Identify lessons suitable for notebooks (Python, data analysis)
- [ ] Create .ipynb files for each lesson
- [ ] Write markdown explanations
- [ ] Add code examples
- [ ] Create exercises with validation
- [ ] Seed notebooks in database
- [ ] Test all notebooks load correctly

**Deliverable:** 10-20 interactive notebooks across courses

---

### Phase 4: Advanced Features (2-3 weeks)

**Goal:** Auto-grading and submissions

Tasks:
- [ ] Implement nbgrader-style test cells
- [ ] Build auto-grading API
- [ ] Create submission workflow
- [ ] Add feedback UI
- [ ] Implement retry logic
- [ ] Build instructor dashboard for viewing submissions
- [ ] Add analytics (time spent, completion rates)

**Deliverable:** Full notebook learning experience with grading

---

## Cost Analysis

### Option 1: JupyterLite (Recommended)

**Infrastructure:**
- Static hosting: $0 (Vercel free tier) to $20/month (pro)
- CDN bandwidth: Included in hosting
- Database: Existing Prisma/PostgreSQL
- **Total: $0-20/month**

**Development:**
- Initial setup: 40-60 hours
- Content creation: 2-3 hours per notebook
- Maintenance: ~5 hours/month

**Scales to:** Unlimited students (static CDN)

---

### Option 2: JupyterHub (Alternative)

**Infrastructure:**
- Server: $50-200/month (100 students)
- Server: $500-2,000/month (1,000 students)
- Server: $5,000+/month (10,000 students)
- DevOps/monitoring: $100-500/month
- **Total: $150-5,500+/month**

**Development:**
- Initial setup: 80-120 hours (Kubernetes, security)
- Maintenance: 20-40 hours/month

**Scales to:** Depends on infrastructure investment

---

## Recommended Next Steps

### Step 1: Decision

Choose between:
1. **JupyterLite** - Browser-based, zero backend cost (recommended)
2. **JupyterHub** - Server-based, higher cost, more features

### Step 2: Prototype

If choosing JupyterLite:
1. Set up Yarn V3
2. Install @datalayer/jupyter-react
3. Create one test notebook
4. Integrate into one lesson page
5. Validate UX and performance

### Step 3: Plan Database Schema

1. Review proposed Notebook models
2. Adjust based on your needs
3. Create migration
4. Add seed data

### Step 4: Build Components

1. JupyterNotebook wrapper component
2. TrackedNotebook with progress
3. Progress indicators
4. Submission workflow

### Step 5: Create Content

1. Start with 3-5 pilot notebooks
2. Test with users
3. Iterate based on feedback
4. Scale to more lessons

---

## Questions to Consider

Before implementing, decide:

1. **Content Type:**
   - Pure Python programming?
   - Data analysis with Pandas/NumPy?
   - Machine learning with scikit-learn?
   - Visualization with Matplotlib?

2. **Student Experience:**
   - Embedded in lesson page? (split-screen with video)
   - Separate tab/window? (link to standalone JupyterLite)
   - Modal/fullscreen? (expand to full screen)

3. **Progress Tracking:**
   - Track cell execution? (yes/no)
   - Require submission? (yes/no)
   - Auto-grade exercises? (yes/no)
   - Save student work? (yes/no)

4. **Performance:**
   - Acceptable initial load time? (10-30 seconds)
   - Target bundle size? (6-172 MB)
   - Required Python packages? (affects bundle size)

---

## Resources

### Documentation
- [JupyterLite](https://jupyterlite.readthedocs.io/)
- [Pyodide](https://pyodide.org/)
- [@datalayer/jupyter-react](https://jupyter-ui.datalayer.tech/)
- [JupyterLab](https://jupyterlab.readthedocs.io/)
- [nbgrader](https://nbgrader.readthedocs.io/)

### Examples
- [Datalayer Next.js Example](https://jupyter-ui.datalayer.tech/docs/examples/next-js/)
- [JupyterLite Demo](https://jupyterlite.github.io/demo/)
- [Pyodide REPL](https://pyodide.org/en/stable/console.html)

### Community
- [Jupyter Discourse](https://discourse.jupyter.org/)
- [JupyterLite GitHub](https://github.com/jupyterlite/jupyterlite)
- [Pyodide GitHub](https://github.com/pyodide/pyodide)

---

**Created:** 2026-02-05
**Status:** 📋 Research Complete - Ready for Implementation Decision
**Recommendation:** Start with JupyterLite + @datalayer/jupyter-react
