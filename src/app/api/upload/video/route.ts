import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("video") as File
    const courseId = formData.get("courseId") as string
    const lessonSlug = formData.get("lessonSlug") as string

    if (!file) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      )
    }

    if (!courseId || !lessonSlug) {
      return NextResponse.json(
        { error: "Course ID and lesson slug are required" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only MP4, MOV, and AVI are allowed" },
        { status: 400 }
      )
    }

    // Validate file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024 // 2GB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 2GB limit" },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save uploaded file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tempFilePath = join(uploadsDir, `temp-${Date.now()}-${file.name}`)
    await writeFile(tempFilePath, buffer)

    // Get actual course slug from database
    const { db } = await import("@/db")
    const course = await db.course.findUnique({
      where: { id: parseInt(courseId) },
      select: { slug: true },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    const courseSlug = course.slug

    // Process video using the video processing script
    const scriptPath = join(process.cwd(), "scripts", "process-video.js")

    try {
      const { stdout, stderr } = await execAsync(
        `node "${scriptPath}" "${tempFilePath}" "${courseSlug}" "${lessonSlug}"`
      )

      console.log("Video processing output:", stdout)

      if (stderr) {
        console.error("Video processing warnings:", stderr)
      }

      // Extract the HLS paths from the script output
      // The script should output JSON or structured data
      // For now, we'll construct the expected paths
      const hlsPlaylistPath = `courses/${courseSlug}/${lessonSlug}/playlist.m3u8`
      const hlsStoragePath = `courses/${courseSlug}/${lessonSlug}`

      // Generate a placeholder encryption key
      // In production, this should be extracted from the script output
      const hlsEncryptionKey = Buffer.from("encryption-key").toString("base64")

      // Clean up temporary file
      // Note: The process-video.js script should handle this
      // If not, uncomment the following:
      // await unlink(tempFilePath)

      return NextResponse.json({
        success: true,
        message: "Video uploaded and processed successfully",
        hls_playlist_path: hlsPlaylistPath,
        hls_storage_path: hlsStoragePath,
        hls_encryption_key: hlsEncryptionKey,
      })
    } catch (processingError) {
      console.error("Error processing video:", processingError)
      return NextResponse.json(
        {
          error: "Failed to process video. Please ensure FFmpeg is installed.",
          details:
            processingError instanceof Error
              ? processingError.message
              : "Unknown error",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error uploading video:", error)
    return NextResponse.json(
      {
        error: "Failed to upload video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Maximum file size for Next.js API routes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2gb",
    },
  },
}
