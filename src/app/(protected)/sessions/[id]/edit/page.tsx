'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, ArrowLeft, Loader2, Info } from 'lucide-react'
import { Subject } from '@/types/database'
import SubjectSelect from '@/components/sessions/SubjectSelect'
import { cn } from '@/lib/utils'

interface FormErrors {
  name?: string
  subject_id?: string
  duration_minutes?: string
  tasks?: string
  general?: string
}

export default function EditSessionPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [name, setName] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [tasks, setTasks] = useState<string[]>([''])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [sessionRes, subjectsRes] = await Promise.all([
          fetch(`/api/sessions/${id}`),
          fetch('/api/subjects'),
        ])

        if (sessionRes.status === 404) {
          setNotFound(true)
          return
        }

        if (!sessionRes.ok) {
          setErrors({ general: 'Failed to load session' })
          return
        }

        const [sessionData, subjectsData] = await Promise.all([
          sessionRes.json(),
          subjectsRes.ok ? subjectsRes.json() : [],
        ])

        setName(sessionData.name ?? '')
        setSubjectId(sessionData.subject_id ?? '')
        setDurationMinutes(sessionData.duration_minutes ?? 60)
        setTasks(sessionData.tasks?.length > 0 ? sessionData.tasks : [''])
        setSubjects(subjectsData)
      } catch {
        setErrors({ general: 'Failed to load session data' })
      } finally {
        setPageLoading(false)
      }
    }

    loadData()
  }, [id])

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Session name is required'
    } else if (name.trim().length > 100) {
      newErrors.name = 'Name must be 100 characters or less'
    }

    if (!durationMinutes || isNaN(durationMinutes)) {
      newErrors.duration_minutes = 'Duration is required'
    } else if (durationMinutes < 1 || durationMinutes > 480) {
      newErrors.duration_minutes = 'Duration must be between 1 and 480 minutes'
    }

    const nonEmptyTasks = tasks.filter((t) => t.trim().length > 0)
    if (nonEmptyTasks.length > 20) {
      newErrors.tasks = 'Maximum 20 tasks allowed'
    } else {
      const tooLong = nonEmptyTasks.filter((t) => t.trim().length > 200)
      if (tooLong.length > 0) {
        newErrors.tasks = 'Each task must be 200 characters or less'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrors({})

    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          subject_id: subjectId || undefined,
          duration_minutes: durationMinutes,
          tasks: tasks.filter((t) => t.trim().length > 0),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors({ general: data.error || 'Failed to update session. Please try again.' })
        setLoading(false)
        return
      }

      router.push(`/sessions/${id}`)
      router.refresh()
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
      setLoading(false)
    }
  }

  function addTask() {
    if (tasks.length < 20) {
      setTasks([...tasks, ''])
    }
  }

  function removeTask(index: number) {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  function updateTask(index: number, value: string) {
    const updated = [...tasks]
    updated[index] = value
    setTasks(updated)
  }

  if (pageLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h2>
        <p className="text-gray-600 mb-6">This session doesn't exist or you don't have access to it.</p>
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/sessions/${id}`}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Session</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Changes will be saved to version history</p>
        </div>
      </div>

      {/* Version info note */}
      <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6">
        <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          A version snapshot of the current state will be saved automatically when you update this session.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        {/* Session Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Session Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="e.g., Calculus Chapter 5 Review"
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              errors.name ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
            )}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.name ? (
              <p className="text-xs text-red-600">{errors.name}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-gray-400">{name.length}/100</p>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Subject <span className="text-red-500">*</span>
          </label>
          <SubjectSelect
            value={subjectId}
            onChange={setSubjectId}
            subjects={subjects}
            error={errors.subject_id}
          />
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1.5">
            Duration (minutes) <span className="text-red-500">*</span>
          </label>
          <input
            id="duration"
            type="number"
            min={1}
            max={480}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              errors.duration_minutes ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
            )}
          />
          {errors.duration_minutes && (
            <p className="mt-1 text-xs text-red-600">{errors.duration_minutes}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">Between 1 and 480 minutes (8 hours)</p>
        </div>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Tasks / Topics <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <span className="text-xs text-gray-400">{tasks.filter((t) => t.trim()).length}/20</span>
          </div>

          {errors.tasks && (
            <p className="mb-2 text-xs text-red-600">{errors.tasks}</p>
          )}

          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-shrink-0 w-6 text-xs text-gray-400 text-right">{index + 1}.</span>
                <input
                  type="text"
                  value={task}
                  onChange={(e) => updateTask(index, e.target.value)}
                  maxLength={200}
                  placeholder={`Task ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400"
                />
                {tasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove task"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {tasks.length < 20 && (
            <button
              type="button"
              onClick={addTask}
              className="mt-3 flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Link
            href={`/sessions/${id}`}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
