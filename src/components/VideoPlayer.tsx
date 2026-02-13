"use client"

/**
 * VideoPlayer Component
 *
 * Supports both YouTube embeds and protected HLS streaming
 * - YouTube: Uses iframe embed for free courses
 * - HLS: Uses Video.js with secure token-based streaming for paid courses
 */

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Play, Loader2, AlertCircle } from "lucide-react"

interface VideoPlayerProps {
  videoType: "youtube" | "hls"
  youtubeId?: string
  courseSlug?: string
  lessonSlug?: string
  videoToken?: string
  className?: string
  autoplay?: boolean
}

export function VideoPlayer({
  videoType,
  youtubeId,
  courseSlug,
  lessonSlug,
  videoToken,
  className = "",
  autoplay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hlsInstance, setHlsInstance] = useState<any>(null)

  // YouTube player
  if (videoType === "youtube" && youtubeId) {
    return (
      <div className={`relative w-full ${className}`} style={{ paddingTop: "56.25%" }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${youtubeId}${autoplay ? "?autoplay=1" : ""}`}
          title="Course video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  // HLS player
  if (videoType === "hls" && courseSlug && lessonSlug && videoToken) {
    return (
      <HLSPlayer
        courseSlug={courseSlug}
        lessonSlug={lessonSlug}
        videoToken={videoToken}
        className={className}
        autoplay={autoplay}
      />
    )
  }

  // Error state
  return (
    <Card className="w-full aspect-video flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="text-center p-6">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Video configuration error
        </p>
      </div>
    </Card>
  )
}

/**
 * HLS Player Component
 * Uses HLS.js for adaptive streaming with encryption support
 */
function HLSPlayer({
  courseSlug,
  lessonSlug,
  videoToken,
  className,
  autoplay,
}: {
  courseSlug: string
  lessonSlug: string
  videoToken: string
  className: string
  autoplay: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const videoUrl = `/api/videos/${courseSlug}/${lessonSlug}?token=${videoToken}`

    // Check if HLS is natively supported (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl
      video.addEventListener("loadedmetadata", () => setLoading(false))
      video.addEventListener("error", () => {
        setError("Failed to load video")
        setLoading(false)
      })

      if (autoplay) {
        video.play().catch(() => {
          // Autoplay failed, user interaction required
        })
      }
    } else {
      // Use HLS.js for other browsers
      import("hls.js")
        .then((module) => {
          const Hls = module.default

          if (Hls.isSupported()) {
            const hls = new Hls()

            hls.loadSource(videoUrl)
            hls.attachMedia(video)

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setLoading(false)
              if (autoplay) {
                video.play().catch(() => {
                  // Autoplay failed
                })
              }
            })

            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                setError("Failed to load video")
                setLoading(false)
              }
            })

            return () => {
              hls.destroy()
            }
          } else {
            setError("Video playback not supported in this browser")
            setLoading(false)
          }
        })
        .catch(() => {
          setError("Failed to initialize video player")
          setLoading(false)
        })
    }

    return () => {
      if (video) {
        video.pause()
        video.removeAttribute("src")
        video.load()
      }
    }
  }, [courseSlug, lessonSlug, videoToken, autoplay])

  if (error) {
    return (
      <Card className="w-full aspect-video flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className={`relative w-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg z-10">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full aspect-video rounded-lg bg-black"
        controls
        controlsList="nodownload" // Disable download button
        disablePictureInPicture={false}
        onContextMenu={(e) => e.preventDefault()} // Disable right-click
        playsInline
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
