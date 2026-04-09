'use client'

import { useState, FormEvent } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { CreateSessionInput } from '@/lib/sessions'
import { Subject } from '@/lib/subjects'
import { cn } from '@/lib/utils'

interface SessionFormProps {
  initialData?: Partial<CreateSessionInput & { id: string }>
  subjects: Subject[]
  onSubmit: (data: CreateSessionInput) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

interface FormErrors {
  name?: string
  subject_id?: string
  duration_minutes?: string
  tasks?: string
}

export default function SessionForm({
  initialData,
  subjects,
  onSubmit,
  onCancel,
  isLoading,
}: SessionFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [subjectId, setSubjectId] = useState(initialData?.subject_id ?? '')
  const [durationMinutes, setDurationMinutes] = useState<number>(
    initialData?.duration_minutes ?? 60
  )
  const [tasks, setTasks] = useState<string[]>(initialData?.tasks ?? [''])
  const [errors, setErrors] = useState<FormErrors>({})

  // Group subjects by category
  const groupedSubjects = subjects.reduce<Record<string, Subject[]>>(
    (acc, subject) => {
      const category = subject.category_name ?? 'Other'
      if (!acc[category]) acc[category] = []
      acc[category].push(subject)
      return acc
    },
    {}
  )

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

    if (!durationMinutes || durationMinutes < 15 || durationMinutes > 480) {
      newErrors.duration_minutes = 'Duration must be between 15 and 480 minutes'
    } else if (!Number.isInteger(durationMinutes)) {
      newErrors.duration_minutes = 'Duration must be a whole number of minutes'
    }

    const cleanedTasks = tasks.filter((t) => t.trim().length > 0)
    if (cleanedTasks.length > 20) {
      newErrors.tasks = 'Maximum 20 tasks allowed'
    }
    const tooLong = cleanedTasks.find((t) => t.length > 200)
    if (tooLong) {
      newErrors.tasks = 'Each task must be 200 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const cleanedTasks = tasks
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    await onSubmit({
      name: name.trim(),
      subject_id: subjectId,
      duration_minutes: durationMinutes,
      tasks: cleanedTasks,
    })
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

  const hours = Math.floor(durationMinutes / 60)
  const mins = durationMinutes % 60
  const durationHelper =
    hours > 0
      ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim()
      : `${mins}m`

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Session Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Session Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Calculus Chapter 5 Review"
            maxLength={100}
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            )}
            disabled={isLoading}
          />
          <span className="absolute right-2 bottom-2 text-xs text-gray-400">
            {name.length}/100
          </span>
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject <span className="text-red-500">*</span>
        </label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className={cn(
            'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white',
            errors.subject_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
          )}
          disabled={isLoading}
        >
          <option value="">Select a subject...</option>
          {Object.entries(groupedSubjects)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, categorySubjects]) => (
              <optgroup key={category} label={category}>
                {categorySubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            ))}
        </select>
        {errors.subject_id && (
          <p className="mt-1 text-xs text-red-600">{errors.subject_id}</p>
        )}
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duration (minutes) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
          min={15}
          max={480}
          step={15}
          className={cn(
            'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            errors.duration_minutes ? 'border-red-300 bg-red-50' : 'border-gray-300'
          )}
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">
          = {durationHelper} &nbsp;(15 – 480 minutes)
        </p>
        {errors.duration_minutes && (
          <p className="mt-1 text-xs text-red-600">{errors.duration_minutes}</p>
        )}
      </div>

      {/* Tasks */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Topics / Tasks{' '}
            <span className="text-gray-400 font-normal">
              ({tasks.filter((t) => t.trim()).length}/20)
            </span>
          </label>
        </div>
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={task}
                onChange={(e) => updateTask(index, e.target.value)}
                placeholder={`Task ${index + 1}`}
                maxLength={200}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTask(index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  disabled={isLoading}
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
            className="mt-2 flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            disabled={isLoading}
          >
            <Plus className="h-3.5 w-3.5" />
            Add task
          </button>
        )}
        {errors.tasks && (
          <p className="mt-1 text-xs text-red-600">{errors.tasks}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? 'Saving...' : 'Save Session'}
        </button>
      </div>
    </form>
  )
}
