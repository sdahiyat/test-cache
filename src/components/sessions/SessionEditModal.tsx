'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, X, AlertCircle, Info } from 'lucide-react'
import SessionForm from '@/components/sessions/SessionForm'
import { StudySession, CreateSessionInput } from '@/lib/sessions'
import { Subject } from '@/lib/subjects'

interface SessionEditModalProps {
  session: StudySession
  subjects: Subject[]
  onClose?: () => void
}

export default function SessionEditModal({
  session,
  subjects,
  onClose,
}: SessionEditModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openModal() {
    setError(null)
    setIsOpen(true)
  }

  function closeModal() {
    if (isLoading) return
    setIsOpen(false)
    setError(null)
    onClose?.()
  }

  async function handleSubmit(data: CreateSessionInput) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const body = await response.json()
        if (body.errors) {
          const firstError = Object.values(body.errors as Record<string, string>)[0]
          setError(firstError)
        } else {
          setError(body.error ?? 'Failed to update session')
        }
        return
      }

      setIsOpen(false)
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const initialData = {
    id: session.id,
    name: session.name,
    subject_id: session.subject_id ?? '',
    duration_minutes: session.duration_minutes,
    tasks: session.tasks.length > 0 ? session.tasks : [''],
  }

  return (
    <>
      <button
        onClick={openModal}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
      >
        <Edit2 className="h-4 w-4" />
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Study Session
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Info note */}
            <div className="mx-5 mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                The previous version will be saved automatically before applying
                your changes.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mx-5 mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <div className="p-5">
              <SessionForm
                initialData={initialData}
                subjects={subjects}
                onSubmit={handleSubmit}
                onCancel={closeModal}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
