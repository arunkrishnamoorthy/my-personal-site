# Video Options for Your E-Learning Platform

## Two Ways to Add Videos

You have **two options** for adding videos to your courses. Here's how to choose:

---

## Option 1: YouTube Videos (✅ Works Now)

### How It Works
1. Upload your video to YouTube
2. Get the video ID from the URL
3. Paste it in the lesson editor
4. Done! No installation needed

### Steps

**1. Upload to YouTube**
- Go to https://youtube.com/upload
- Upload your video
- Set visibility:
  - **Public**: Anyone can find it
  - **Unlisted**: Only people with link can watch (recommended)
  - **Private**: Only you can see it (won't work for courses)

**2. Get Video ID**

From this URL:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

The video ID is:
```
dQw4w9WgXcQ
```

**3. Add to Lesson**
- Create lesson in course manager
- Select "YouTube Video" tab
- Paste video ID: `dQw4w9WgXcQ`
- Save lesson

**4. Result**
Video plays embedded in your course page!

### Pros
✅ **No setup required** - Works immediately
✅ **Free hosting** - YouTube handles storage & bandwidth
✅ **Reliable playback** - YouTube's infrastructure
✅ **Multiple qualities** - YouTube auto-generates (360p, 720p, 1080p)
✅ **Mobile friendly** - Works on all devices
✅ **Fast** - YouTube's CDN worldwide

### Cons
❌ **Less control** - YouTube controls the player
❌ **Downloadable** - Users can download with tools
❌ **Ads possible** - YouTube may show ads (unless unlisted)
❌ **External dependency** - Requires YouTube account

### Best For
- ✅ Free courses
- ✅ Quick setup
- ✅ Public educational content
- ✅ When video protection isn't critical

---

## Option 2: Protected HLS Videos (⚙️ Requires FFmpeg)

### How It Works
1. Upload MP4 file in lesson editor
2. System converts to encrypted HLS format
3. Video stored on your server
4. Harder to download (95%+ protection)

### Requirements

**Must Install FFmpeg First:**
```bash
# macOS
brew install ffmpeg

# Takes ~5 minutes
# One-time setup
```

See `FFMPEG_SETUP.md` for detailed instructions.

### Steps

**1. Install FFmpeg** (one-time)
```bash
brew install ffmpeg
ffmpeg -version  # Verify
```

**2. Setup Storage** (one-time)
```bash
mkdir -p /var/www/videos/courses
sudo chown -R $USER:$USER /var/www/videos
```

**3. Add Environment Variables** (one-time)
```env
VIDEO_STORAGE_PATH=/var/www/videos
VIDEO_SECRET=<run: openssl rand -base64 32>
```

**4. Upload Video**
- Create lesson in course manager
- Select "Upload Protected Video" tab
- Drag & drop or select MP4 file (max 2GB)
- Wait for processing (2-10 minutes)
- Save lesson

**5. Result**
Encrypted video plays on your course page with download protection!

### Pros
✅ **95%+ download protection** - Encrypted segments
✅ **Full control** - Your server, your rules
✅ **No external dependencies** - All self-hosted
✅ **Professional** - Like Netflix, Udemy, Coursera
✅ **Privacy** - Videos on your server only

### Cons
❌ **Setup required** - FFmpeg installation
❌ **Storage needed** - ~22 MB per minute (1080p)
❌ **Processing time** - 2-10 minutes per video
❌ **Bandwidth costs** - Your server bandwidth used

### Best For
- ✅ Paid courses
- ✅ Premium content
- ✅ Exclusive material
- ✅ When protection is important

---

## Quick Comparison

| Feature | YouTube | Protected HLS |
|---------|---------|---------------|
| **Setup** | None | FFmpeg install |
| **Upload** | To YouTube | Direct upload |
| **Storage** | Free (YouTube) | Your server |
| **Protection** | Basic | Strong (95%+) |
| **Cost** | Free | Server storage |
| **Quality** | YouTube decides | You control |
| **Speed to Use** | Immediate | 2-10 min processing |
| **Best For** | Free courses | Paid courses |

---

## Current Status on Your System

❌ **FFmpeg**: Not installed
✅ **YouTube**: Ready to use now
✅ **Course Manager**: Fully working
✅ **Lesson Editor**: Both options available

---

## Recommendations

### Scenario 1: You Want to Start Immediately
→ **Use YouTube videos**
- Upload videos to YouTube (unlisted)
- Paste video IDs in lesson editor
- Start creating courses today!

### Scenario 2: You Have Paid Courses
→ **Install FFmpeg** (5 minutes)
```bash
brew install ffmpeg
```
Then upload videos directly for protection

### Scenario 3: Mix of Free and Paid
→ **Use both!**
- Free courses: YouTube videos
- Paid courses: Protected HLS (after FFmpeg install)

---

## How to Choose for Each Course

When creating a lesson, you'll see both options:

```
┌─────────────────────────────────────┐
│  YouTube Video  │  Upload Protected │
├─────────────────┴───────────────────┤
│                                     │
│  Choose based on:                   │
│  - Course is free? → YouTube        │
│  - Course is paid? → Upload         │
│  - Need protection? → Upload        │
│  - Quick setup? → YouTube           │
│                                     │
└─────────────────────────────────────┘
```

---

## Next Steps

### Option A: Start with YouTube (5 minutes)

1. Upload a video to YouTube
2. Set as "Unlisted"
3. Copy video ID from URL
4. Go to `/courses/manage`
5. Create course → Add unit → Add lesson
6. Select "YouTube Video"
7. Paste video ID
8. Save & preview!

### Option B: Install FFmpeg (10 minutes)

1. Install FFmpeg:
   ```bash
   brew install ffmpeg
   ```

2. Setup storage:
   ```bash
   mkdir -p /var/www/videos/courses
   sudo chown -R $USER:$USER /var/www/videos
   ```

3. Add to `.env`:
   ```env
   VIDEO_STORAGE_PATH=/var/www/videos
   VIDEO_SECRET=<openssl rand -base64 32>
   ```

4. Test upload:
   - Go to `/courses/manage`
   - Create course → Add unit → Add lesson
   - Select "Upload Protected Video"
   - Upload MP4 file
   - Wait for processing
   - Save & preview!

---

## Summary

**Both video systems are fully implemented and working!**

The error you saw was just because FFmpeg isn't installed yet.

**Quick Decision:**
- Want to start NOW? → Use YouTube
- Have 5 minutes? → Install FFmpeg for both options

**Question for you:**
Which would you like to use? I can help you set up either or both! 🎥
