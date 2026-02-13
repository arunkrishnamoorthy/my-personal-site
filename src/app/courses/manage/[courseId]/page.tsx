import Container from "@/components/Container"
import { MainNav } from "@/components/ui/main-nav"
import { db } from "@/db"
import { notFound } from "next/navigation"
import CourseEditor from "@/components/course-management/CourseEditor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UnitsManager from "@/components/course-management/UnitsManager"

async function getCourseData(courseId: string) {
  if (courseId === "new") {
    return null
  }

  const course = await db.course.findUnique({
    where: { id: parseInt(courseId) },
    include: {
      category: true,
      instructors: {
        include: { instructor: true },
      },
      prerequisites: true,
      target_roles: true,
      learning_objectives: true,
      units: {
        include: {
          lessons: {
            orderBy: { sequence_order: "asc" },
          },
          unit_objectives: true,
        },
        orderBy: { sequence_order: "asc" },
      },
    },
  })

  if (!course) {
    notFound()
  }

  return course
}

async function getCategories() {
  return await db.category.findMany({
    orderBy: { name: "asc" },
  })
}

async function getInstructors() {
  return await db.instructor.findMany({
    orderBy: { name: "asc" },
  })
}

export default async function CourseManageDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getCourseData(courseId)
  const categories = await getCategories()
  const instructors = await getInstructors()

  const isNew = courseId === "new"

  return (
    <Container>
      <MainNav />

      <main className="mt-10 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isNew ? "Create New Course" : `Edit Course: ${course?.title}`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isNew
              ? "Fill in the details to create a new course"
              : "Update course information and manage content"}
          </p>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="content" disabled={isNew}>
              Units & Lessons
            </TabsTrigger>
            <TabsTrigger value="settings" disabled={isNew}>
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <CourseEditor
              course={course}
              categories={categories}
              instructors={instructors}
              isNew={isNew}
            />
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            {course && <UnitsManager course={course} />}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Course Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced settings will be added here (pricing, enrollment limits,
                publishing, etc.)
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </Container>
  )
}
