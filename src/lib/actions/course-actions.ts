"use server"

import { db } from "@/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ============================================================================
// COURSE ACTIONS
// ============================================================================

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  overview: z.string().min(1, "Overview is required"),
  difficulty_level: z.string(),
  category_id: z.number().nullable(),
  icon_text: z.string().nullable(),
  tailwind_color: z.string(),
  is_free: z.boolean(),
  price: z.number().optional(),
  currency: z.string().nullable(),
  course_type: z.string(),
  is_published: z.boolean(),
})

export async function saveCourse(data: any) {
  try {
    // Validate data
    const validated = courseSchema.parse(data)

    if (data.id) {
      // Update existing course
      await db.course.update({
        where: { id: data.id },
        data: {
          ...validated,
          price: validated.price || null,
        },
      })

      // Update prerequisites
      if (data.prerequisites) {
        await db.coursePrerequisite.deleteMany({
          where: { course_id: data.id },
        })

        if (data.prerequisites.length > 0) {
          await db.coursePrerequisite.createMany({
            data: data.prerequisites.map((text: string, index: number) => ({
              course_id: data.id,
              prerequisite_text: text,
              sequence_order: index,
            })),
          })
        }
      }

      // Update target roles
      if (data.target_roles) {
        await db.courseTargetRole.deleteMany({
          where: { course_id: data.id },
        })

        if (data.target_roles.length > 0) {
          await db.courseTargetRole.createMany({
            data: data.target_roles.map((role: string) => ({
              course_id: data.id,
              role_name: role,
            })),
          })
        }
      }

      // Update learning objectives
      if (data.learning_objectives) {
        await db.courseLearningObjective.deleteMany({
          where: { course_id: data.id },
        })

        if (data.learning_objectives.length > 0) {
          await db.courseLearningObjective.createMany({
            data: data.learning_objectives.map((text: string, index: number) => ({
              course_id: data.id,
              objective_text: text,
              sequence_order: index,
            })),
          })
        }
      }

      revalidatePath("/courses/manage")
      revalidatePath(`/courses/${validated.slug}`)

      return { success: true, courseId: data.id }
    } else {
      // Create new course
      const course = await db.course.create({
        data: {
          ...validated,
          price: validated.price || null,
        },
      })

      // Create prerequisites
      if (data.prerequisites && data.prerequisites.length > 0) {
        await db.coursePrerequisite.createMany({
          data: data.prerequisites.map((text: string, index: number) => ({
            course_id: course.id,
            prerequisite_text: text,
            sequence_order: index,
          })),
        })
      }

      // Create target roles
      if (data.target_roles && data.target_roles.length > 0) {
        await db.courseTargetRole.createMany({
          data: data.target_roles.map((role: string) => ({
            course_id: course.id,
            role_name: role,
          })),
        })
      }

      // Create learning objectives
      if (data.learning_objectives && data.learning_objectives.length > 0) {
        await db.courseLearningObjective.createMany({
          data: data.learning_objectives.map((text: string, index: number) => ({
            course_id: course.id,
            objective_text: text,
            sequence_order: index,
          })),
        })
      }

      revalidatePath("/courses/manage")

      return { success: true, courseId: course.id }
    }
  } catch (error) {
    console.error("Error saving course:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to save course" }
  }
}

export async function deleteCourse(courseId: number) {
  try {
    await db.course.delete({
      where: { id: courseId },
    })

    revalidatePath("/courses/manage")

    return { success: true }
  } catch (error) {
    console.error("Error deleting course:", error)
    return { success: false, error: "Failed to delete course" }
  }
}

// ============================================================================
// UNIT ACTIONS
// ============================================================================

const unitSchema = z.object({
  course_id: z.number(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
})

export async function saveUnit(data: any) {
  try {
    // Validate data
    const validated = unitSchema.parse(data)

    if (data.id) {
      // Update existing unit
      await db.unit.update({
        where: { id: data.id },
        data: {
          title: validated.title,
          slug: validated.slug,
          description: validated.description || null,
        },
      })

      // Update objectives
      if (data.objectives) {
        await db.unitObjective.deleteMany({
          where: { unit_id: data.id },
        })

        if (data.objectives.length > 0) {
          await db.unitObjective.createMany({
            data: data.objectives.map((text: string, index: number) => ({
              unit_id: data.id,
              objective_text: text,
              sequence_order: index,
            })),
          })
        }
      }

      revalidatePath(`/courses/manage/${validated.course_id}`)

      return { success: true, unitId: data.id }
    } else {
      // Get the next sequence order
      const lastUnit = await db.unit.findFirst({
        where: { course_id: validated.course_id },
        orderBy: { sequence_order: "desc" },
      })

      const nextOrder = lastUnit ? lastUnit.sequence_order + 1 : 0

      // Create new unit
      const unit = await db.unit.create({
        data: {
          ...validated,
          description: validated.description || null,
          sequence_order: nextOrder,
        },
      })

      // Create objectives
      if (data.objectives && data.objectives.length > 0) {
        await db.unitObjective.createMany({
          data: data.objectives.map((text: string, index: number) => ({
            unit_id: unit.id,
            objective_text: text,
            sequence_order: index,
          })),
        })
      }

      // Update course stats
      await updateCourseStats(validated.course_id)

      revalidatePath(`/courses/manage/${validated.course_id}`)

      return { success: true, unitId: unit.id }
    }
  } catch (error) {
    console.error("Error saving unit:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to save unit" }
  }
}

export async function deleteUnit(unitId: number, courseId: number) {
  try {
    await db.unit.delete({
      where: { id: unitId },
    })

    // Update course stats
    await updateCourseStats(courseId)

    revalidatePath(`/courses/manage/${courseId}`)

    return { success: true }
  } catch (error) {
    console.error("Error deleting unit:", error)
    return { success: false, error: "Failed to delete unit" }
  }
}

// ============================================================================
// LESSON ACTIONS
// ============================================================================

const lessonSchema = z.object({
  course_id: z.number(),
  unit_id: z.number(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  lesson_type: z.string(),
  video_type: z.string().optional(),
  youtube_id: z.string().nullable().optional(),
  video_duration_mins: z.number().optional(),
  is_published: z.boolean(),
  is_preview: z.boolean(),
  hls_playlist_path: z.string().nullable().optional(),
  hls_storage_path: z.string().nullable().optional(),
  hls_encryption_key: z.string().nullable().optional(),
  mkdocs_content: z.string().nullable().optional(),
})

export async function saveLesson(data: any) {
  try {
    // Validate data
    const validated = lessonSchema.parse(data)

    if (data.id) {
      // Update existing lesson
      await db.lesson.update({
        where: { id: data.id },
        data: {
          title: validated.title,
          slug: validated.slug,
          lesson_type: validated.lesson_type,
          video_type: validated.video_type || "youtube",
          youtube_id: validated.youtube_id,
          video_duration_mins: validated.video_duration_mins || 0,
          is_published: validated.is_published,
          is_preview: validated.is_preview,
          hls_playlist_path: validated.hls_playlist_path,
          hls_storage_path: validated.hls_storage_path,
          hls_encryption_key: validated.hls_encryption_key,
          mkdocs_content: validated.mkdocs_content,
        },
      })

      revalidatePath(`/courses/manage/${validated.course_id}`)

      return { success: true, lessonId: data.id }
    } else {
      // Get the next sequence order
      const lastLesson = await db.lesson.findFirst({
        where: { unit_id: validated.unit_id },
        orderBy: { sequence_order: "desc" },
      })

      const nextOrder = lastLesson ? lastLesson.sequence_order + 1 : 0

      // Create new lesson
      const lesson = await db.lesson.create({
        data: {
          course_id: validated.course_id,
          unit_id: validated.unit_id,
          title: validated.title,
          slug: validated.slug,
          lesson_type: validated.lesson_type,
          video_type: validated.video_type || "youtube",
          youtube_id: validated.youtube_id,
          video_duration_mins: validated.video_duration_mins || 0,
          sequence_order: nextOrder,
          is_published: validated.is_published,
          is_preview: validated.is_preview,
          hls_playlist_path: validated.hls_playlist_path,
          hls_storage_path: validated.hls_storage_path,
          hls_encryption_key: validated.hls_encryption_key,
          mkdocs_content: validated.mkdocs_content,
        },
      })

      // Update unit and course stats
      await updateUnitStats(validated.unit_id)
      await updateCourseStats(validated.course_id)

      revalidatePath(`/courses/manage/${validated.course_id}`)

      return { success: true, lessonId: lesson.id }
    }
  } catch (error) {
    console.error("Error saving lesson:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to save lesson" }
  }
}

export async function deleteLesson(lessonId: number, unitId: number, courseId: number) {
  try {
    await db.lesson.delete({
      where: { id: lessonId },
    })

    // Update unit and course stats
    await updateUnitStats(unitId)
    await updateCourseStats(courseId)

    revalidatePath(`/courses/manage/${courseId}`)

    return { success: true }
  } catch (error) {
    console.error("Error deleting lesson:", error)
    return { success: false, error: "Failed to delete lesson" }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function updateUnitStats(unitId: number) {
  const lessons = await db.lesson.findMany({
    where: { unit_id: unitId },
    select: {
      video_duration_mins: true,
    },
  })

  const totalLessons = lessons.length
  const totalDuration = lessons.reduce(
    (sum, lesson) => sum + (lesson.video_duration_mins || 0),
    0
  )

  await db.unit.update({
    where: { id: unitId },
    data: {
      total_lessons: totalLessons,
      total_duration_mins: totalDuration,
    },
  })
}

async function updateCourseStats(courseId: number) {
  const units = await db.unit.count({
    where: { course_id: courseId },
  })

  const lessons = await db.lesson.findMany({
    where: { course_id: courseId },
    select: {
      video_duration_mins: true,
    },
  })

  const totalLessons = lessons.length
  const totalDuration = lessons.reduce(
    (sum, lesson) => sum + (lesson.video_duration_mins || 0),
    0
  )

  await db.course.update({
    where: { id: courseId },
    data: {
      total_units: units,
      total_lessons: totalLessons,
      total_duration_mins: totalDuration,
    },
  })
}
