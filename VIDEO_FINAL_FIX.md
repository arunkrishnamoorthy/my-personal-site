# Video Loading - Final Fix ✅

## Root Cause Found

The playlist.m3u8 file had **relative segment paths** like:
```
segment-000.ts
```

When HLS.js resolved these against the base URL:
```
/api/videos/building-agent-with-ai-core/introduction-to-sap-ai-core?token=xxx
```

It created **incorrect URLs** like:
```
❌ /api/videos/building-agent-with-ai-core/segment-000.ts?token=xxx
```

Missing the `lesson-slug` and the `file=` parameter!

---

## The Fix

### Modified API Route
Now when serving `playlist.m3u8`, the API dynamically rewrites segment paths to:

```
✅ /api/videos/building-agent-with-ai-core/introduction-to-sap-ai-core?token=xxx&file=segment-000.ts
```

### Code Changes

**File**: `src/app/api/videos/[courseSlug]/[lessonSlug]/route.ts`

```typescript
// Build base URL for this playlist
const baseUrl = `/api/videos/${courseSlug}/${lessonSlug}?token=${token}`

// Replace segment filenames with full query-parameter URLs
let modifiedPlaylist = playlistContent.replace(
  /^(segment-\d+\.ts)$/gm,
  `${baseUrl}&file=$1`
)
```

**Result**: Every segment line in the playlist is replaced with a full API URL including token and file parameter.

---

## How to Test

### Step 1: Restart Dev Server (CRITICAL!)
```bash
# Stop with Ctrl+C
npm run dev
```

### Step 2: Hard Refresh Browser
```bash
# Clear cache and reload
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# OR open in incognito/private window
```

### Step 3: Visit Lesson
```
http://localhost:3000/courses/building-agent-with-ai-core/introduction-to-sap-ai-core
```

### Step 4: Check Network Tab (F12)

You should now see:

✅ **Playlist Request**:
```
GET /api/videos/building-agent-with-ai-core/introduction-to-sap-ai-core?token=...
Status: 200
Response: Modified playlist with full URLs
```

✅ **Key Request**:
```
GET /api/videos/key/building-agent-with-ai-core/introduction-to-sap-ai-core?token=...
Status: 200
```

✅ **Segment Requests** (all 30):
```
GET /api/videos/building-agent-with-ai-core/introduction-to-sap-ai-core?token=...&file=segment-000.ts
GET /api/videos/building-agent-with-ai-core/introduction-to-sap-ai-core?token=...&file=segment-001.ts
...
Status: 200 (ALL should be 200, not 403!)
```

---

## What Changed

| Component | Before | After |
|-----------|--------|-------|
| **Playlist segments** | `segment-000.ts` | `/api/videos/.../...?token=xxx&file=segment-000.ts` |
| **HLS.js resolution** | Incorrect path | Correct full URL |
| **Request format** | Missing lesson slug | Complete API path |
| **Token** | In query string | In query string ✅ |
| **File parameter** | Missing | Included ✅ |

---

## Expected Behavior

### Before Fix
- ❌ 403 Forbidden on all segments
- ❌ URLs missing lesson slug
- ❌ Token mismatch errors
- ❌ Video fails to load

### After Fix
- ✅ 200 OK on all segments
- ✅ Complete URLs with all parameters
- ✅ Token validation passes
- ✅ Video loads and plays!

---

## If It Still Doesn't Work

### Check 1: Playlist Content
View the modified playlist in Network tab:
1. F12 → Network
2. Find request to `?token=...` (without `&file=`)
3. Click on it → Response tab
4. Check if segments have full URLs

Should look like:
```
#EXTINF:10.800000,
/api/videos/building-agent-with-ai-core/introduction-to-sap-ai-core?token=xxx&file=segment-000.ts
```

### Check 2: Segment Requests
In Network tab, find segment requests:
- Should have `&file=segment-XXX.ts` in URL
- Should return Status 200
- Should have `Content-Type: video/mp2t`

### Check 3: Console Errors
F12 → Console tab
- Look for HLS.js errors
- Look for 403/404 errors
- Share any error messages

---

## Summary of All Fixes

1. ✅ Fixed async params (Next.js 15)
2. ✅ Moved video files to correct course slug
3. ✅ Updated database with correct paths
4. ✅ Fixed playlist encryption key URI
5. ✅ Created encryption key API endpoint
6. ✅ Added environment variables
7. ✅ **Fixed segment URL generation** (this fix)

---

## Next Steps

1. **Restart dev server** → `npm run dev`
2. **Hard refresh browser** → Cmd+Shift+R
3. **Visit lesson page**
4. **Video should play!** 🎉

If segments still show 403, share:
- Screenshot of Network tab showing the failing request
- The exact URL that's failing
- Response/Preview tab content

---

**Last Updated**: 2026-02-13 21:30
**Status**: Should be working now!
**Action**: Restart dev server + hard refresh browser
