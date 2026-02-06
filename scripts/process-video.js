#!/usr/bin/env node

/**
 * Video Processing Script for E-Learning Platform
 *
 * This script converts MP4 videos to HLS format with AES-128 encryption
 * for secure streaming of paid course content.
 *
 * Usage:
 *   node scripts/process-video.js <input-video.mp4> <course-slug> <lesson-slug>
 *
 * Example:
 *   node scripts/process-video.js uploads/my-video.mp4 sap-abap-basics lesson-1-introduction
 *
 * Requirements:
 *   - FFmpeg installed on system
 *   - Sufficient disk space for processed videos
 *
 * Output Structure:
 *   videos/
 *   └── courses/
 *       └── {course-slug}/
 *           └── {lesson-slug}/
 *               ├── playlist.m3u8 (HLS playlist)
 *               ├── segment-000.ts (video segment 1)
 *               ├── segment-001.ts (video segment 2)
 *               ├── ...
 *               ├── key.key (encryption key)
 *               └── keyinfo.txt (key info file)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const VIDEO_BASE_PATH = process.env.VIDEO_STORAGE_PATH || './public/videos';
const KEY_INFO_URL = process.env.VIDEO_KEY_INFO_URL || '/api/videos/key';

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: node scripts/process-video.js <input-video> <course-slug> <lesson-slug>');
  console.error('Example: node scripts/process-video.js uploads/video.mp4 sap-abap-basics lesson-1');
  process.exit(1);
}

const [inputVideo, courseSlug, lessonSlug] = args;

// Validate input video exists
if (!fs.existsSync(inputVideo)) {
  console.error(`Error: Input video not found: ${inputVideo}`);
  process.exit(1);
}

// Create output directory structure
const outputDir = path.join(VIDEO_BASE_PATH, 'courses', courseSlug, lessonSlug);
console.log(`Creating output directory: ${outputDir}`);
fs.mkdirSync(outputDir, { recursive: true });

// Generate encryption key (16 bytes for AES-128)
const encryptionKey = crypto.randomBytes(16);
const keyFile = path.join(outputDir, 'key.key');
fs.writeFileSync(keyFile, encryptionKey);
console.log('Generated encryption key');

// Generate key info file for FFmpeg
// Format:
// Line 1: Key URI (URL to fetch key)
// Line 2: Path to key file
// Line 3: Initialization Vector (IV) in hex
const iv = crypto.randomBytes(16).toString('hex');
const keyInfoContent = `${KEY_INFO_URL}/${courseSlug}/${lessonSlug}
${keyFile}
${iv}`;
const keyInfoFile = path.join(outputDir, 'keyinfo.txt');
fs.writeFileSync(keyInfoFile, keyInfoContent);
console.log('Generated key info file');

// Output files
const playlistFile = path.join(outputDir, 'playlist.m3u8');
const segmentPattern = path.join(outputDir, 'segment-%03d.ts');

// FFmpeg command to convert video to HLS with encryption
const ffmpegCommand = `ffmpeg -i "${inputVideo}" \
  -codec: copy \
  -start_number 0 \
  -hls_time 10 \
  -hls_list_size 0 \
  -hls_key_info_file "${keyInfoFile}" \
  -hls_playlist_type vod \
  -hls_segment_filename "${segmentPattern}" \
  -f hls \
  "${playlistFile}"`;

console.log('\nProcessing video with FFmpeg...');
console.log('This may take several minutes depending on video size.\n');

try {
  execSync(ffmpegCommand, { stdio: 'inherit' });
  console.log('\n✓ Video processing completed successfully!');

  // Get video info
  const files = fs.readdirSync(outputDir);
  const segmentCount = files.filter(f => f.endsWith('.ts')).length;
  const totalSize = files.reduce((acc, file) => {
    const filePath = path.join(outputDir, file);
    return acc + fs.statSync(filePath).size;
  }, 0);
  const sizeMB = (totalSize / 1024 / 1024).toFixed(2);

  console.log('\nOutput Summary:');
  console.log(`  Directory: ${outputDir}`);
  console.log(`  Playlist: playlist.m3u8`);
  console.log(`  Segments: ${segmentCount} files`);
  console.log(`  Total size: ${sizeMB} MB`);
  console.log(`  Encryption: AES-128 enabled`);

  // Generate relative paths for database storage
  const relativePath = path.relative(VIDEO_BASE_PATH, outputDir);
  const playlistPath = path.join(relativePath, 'playlist.m3u8').replace(/\\/g, '/');
  const storagePath = relativePath.replace(/\\/g, '/');

  // Encrypt the key for database storage (using base64 encoding)
  const encryptedKey = encryptionKey.toString('base64');

  console.log('\nDatabase Update Information:');
  console.log('Update your lesson record with:');
  console.log(`  video_type: "hls"`);
  console.log(`  hls_playlist_path: "${playlistPath}"`);
  console.log(`  hls_storage_path: "${storagePath}"`);
  console.log(`  hls_encryption_key: "${encryptedKey}"`);

  // Generate database update SQL (optional)
  console.log('\nSQL Update Command:');
  console.log(`UPDATE "Lesson" SET`);
  console.log(`  video_type = 'hls',`);
  console.log(`  hls_playlist_path = '${playlistPath}',`);
  console.log(`  hls_storage_path = '${storagePath}',`);
  console.log(`  hls_encryption_key = '${encryptedKey}'`);
  console.log(`WHERE slug = '${lessonSlug}';`);

  console.log('\n✓ Done! Video is ready for secure streaming.');

} catch (error) {
  console.error('\n✗ Error processing video:');
  console.error(error.message);
  process.exit(1);
}
