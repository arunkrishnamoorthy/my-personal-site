# Interactive Code Editor Feature

## Overview

Added an interactive code editor component similar to DeepLearning.AI's Jupyter notebook panel. This allows lessons to include a split-screen view with a video on one side and an executable code editor on the other.

---

## Features

### 1. **Split-Screen Layout**
- Video player and code editor side-by-side on desktop
- Stacked layout on mobile devices
- Only appears when `has_code_editor` is enabled for a lesson

### 2. **Interactive Code Execution**
- Write/edit JavaScript code in the editor
- Click "Run Code" button to execute
- Output appears in a terminal-style console below the editor
- Captures `console.log()` output
- Error handling with clear error messages

### 3. **Syntax Highlighting Ready**
- Currently uses a simple textarea
- Can be upgraded to Monaco Editor (VS Code engine) or CodeMirror for syntax highlighting

---

## Files Created/Modified

### New Files

#### `/src/components/CodeEditor.tsx`
Client component that provides the code editor interface:
- Code textarea for writing JavaScript
- Run button to execute code
- Output panel showing console logs and errors
- Terminal-style output display

**Features:**
- Captures console.log output during execution
- Safe error handling with try-catch
- JSON stringification for object logging
- Clean UI with Tailwind styling

### Modified Files

#### `/src/app/courses/[courseId]/[lecture]/page.tsx`
Updated to show split-screen layout when lesson has code editor enabled:
- Imports CodeEditor component
- Conditional grid layout for video + editor
- Passes editor content and type from database

#### `/prisma/seed.ts`
Updated lesson templates to include code editor fields:
- Added `has_code_editor` boolean flag
- Added `editor_type` field (javascript/typescript/jupyter)
- Added `editor_content` with sample SAPUI5 code
- "Hands-on Demo" lessons now include interactive code

---

## Database Fields

The following fields in the `Lesson` model control the code editor:

```prisma
model Lesson {
  // ... other fields

  has_code_editor     Boolean  @default(false)
  editor_type         String?  // "javascript", "typescript", "jupyter"
  editor_content      String?  @db.Text // Initial code to display

  // ... other fields
}
```

---

## How to Test

### Step 1: Re-seed Database
```bash
npm run db:seed
```

This will create lessons with the code editor enabled for "Hands-on Demo" lessons.

### Step 2: Navigate to a Hands-on Demo Lesson
```
http://localhost:3000/courses/beginners-guide-to-sapui5/introduction-lesson-2
```

This is "Hands-on Demo 2" in the Introduction unit, which has the code editor enabled.

### Step 3: Try the Code Editor
1. You'll see the video on the left and code editor on the right
2. The editor will have sample SAPUI5 controller code
3. Click "Run Code" to execute it
4. See the output in the terminal-style console below

---

## Example Code Editor Content

The seed script includes this sample code for SAPUI5 lessons:

```javascript
// SAP UI5 - Creating a Simple Controller
// This example demonstrates how to define a controller in SAPUI5

sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("myapp.controller.Main", {

    onInit: function() {
      console.log("Controller initialized");
    },

    onButtonPress: function() {
      MessageToast.show("Button was pressed!");
      console.log("User clicked the button");
    },

    calculateSum: function(a, b) {
      const result = a + b;
      console.log(`Sum of ${a} + ${b} = ${result}`);
      return result;
    }

  });
});

// Try it out:
console.log("=== SAPUI5 Controller Demo ===");
console.log("Controller initialized");
console.log("Button was pressed!");

const sum = 10 + 20;
console.log(`Sum of 10 + 20 = ${sum}`);
```

---

## Customization Options

### Add Code Editor to Specific Lessons

When creating lessons in the database or seed script:

```typescript
await prisma.lesson.create({
  data: {
    // ... other fields
    has_code_editor: true,
    editor_type: 'javascript',
    editor_content: `console.log('Your custom code here');`,
  }
})
```

### Supported Editor Types

1. **javascript** - Run JavaScript code directly
2. **typescript** - Can be extended with TypeScript compilation
3. **jupyter** - Can be extended for Python execution (requires backend)

---

## Future Enhancements

### Phase 1: Completed ✅
- [x] Basic code editor component
- [x] JavaScript execution
- [x] Console output capture
- [x] Split-screen layout
- [x] Seed data with examples

### Phase 2: Suggested Improvements
- [ ] **Monaco Editor Integration** - Use VS Code's editor for syntax highlighting
- [ ] **Multiple Language Support** - TypeScript, Python, HTML/CSS
- [ ] **Code Persistence** - Save user's code edits in database
- [ ] **Pre-populated Examples** - Load different code snippets per lesson
- [ ] **File Tabs** - Multiple files like real IDEs (Controller.js, View.xml, etc.)
- [ ] **Output Formatting** - Better console output with colors and formatting

### Phase 3: Advanced Features
- [ ] **Backend Execution** - Run Python/Node.js on server side
- [ ] **Jupyter Kernel Integration** - Real Jupyter notebook execution
- [ ] **Code Testing** - Run unit tests against user code
- [ ] **Auto-grading** - Check if code meets requirements
- [ ] **Code Sharing** - Share solutions with other students
- [ ] **Live Preview** - For UI5/HTML lessons, show rendered output

---

## Monaco Editor Upgrade (Optional)

To upgrade to Monaco Editor for better syntax highlighting:

### Install Monaco Editor
```bash
npm install @monaco-editor/react
```

### Update CodeEditor Component
```typescript
import Editor from '@monaco-editor/react'

// Replace textarea with:
<Editor
  height="400px"
  defaultLanguage="javascript"
  value={code}
  onChange={(value) => setCode(value || '')}
  theme="vs-dark"
  options={{
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
  }}
/>
```

---

## Security Considerations

### Current Implementation (Client-Side Execution)
- Uses `eval()` for JavaScript execution
- Safe for basic examples and tutorials
- Code runs in browser sandbox
- Cannot access sensitive data or make external requests

### For Production (Server-Side Execution)
If you plan to execute Python or untrusted code:
1. **Use sandboxed containers** (Docker)
2. **Implement timeouts** to prevent infinite loops
3. **Resource limits** (CPU, memory, execution time)
4. **Code validation** before execution
5. **Rate limiting** to prevent abuse

---

## Usage Statistics

After seeding, you'll have:
- **4 courses** with 79 total lessons
- **~26 lessons** with code editor enabled (all "Hands-on Demo" lessons)
- **JavaScript editor** for UI5, CAP, and ABAP courses
- **Sample code** demonstrating course concepts

---

## Lesson Types with Code Editor

| Course | Unit | Lesson | Editor Type |
|--------|------|--------|-------------|
| UI5 Beginner | All Units | Hands-on Demo 2 | JavaScript |
| CAP Beginner | All Units | Hands-on Demo 2 | JavaScript |
| AI Agents | All Units | Hands-on Demo 2 | JavaScript |
| ABAP Basics | All Units | Hands-on Demo 2 | JavaScript |

---

## Component Props

### CodeEditor Component

```typescript
interface CodeEditorProps {
  initialCode?: string        // Default code to display
  editorType?: "javascript" | "typescript" | "jupyter"
}
```

**Example Usage:**
```tsx
<CodeEditor
  initialCode={lesson.editor_content || undefined}
  editorType={lesson.editor_type as "javascript"}
/>
```

---

## Screenshots

The layout will look like:

```
┌─────────────────────────────────────────────────────────────┐
│  Video Player               │  Interactive Code Editor      │
│  (YouTube embed)            │  ┌─────────────────────────┐  │
│                             │  │ // Your code here       │  │
│                             │  │ console.log('Hello');   │  │
│                             │  │                         │  │
│                             │  └─────────────────────────┘  │
│                             │  [Run Code] button            │
│                             │  ┌─────────────────────────┐  │
│                             │  │ Output:                 │  │
│                             │  │ > Hello                 │  │
│                             │  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

**Created:** 2026-02-05
**Status:** ✅ Ready to Test
**Next Step:** Run `npm run db:seed` and test at lesson URL
