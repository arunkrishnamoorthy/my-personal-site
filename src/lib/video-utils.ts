/**
 * Video Utilities
 *
 * Utilities for generating signed URLs and handling video streaming
 * for protected course content.
 */

import { SignJWT, jwtVerify } from "jose"

const VIDEO_SECRET = process.env.VIDEO_SECRET || "your-secret-key-change-in-production"
const SECRET_KEY = new TextEncoder().encode(VIDEO_SECRET)

export interface VideoTokenPayload {
  courseSlug: string
  lessonSlug: string
  userId?: string
  exp?: number
}

/**
 * Generate a signed JWT token for video access
 *
 * @param courseSlug - Course identifier
 * @param lessonSlug - Lesson identifier
 * @param userId - Optional user ID for tracking
 * @param expiresIn - Token expiration in seconds (default: 1 hour)
 * @returns JWT token string
 */
export async function generateVideoToken(
  courseSlug: string,
  lessonSlug: string,
  userId?: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const token = await new SignJWT({
    courseSlug,
    lessonSlug,
    userId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(SECRET_KEY)

  return token
}

/**
 * Verify and decode a video access token
 *
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export async function verifyVideoToken(token: string): Promise<VideoTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload as unknown as VideoTokenPayload
  } catch (error) {
    throw new Error("Invalid or expired video token")
  }
}

/**
 * Generate a complete video URL with signed token
 *
 * @param courseSlug - Course identifier
 * @param lessonSlug - Lesson identifier
 * @param userId - Optional user ID
 * @returns Full URL to video playlist
 */
export async function getVideoUrl(
  courseSlug: string,
  lessonSlug: string,
  userId?: string
): Promise<string> {
  const token = await generateVideoToken(courseSlug, lessonSlug, userId)
  return `/api/videos/${courseSlug}/${lessonSlug}?token=${token}`
}

/**
 * Check if a user has access to a video
 * TODO: Implement enrollment/purchase check
 *
 * @param userId - User ID to check
 * @param courseSlug - Course slug
 * @param lessonSlug - Lesson slug
 * @returns Whether user has access
 */
export async function hasVideoAccess(
  userId: string | undefined,
  courseSlug: string,
  lessonSlug: string
): Promise<boolean> {
  // TODO: Implement actual access control logic
  // For now, return true for preview lessons
  // In production, check:
  // - Is course free?
  // - Is lesson marked as preview?
  // - Does user have active enrollment?
  // - Has user purchased the course?

  return true // Temporary - implement access control later
}

/**
 * Get video storage path for a lesson
 *
 * @param courseSlug - Course identifier
 * @param lessonSlug - Lesson identifier
 * @returns Relative storage path
 */
export function getVideoStoragePath(courseSlug: string, lessonSlug: string): string {
  return `courses/${courseSlug}/${lessonSlug}`
}

/**
 * Sanitize file path to prevent directory traversal attacks
 *
 * @param filePath - File path to sanitize
 * @returns Sanitized file path
 */
export function sanitizeFilePath(filePath: string): string {
  // Remove any ../ or .\ sequences
  return filePath.replace(/\.\.[\/\\]/g, "").replace(/^[\/\\]/, "")
}
