import Container from "@/components/Container"
import { MainNav } from "@/components/ui/main-nav"
import { db } from "@/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react"

async function getAllCourses() {
  const courses = await db.course.findMany({
    include: {
      category: true,
      instructors: {
        include: { instructor: true },
      },
      _count: {
        select: {
          units: true,
          lessons: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  })

  return courses
}

export default async function CourseManagementPage() {
  const courses = await getAllCourses()

  return (
    <Container>
      <MainNav />

      <main className="mt-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Course Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage your course content
            </p>
          </div>
          <Link href="/courses/manage/new">
            <Button className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Create New Course
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Courses
            </div>
            <div className="text-3xl font-bold">{courses.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Published
            </div>
            <div className="text-3xl font-bold text-emerald-600">
              {courses.filter((c) => c.is_published).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Units
            </div>
            <div className="text-3xl font-bold">
              {courses.reduce((sum, c) => sum + c._count.units, 0)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Lessons
            </div>
            <div className="text-3xl font-bold">
              {courses.reduce((sum, c) => sum + c._count.lessons, 0)}
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No courses created yet.</p>
              <Link href="/courses/manage/new">
                <Button>Create Your First Course</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {course.icon_text && (
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-sm mr-3">
                              {course.icon_text}
                            </span>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {course.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {course.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {course.category?.name || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            course.is_published
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {course.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div>{course._count.units} units</div>
                        <div>{course._count.lessons} lessons</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {course.course_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link href={`/courses/${course.slug}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/courses/manage/${course.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </Container>
  )
}
