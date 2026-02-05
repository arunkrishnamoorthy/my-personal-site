import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/db"

// Validation schema for updating progress
const progressUpdateSchema = z.object({
  userId: z.number().int().positive(),
  watch_duration_secs: z.number().int().min(0).optional(),
  last_position_secs: z.number().int().min(0).optional(),
  is_completed: z.boolean().optional(),
  completion_percentage: z.number().int().min(0).max(100).optional(),
  speed_preference: z.number().min(0.25).max(3).optional(),
  dropped_at_secs: z.number().int().min(0).optional(),
})

/**
 * POST /api/lessons/[lessonId]/progress
 * Update lesson progress for a user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const lessonId = parseInt(params.lessonId)

    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: "Invalid lesson ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = progressUpdateSchema.parse(body)

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        course_id: true,
        video_duration_mins: true,
      },
    })

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      )
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        user_id_course_id: {
          user_id: validatedData.userId,
          course_id: lesson.course_id,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      )
    }

    // Find or create lesson progress
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        user_id_lesson_id: {
          user_id: validatedData.userId,
          lesson_id: lessonId,
        },
      },
    })

    let progress

    if (existingProgress) {
      // Update existing progress
      progress = await prisma.lessonProgress.update({
        where: { id: existingProgress.id },
        data: {
          watch_duration_secs: validatedData.watch_duration_secs ?? existingProgress.watch_duration_secs,
          last_position_secs: validatedData.last_position_secs ?? existingProgress.last_position_secs,
          is_completed: validatedData.is_completed ?? existingProgress.is_completed,
          completion_percentage: validatedData.completion_percentage ?? existingProgress.completion_percentage,
          speed_preference: validatedData.speed_preference ?? existingProgress.speed_preference,
          dropped_at_secs: validatedData.dropped_at_secs ?? existingProgress.dropped_at_secs,
          last_accessed_at: new Date(),
          completed_at: validatedData.is_completed && !existingProgress.is_completed
            ? new Date()
            : existingProgress.completed_at,
          replay_count: validatedData.last_position_secs === 0 && existingProgress.last_position_secs > 0
            ? existingProgress.replay_count + 1
            : existingProgress.replay_count,
        },
      })
    } else {
      // Create new progress
      progress = await prisma.lessonProgress.create({
        data: {
          user_id: validatedData.userId,
          lesson_id: lessonId,
          watch_duration_secs: validatedData.watch_duration_secs || 0,
          last_position_secs: validatedData.last_position_secs || 0,
          is_completed: validatedData.is_completed || false,
          completion_percentage: validatedData.completion_percentage || 0,
          speed_preference: validatedData.speed_preference,
          dropped_at_secs: validatedData.dropped_at_secs,
          completed_at: validatedData.is_completed ? new Date() : null,
        },
      })
    }

    // Update enrollment last_accessed_at
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        last_accessed_at: new Date(),
      },
    })

    return NextResponse.json({
      status: "success",
      message: "Progress updated successfully",
      progress: {
        lesson_id: progress.lesson_id,
        is_completed: progress.is_completed,
        completion_percentage: progress.completion_percentage,
        watch_duration_secs: progress.watch_duration_secs,
        last_position_secs: progress.last_position_secs,
        last_accessed_at: progress.last_accessed_at,
      },
    })
  } catch (error) {
    console.error("Progress update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/lessons/[lessonId]/progress
 * Get lesson progress for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const lessonId = parseInt(params.lessonId)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter required" },
        { status: 400 }
      )
    }

    const userIdInt = parseInt(userId)

    if (isNaN(lessonId) || isNaN(userIdInt)) {
      return NextResponse.json(
        { error: "Invalid lesson ID or user ID" },
        { status: 400 }
      )
    }

    const progress = await prisma.lessonProgress.findUnique({
      where: {
        user_id_lesson_id: {
          user_id: userIdInt,
          lesson_id: lessonId,
        },
      },
      include: {
        lesson: {
          select: {
            title: true,
            slug: true,
            video_duration_mins: true,
          },
        },
      },
    })

    if (!progress) {
      return NextResponse.json({
        lesson_id: lessonId,
        has_progress: false,
        is_completed: false,
        completion_percentage: 0,
        watch_duration_secs: 0,
        last_position_secs: 0,
      })
    }

    return NextResponse.json({
      lesson_id: progress.lesson_id,
      has_progress: true,
      is_completed: progress.is_completed,
      completion_percentage: progress.completion_percentage,
      watch_duration_secs: progress.watch_duration_secs,
      last_position_secs: progress.last_position_secs,
      replay_count: progress.replay_count,
      speed_preference: progress.speed_preference,
      quiz_passed: progress.quiz_passed,
      quiz_attempts: progress.quiz_attempts,
      started_at: progress.started_at,
      completed_at: progress.completed_at,
      last_accessed_at: progress.last_accessed_at,
      lesson: progress.lesson,
    })
  } catch (error) {
    console.error("Progress fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
