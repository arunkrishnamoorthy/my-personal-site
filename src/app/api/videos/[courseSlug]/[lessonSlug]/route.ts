/**
 * Protected Video Streaming API
 *
 * Serves HLS video segments and playlists with signed URL authentication
 * Prevents unauthorized access and direct downloads
 */

import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import { verifyVideoToken, sanitizeFilePath, hasVideoAccess } from "@/lib/video-utils"
import prisma from "@/db"

const VIDEO_BASE_PATH = process.env.VIDEO_STORAGE_PATH || "./public/videos"

/**
 * GET /api/videos/[courseSlug]/[lessonSlug]
 *
 * Serves HLS playlist (.m3u8) or video segments (.ts)
 * Requires valid signed token in query parameter
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }
) {
  try {
    const { courseSlug, lessonSlug } = await params
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")
    const file = searchParams.get("file") || "playlist.m3u8"

    // Validate token
    if (!token) {
      return NextResponse.json({ error: "Missing authentication token" }, { status: 401 })
    }

    // Verify token
    let decodedToken
    try {
      decodedToken = await verifyVideoToken(token)
    } catch (error) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Verify token matches requested video
    if (
      decodedToken.courseSlug !== courseSlug ||
      decodedToken.lessonSlug !== lessonSlug
    ) {
      return NextResponse.json({ error: "Token mismatch" }, { status: 403 })
    }

    // TODO: Check user access (enrollment/purchase)
    // const hasAccess = await hasVideoAccess(decodedToken.userId, courseSlug, lessonSlug)
    // if (!hasAccess) {
    //   return NextResponse.json({ error: "Access denied" }, { status: 403 })
    // }

    // Get lesson from database
    const lesson = await prisma.lesson.findFirst({
      where: {
        slug: lessonSlug,
        course: { slug: courseSlug },
        video_type: "hls",
      },
      select: {
        hls_storage_path: true,
        hls_playlist_path: true,
      },
    })

    if (!lesson || !lesson.hls_storage_path) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Sanitize and construct file path
    const sanitizedFile = sanitizeFilePath(file)
    const videoPath = path.join(VIDEO_BASE_PATH, lesson.hls_storage_path, sanitizedFile)

    // Security: Ensure path is within allowed directory
    const resolvedPath = path.resolve(videoPath)
    const allowedBasePath = path.resolve(VIDEO_BASE_PATH, lesson.hls_storage_path)
    if (!resolvedPath.startsWith(allowedBasePath)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 })
    }

    // Read and serve file
    let fileContent
    try {
      fileContent = await readFile(resolvedPath)
    } catch (error) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Determine content type
    const contentType = sanitizedFile.endsWith(".m3u8")
      ? "application/vnd.apple.mpegurl"
      : sanitizedFile.endsWith(".ts")
      ? "video/mp2t"
      : "application/octet-stream"

    // If serving playlist, modify segment URLs to use query parameters
    let modifiedContent = fileContent
    if (sanitizedFile.endsWith(".m3u8")) {
      const playlistContent = fileContent.toString("utf-8")

      // Build base URL for this playlist (without file parameter)
      const baseUrl = `/api/videos/${courseSlug}/${lessonSlug}?token=${token}`

      // Replace segment filenames with full query-parameter URLs
      let modifiedPlaylist = playlistContent.replace(
        /^(segment-\d+\.ts)$/gm,
        `${baseUrl}&file=$1`
      )

      // Replace encryption key URI to include token
      modifiedPlaylist = modifiedPlaylist.replace(
        /URI="([^"]+)"/g,
        `URI="$1?token=${token}"`
      )

      modifiedContent = Buffer.from(modifiedPlaylist)
    }

    // Return file with appropriate headers
    return new NextResponse(modifiedContent as any, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        // Prevent download
        "Content-Disposition": "inline",
      },
    })
  } catch (error) {
    console.error("Error serving video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
