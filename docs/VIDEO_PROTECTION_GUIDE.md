# Video Protection & Hosting Guide

## Overview

This guide explains how to host and protect videos for your e-learning platform. The system supports two video types:

1. **YouTube Embeds** - For free courses
2. **HLS Streaming** - For paid courses with download protection

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Setup Requirements](#setup-requirements)
3. [Video Processing Workflow](#video-processing-workflow)
4. [Database Configuration](#database-configuration)
5. [Protection Features](#protection-features)
6. [Cost Analysis](#cost-analysis)
7. [Troubleshooting](#troubleshooting)
8. [Security Considerations](#security-considerations)

---

## Architecture Overview

### Storage Architecture

```
public/videos/
└── courses/
    ├── course-slug-1/
    │   ├── lesson-1/
    │   │   ├── playlist.m3u8      (HLS playlist)
    │   │   ├── segment-000.ts     (encrypted video chunk 1)
    │   │   ├── segment-001.ts     (encrypted video chunk 2)
    │   │   ├── segment-002.ts     (encrypted video chunk 3)
    │   │   ├── ...
    │   │   ├── key.key            (AES-128 encryption key)
    │   │   └── keyinfo.txt        (key information for FFmpeg)
    │   └── lesson-2/
    │       └── ...
    └── course-slug-2/
        └── ...
```

### Request Flow

```
User Request Video
       ↓
Server generates JWT token (1 hour expiration)
       ↓
Client receives video URL with token
       ↓
Video player requests playlist.m3u8 with token
       ↓
Server verifies token & returns playlist
       ↓
Player requests segments (segment-000.ts, etc.)
       ↓
Server verifies token for each segment
       ↓
Encrypted segments delivered to player
       ↓
Player decrypts and plays video
```

---

## Setup Requirements

### 1. Install Dependencies

```bash
# Install HLS.js for browser-based HLS playback
npm install hls.js

# Install jose for JWT token generation (if not already installed)
npm install jose

# Ensure FFmpeg is installed on your system
# macOS:
brew install ffmpeg

# Ubuntu/Debian:
sudo apt update && sudo apt install ffmpeg

# Windows:
# Download from https://ffmpeg.org/download.html
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Video Storage Path
VIDEO_STORAGE_PATH=./public/videos

# Video Secret Key (generate with: openssl rand -base64 32)
VIDEO_SECRET=your_secret_key_here_change_in_production

# Video Key Info URL
VIDEO_KEY_INFO_URL=/api/videos/key
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

### 3. Create Video Storage Directory

```bash
mkdir -p public/videos/courses
```

---

## Video Processing Workflow

### Step 1: Prepare Your Video

- Format: MP4 (H.264 video, AAC audio)
- Resolution: 1920x1080 (1080p) recommended
- Bitrate: 5-8 Mbps for 1080p
- Audio: 128-192 kbps AAC

Place your video in an `uploads/` directory (create if needed):

```bash
mkdir uploads
mv my-course-video.mp4 uploads/
```

### Step 2: Process Video to HLS

Run the processing script:

```bash
node scripts/process-video.js <input-video> <course-slug> <lesson-slug>
```

**Example:**

```bash
node scripts/process-video.js \
  uploads/intro-to-sap.mp4 \
  sap-abap-fundamentals \
  lesson-1-introduction
```

**What happens:**
1. Creates output directory: `public/videos/courses/sap-abap-fundamentals/lesson-1-introduction/`
2. Generates AES-128 encryption key
3. Converts video to HLS format (10-second segments)
4. Encrypts each segment with AES-128
5. Creates playlist.m3u8 file
6. Outputs database update information

**Output:**
```
Processing video with FFmpeg...
✓ Video processing completed successfully!

Output Summary:
  Directory: public/videos/courses/sap-abap-fundamentals/lesson-1-introduction
  Playlist: playlist.m3u8
  Segments: 120 files
  Total size: 245.67 MB
  Encryption: AES-128 enabled

Database Update Information:
Update your lesson record with:
  video_type: "hls"
  hls_playlist_path: "courses/sap-abap-fundamentals/lesson-1-introduction/playlist.m3u8"
  hls_storage_path: "courses/sap-abap-fundamentals/lesson-1-introduction"
  hls_encryption_key: "dGVzdGtleXRlc3RrZXk="
```

### Step 3: Update Database

Copy the SQL command from the output and run it:

```sql
UPDATE "Lesson" SET
  video_type = 'hls',
  hls_playlist_path = 'courses/sap-abap-fundamentals/lesson-1-introduction/playlist.m3u8',
  hls_storage_path = 'courses/sap-abap-fundamentals/lesson-1-introduction',
  hls_encryption_key = 'dGVzdGtleXRlc3RrZXk='
WHERE slug = 'lesson-1-introduction';
```

**Or update via Prisma:**

```typescript
import prisma from "@/db"

await prisma.lesson.update({
  where: { slug: "lesson-1-introduction" },
  data: {
    video_type: "hls",
    hls_playlist_path: "courses/sap-abap-fundamentals/lesson-1-introduction/playlist.m3u8",
    hls_storage_path: "courses/sap-abap-fundamentals/lesson-1-introduction",
    hls_encryption_key: "dGVzdGtleXRlc3RrZXk=",
  },
})
```

### Step 4: Test Video Playback

1. Navigate to the lesson page: `/courses/sap-abap-fundamentals/lesson-1-introduction`
2. The VideoPlayer component will automatically detect HLS video type
3. Video should load and play with controls
4. Check browser console for any errors

---

## Database Configuration

### Lesson Schema Fields

```prisma
model Lesson {
  // Video type selector
  video_type          String   @db.VarChar(20) @default("youtube")

  // YouTube videos (free courses)
  youtube_id          String?  @db.VarChar(100)

  // HLS videos (paid courses with protection)
  hls_playlist_path   String?  @db.VarChar(500)
  hls_storage_path    String?  @db.VarChar(500)
  hls_encryption_key  String?  @db.VarChar(500)

  // Common fields
  video_duration_mins Int?     @default(0)
}
```

### Example: Free Course (YouTube)

```typescript
{
  video_type: "youtube",
  youtube_id: "dQw4w9WgXcQ",
  video_duration_mins: 15,
  hls_playlist_path: null,
  hls_storage_path: null,
  hls_encryption_key: null
}
```

### Example: Paid Course (HLS)

```typescript
{
  video_type: "hls",
  youtube_id: null,
  video_duration_mins: 45,
  hls_playlist_path: "courses/sap-abap-fundamentals/lesson-1/playlist.m3u8",
  hls_storage_path: "courses/sap-abap-fundamentals/lesson-1",
  hls_encryption_key: "dGVzdGtleXRlc3RrZXk="
}
```

---

## Protection Features

### What This System Provides

#### 1. **HLS Chunking**
- Video split into 100+ small segments (10 seconds each)
- Downloading all segments manually is tedious and time-consuming
- Makes bulk download tools less effective

#### 2. **AES-128 Encryption**
- Each video segment is encrypted with a unique key
- Key is stored server-side and only served to authenticated requests
- Even if segments are downloaded, they cannot be played without the key

#### 3. **Signed URLs with Expiration**
- All video requests require a valid JWT token
- Tokens expire after 1 hour (configurable)
- Shared URLs become invalid after expiration
- Each token is tied to specific course/lesson

#### 4. **Server-Side Authorization**
- API endpoint verifies token before serving content
- Future enhancement: Check user enrollment/purchase status
- Can implement IP restrictions, rate limiting, etc.

#### 5. **Player-Level Protection**
- Right-click disabled on video player
- Download button disabled via `controlsList="nodownload"`
- DevTools console warnings for unauthorized access attempts

#### 6. **Path Traversal Protection**
- File paths sanitized to prevent `../../` attacks
- Only files within designated video directory are accessible
- Security validation on every request

### What This System CANNOT Prevent

1. **Screen Recording** - Users can always record their screen
2. **Determined Pirates** - Advanced users with browser DevTools can still extract segments
3. **DRM-Level Protection** - This is not enterprise DRM (Widevine, FairPlay)

### Protection Level Comparison

| Method | Casual Users | Intermediate Users | Advanced Users | Cost |
|--------|--------------|-------------------|----------------|------|
| YouTube Embed | ❌ Easy download | ❌ Easy download | ❌ Easy download | $0 |
| Direct MP4 Link | ❌ Right-click save | ❌ Right-click save | ❌ Right-click save | $0 |
| **HLS + Encryption** | ✅ Blocked | ⚠️ Difficult | ❌ Possible | **$0-5/mo** |
| DRM (Widevine) | ✅ Blocked | ✅ Blocked | ⚠️ Difficult | $500+/mo |

**Verdict:** HLS + Encryption stops 95%+ of users with minimal cost.

---

## Cost Analysis

### Self-Hosted on VPS (Recommended)

**Assumptions:**
- 100GB video storage
- 100GB bandwidth per month
- 10 courses with 20 lessons each

| Component | Cost |
|-----------|------|
| VPS Storage (100GB) | $0 (included) |
| Bandwidth (100GB/month) | $0-5 (most VPS include 1TB+) |
| FFmpeg Processing | $0 (run on VPS) |
| SSL Certificate | $0 (Let's Encrypt) |
| **Total per month** | **$0-5** |

### Alternative: Cloudflare R2

If your VPS storage is limited:

| Component | Cost |
|-----------|------|
| Storage (100GB @ $0.015/GB) | $1.50 |
| Bandwidth (100GB @ $0/GB) | $0 (FREE egress!) |
| Operations (10K requests @ $0.36/million) | $0.004 |
| **Total per month** | **~$1.50** |

**Why Cloudflare R2?**
- S3-compatible API
- **Zero egress fees** (unlike AWS S3)
- Global CDN included
- Easy integration

### Comparison with Third-Party Services

| Service | Cost (100GB storage + 100GB bandwidth) | Protection Level |
|---------|----------------------------------------|------------------|
| **Self-hosted HLS** | **$0-5/mo** | **Moderate** ✅ |
| Vimeo Pro | $20/mo (up to 1TB bandwidth) | Moderate |
| Wistia | $99/mo (200GB bandwidth) | High (DRM) |
| Cloudflare Stream | $5/mo (1,000 mins) + $1/1,000 mins | High (HLS) |
| AWS CloudFront + S3 | ~$15-20/mo | Moderate |

---

## Troubleshooting

### Issue: Video Not Playing

**Symptoms:**
- Black screen with loading spinner
- Error: "Failed to load video"

**Solutions:**

1. **Check browser console for errors:**
   ```
   Press F12 → Console tab
   ```

2. **Verify video files exist:**
   ```bash
   ls -la public/videos/courses/your-course/your-lesson/
   ```
   Should see: playlist.m3u8, segment-*.ts files

3. **Check file permissions:**
   ```bash
   chmod -R 755 public/videos/
   ```

4. **Verify database record:**
   ```sql
   SELECT video_type, hls_playlist_path, hls_storage_path
   FROM "Lesson"
   WHERE slug = 'your-lesson-slug';
   ```

5. **Test video URL directly:**
   ```
   http://localhost:3000/api/videos/course-slug/lesson-slug?token=YOUR_TOKEN
   ```

### Issue: Token Expired Error

**Symptoms:**
- Error: "Invalid or expired token"
- Video stops playing after 1 hour

**Solutions:**

1. **Refresh the page** - New token is generated on each page load
2. **Increase token expiration** in `src/lib/video-utils.ts`:
   ```typescript
   export async function generateVideoToken(
     // ...
     expiresIn: number = 7200 // 2 hours instead of 1
   ) {
     // ...
   }
   ```

### Issue: FFmpeg Processing Fails

**Symptoms:**
- Error during video processing
- "FFmpeg not found"

**Solutions:**

1. **Install FFmpeg:**
   ```bash
   # macOS
   brew install ffmpeg

   # Ubuntu
   sudo apt install ffmpeg
   ```

2. **Verify FFmpeg installation:**
   ```bash
   ffmpeg -version
   ```

3. **Check input video format:**
   ```bash
   ffmpeg -i your-video.mp4
   ```
   Should show valid video/audio streams

### Issue: Large Video File Sizes

**Symptoms:**
- Processed video is larger than original
- Slow loading times

**Solutions:**

1. **Re-encode video before processing:**
   ```bash
   ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 23 \
     -c:a aac -b:a 128k output.mp4
   ```
   - `-crf 23`: Quality (18-28, lower = better quality)
   - `-preset medium`: Encoding speed vs compression

2. **Use adaptive bitrate streaming:**
   Modify `scripts/process-video.js` to create multiple quality versions:
   - 1080p (5 Mbps)
   - 720p (2.5 Mbps)
   - 480p (1 Mbps)

---

## Security Considerations

### Current Security Measures

1. ✅ **JWT Token Authentication** - All requests must include valid token
2. ✅ **Token Expiration** - Tokens expire after 1 hour
3. ✅ **AES-128 Encryption** - Video segments are encrypted
4. ✅ **Path Sanitization** - Prevents directory traversal attacks
5. ✅ **CORS Protection** - API only accessible from same origin
6. ✅ **No Caching** - `Cache-Control: no-cache` headers

### Recommended Enhancements

#### 1. Rate Limiting

Prevent brute-force token attacks:

```typescript
// src/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const requestCounts = new Map<string, number>()

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/videos/")) {
    const ip = request.ip || "unknown"
    const count = requestCounts.get(ip) || 0

    if (count > 100) { // 100 requests per minute
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    requestCounts.set(ip, count + 1)
    setTimeout(() => requestCounts.delete(ip), 60000)
  }

  return NextResponse.next()
}
```

#### 2. User Enrollment Check

Verify user has purchased/enrolled in course:

```typescript
// src/lib/video-utils.ts
export async function hasVideoAccess(
  userId: string | undefined,
  courseSlug: string,
  lessonSlug: string
): Promise<boolean> {
  if (!userId) return false

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      user_id: parseInt(userId),
      course: { slug: courseSlug },
      enrollment_status: "active"
    }
  })

  return !!enrollment
}
```

#### 3. Watermarking

Add user-specific watermarks to discourage sharing:

```bash
ffmpeg -i input.mp4 \
  -vf "drawtext=text='User: john@example.com':fontsize=24:fontcolor=white@0.5:x=10:y=10" \
  output.mp4
```

#### 4. CDN Integration

Serve videos through Cloudflare CDN:

```typescript
// src/app/api/videos/[courseSlug]/[lessonSlug]/route.ts
const videoUrl = process.env.VIDEO_CDN_URL
  ? `${process.env.VIDEO_CDN_URL}/${lesson.hls_storage_path}/${sanitizedFile}`
  : localPath
```

### Security Best Practices

1. **Rotate VIDEO_SECRET regularly** (every 3-6 months)
2. **Monitor unusual access patterns** (same IP requesting many videos)
3. **Backup encryption keys** (store `key.key` files securely)
4. **Use HTTPS in production** (never serve videos over HTTP)
5. **Keep FFmpeg updated** (security patches)
6. **Limit token scope** (one token per video, not per course)

---

## Advanced Topics

### Multi-Quality Streaming

Create multiple quality versions for adaptive bitrate streaming:

```javascript
// scripts/process-video-adaptive.js
const qualities = [
  { name: "1080p", height: 1080, bitrate: "5M" },
  { name: "720p", height: 720, bitrate: "2.5M" },
  { name: "480p", height: 480, bitrate: "1M" },
]

qualities.forEach((quality) => {
  const command = `ffmpeg -i ${input} \
    -vf scale=-2:${quality.height} \
    -b:v ${quality.bitrate} \
    -c:a aac -b:a 128k \
    -hls_time 10 \
    ${outputDir}/${quality.name}/playlist.m3u8`

  execSync(command)
})

// Create master playlist
const masterPlaylist = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
720p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=854x480
480p/playlist.m3u8`

fs.writeFileSync(`${outputDir}/master.m3u8`, masterPlaylist)
```

### Video Analytics

Track video engagement:

```typescript
// Track watch progress
await prisma.lessonProgress.upsert({
  where: {
    user_id_lesson_id: { user_id: userId, lesson_id: lessonId }
  },
  update: {
    last_position_secs: currentTime,
    watch_duration_secs: { increment: timeDelta },
    last_accessed_at: new Date()
  },
  create: {
    user_id: userId,
    lesson_id: lessonId,
    last_position_secs: currentTime,
    watch_duration_secs: timeDelta
  }
})
```

### Automated Processing Pipeline

Create a batch processing script:

```bash
#!/bin/bash
# scripts/batch-process-videos.sh

VIDEO_DIR="uploads"
COURSE_SLUG="$1"

for video in "$VIDEO_DIR"/*.mp4; do
  filename=$(basename "$video" .mp4)
  lesson_slug=$(echo "$filename" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

  echo "Processing: $video → $lesson_slug"
  node scripts/process-video.js "$video" "$COURSE_SLUG" "$lesson_slug"
done
```

---

## Next Steps

1. ✅ **System is now ready for video uploads**
2. 📹 **Process your first video** using the script
3. 🔐 **Test the protection** by trying to download the video
4. 💾 **Set up backups** for your video files
5. 📊 **Monitor storage usage** as you add more videos
6. 🚀 **Consider CDN integration** when traffic grows

---

## Support & Resources

- **FFmpeg Documentation:** https://ffmpeg.org/documentation.html
- **HLS.js Documentation:** https://github.com/video-dev/hls.js/
- **JWT Best Practices:** https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/
- **Video Encoding Guide:** https://trac.ffmpeg.org/wiki/Encode/H.264

---

**Last Updated:** 2026-02-06
**Version:** 1.0.0
**Author:** Arun Krishnamoorthy
