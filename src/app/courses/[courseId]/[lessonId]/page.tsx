import Container from "@/components/Container"
import { MainNav } from "@/components/ui/main-nav"
import { VideoPlayer } from "@/components/VideoPlayer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { db } from "@/db"
import { notFound } from "next/navigation"
import { generateVideoToken } from "@/lib/video-utils"

async function getLessonData(courseSlug: string, lessonSlug: string) {
  const lesson = await db.lesson.findFirst({
    where: {
      slug: lessonSlug,
      course: { slug: courseSlug },
      is_published: true,
    },
    include: {
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          is_free: true,
        },
      },
      unit: {
        select: {
          id: true,
          slug: true,
          title: true,
        },
      },
      takeaways: {
        orderBy: { sequence_order: "asc" },
      },
      resources: {
        orderBy: { created_at: "desc" },
      },
    },
  })

  if (!lesson) return null

  // Get all lessons in the course for full navigation
  const allLessons = await db.lesson.findMany({
    where: {
      course_id: lesson.course_id,
      is_published: true,
    },
    include: {
      unit: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: [{ unit: { sequence_order: "asc" } }, { sequence_order: "asc" }],
  })

  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id)
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return {
    lesson,
    previousLesson,
    nextLesson,
    allLessons,
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const data = await getLessonData(courseId, lessonId)

  if (!data) {
    notFound()
  }

  const { lesson, previousLesson, nextLesson, allLessons } = data

  // Generate video token for HLS videos
  let videoToken: string | undefined
  if (lesson.video_type === "hls") {
    videoToken = await generateVideoToken(courseId, lessonId)
  }

  return (
    <Container>
      <MainNav />

      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-emerald-50/30 via-white to-white dark:from-background dark:via-background dark:to-background pointer-events-none"></div>

      <main className="w-full max-w-7xl mx-auto mt-8 mb-16">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-muted-foreground">
          <Link
            href="/courses"
            className="hover:text-emerald-600 transition-colors"
          >
            Courses
          </Link>
          <span className="mx-2">›</span>
          <Link
            href={`/courses/${lesson.course.slug}`}
            className="hover:text-emerald-600 transition-colors"
          >
            {lesson.course.title}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900 dark:text-white">{lesson.title}</span>
        </div>
        {/* Video Section */}
        <div className="mb-8">
          <VideoPlayer
            videoType={lesson.video_type as "youtube" | "hls"}
            youtubeId={lesson.youtube_id || undefined}
            courseSlug={courseId}
            lessonSlug={lessonId}
            videoToken={videoToken}
            className="shadow-2xl"
          />
        </div>

        {/* Lesson Info and Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                  <BookOpen className="w-3.5 h-3.5" />
                  {lesson.lesson_type === "video" ? "Video Lesson" : "Lesson"}
                </span>
                {lesson.video_duration_mins && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {lesson.video_duration_mins} mins
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {lesson.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {lesson.unit.title} • {lesson.course.title}
              </p>
            </div>

            {/* Key Takeaways */}
            {lesson.takeaways.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Takeaways</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {lesson.takeaways.map((takeaway) => (
                      <li key={takeaway.id} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {takeaway.takeaway_text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Lesson Resources */}
            {lesson.resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {lesson.resources.map((resource) => (
                      <li key={resource.id}>
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Download className="w-4 h-4 text-emerald-600" />
                            <div>
                              <p className="text-sm font-medium">{resource.resource_title}</p>
                              <p className="text-xs text-muted-foreground">
                                {resource.resource_type}
                                {resource.file_size_kb && ` • ${Math.round(resource.file_size_kb / 1024)} MB`}
                              </p>
                            </div>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Chapter URL */}
            {lesson.chapter_url && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium">
                      Want to learn more?
                    </span>
                  </div>
                  <a
                    href={lesson.chapter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-sm underline"
                  >
                    Read the full chapter
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
              {previousLesson ? (
                <Link href={`/courses/${lesson.course.slug}/${previousLesson.slug}`}>
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Previous Lesson
                  </Button>
                </Link>
              ) : (
                <div />
              )}
              {nextLesson ? (
                <Link href={`/courses/${lesson.course.slug}/${nextLesson.slug}`}>
                  <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                    Next Lesson
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/courses/${lesson.course.slug}`}>
                  <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Back to Course
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar - Course Outline */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Course Lessons</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <div className="space-y-4">
                  {(() => {
                    // Group lessons by unit
                    const lessonsByUnit = allLessons.reduce(
                      (acc, l, idx) => {
                        const unitId = l.unit.id
                        if (!acc[unitId]) {
                          acc[unitId] = {
                            unit: l.unit,
                            lessons: [],
                          }
                        }
                        acc[unitId].lessons.push({ ...l, globalIndex: idx })
                        return acc
                      },
                      {} as Record<
                        number,
                        {
                          unit: { id: number; title: string }
                          lessons: Array<
                            (typeof allLessons)[0] & { globalIndex: number }
                          >
                        }
                      >
                    )

                    return Object.values(lessonsByUnit).map((group, unitIdx) => (
                      <div key={group.unit.id}>
                        {/* Unit Header */}
                        <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Unit {unitIdx + 1}: {group.unit.title}
                          </h4>
                        </div>

                        {/* Lessons in Unit */}
                        <div className="space-y-1">
                          {group.lessons.map((l) => (
                            <Link
                              key={l.id}
                              href={`/courses/${lesson.course.slug}/${l.slug}`}
                            >
                              <div
                                className={`p-3 rounded-lg transition-colors cursor-pointer ${
                                  l.id === lesson.id
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800"
                                    : "hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-xs font-semibold text-muted-foreground mt-0.5">
                                    {l.globalIndex + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p
                                      className={`text-sm font-medium ${
                                        l.id === lesson.id
                                          ? "text-emerald-700 dark:text-emerald-400"
                                          : "text-gray-900 dark:text-white"
                                      }`}
                                    >
                                      {l.title}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </Container>
  )
}
