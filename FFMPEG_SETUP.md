# FFmpeg Setup Guide

## What is FFmpeg?

FFmpeg is a powerful video processing tool that converts your uploaded videos into HLS (HTTP Live Streaming) format with encryption for protected content.

## Why Do You Need It?

**For Protected Video Uploads Only** - If you plan to upload paid course videos that need protection.

**NOT needed for**:
- YouTube videos (just paste the video ID)
- Free courses using YouTube
- Text/Markdown lessons

## Installation

### macOS (Homebrew)

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install FFmpeg
brew install ffmpeg

# Verify installation
ffmpeg -version
```

**Expected output:**
```
ffmpeg version 6.x.x
built with ...
```

### Alternative: macOS (MacPorts)

```bash
sudo port install ffmpeg
```

## Verify Installation

After installation, run:

```bash
which ffmpeg
```

Should output something like:
```
/opt/homebrew/bin/ffmpeg
```

## Test Video Processing

```bash
# Create test directory
mkdir -p uploads

# Place a test video in uploads/test.mp4

# Run the processing script
node scripts/process-video.js uploads/test.mp4 test-course test-lesson
```

If successful, you'll see:
```
✓ Video processing completed successfully!

Output Summary:
  Directory: /var/www/videos/courses/test-course/test-lesson
  Playlist: playlist.m3u8
  Segments: 60 files
  Total size: 245.67 MB
  Encryption: AES-128 enabled
```

## Common Issues

### "command not found" after installation

**Problem**: Terminal doesn't see FFmpeg

**Solution**: Restart your terminal or run:
```bash
source ~/.zshrc  # or ~/.bash_profile
```

### Homebrew not found

**Problem**: Homebrew not in PATH

**Solution**:
```bash
# For Apple Silicon Macs
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc

# For Intel Macs
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

## Alternative: Use YouTube Videos Instead

If you don't want to install FFmpeg:

1. Upload your videos to YouTube (can be unlisted)
2. When creating lessons, choose "YouTube Video" tab
3. Paste the YouTube video ID
4. No FFmpeg required!

**Pros**:
- No setup needed
- YouTube handles video delivery
- Works immediately

**Cons**:
- Videos can be downloaded from YouTube
- Less control over video protection
- Requires YouTube account

## Storage Requirements

With FFmpeg installed, videos are stored locally:

- **Location**: `/var/www/videos/courses/`
- **Format**: HLS segments + encrypted chunks
- **Size**: ~22 MB per minute (1080p)
- **Available**: 115GB on your VPS (35-40 courses)

## Recommendations

### For Free Courses
→ Use YouTube videos (no FFmpeg needed)

### For Paid Courses with Basic Protection
→ Use YouTube unlisted videos (no FFmpeg needed)

### For Paid Courses with Strong Protection
→ Install FFmpeg for encrypted HLS videos

## Summary

**FFmpeg Status**: ❌ Not installed
**Installation Time**: ~5 minutes
**Disk Space**: ~50 MB
**Difficulty**: Easy (one command)

**Install now?**
```bash
brew install ffmpeg
```

**Or use YouTube videos instead?**
- Just paste video IDs in lesson editor
- Works immediately without setup
