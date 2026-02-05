import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/db"

// Validation schema
const enrollmentSchema = z.object({
  userId: z.number().int().positive(),
  email: z.string().email().optional(),
  name: z.string().optional(),
})

/**
 * POST /api/courses/[courseId]/enroll
 * Enroll a user in a course
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = parseInt(params.courseId)

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: "Invalid course ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = enrollmentSchema.parse(body)

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        is_published: true,
        is_free: true,
        max_enrollments: true,
        student_count: true,
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    if (!course.is_published) {
      return NextResponse.json(
        { error: "Course is not available for enrollment" },
        { status: 403 }
      )
    }

    // Check enrollment limit
    if (course.max_enrollments && course.student_count >= course.max_enrollments) {
      return NextResponse.json(
        { error: "Course enrollment limit reached" },
        { status: 403 }
      )
    }

    // Check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!user && validatedData.email) {
      user = await prisma.user.create({
        data: {
          id: validatedData.userId,
          email: validatedData.email,
          name: validatedData.name,
        },
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        user_id_course_id: {
          user_id: validatedData.userId,
          course_id: courseId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        {
          message: "Already enrolled in this course",
          enrollment: existingEnrollment,
        },
        { status: 200 }
      )
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        user_id: validatedData.userId,
        course_id: courseId,
        enrollment_status: "active",
        progress_percentage: 0,
      },
    })

    // Increment student count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        student_count: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      status: "success",
      message: "Successfully enrolled in course",
      enrollment,
      course: {
        id: course.id,
        title: course.title,
      },
    })
  } catch (error) {
    console.error("Enrollment error:", error)

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
 * GET /api/courses/[courseId]/enroll
 * Check enrollment status
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

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        user_id_course_id: {
          user_id: parseInt(userId),
          course_id: courseId,
        },
      },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { enrolled: false },
        { status: 200 }
      )
    }

    return NextResponse.json({
      enrolled: true,
      enrollment,
    })
  } catch (error) {
    console.error("Enrollment check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
