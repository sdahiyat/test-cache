'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, ArrowLeft, Loader2, ArrowUpRight } from 'lucide-react'
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

export default function NewSessionPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [tasks, setTasks] = useState<string[]>([''])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [subjectsLoading, setSubjectsLoading] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [upgradeRequired, setUpgradeRequired] = useState(false)

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await fetch('/api/subjects')
        if (res.ok) {
          const data = await res.json()
          setSubjects(data)
        }
      } catch (err) {
        console.error('Failed to load subjects:', err)
      } finally {
        setSubjectsLoading(false)
      }
    }
    fetchSubjects()
  }, [])

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Session name is required'
    } else if (name.trim().length > 100) {
      newErrors.name = 'Name must be 100 characters or less'
    }

    if (!subjectId) {
      newErrors.subject_id = 'Please select a subject'
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
    setUpgradeRequired(false)

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          subject_id: subjectId,
          duration_minutes: durationMinutes,
          tasks: tasks.filter((t) => t.trim().length > 0),
        }),
      })

      const data = await res.json()

      if (res.status === 403 && data.upgradeRequired) {
        setUpgradeRequired(true)
        setLoading(false)
        return
      }

      if (!res.ok) {
        setErrors({ general: data.error || 'Failed to create session. Please try again.' })
        setLoading(false)
        return
      }

      router.push(`/sessions/${data.id}`)
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

  if (upgradeRequired) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
          <ArrowUpRight className="h-8 w-8 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Session Limit Reached</h2>
        <p className="text-gray-600 mb-6">
          Free users can have a maximum of 5 active sessions. Archive an existing session or
          upgrade to Pro for unlimited sessions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sessions"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Back to Sessions
          </Link>
          <Link
            href="/upgrade"
            className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/sessions"
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Study Session</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Set up a new structured study session</p>
        </div>
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
          {subjectsLoading ? (
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <SubjectSelect
              value={subjectId}
              onChange={setSubjectId}
              subjects={subjects}
              required
              error={errors.subject_id}
            />
          )}
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
            href="/sessions"
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
                Creating...
              </>
            ) : (
              'Create Session'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
