import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/db"

// Validation schema for quiz attempt
const quizAttemptSchema = z.object({
  userId: z.number().int().positive(),
  answers: z.array(
    z.object({
      question_id: z.number().int().positive(),
      selected_option_id: z.number().int().positive().optional(),
      answer_text: z.string().optional(),
    })
  ),
  time_taken_mins: z.number().int().min(0).optional(),
})

/**
 * POST /api/quizzes/[quizId]/attempt
 * Submit a quiz attempt
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = parseInt(params.quizId)

    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: "Invalid quiz ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = quizAttemptSchema.parse(body)

    // Fetch quiz with questions and options
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          select: {
            id: true,
            course_id: true,
            title: true,
          },
        },
        questions: {
          include: {
            options: true,
          },
          orderBy: { sequence_order: "asc" },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      )
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        user_id_course_id: {
          user_id: validatedData.userId,
          course_id: quiz.lesson.course_id,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      )
    }

    // Check max attempts
    if (quiz.max_attempts) {
      const attemptCount = await prisma.quizAttempt.count({
        where: {
          user_id: validatedData.userId,
          quiz_id: quizId,
        },
      })

      if (attemptCount >= quiz.max_attempts) {
        return NextResponse.json(
          { error: `Maximum ${quiz.max_attempts} attempts reached` },
          { status: 403 }
        )
      }
    }

    // Calculate attempt number
    const previousAttempts = await prisma.quizAttempt.findMany({
      where: {
        user_id: validatedData.userId,
        quiz_id: quizId,
      },
      select: { attempt_number: true },
      orderBy: { attempt_number: "desc" },
      take: 1,
    })

    const attemptNumber = previousAttempts.length > 0
      ? previousAttempts[0].attempt_number + 1
      : 1

    // Grade the quiz
    let totalPoints = 0
    let earnedPoints = 0
    const gradedAnswers = []

    for (const answer of validatedData.answers) {
      const question = quiz.questions.find((q) => q.id === answer.question_id)

      if (!question) {
        continue
      }

      totalPoints += question.points

      let isCorrect = false
      let pointsEarned = 0

      if (question.question_type === "multiple_choice" && answer.selected_option_id) {
        const selectedOption = question.options.find(
          (opt) => opt.id === answer.selected_option_id
        )
        isCorrect = selectedOption?.is_correct || false
        pointsEarned = isCorrect ? question.points : 0
      } else if (question.question_type === "short_answer" && answer.answer_text) {
        // For short answer, you'd need custom grading logic
        // For now, mark as correct if any answer is provided
        isCorrect = answer.answer_text.trim().length > 0
        pointsEarned = isCorrect ? question.points : 0
      }

      earnedPoints += pointsEarned

      gradedAnswers.push({
        question_id: answer.question_id,
        selected_option_id: answer.selected_option_id,
        answer_text: answer.answer_text,
        is_correct: isCorrect,
        points_earned: pointsEarned,
      })

      // Update question analytics
      await prisma.quizQuestion.update({
        where: { id: question.id },
        data: {
          times_answered: { increment: 1 },
          times_correct: isCorrect ? { increment: 1 } : undefined,
        },
      })
    }

    const percentage = totalPoints > 0
      ? Math.round((earnedPoints / totalPoints) * 100)
      : 0

    const passed = percentage >= quiz.passing_score

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        user_id: validatedData.userId,
        quiz_id: quizId,
        attempt_number: attemptNumber,
        score: earnedPoints,
        max_score: totalPoints,
        percentage,
        passed,
        time_taken_mins: validatedData.time_taken_mins,
        completed_at: new Date(),
        answers: {
          create: gradedAnswers,
        },
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                question_text: true,
                explanation: true,
              },
            },
          },
        },
      },
    })

    // Update lesson progress
    const lessonProgress = await prisma.lessonProgress.findUnique({
      where: {
        user_id_lesson_id: {
          user_id: validatedData.userId,
          lesson_id: quiz.lesson.id,
        },
      },
    })

    if (lessonProgress) {
      await prisma.lessonProgress.update({
        where: { id: lessonProgress.id },
        data: {
          quiz_passed: passed,
          quiz_attempts: { increment: 1 },
          is_completed: passed && quiz.is_required ? true : lessonProgress.is_completed,
          completed_at: passed && quiz.is_required && !lessonProgress.is_completed
            ? new Date()
            : lessonProgress.completed_at,
        },
      })
    } else {
      await prisma.lessonProgress.create({
        data: {
          user_id: validatedData.userId,
          lesson_id: quiz.lesson.id,
          quiz_passed: passed,
          quiz_attempts: 1,
          is_completed: passed && quiz.is_required,
          completed_at: passed && quiz.is_required ? new Date() : null,
        },
      })
    }

    return NextResponse.json({
      status: "success",
      message: passed ? "Quiz passed!" : "Quiz completed",
      attempt: {
        id: attempt.id,
        attempt_number: attempt.attempt_number,
        score: attempt.score,
        max_score: attempt.max_score,
        percentage: attempt.percentage,
        passed: attempt.passed,
        passing_score: quiz.passing_score,
        time_taken_mins: attempt.time_taken_mins,
        completed_at: attempt.completed_at,
      },
      answers: attempt.answers.map((ans) => ({
        question_id: ans.question_id,
        question_text: ans.question.question_text,
        is_correct: ans.is_correct,
        points_earned: ans.points_earned,
        explanation: ans.question.explanation,
      })),
      can_retake: quiz.max_attempts ? attemptNumber < quiz.max_attempts : true,
      attempts_remaining: quiz.max_attempts
        ? quiz.max_attempts - attemptNumber
        : null,
    })
  } catch (error) {
    console.error("Quiz attempt error:", error)

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
 * GET /api/quizzes/[quizId]/attempt
 * Get user's quiz attempts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = parseInt(params.quizId)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter required" },
        { status: 400 }
      )
    }

    const userIdInt = parseInt(userId)

    if (isNaN(quizId) || isNaN(userIdInt)) {
      return NextResponse.json(
        { error: "Invalid quiz ID or user ID" },
        { status: 400 }
      )
    }

    // Get quiz info
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        title: true,
        passing_score: true,
        max_attempts: true,
      },
    })

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      )
    }

    // Get all attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        user_id: userIdInt,
        quiz_id: quizId,
      },
      orderBy: { attempt_number: "desc" },
      include: {
        answers: {
          select: {
            question_id: true,
            is_correct: true,
            points_earned: true,
          },
        },
      },
    })

    const bestAttempt = attempts.length > 0
      ? attempts.reduce((best, current) =>
          current.percentage > best.percentage ? current : best
        )
      : null

    return NextResponse.json({
      quiz_title: quiz.title,
      passing_score: quiz.passing_score,
      max_attempts: quiz.max_attempts,
      attempt_count: attempts.length,
      can_retake: quiz.max_attempts ? attempts.length < quiz.max_attempts : true,
      attempts_remaining: quiz.max_attempts
        ? Math.max(0, quiz.max_attempts - attempts.length)
        : null,
      best_score: bestAttempt?.percentage || 0,
      has_passed: bestAttempt ? bestAttempt.percentage >= quiz.passing_score : false,
      attempts: attempts.map((attempt) => ({
        id: attempt.id,
        attempt_number: attempt.attempt_number,
        score: attempt.score,
        max_score: attempt.max_score,
        percentage: attempt.percentage,
        passed: attempt.passed,
        time_taken_mins: attempt.time_taken_mins,
        completed_at: attempt.completed_at,
        correct_answers: attempt.answers.filter((a) => a.is_correct).length,
        total_questions: attempt.answers.length,
      })),
    })
  } catch (error) {
    console.error("Quiz attempts fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
