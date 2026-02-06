#!/bin/bash

# Video Storage Monitoring Script
# Checks disk usage and alerts if running low

VIDEO_PATH="/var/www/videos"
ALERT_THRESHOLD=80  # Alert when disk usage exceeds 80%

echo "======================================"
echo "Video Storage Report"
echo "======================================"
echo ""

# Check if video directory exists
if [ ! -d "$VIDEO_PATH" ]; then
    echo "⚠️  Video directory not found: $VIDEO_PATH"
    echo "Run: sudo mkdir -p $VIDEO_PATH"
    exit 1
fi

# Overall disk usage
echo "📊 Overall Disk Usage:"
df -h / | grep -v Filesystem

echo ""
echo "📹 Video Directory Usage:"
if [ -d "$VIDEO_PATH" ]; then
    TOTAL_SIZE=$(du -sh "$VIDEO_PATH" 2>/dev/null | cut -f1)
    FILE_COUNT=$(find "$VIDEO_PATH" -type f 2>/dev/null | wc -l)
    echo "  Total Size: $TOTAL_SIZE"
    echo "  Total Files: $FILE_COUNT"
else
    echo "  No videos yet"
fi

echo ""
echo "🎓 Courses:"
if [ -d "$VIDEO_PATH/courses" ]; then
    COURSE_COUNT=$(find "$VIDEO_PATH/courses" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
    echo "  Total Courses: $COURSE_COUNT"
    echo ""
    echo "  Top 5 Largest Courses:"
    du -sh "$VIDEO_PATH/courses"/*/ 2>/dev/null | sort -hr | head -5 | awk '{print "    " $2 ": " $1}'
else
    echo "  No courses yet"
fi

echo ""
echo "⚡ Capacity:"
DISK_USAGE=$(df / | grep / | awk '{print $5}' | sed 's/%//')
AVAILABLE=$(df -h / | grep / | awk '{print $4}')
echo "  Available Space: $AVAILABLE"
echo "  Disk Usage: $DISK_USAGE%"

if [ "$DISK_USAGE" -gt "$ALERT_THRESHOLD" ]; then
    echo ""
    echo "⚠️  WARNING: Disk usage is above ${ALERT_THRESHOLD}%!"
    echo "   Consider cleaning up old files or expanding storage."
else
    echo "  ✅ Storage healthy"
fi

echo ""
echo "======================================"
