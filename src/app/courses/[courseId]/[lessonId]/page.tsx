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
        include: {
          lessons: {
            where: { is_published: true },
            orderBy: { sequence_order: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              sequence_order: true,
            },
          },
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

  return lesson
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const lesson = await getLessonData(courseId, lessonId)

  if (!lesson) {
    notFound()
  }

  // Generate video token for HLS videos
  let videoToken: string | undefined
  if (lesson.video_type === "hls") {
    videoToken = await generateVideoToken(courseId, lessonId)
  }

  // Find previous and next lessons
  const currentIndex = lesson.unit.lessons.findIndex((l) => l.id === lesson.id)
  const previousLesson = currentIndex > 0 ? lesson.unit.lessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex < lesson.unit.lessons.length - 1
      ? lesson.unit.lessons[currentIndex + 1]
      : null

  return (
    <Container>
      <MainNav />

      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-emerald-50/30 via-white to-white dark:from-background dark:via-background dark:to-background pointer-events-none"></div>

      {/* Back to Course Button */}
      <div className="w-full max-w-7xl mx-auto mt-6 mb-4">
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Course
          </Button>
        </Link>
      </div>

      <main className="w-full max-w-7xl mx-auto">
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

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
              {previousLesson ? (
                <Link href={`/courses/${courseId}/${previousLesson.slug}`}>
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Previous Lesson
                  </Button>
                </Link>
              ) : (
                <div />
              )}
              {nextLesson ? (
                <Link href={`/courses/${courseId}/${nextLesson.slug}`}>
                  <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                    Next Lesson
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/courses/${courseId}`}>
                  <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Unit
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar - Unit Lessons */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">{lesson.unit.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {lesson.unit.lessons.length} lessons in this unit
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lesson.unit.lessons.map((unitLesson, idx) => (
                    <li key={unitLesson.id}>
                      <Link href={`/courses/${courseId}/${unitLesson.slug}`}>
                        <div
                          className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                            unitLesson.id === lesson.id
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                              unitLesson.id === lesson.id
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span className="text-sm flex-1">{unitLesson.title}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </Container>
  )
}
