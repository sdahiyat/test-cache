'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, AlertCircle } from 'lucide-react'
import SessionForm from '@/components/sessions/SessionForm'
import { CreateSessionInput } from '@/lib/sessions'
import { Subject } from '@/lib/subjects'

interface NewSessionButtonProps {
  disabled: boolean
  limitReached: boolean
  subjects: Subject[]
}

export default function NewSessionButton({
  disabled,
  limitReached,
  subjects,
}: NewSessionButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  function openModal() {
    if (disabled) {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
      return
    }
    setError(null)
    setIsOpen(true)
  }

  function closeModal() {
    if (isLoading) return
    setIsOpen(false)
    setError(null)
  }

  async function handleSubmit(data: CreateSessionInput) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const body = await response.json()
        if (response.status === 403) {
          setError('You have reached the free tier limit of 5 sessions. Upgrade to Pro for unlimited sessions.')
        } else if (body.errors) {
          const firstError = Object.values(body.errors as Record<string, string>)[0]
          setError(firstError)
        } else {
          setError(body.error ?? 'Failed to create session')
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

  return (
    <>
      <div className="relative">
        <button
          onClick={openModal}
          disabled={false} // We handle disabled state manually for tooltip
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            disabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          <Plus className="h-4 w-4" />
          New Session
          {limitReached && (
            <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
              5/5
            </span>
          )}
        </button>

        {showTooltip && (
          <div className="absolute right-0 top-full mt-2 z-50 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
            Upgrade to Pro for unlimited sessions
            <div className="absolute -top-1 right-4 h-2 w-2 bg-gray-800 rotate-45" />
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                New Study Session
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mx-5 mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <div className="p-5">
              <SessionForm
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
