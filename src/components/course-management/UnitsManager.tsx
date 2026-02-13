"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, ChevronDown, ChevronRight, Edit, Trash2, Video } from "lucide-react"
import UnitEditorModal from "./UnitEditorModal"
import LessonEditorModal from "./LessonEditorModal"

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
}

type Unit = {
  id: number
  slug: string
  title: string
  description: string | null
  sequence_order: number
  lessons: Lesson[]
  unit_objectives: { id: number; objective_text: string; sequence_order: number }[]
}

type Course = {
  id: number
  slug: string
  title: string
  units: Unit[]
}

type Props = {
  course: Course
}

export default function UnitsManager({ course }: Props) {
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set())
  const [unitEditorOpen, setUnitEditorOpen] = useState(false)
  const [lessonEditorOpen, setLessonEditorOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)

  const toggleUnit = (unitId: number) => {
    const newExpanded = new Set(expandedUnits)
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId)
    } else {
      newExpanded.add(unitId)
    }
    setExpandedUnits(newExpanded)
  }

  const handleCreateUnit = () => {
    setSelectedUnit(null)
    setUnitEditorOpen(true)
  }

  const handleEditUnit = (unit: Unit) => {
    setSelectedUnit(unit)
    setUnitEditorOpen(true)
  }

  const handleCreateLesson = (unitId: number) => {
    setSelectedUnitId(unitId)
    setSelectedLesson(null)
    setLessonEditorOpen(true)
  }

  const handleEditLesson = (lesson: Lesson, unitId: number) => {
    setSelectedUnitId(unitId)
    setSelectedLesson(lesson)
    setLessonEditorOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Units & Lessons</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your course content into units and lessons
          </p>
        </div>
        <Button onClick={handleCreateUnit}>
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
        </Button>
      </div>

      {course.units.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <p className="text-lg mb-2">No units created yet</p>
            <p className="text-sm">
              Create your first unit to start adding lessons
            </p>
          </div>
          <Button onClick={handleCreateUnit}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Unit
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {course.units.map((unit, unitIndex) => (
            <div
              key={unit.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
            >
              {/* Unit Header */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleUnit(unit.id)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {expandedUnits.has(unit.id) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        Unit {unitIndex + 1}
                      </span>
                      <h3 className="text-lg font-semibold">{unit.title}</h3>
                    </div>
                    {unit.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {unit.description}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {unit.lessons.length} lessons
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditUnit(unit)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>

              {/* Lessons List */}
              {expandedUnits.has(unit.id) && (
                <div className="p-4">
                  <div className="mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateLesson(unit.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lesson
                    </Button>
                  </div>

                  {unit.lessons.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">No lessons in this unit yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateLesson(unit.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Lesson
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {unit.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-sm font-medium text-gray-500 min-w-[3rem]">
                              {unitIndex + 1}.{lessonIndex + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              {lesson.video_type === "youtube" && (
                                <Video className="w-4 h-4 text-red-600" />
                              )}
                              {lesson.video_type === "hls" && (
                                <Video className="w-4 h-4 text-emerald-600" />
                              )}
                              <span className="font-medium">{lesson.title}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                lesson.is_published
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {lesson.is_published ? "Published" : "Draft"}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {lesson.video_type}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLesson(lesson, unit.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Unit Editor Modal */}
      {unitEditorOpen && (
        <UnitEditorModal
          courseId={course.id}
          unit={selectedUnit}
          isOpen={unitEditorOpen}
          onClose={() => setUnitEditorOpen(false)}
        />
      )}

      {/* Lesson Editor Modal */}
      {lessonEditorOpen && selectedUnitId && (
        <LessonEditorModal
          courseId={course.id}
          unitId={selectedUnitId}
          lesson={selectedLesson}
          isOpen={lessonEditorOpen}
          onClose={() => setLessonEditorOpen(false)}
        />
      )}
    </div>
  )
}
