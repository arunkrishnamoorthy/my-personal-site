# Video Storage Setup Guide

## Overview

This guide documents the video storage configuration for your e-learning platform on a VPS with 155GB available disk space.

**Recommended Setup:** Local VPS storage at `/var/www/videos`

---

## Table of Contents

1. [System Specifications](#system-specifications)
2. [Initial Setup](#initial-setup)
3. [Configuration](#configuration)
4. [Verification](#verification)
5. [Monitoring](#monitoring)
6. [Capacity Planning](#capacity-planning)
7. [Maintenance](#maintenance)
8. [Backup Strategy](#backup-strategy)
9. [Migration Path](#migration-path)
10. [Troubleshooting](#troubleshooting)

---

## System Specifications

### Current VPS Disk Space

```
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       193G   39G  155G  20% /
```

**Available for Videos:** 155GB (with 40GB buffer = **115GB usable**)

### Storage Capacity

| Content Type | Quantity | Storage Used |
|--------------|----------|--------------|
| 30-min lesson (1080p) | 1 | ~330 MB |
| 1-hour lesson (1080p) | 1 | ~660 MB |
| 10-lesson course (30 min each) | 1 | ~3.3 GB |
| **Total Capacity** | **35-40 courses** | **~115 GB** |

### Projected Growth

| Timeline | Courses | Storage Used | Remaining |
|----------|---------|--------------|-----------|
| Now | 0 | 0 GB | 155 GB |
| 6 months | 10 | 33 GB | 122 GB |
| 1 year | 20 | 66 GB | 89 GB |
| 2 years | 40 | 132 GB | 23 GB |

**Runway:** 2+ years before needing external storage

---

## Initial Setup

### Step 1: Create Video Storage Directory

```bash
# Create directory structure
sudo mkdir -p /var/www/videos/courses

# Verify creation
ls -la /var/www/
```

**Expected output:**
```
drwxr-xr-x  3 root root 4096 Feb  6 12:00 videos
```

### Step 2: Set Ownership and Permissions

```bash
# Set ownership to your user (replace $USER with your username if needed)
sudo chown -R $USER:$USER /var/www/videos

# Set permissions (755: owner can read/write/execute, others can read/execute)
chmod -R 755 /var/www/videos

# Verify permissions
ls -la /var/www/
```

**Expected output:**
```
drwxr-xr-x  3 yourusername yourusername 4096 Feb  6 12:00 videos
```

### Step 3: Test Write Permissions

```bash
# Test write access
touch /var/www/videos/test.txt

# Verify file created
ls -la /var/www/videos/

# Clean up test file
rm /var/www/videos/test.txt
```

**If you get "Permission denied":**
```bash
# Run chown again with correct username
sudo chown -R $(whoami):$(whoami) /var/www/videos
```

---

## Configuration

### Update Environment Variables

Edit your `.env` file:

```bash
# Open .env file
nano .env
```

Add or update these variables:

```env
# ==========================================
# Video Storage Configuration
# ==========================================

# Video Storage Path (absolute path to video directory)
VIDEO_STORAGE_PATH=/var/www/videos

# Video Secret Key (generate with: openssl rand -base64 32)
VIDEO_SECRET=your_generated_secret_key_here

# Video Key Info URL (used by FFmpeg during processing)
VIDEO_KEY_INFO_URL=/api/videos/key

# Video Token Expiration (in seconds, default: 3600 = 1 hour)
VIDEO_TOKEN_EXPIRATION=3600
```

### Generate Video Secret Key

```bash
# Generate secure secret key
openssl rand -base64 32
```

**Example output:**
```
xK9mP2nV8qR5wT7yU4iO1pL6jH3gF0dS2aZ9bC8eM4n=
```

Copy this value and paste it as `VIDEO_SECRET` in your `.env` file.

### Verify Configuration

```bash
# Check environment variables are loaded
cat .env | grep VIDEO_

# Expected output:
# VIDEO_STORAGE_PATH=/var/www/videos
# VIDEO_SECRET=xK9mP2nV8qR5wT7yU4iO1pL6jH3gF0dS2aZ9bC8eM4n=
# VIDEO_KEY_INFO_URL=/api/videos/key
```

---

## Verification

### Test 1: Process Sample Video

```bash
# 1. Create uploads directory for source videos
mkdir -p uploads

# 2. Copy a test video to uploads (replace with your video)
cp /path/to/your/video.mp4 uploads/test-video.mp4

# 3. Process the video
node scripts/process-video.js \
  uploads/test-video.mp4 \
  test-course \
  test-lesson
```

**Expected output:**
```
Creating output directory: /var/www/videos/courses/test-course/test-lesson
Generated encryption key
Generated key info file

Processing video with FFmpeg...
This may take several minutes depending on video size.

✓ Video processing completed successfully!

Output Summary:
  Directory: /var/www/videos/courses/test-course/test-lesson
  Playlist: playlist.m3u8
  Segments: 60 files
  Total size: 245.67 MB
  Encryption: AES-128 enabled

Database Update Information:
Update your lesson record with:
  video_type: "hls"
  hls_playlist_path: "courses/test-course/test-lesson/playlist.m3u8"
  hls_storage_path: "courses/test-course/test-lesson"
  hls_encryption_key: "dGVzdGtleXRlc3RrZXk="

✓ Done! Video is ready for secure streaming.
```

### Test 2: Verify File Structure

```bash
# Check directory structure
tree -L 3 /var/www/videos/

# Or use ls if tree is not installed
ls -lah /var/www/videos/courses/test-course/test-lesson/
```

**Expected structure:**
```
/var/www/videos/
└── courses/
    └── test-course/
        └── test-lesson/
            ├── playlist.m3u8      (HLS playlist)
            ├── segment-000.ts     (video chunk 1)
            ├── segment-001.ts     (video chunk 2)
            ├── segment-002.ts     (etc...)
            ├── key.key            (encryption key)
            └── keyinfo.txt        (key info)
```

### Test 3: Verify Security (Files NOT Publicly Accessible)

```bash
# Try accessing file directly via browser (should fail)
curl http://localhost:3000/videos/courses/test-course/test-lesson/playlist.m3u8
```

**Expected result:** 404 Not Found ✅

### Test 4: Verify API Access (Should Work)

```bash
# Start dev server
npm run dev

# In another terminal, test API endpoint
# Note: You'll need a valid token, so test via browser instead:
# Open: http://localhost:3000/courses/test-course/test-lesson
```

**Expected result:** Video plays ✅

---

## Monitoring

### Install Monitoring Script

The monitoring script was created at `scripts/check-video-storage.sh`.

```bash
# Make executable
chmod +x scripts/check-video-storage.sh

# Run monitoring check
./scripts/check-video-storage.sh
```

**Example output:**
```
======================================
Video Storage Report
======================================

📊 Overall Disk Usage:
/dev/sda1       193G   39G  155G  20% /

📹 Video Directory Usage:
  Total Size: 3.2G
  Total Files: 180

🎓 Courses:
  Total Courses: 1

  Top 5 Largest Courses:
    /var/www/videos/courses/test-course: 3.2G

⚡ Capacity:
  Available Space: 152G
  Disk Usage: 20%
  ✅ Storage healthy

======================================
```

### Set Up Automated Monitoring (Optional)

Create a cron job to check storage weekly:

```bash
# Open crontab editor
crontab -e

# Add this line (runs every Monday at 9 AM)
0 9 * * 1 /path/to/your/project/scripts/check-video-storage.sh > /var/log/video-storage-report.log 2>&1
```

### Manual Monitoring Commands

```bash
# Check total disk usage
df -h /

# Check video directory size
du -sh /var/www/videos

# Check size by course
du -sh /var/www/videos/courses/*

# Check number of video files
find /var/www/videos -name "*.ts" | wc -l

# Check largest courses
du -sh /var/www/videos/courses/*/ | sort -hr | head -10

# Check oldest courses (for potential cleanup)
ls -lt /var/www/videos/courses/ | tail -10
```

---

## Capacity Planning

### Storage Estimation Tool

Use this formula to estimate storage needs:

```
Total Storage = (Number of Courses) × (Lessons per Course) × (Avg Minutes per Lesson) × (22 MB per minute)
```

**Examples:**

1. **10 courses, 10 lessons each, 30 minutes per lesson:**
   ```
   10 × 10 × 30 × 22 MB = 66,000 MB = 66 GB
   ```

2. **20 courses, 15 lessons each, 45 minutes per lesson:**
   ```
   20 × 15 × 45 × 22 MB = 297,000 MB = 297 GB
   (Exceeds capacity - need external storage)
   ```

3. **5 courses, 20 lessons each, 1 hour per lesson:**
   ```
   5 × 20 × 60 × 22 MB = 132,000 MB = 132 GB
   (Within capacity)
   ```

### Capacity Thresholds

| Threshold | Action Required |
|-----------|-----------------|
| **< 50%** (< 77GB used) | ✅ Normal operations, no action needed |
| **50-70%** (77-108GB) | ⚠️ Start planning migration strategy |
| **70-80%** (108-124GB) | ⚠️ Begin migration to external storage |
| **> 80%** (> 124GB) | 🚨 Urgent: Migrate immediately or delete old content |

### Alert Script

Create a simple alert script:

```bash
#!/bin/bash
# scripts/storage-alert.sh

USAGE=$(df / | grep / | awk '{print $5}' | sed 's/%//')
THRESHOLD=70

if [ "$USAGE" -gt "$THRESHOLD" ]; then
    echo "⚠️  ALERT: Disk usage is at ${USAGE}%"
    echo "Consider migrating videos to external storage."
    # Add email notification here if needed
fi
```

---

## Maintenance

### Regular Maintenance Tasks

#### Weekly

```bash
# 1. Check storage usage
./scripts/check-video-storage.sh

# 2. Check for orphaned files (lessons deleted from DB but files remain)
# (Manual process - compare DB lesson slugs with filesystem)
```

#### Monthly

```bash
# 1. Review largest courses
du -sh /var/www/videos/courses/*/ | sort -hr | head -10

# 2. Check for duplicate files
find /var/www/videos -name "*.ts" -type f -exec md5sum {} \; | sort | uniq -d -w32

# 3. Verify file integrity (sample check)
ffprobe /var/www/videos/courses/random-course/random-lesson/segment-000.ts
```

#### Quarterly

```bash
# 1. Review and archive old course content
# 2. Optimize storage with compression tools (if needed)
# 3. Update storage capacity planning
# 4. Test backup restoration
```

### Cleanup Old Content

If you need to free up space:

```bash
# 1. Identify courses to archive
du -sh /var/www/videos/courses/*/ | sort -hr

# 2. Archive to backup location
tar -czf ~/backups/old-course-$(date +%Y%m%d).tar.gz \
  /var/www/videos/courses/old-course-slug

# 3. Verify archive
tar -tzf ~/backups/old-course-*.tar.gz | head

# 4. Remove from active storage
rm -rf /var/www/videos/courses/old-course-slug

# 5. Update database to mark course as archived
# UPDATE "Course" SET is_published = false WHERE slug = 'old-course-slug';
```

---

## Backup Strategy

### Option 1: Local Backup (Recommended)

Create backups on the same VPS (different partition if available):

```bash
#!/bin/bash
# scripts/backup-videos.sh

BACKUP_DIR="/home/backups/videos"
SOURCE_DIR="/var/www/videos"
DATE=$(date +%Y%m%d)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup videos (incremental)
rsync -avz --progress \
  --exclude="*.txt" \
  --exclude="keyinfo.txt" \
  $SOURCE_DIR/ \
  $BACKUP_DIR/backup-$DATE/

echo "Backup completed: $BACKUP_DIR/backup-$DATE/"

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -name "backup-*" -mtime +7 -exec rm -rf {} \;
```

```bash
# Make executable
chmod +x scripts/backup-videos.sh

# Run backup
./scripts/backup-videos.sh

# Set up weekly backup (every Sunday at 2 AM)
crontab -e
# Add: 0 2 * * 0 /path/to/project/scripts/backup-videos.sh
```

### Option 2: Remote Backup

Backup to remote server via rsync:

```bash
#!/bin/bash
# scripts/backup-videos-remote.sh

REMOTE_USER="backup-user"
REMOTE_HOST="backup-server.com"
REMOTE_DIR="/backups/videos"
SOURCE_DIR="/var/www/videos"

# Sync to remote server
rsync -avz --progress \
  -e "ssh -p 22" \
  $SOURCE_DIR/ \
  $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

echo "Remote backup completed"
```

### Option 3: Cloud Backup (Encrypted)

Backup to cloud storage (S3, R2, etc.):

```bash
# Using rclone (install first: https://rclone.org/)
rclone sync /var/www/videos remote:video-backups --progress
```

### Backup Verification

```bash
# Verify backup integrity
diff -r /var/www/videos /home/backups/videos/backup-latest/

# Restore test
rsync -avz /home/backups/videos/backup-latest/courses/test-course/ \
  /tmp/restore-test/

# Verify restored files
ls -lah /tmp/restore-test/
```

---

## Migration Path

### When to Migrate to External Storage

Migrate when:
- ❌ Disk usage exceeds 80% (>124GB used)
- ❌ You have 30+ courses published
- ❌ Bandwidth costs become significant
- ❌ Need global CDN for international students

### Migration Options

#### Option 1: Cloudflare R2 (Recommended)

**Pros:**
- $0.015/GB storage
- **$0 egress** (free bandwidth)
- S3-compatible API
- Global CDN included

**Cost for 100GB:** $1.50/month

**Migration steps:**

1. **Install Cloudflare R2 CLI (Wrangler):**
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. **Create R2 bucket:**
   ```bash
   wrangler r2 bucket create course-videos
   ```

3. **Sync existing videos:**
   ```bash
   # Using rclone
   rclone sync /var/www/videos r2:course-videos --progress
   ```

4. **Update video serving logic:**
   ```typescript
   // src/app/api/videos/[courseSlug]/[lessonSlug]/route.ts
   const videoUrl = process.env.R2_URL
     ? `${process.env.R2_URL}/${lesson.hls_storage_path}/${sanitizedFile}`
     : localPath
   ```

#### Option 2: AWS S3 + CloudFront

**Cost for 100GB:** ~$15-20/month (higher due to egress fees)

**Only consider if:**
- Already using AWS infrastructure
- Need AWS-specific features
- Have AWS credits

#### Option 3: External SSD/NAS

**Cost:** $50-200 (one-time)

**Setup:**
```bash
# Mount external drive
sudo mount /dev/sdb1 /mnt/videos

# Update .env
VIDEO_STORAGE_PATH=/mnt/videos
```

### Hybrid Approach

Keep recent courses on VPS, archive old ones to cloud:

```bash
#!/bin/bash
# scripts/archive-old-courses.sh

# Archive courses older than 1 year to R2
find /var/www/videos/courses -type d -mtime +365 | while read course; do
  rclone sync "$course" r2:archive-videos/$(basename "$course")
  rm -rf "$course"
done
```

---

## Troubleshooting

### Issue 1: Permission Denied When Processing Video

**Symptoms:**
```
Error: EACCES: permission denied, mkdir '/var/www/videos/courses/...'
```

**Solution:**
```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/videos

# Fix permissions
chmod -R 755 /var/www/videos

# Verify
ls -la /var/www/videos
```

### Issue 2: Disk Space Full

**Symptoms:**
```
Error: ENOSPC: no space left on device
```

**Solution:**
```bash
# 1. Check disk usage
df -h /

# 2. Find large files
du -sh /var/www/videos/courses/* | sort -hr | head -10

# 3. Archive or delete old courses
./scripts/backup-videos.sh
rm -rf /var/www/videos/courses/old-course

# 4. Clear system logs if needed
sudo journalctl --vacuum-time=7d
```

### Issue 3: Files Not Accessible by Web Server

**Symptoms:**
```
Error: EACCES: permission denied, open '/var/www/videos/...'
```

**Solution:**
```bash
# Ensure web server user (usually www-data or nginx) can read files
sudo chown -R $USER:www-data /var/www/videos
chmod -R 755 /var/www/videos

# Or for Next.js (running as your user)
sudo chown -R $USER:$USER /var/www/videos
```

### Issue 4: Video Processing Fails

**Symptoms:**
```
Error: FFmpeg command failed
```

**Solutions:**

1. **Check FFmpeg installation:**
   ```bash
   ffmpeg -version
   ```

2. **Check input video format:**
   ```bash
   ffmpeg -i uploads/video.mp4
   ```

3. **Test FFmpeg manually:**
   ```bash
   ffmpeg -i uploads/test.mp4 -t 10 output-test.mp4
   ```

4. **Check available disk space:**
   ```bash
   df -h /var/www/videos
   ```

### Issue 5: Monitoring Script Not Working

**Symptoms:**
```bash
./scripts/check-video-storage.sh
-bash: ./scripts/check-video-storage.sh: Permission denied
```

**Solution:**
```bash
# Make script executable
chmod +x scripts/check-video-storage.sh

# Run again
./scripts/check-video-storage.sh
```

---

## Security Considerations

### File Permissions Best Practices

```bash
# Correct permissions structure:
# - Directories: 755 (rwxr-xr-x)
# - Video files: 644 (rw-r--r--)
# - Encryption keys: 600 (rw-------)

# Apply correct permissions
find /var/www/videos -type d -exec chmod 755 {} \;
find /var/www/videos -type f -name "*.ts" -exec chmod 644 {} \;
find /var/www/videos -type f -name "*.m3u8" -exec chmod 644 {} \;
find /var/www/videos -type f -name "key.key" -exec chmod 600 {} \;
```

### Encryption Key Security

```bash
# Ensure encryption keys are not world-readable
find /var/www/videos -name "key.key" -exec chmod 600 {} \;

# Verify
find /var/www/videos -name "key.key" -exec ls -la {} \;
```

### Regular Security Audits

```bash
# Check for world-writable files (security risk)
find /var/www/videos -type f -perm -002

# Check for files with incorrect ownership
find /var/www/videos ! -user $USER

# Check for suspicious files
find /var/www/videos -name "*.php" -o -name "*.sh" -o -name "*.exe"
```

---

## Quick Reference

### Common Commands

```bash
# Check storage usage
df -h /

# Check video directory size
du -sh /var/www/videos

# Monitor storage
./scripts/check-video-storage.sh

# Process video
node scripts/process-video.js uploads/video.mp4 course-slug lesson-slug

# Backup videos
./scripts/backup-videos.sh

# Find largest courses
du -sh /var/www/videos/courses/* | sort -hr | head -5

# Count total videos
find /var/www/videos -name "*.ts" | wc -l

# Test write permissions
touch /var/www/videos/test.txt && rm /var/www/videos/test.txt
```

### File Locations

| Item | Path |
|------|------|
| **Video Storage** | `/var/www/videos/courses/` |
| **Processed Videos** | `/var/www/videos/courses/{course-slug}/{lesson-slug}/` |
| **Source Videos** | `uploads/` (temporary) |
| **Processing Script** | `scripts/process-video.js` |
| **Monitoring Script** | `scripts/check-video-storage.sh` |
| **Backup Script** | `scripts/backup-videos.sh` |
| **Environment Config** | `.env` |

---

## Summary

### Current Setup

- **Storage Location:** `/var/www/videos/`
- **Available Space:** 155GB (115GB usable)
- **Capacity:** 35-40 courses (2+ years runway)
- **Cost:** $0/month
- **Security:** Files not publicly accessible, API-only access
- **Backup:** Weekly local backups recommended

### Maintenance Schedule

| Frequency | Task |
|-----------|------|
| **Daily** | Automatic monitoring (if cron setup) |
| **Weekly** | Review storage report |
| **Monthly** | Check for orphaned files, verify integrity |
| **Quarterly** | Archive old content, test backups |

### Migration Trigger Points

| Metric | Action |
|--------|--------|
| **> 30 courses** | Consider external storage |
| **> 80% disk usage** | Migrate to Cloudflare R2 |
| **> 1TB bandwidth/month** | Add CDN |
| **Global audience** | Use multi-region CDN |

---

**Setup Status:** ✅ Ready for Production

**Next Steps:**
1. Complete initial setup (create directory, set permissions)
2. Update `.env` with configuration
3. Process test video
4. Set up monitoring
5. Configure backups
6. Start uploading course content!

---

**Last Updated:** 2026-02-06
**Document Version:** 1.0.0
**Author:** Arun Krishnamoorthy
**VPS Specs:** 193GB total, 155GB available
