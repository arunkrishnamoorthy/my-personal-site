import Container from "@/components/Container"
import { MainNav } from "@/components/ui/main-nav"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Users,
  Award,
  Play,
  Star,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { db } from "@/db"
import { notFound } from "next/navigation"

async function getCourseData(slug: string) {
  const course = await db.course.findUnique({
    where: { slug, is_published: true },
    include: {
      category: true,
      instructors: {
        include: { instructor: true },
        orderBy: { sequence_order: "asc" },
      },
      units: {
        include: {
          lessons: {
            where: { is_published: true },
            orderBy: { sequence_order: "asc" },
          },
          unit_objectives: {
            orderBy: { sequence_order: "asc" },
          },
        },
        orderBy: { sequence_order: "asc" },
      },
      prerequisites: {
        orderBy: { sequence_order: "asc" },
      },
      target_roles: true,
      learning_objectives: {
        orderBy: { sequence_order: "asc" },
      },
    },
  })

  return course
}

export default async function CourseLanding({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getCourseData(courseId)

  if (!course) {
    notFound()
  }

  // Calculate total duration in hours
  const totalHours = Math.floor(course.total_duration_mins / 60)
  const remainingMins = course.total_duration_mins % 60

  return (
    <Container>
      <MainNav />

      {/* Background gradient for light mode */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-emerald-50/30 via-white to-white dark:from-background dark:via-background dark:to-background pointer-events-none"></div>

      {/* Course Heading Section */}
      <section className="w-full max-w-6xl mx-auto mt-8 mb-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {course.icon_text && (
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-lg shadow-lg">
                  {course.icon_text}
                </span>
              )}
              <div
                className={`h-1.5 w-32 md:w-64 rounded-full shadow-sm ${course.tailwind_color}`}
                style={{
                  backgroundColor: course.tailwind_color.includes("emerald-400")
                    ? "#34d399"
                    : course.tailwind_color.includes("blue-400")
                    ? "#60a5fa"
                    : "#6b7280",
                }}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                <TrendingUp className="w-3 h-3" />
                {course.difficulty_level}
              </span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {course.title}
          </h1>
          <p className="text-sm text-muted-foreground">{course.description}</p>
        </div>
      </section>

      {/* Hero Section */}
      <main className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 mt-6">
        {/* Left: Course Video Placeholder */}
        <div className="flex-1">
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white dark:bg-card">
            <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 dark:from-emerald-600 dark:via-emerald-700 dark:to-teal-800 h-[280px] md:h-[380px] flex items-center justify-center group">
              {/* Decorative circles */}
              <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/10 blur-2xl"></div>
              <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full bg-white/10 blur-3xl"></div>

              <div className="relative z-10 flex flex-col items-center justify-center">
                <button className="flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-2xl transform transition-all duration-300 hover:scale-110 group-hover:shadow-white/20">
                  <Play
                    className="w-10 h-10 text-emerald-600 ml-1"
                    fill="currentColor"
                  />
                </button>
                <span className="mt-6 text-white/90 font-semibold text-lg">
                  Course Introduction Video
                </span>
                <span className="mt-1 text-white/70 text-sm">
                  {totalHours > 0 ? `${totalHours}h ${remainingMins}m` : `${remainingMins}m`}
                </span>
              </div>

              {/* Premium badge */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold">
                <Award className="w-3.5 h-3.5" />
                {course.is_free ? "Free Course" : "Premium Course"}
              </div>
            </div>
          </Card>

          {/* Course Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="text-center py-4 bg-gradient-to-br from-emerald-50 to-white dark:from-card dark:to-card border-emerald-100 dark:border-gray-800">
              <CardContent className="p-0">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {course.total_lessons}
                </div>
                <div className="text-xs text-muted-foreground">Lessons</div>
              </CardContent>
            </Card>
            <Card className="text-center py-4 bg-gradient-to-br from-blue-50 to-white dark:from-card dark:to-card border-blue-100 dark:border-gray-800">
              <CardContent className="p-0">
                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalHours > 0 ? `${totalHours}h` : `${remainingMins}m`}
                </div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </CardContent>
            </Card>
            <Card className="text-center py-4 bg-gradient-to-br from-purple-50 to-white dark:from-card dark:to-card border-purple-100 dark:border-gray-800">
              <CardContent className="p-0">
                <Users className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {course.student_count >= 1000
                    ? `${(course.student_count / 1000).toFixed(1)}k`
                    : course.student_count}
                </div>
                <div className="text-xs text-muted-foreground">Students</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: Course Details */}
        <aside className="flex-1 flex flex-col gap-5">
          {/* Overview Card */}
          <Card className="bg-white dark:bg-card border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {course.overview}
              </p>
            </CardContent>
          </Card>

          {/* Learning Objectives Card */}
          {course.learning_objectives.length > 0 && (
            <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-card dark:to-card border-emerald-100 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Learning objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {course.learning_objectives.map((obj) => (
                    <li key={obj.id} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {obj.objective_text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Additional Info Card */}
          <Card className="bg-white dark:bg-card border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-base">Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instructors */}
              {course.instructors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Instructors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {course.instructors.map((ci) => (
                      <span
                        key={ci.id}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800"
                      >
                        {ci.instructor.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Roles */}
              {course.target_roles.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Roles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {course.target_roles.map((role) => (
                      <span
                        key={role.id}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-800"
                      >
                        {role.role_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Prerequisites
                  </h3>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prereq) => (
                      <li
                        key={prereq.id}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Star className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                        <span>{prereq.prerequisite_text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Start Learning Button */}
          {course.units.length > 0 && course.units[0].lessons.length > 0 && (
            <Link
              href={`/courses/${course.slug}/${course.units[0].lessons[0].slug}`}
              className="w-full"
            >
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Play className="w-4 h-4" />
                Start learning
              </Button>
            </Link>
          )}
        </aside>
      </main>

      {/* Course Units Section */}
      <section className="w-full max-w-6xl mx-auto mt-12 mb-16">
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Course Curriculum
          </h2>
          <p className="text-sm text-muted-foreground">
            {course.total_units} units • {course.total_lessons} lessons •{" "}
            {totalHours > 0
              ? `${totalHours}h ${remainingMins}m`
              : `${remainingMins}m`}{" "}
            total
          </p>
        </div>

        <Accordion type="multiple" className="space-y-4">
          {course.units.map((unit, idx) => {
            // For now, progress is 0 since we don't have user context
            // In a real app, you'd fetch this from the API
            const completedLectures = 0
            const totalLectures = unit.lessons.length
            const progress = 0

            return (
              <AccordionItem
                key={unit.id}
                value={unit.id.toString()}
                className="border-none"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-card border-gray-200 dark:border-gray-800">
                  <AccordionTrigger className="px-6 py-5 hover:no-underline">
                    <div className="flex items-start gap-4 w-full">
                      {/* Unit Number Badge */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-md shrink-0">
                        {idx + 1}
                      </div>

                      {/* Unit Info */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Unit {idx + 1}
                          </span>
                          {progress === 100 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                          {progress > 0 && progress < 100 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                              In Progress
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {unit.title}
                        </h3>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            {unit.lessons.length} Lessons
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {unit.total_duration_mins >= 60
                              ? `${Math.floor(unit.total_duration_mins / 60)}h ${unit.total_duration_mins % 60}m`
                              : `${unit.total_duration_mins}m`}
                          </span>
                          {progress > 0 && (
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                              {completedLectures}/{totalLectures} completed
                            </span>
                          )}
                        </div>

                        {/* Progress bar */}
                        {progress > 0 && (
                          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-6 pb-6">
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Objectives */}
                        {unit.unit_objectives.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                              What you&apos;ll learn
                            </h4>
                            <ul className="space-y-2">
                              {unit.unit_objectives.map((obj) => (
                                <li
                                  key={obj.id}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                  <span>{obj.objective_text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Lectures/Progress */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Lessons in this unit
                          </h4>
                          <ul className="space-y-2">
                            {unit.lessons.map((lesson, lidx) => (
                              <li key={lesson.id} className="group">
                                <Link
                                  href={`/courses/${course.slug}/${lesson.slug}`}
                                >
                                  <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-gray-700">
                                    <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                                    <span className="text-sm flex-1 text-muted-foreground">
                                      {lidx + 1}. {lesson.title}
                                    </span>
                                    {lesson.is_preview && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                                        Preview
                                      </span>
                                    )}
                                    <Play className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action Button */}
                      {unit.lessons.length > 0 && (
                        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                          <Link href={`/courses/${course.slug}/${unit.lessons[0].slug}`}>
                            <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all">
                              {progress > 0 && progress < 100
                                ? "Continue Learning"
                                : progress === 100
                                ? "Review Unit"
                                : "Start Unit"}
                              <Play className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            )
          })}
        </Accordion>
      </section>
    </Container>
  )
}
