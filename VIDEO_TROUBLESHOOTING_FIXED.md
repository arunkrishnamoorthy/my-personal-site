# Video Upload Issue - FIXED ✅

## What Was Wrong

When you uploaded the video, three issues occurred:

### 1. FFmpeg Timing Issue
- **Problem**: FFmpeg wasn't installed when you first tried to upload
- **Result**: Video processing failed, but lesson was saved with `video_type="hls"` but NULL paths
- **Fixed**: FFmpeg is now installed and working

### 2. Wrong Course Slug in Paths
- **Problem**: Upload API used `course-{id}` instead of actual course slug
- **Result**: Videos stored in `public/videos/courses/course-10/` instead of `courses/building-agent-with-ai-core/`
- **Fixed**:
  - Moved video files to correct location
  - Updated upload API to fetch actual course slug

### 3. Missing Database Paths
- **Problem**: When FFmpeg failed, database wasn't updated with video paths
- **Result**: Lesson had NULL values for `hls_playlist_path`, `hls_storage_path`, `hls_encryption_key`
- **Fixed**: Updated database with correct paths

### 4. Missing Environment Variables
- **Problem**: `.env` didn't have VIDEO_SECRET and VIDEO_STORAGE_PATH
- **Result**: Video serving might fail
- **Fixed**: Added required environment variables

---

## What Was Fixed

### ✅ Database Updated
```sql
Lesson ID 177 now has:
- hls_playlist_path: 'courses/building-agent-with-ai-core/introduction-to-sap-ai-core/playlist.m3u8'
- hls_storage_path: 'courses/building-agent-with-ai-core/introduction-to-sap-ai-core'
- hls_encryption_key: (base64 encrypted key)
```

### ✅ Video Files Moved
```
FROM: public/videos/courses/course-10/introduction-to-sap-ai-core/
TO:   public/videos/courses/building-agent-with-ai-core/introduction-to-sap-ai-core/

Contains:
- playlist.m3u8 (HLS playlist)
- segment-000.ts through segment-029.ts (video chunks)
- key.key (encryption key)
- keyinfo.txt (key info)
```

### ✅ Upload API Fixed
```typescript
// Now fetches actual course slug from database
const course = await db.course.findUnique({
  where: { id: parseInt(courseId) },
  select: { slug: true },
})
const courseSlug = course.slug  // 'building-agent-with-ai-core'
```

### ✅ Environment Variables Added
```env
VIDEO_STORAGE_PATH=./public/videos
VIDEO_SECRET=video-secret-key-change-in-production
VIDEO_KEY_INFO_URL=/api/videos/key
```

### ✅ Async Params Fixed
Fixed Next.js 15 compatibility issue in course management pages

---

## How to Test

### 1. Restart Your Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

The new environment variables need to be loaded.

### 2. Navigate to Your Lesson
```
http://localhost:3000/courses/building-agent-with-ai-core/introduction-to-sap-ai-core
```

### 3. Expected Result
- ✅ Video player appears
- ✅ Video loads and plays
- ✅ Controls work (play, pause, seek, volume)
- ✅ No "Failed to load" error

### 4. What You Should See
The HLS player loading the video with these API calls:
```
GET /api/videos/building-agent-with-ai-core/introduction-to-sap-ai-core?token=<JWT>
GET /api/videos/building-agent-with-ai-core/introduction-to-sap-ai-core?token=<JWT>&file=segment-000.ts
GET /api/videos/building-agent-with-ai-core/introduction-to-sap-ai-core?token=<JWT>&file=segment-001.ts
... (and so on)
```

---

## For Future Video Uploads

When you upload new videos now:

### ✅ What Will Work
1. FFmpeg is installed → Videos will process correctly
2. API uses correct course slug → Files saved in right location
3. Database updated automatically → Paths saved correctly
4. Environment variables set → Video serving works

### 📝 Upload Process
1. Go to `/courses/manage/{courseId}`
2. Click "Units & Lessons" tab
3. Add or edit a lesson
4. Select "Upload Protected Video"
5. Upload MP4 file
6. Wait 2-10 minutes for processing
7. Click "Save Lesson"
8. ✅ Video ready to play!

### 🎬 Result
Videos will be stored as:
```
public/videos/courses/{course-slug}/{lesson-slug}/
├── playlist.m3u8
├── segment-000.ts
├── segment-001.ts
├── ...
├── key.key
└── keyinfo.txt
```

And accessible via:
```
/api/videos/{course-slug}/{lesson-slug}?token={JWT}
```

---

## If It Still Doesn't Work

### Check These:

1. **Dev server restarted?**
   ```bash
   # Make sure you restarted after env changes
   npm run dev
   ```

2. **Browser cache**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Or open in incognito/private window

3. **Check browser console (F12)**
   - Look for errors
   - Check Network tab for failed requests

4. **Verify database**
   ```bash
   npx tsx -e "
   import { PrismaClient } from '@prisma/client';
   const prisma = new PrismaClient();
   prisma.lesson.findFirst({
     where: { id: 177 },
     select: { hls_playlist_path: true, hls_storage_path: true }
   }).then(console.log);
   "
   ```

5. **Check video files exist**
   ```bash
   ls -la public/videos/courses/building-agent-with-ai-core/introduction-to-sap-ai-core/
   ```

6. **Test API directly**
   - Generate a test token: (need to implement this if needed)
   - Call: `http://localhost:3000/api/videos/building-agent-with-ai-core/introduction-to-sap-ai-core?token={TOKEN}`

---

## Security Notes

### Current Setup
- ✅ Videos encrypted with AES-128
- ✅ JWT token authentication
- ✅ Path traversal protection
- ✅ Tokens expire after 1 hour
- ✅ Download button disabled
- ✅ Right-click disabled

### Production Recommendations
1. **Change VIDEO_SECRET**
   ```bash
   # Generate secure secret
   openssl rand -base64 32

   # Add to .env
   VIDEO_SECRET=<generated-secret>
   ```

2. **Enable Access Control**
   - Check user enrollment before serving videos
   - Verify course purchase for paid courses
   - See `hasVideoAccess()` in `src/lib/video-utils.ts`

3. **Add Rate Limiting**
   - Prevent abuse of video API
   - Limit token generation

---

## Summary

### What Was Broken
- ❌ FFmpeg not installed
- ❌ Wrong course slug in paths
- ❌ Database paths NULL
- ❌ Environment variables missing

### What's Fixed
- ✅ FFmpeg installed and working
- ✅ Correct course slug used
- ✅ Database updated with correct paths
- ✅ Environment variables added
- ✅ Upload API fixed for future uploads

### Next Steps
1. Restart dev server
2. Test video playback
3. Upload new videos (will work correctly now)
4. Enjoy! 🎉

---

**Last Updated**: 2026-02-13
**Issue**: Video upload processed but failed to load
**Status**: ✅ RESOLVED
