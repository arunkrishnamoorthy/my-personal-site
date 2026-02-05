import { NextRequest, NextResponse } from "next/server"
import prisma from "@/db"

/**
 * GET /api/courses/[courseId]/progress
 * Get user's progress for a course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = parseInt(params.courseId)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter required" },
        { status: 400 }
      )
    }

    const userIdInt = parseInt(userId)

    if (isNaN(courseId) || isNaN(userIdInt)) {
      return NextResponse.json(
        { error: "Invalid course ID or user ID" },
        { status: 400 }
      )
    }

    // Get enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        user_id_course_id: {
          user_id: userIdInt,
          course_id: courseId,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 404 }
      )
    }

    // Get course with all lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        units: {
          include: {
            lessons: {
              where: { is_published: true },
              orderBy: { sequence_order: "asc" },
            },
          },
          orderBy: { sequence_order: "asc" },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    // Get all lesson IDs
    const lessonIds = course.units.flatMap((unit) =>
      unit.lessons.map((lesson) => lesson.id)
    )

    // Get user's lesson progress
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        user_id: userIdInt,
        lesson_id: { in: lessonIds },
      },
    })

    // Calculate progress
    const totalLessons = lessonIds.length
    const completedLessons = lessonProgress.filter((p) => p.is_completed).length
    const progressPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    // Update enrollment progress if changed
    if (enrollment.progress_percentage !== progressPercentage) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progress_percentage: progressPercentage,
          last_accessed_at: new Date(),
          started_at: enrollment.started_at || new Date(),
          completed_at: progressPercentage === 100 ? new Date() : null,
          enrollment_status: progressPercentage === 100 ? "completed" : "active",
        },
      })
    }

    // Build progress by unit
    const unitProgress = course.units.map((unit) => {
      const unitLessonIds = unit.lessons.map((l) => l.id)
      const unitLessonProgress = lessonProgress.filter((p) =>
        unitLessonIds.includes(p.lesson_id)
      )
      const unitCompleted = unitLessonProgress.filter((p) => p.is_completed).length

      return {
        unit_id: unit.id,
        unit_title: unit.title,
        total_lessons: unit.lessons.length,
        completed_lessons: unitCompleted,
        progress_percentage: unit.lessons.length > 0
          ? Math.round((unitCompleted / unit.lessons.length) * 100)
          : 0,
        lessons: unit.lessons.map((lesson) => {
          const progress = lessonProgress.find((p) => p.lesson_id === lesson.id)
          return {
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            lesson_slug: lesson.slug,
            is_completed: progress?.is_completed || false,
            watch_duration_secs: progress?.watch_duration_secs || 0,
            last_position_secs: progress?.last_position_secs || 0,
            quiz_passed: progress?.quiz_passed || false,
            last_accessed_at: progress?.last_accessed_at,
          }
        }),
      }
    })

    return NextResponse.json({
      course_id: course.id,
      course_title: course.title,
      enrollment_status: enrollment.enrollment_status,
      overall_progress: {
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        progress_percentage: progressPercentage,
      },
      enrolled_at: enrollment.enrolled_at,
      last_accessed_at: enrollment.last_accessed_at,
      completed_at: enrollment.completed_at,
      unit_progress: unitProgress,
    })
  } catch (error) {
    console.error("Progress fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
