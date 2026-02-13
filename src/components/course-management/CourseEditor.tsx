"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { saveCourse } from "@/lib/actions/course-actions"
import { Loader2, Save, Plus, X } from "lucide-react"

type Category = {
  id: number
  name: string
  slug: string
}

type Instructor = {
  id: number
  name: string
  slug: string
}

type Course = {
  id: number
  slug: string
  title: string
  description: string
  overview: string
  difficulty_level: string
  category_id: number | null
  icon_text: string | null
  tailwind_color: string
  is_free: boolean
  price: any
  currency: string | null
  course_type: string
  is_published: boolean
  prerequisites: { id: number; prerequisite_text: string; sequence_order: number }[]
  target_roles: { id: number; role_name: string }[]
  learning_objectives: { id: number; objective_text: string; sequence_order: number }[]
}

type Props = {
  course: Course | null
  categories: Category[]
  instructors: Instructor[]
  isNew: boolean
}

export default function CourseEditor({
  course,
  categories,
  instructors,
  isNew,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: course?.title || "",
    slug: course?.slug || "",
    description: course?.description || "",
    overview: course?.overview || "",
    difficulty_level: course?.difficulty_level || "beginner",
    category_id: course?.category_id?.toString() || "",
    icon_text: course?.icon_text || "",
    tailwind_color: course?.tailwind_color || "bg-emerald-400",
    is_free: course?.is_free ?? true,
    price: course?.price ? Number(course.price) : 0,
    currency: course?.currency || "USD",
    course_type: course?.course_type || "video",
    is_published: course?.is_published ?? false,
  })

  const [prerequisites, setPrerequisites] = useState<string[]>(
    course?.prerequisites.map((p) => p.prerequisite_text) || [""]
  )

  const [targetRoles, setTargetRoles] = useState<string[]>(
    course?.target_roles.map((r) => r.role_name) || [""]
  )

  const [learningObjectives, setLearningObjectives] = useState<string[]>(
    course?.learning_objectives.map((o) => o.objective_text) || [""]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await saveCourse({
        id: course?.id,
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        prerequisites: prerequisites.filter((p) => p.trim() !== ""),
        target_roles: targetRoles.filter((r) => r.trim() !== ""),
        learning_objectives: learningObjectives.filter((o) => o.trim() !== ""),
      })

      if (result.success && result.courseId) {
        router.push(`/courses/manage/${result.courseId}`)
        router.refresh()
      } else {
        setError(result.error || "Failed to save course")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const addItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => [...prev, ""])
  }

  const removeItem = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="e.g., SAP ABAP Fundamentals"
            />
          </div>

          <div>
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              required
              placeholder="e.g., sap-abap-fundamentals"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used in the URL: /courses/your-slug
            </p>
          </div>

          <div>
            <Label htmlFor="icon_text">Icon Text</Label>
            <Input
              id="icon_text"
              value={formData.icon_text}
              onChange={(e) =>
                setFormData({ ...formData, icon_text: e.target.value })
              }
              maxLength={10}
              placeholder="e.g., ABAP"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                setFormData({ ...formData, category_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={formData.difficulty_level}
              onValueChange={(value) =>
                setFormData({ ...formData, difficulty_level: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Short Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={3}
              placeholder="Brief description of the course"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="overview">Detailed Overview *</Label>
            <Textarea
              id="overview"
              value={formData.overview}
              onChange={(e) =>
                setFormData({ ...formData, overview: e.target.value })
              }
              required
              rows={5}
              placeholder="Comprehensive overview of what the course covers"
            />
          </div>
        </div>
      </div>

      {/* Course Type & Pricing */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Course Type & Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="course_type">Course Type</Label>
            <Select
              value={formData.course_type}
              onValueChange={(value) =>
                setFormData({ ...formData, course_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Course</SelectItem>
                <SelectItem value="mkdocs">MkDocs Course</SelectItem>
                <SelectItem value="hybrid">Hybrid (Video + Docs)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="is_free" className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_free"
                checked={formData.is_free}
                onChange={(e) =>
                  setFormData({ ...formData, is_free: e.target.checked })
                }
                className="w-4 h-4"
              />
              Free Course
            </Label>
          </div>

          {!formData.is_free && (
            <>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Prerequisites */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Prerequisites</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem(setPrerequisites)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {prerequisites.map((prereq, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={prereq}
                onChange={(e) =>
                  updateItem(index, e.target.value, setPrerequisites)
                }
                placeholder="e.g., Basic programming knowledge"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index, setPrerequisites)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Target Roles */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Target Roles</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem(setTargetRoles)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {targetRoles.map((role, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={role}
                onChange={(e) => updateItem(index, e.target.value, setTargetRoles)}
                placeholder="e.g., ABAP Developer"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index, setTargetRoles)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Learning Objectives</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem(setLearningObjectives)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {learningObjectives.map((objective, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={objective}
                onChange={(e) =>
                  updateItem(index, e.target.value, setLearningObjectives)
                }
                placeholder="e.g., Understand ABAP syntax and structure"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index, setLearningObjectives)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Publishing */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Publishing</h2>
        <div>
          <Label htmlFor="is_published" className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) =>
                setFormData({ ...formData, is_published: e.target.checked })
              }
              className="w-4 h-4"
            />
            Publish this course (make it visible to students)
          </Label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/courses/manage")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isNew ? "Create Course" : "Save Changes"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
