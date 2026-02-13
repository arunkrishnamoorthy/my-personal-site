"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { saveLesson } from "@/lib/actions/course-actions"
import { Loader2, Upload, FileText, Video } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Lesson = {
  id: number
  slug: string
  title: string
  sequence_order: number
  video_type: string
  youtube_id: string | null
  hls_playlist_path: string | null
  lesson_type: string
  is_published: boolean
  is_preview: boolean
  video_duration_mins: number | null
  mkdocs_content: string | null
}

type Props = {
  courseId: number
  unitId: number
  lesson: Lesson | null
  isOpen: boolean
  onClose: () => void
}

export default function LessonEditorModal({
  courseId,
  unitId,
  lesson,
  isOpen,
  onClose,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: lesson?.title || "",
    slug: lesson?.slug || "",
    lesson_type: lesson?.lesson_type || "video",
    video_type: lesson?.video_type || "youtube",
    youtube_id: lesson?.youtube_id || "",
    video_duration_mins: lesson?.video_duration_mins || 0,
    is_published: lesson?.is_published ?? false,
    is_preview: lesson?.is_preview ?? false,
    mkdocs_content: lesson?.mkdocs_content || "",
  })

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [markdownFile, setMarkdownFile] = useState<File | null>(null)

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0])
    }
  }

  const handleMarkdownFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setMarkdownFile(file)

      // Read and preview markdown content
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setFormData({ ...formData, mkdocs_content: content })
      }
      reader.readAsText(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // If video file is selected, upload it first
      let uploadedVideoData = null
      if (videoFile && formData.video_type === "hls") {
        setUploading(true)
        const uploadFormData = new FormData()
        uploadFormData.append("video", videoFile)
        uploadFormData.append("courseId", courseId.toString())
        uploadFormData.append("lessonSlug", formData.slug)

        const uploadResponse = await fetch("/api/upload/video", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload video")
        }

        uploadedVideoData = await uploadResponse.json()
        setUploading(false)
      }

      // Save lesson with video data
      const result = await saveLesson({
        id: lesson?.id,
        course_id: courseId,
        unit_id: unitId,
        ...formData,
        hls_playlist_path: uploadedVideoData?.hls_playlist_path || null,
        hls_storage_path: uploadedVideoData?.hls_storage_path || null,
        hls_encryption_key: uploadedVideoData?.hls_encryption_key || null,
      })

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        setError(result.error || "Failed to save lesson")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {lesson ? "Edit Lesson" : "Create New Lesson"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">Lesson Title *</Label>
              <Input
                id="lesson-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="e.g., Introduction to Variables"
              />
            </div>

            <div>
              <Label htmlFor="lesson-slug">URL Slug *</Label>
              <Input
                id="lesson-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                required
                placeholder="e.g., introduction-to-variables"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lesson-type">Lesson Type</Label>
                <Select
                  value={formData.lesson_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, lesson_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Lesson</SelectItem>
                    <SelectItem value="text">Text/Documentation</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.video_duration_mins}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      video_duration_mins: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          {/* Video Configuration */}
          {formData.lesson_type === "video" && (
            <Tabs
              value={formData.video_type}
              onValueChange={(value) =>
                setFormData({ ...formData, video_type: value })
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="youtube">YouTube Video</TabsTrigger>
                <TabsTrigger value="hls">Upload Protected Video</TabsTrigger>
              </TabsList>

              <TabsContent value="youtube" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="youtube-id">YouTube Video ID *</Label>
                  <Input
                    id="youtube-id"
                    value={formData.youtube_id}
                    onChange={(e) =>
                      setFormData({ ...formData, youtube_id: e.target.value })
                    }
                    placeholder="e.g., dQw4w9WgXcQ"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    From URL: https://www.youtube.com/watch?v=
                    <span className="font-mono">VIDEO_ID</span>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="hls" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="video-upload">Upload Video File</Label>
                  <div className="mt-2">
                    <label
                      htmlFor="video-upload"
                      className="flex items-center justify-center w-full h-32 px-4 transition border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Video className="w-8 h-8 text-gray-400" />
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {videoFile ? (
                            <span className="font-medium">{videoFile.name}</span>
                          ) : (
                            <>
                              <span className="font-medium text-emerald-600">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          MP4, MOV, or AVI (max 2GB)
                        </p>
                      </div>
                      <input
                        id="video-upload"
                        type="file"
                        className="hidden"
                        accept="video/mp4,video/quicktime,video/x-msvideo"
                        onChange={handleVideoFileChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Video will be automatically converted to HLS format with encryption
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Markdown Content */}
          {formData.lesson_type === "text" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="markdown-upload">Upload Markdown File</Label>
                <div className="mt-2">
                  <label
                    htmlFor="markdown-upload"
                    className="flex items-center justify-center w-full h-32 px-4 transition border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <FileText className="w-8 h-8 text-gray-400" />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {markdownFile ? (
                          <span className="font-medium">{markdownFile.name}</span>
                        ) : (
                          <>
                            <span className="font-medium text-emerald-600">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Markdown (.md) or MDX (.mdx) files
                      </p>
                    </div>
                    <input
                      id="markdown-upload"
                      type="file"
                      className="hidden"
                      accept=".md,.mdx"
                      onChange={handleMarkdownFileChange}
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="markdown-content">Markdown Content</Label>
                <Textarea
                  id="markdown-content"
                  value={formData.mkdocs_content}
                  onChange={(e) =>
                    setFormData({ ...formData, mkdocs_content: e.target.value })
                  }
                  rows={10}
                  placeholder="# Lesson Content

Write your lesson content in Markdown format..."
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Publishing Options */}
          <div className="space-y-2 pt-4 border-t">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData({ ...formData, is_published: e.target.checked })
                }
                className="w-4 h-4"
              />
              Publish this lesson
            </Label>

            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_preview}
                onChange={(e) =>
                  setFormData({ ...formData, is_preview: e.target.checked })
                }
                className="w-4 h-4"
              />
              Allow preview without enrollment
            </Label>
          </div>

          {uploading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading and processing video... This may take a few minutes.</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading || uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploading ? "Uploading..." : "Saving..."}
                </>
              ) : (
                <>Save Lesson</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
