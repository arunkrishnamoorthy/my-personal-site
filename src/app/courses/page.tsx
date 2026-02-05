import Container from "@/components/Container"
import { MainNav } from "@/components/ui/main-nav"
import Image from "next/image"
import Link from "next/link"
import { db } from "@/db"

async function getCourses() {
  const courses = await db.course.findMany({
    where: { is_published: true },
    include: {
      category: true,
      instructors: {
        include: { instructor: true },
      },
    },
    orderBy: { sequence_order: "asc" },
  })

  return courses
}

export default async function Courses() {
  const courses = await getCourses()

  return (
    <Container>
      <MainNav />

      {/* Background gradient for light mode */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-emerald-50/30 via-white to-white dark:from-background dark:via-background dark:to-background pointer-events-none"></div>

      <main className="flex flex-col items-center mt-10">
        {/* Heading and Search */}
        <section className="w-full max-w-4xl flex flex-col items-center mb-6">
          <h1 className="text-xl md:text-xl font-semibold text-center mb-4 bg-gradient-to-r from-gray-300 to-gray-100 bg-clip-text">
            What would you like to learn today?
          </h1>
          <div className="w-full flex justify-center mb-5">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Find self-paced learning content, certification guidance, and more"
                className="w-full rounded-full border border-gray-300 px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm shadow-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M21 21l-3.5-3.5"
                  />
                </svg>
              </span>
            </div>
          </div>
        </section>

        {/* Welcome Banner */}
        <section className="w-full max-w-4xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white rounded-2xl px-5 py-5 shadow-lg mb-6">
            <div className="flex items-center">
              <Image
                src="/myphoto.jpeg"
                alt="Arun Krishnamoorthy"
                width={48}
                height={48}
                className="rounded-full border-2 border-white shadow-md"
              />
              <div className="ml-4">
                <div className="text-lg font-bold mb-0.5">
                  Welcome back, Arun!
                </div>
                <div className="text-sm opacity-90">
                  Check your learning progress, achievements, and more.
                </div>
              </div>
            </div>
            <a
              href="#"
              className="bg-white text-emerald-700 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-emerald-50 transition flex items-center text-sm"
            >
              Go to My Learning
              <svg
                className="ml-2"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </section>

        {/* Courses List Section */}
        <section className="w-full max-w-6xl mt-6">
          <h2 className="text-xl font-semibold mb-6 border-l-4 border-emerald-600 dark:border-emerald-500 pl-3">
            Courses
          </h2>

          {courses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No courses available yet.</p>
              <p className="text-sm">Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, idx) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col h-full"
                >
                  {/* Course number and separator */}
                  <div className="flex items-center mb-2">
                    <span className="text-2xl font-bold">{idx + 1}</span>
                    <div
                      className={`flex-1 h-[4px] ml-2 rounded ${course.tailwind_color}`}
                      style={{
                        backgroundColor:
                          course.tailwind_color.includes("emerald-400")
                            ? "#34d399"
                            : course.tailwind_color.includes("blue-400")
                            ? "#60a5fa"
                            : course.tailwind_color.includes("yellow-400")
                            ? "#fbbf24"
                            : course.tailwind_color.includes("pink-300")
                            ? "#f9a8d4"
                            : course.tailwind_color.includes("indigo-400")
                            ? "#818cf8"
                            : course.tailwind_color.includes("blue-500")
                            ? "#3b82f6"
                            : course.tailwind_color.includes("cyan-400")
                            ? "#22d3ee"
                            : course.tailwind_color.includes("green-400")
                            ? "#4ade80"
                            : course.tailwind_color.includes("purple-400")
                            ? "#a78bfa"
                            : course.tailwind_color.includes("emerald-500")
                            ? "#10b981"
                            : "#6b7280",
                      }}
                    ></div>
                  </div>

                  {/* Course title with icon */}
                  <div className="flex items-center mb-2">
                    {course.icon_text && (
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-sm mr-2">
                        {course.icon_text}
                      </span>
                    )}
                    <span className="font-bold text-lg">{course.title}</span>
                  </div>

                  {/* Course metadata */}
                  <div className="text-gray-500 dark:text-gray-300 text-xs mb-1 flex items-center gap-3">
                    <span>{course.total_units} units</span>
                    <span>•</span>
                    <span>{course.total_lessons} lessons</span>
                    {!course.is_free && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold">
                          {course.currency} {Number(course.price).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Difficulty badge */}
                  {course.difficulty_level && (
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {course.difficulty_level}
                      </span>
                    </div>
                  )}

                  {/* Course description */}
                  <div className="text-gray-700 dark:text-gray-200 text-sm mb-4 flex-grow">
                    {course.description}
                  </div>

                  {/* Instructor info */}
                  {course.instructors.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      By {course.instructors.map((ci) => ci.instructor.name).join(", ")}
                    </div>
                  )}

                  {/* Course stats */}
                  {course.student_count > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {course.student_count.toLocaleString()} students enrolled
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-auto flex flex-wrap gap-4">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      {course.is_free ? "Start Learning" : "View Course"}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <path
                          d="M9 18l6-6-6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </Container>
  )
}
