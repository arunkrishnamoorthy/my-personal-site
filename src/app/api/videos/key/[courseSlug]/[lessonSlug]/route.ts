/**
 * HLS Encryption Key API
 *
 * Serves the AES-128 encryption key for HLS video playback
 */

import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import { verifyVideoToken } from "@/lib/video-utils"

const VIDEO_BASE_PATH = process.env.VIDEO_STORAGE_PATH || "./public/videos"

/**
 * GET /api/videos/key/[courseSlug]/[lessonSlug]
 *
 * Serves the encryption key for HLS video decryption
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }
) {
  try {
    const { courseSlug, lessonSlug } = await params
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    // Validate token
    if (!token) {
      return NextResponse.json(
        { error: "Missing authentication token" },
        { status: 401 }
      )
    }

    // Verify token
    try {
      const decodedToken = await verifyVideoToken(token)

      // Verify token matches requested video
      if (
        decodedToken.courseSlug !== courseSlug ||
        decodedToken.lessonSlug !== lessonSlug
      ) {
        return NextResponse.json({ error: "Token mismatch" }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    // Construct path to encryption key
    const keyPath = path.join(
      VIDEO_BASE_PATH,
      "courses",
      courseSlug,
      lessonSlug,
      "key.key"
    )

    // Read encryption key
    let keyContent
    try {
      keyContent = await readFile(keyPath)
    } catch (error) {
      return NextResponse.json(
        { error: "Encryption key not found" },
        { status: 404 }
      )
    }

    // Return key with appropriate headers
    return new NextResponse(keyContent as any, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Error serving encryption key:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
