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
import { saveUnit } from "@/lib/actions/course-actions"
import { Loader2, Plus, X } from "lucide-react"

type Unit = {
  id: number
  slug: string
  title: string
  description: string | null
  sequence_order: number
  unit_objectives: { id: number; objective_text: string; sequence_order: number }[]
}

type Props = {
  courseId: number
  unit: Unit | null
  isOpen: boolean
  onClose: () => void
}

export default function UnitEditorModal({
  courseId,
  unit,
  isOpen,
  onClose,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: unit?.title || "",
    slug: unit?.slug || "",
    description: unit?.description || "",
  })

  const [objectives, setObjectives] = useState<string[]>(
    unit?.unit_objectives.map((o) => o.objective_text) || [""]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await saveUnit({
        id: unit?.id,
        course_id: courseId,
        ...formData,
        objectives: objectives.filter((o) => o.trim() !== ""),
      })

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        setError(result.error || "Failed to save unit")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const addObjective = () => {
    setObjectives([...objectives, ""])
  }

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index))
  }

  const updateObjective = (index: number, value: string) => {
    setObjectives(objectives.map((obj, i) => (i === index ? value : obj)))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {unit ? "Edit Unit" : "Create New Unit"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="unit-title">Unit Title *</Label>
            <Input
              id="unit-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="e.g., Introduction to ABAP"
            />
          </div>

          <div>
            <Label htmlFor="unit-slug">URL Slug *</Label>
            <Input
              id="unit-slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              required
              placeholder="e.g., introduction-to-abap"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used in the URL path
            </p>
          </div>

          <div>
            <Label htmlFor="unit-description">Description</Label>
            <Textarea
              id="unit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              placeholder="Brief description of this unit"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Unit Objectives</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjective}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {objectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    placeholder="e.g., Understand ABAP data types"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeObjective(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Unit</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
