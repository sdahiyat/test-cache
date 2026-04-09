'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeleteSessionButtonProps {
  sessionId: string
  sessionName?: string
  onDelete?: () => void
  redirectAfterDelete?: boolean
  className?: string
  iconOnly?: boolean
}

export default function DeleteSessionButton({
  sessionId,
  sessionName,
  onDelete,
  redirectAfterDelete = false,
  className,
  iconOnly = false,
}: DeleteSessionButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete session')
      }

      setShowConfirm(false)

      if (redirectAfterDelete) {
        router.push('/sessions')
        router.refresh()
      } else {
        onDelete?.()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowConfirm(true)
        }}
        className={cn(
          'inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700',
          'transition-colors duration-150',
          className
        )}
        title="Delete session"
        type="button"
      >
        <Trash2 className="h-4 w-4" />
        {!iconOnly && <span>Delete</span>}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirm(false)
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Session</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete{' '}
                  {sessionName ? (
                    <span className="font-medium">"{sessionName}"</span>
                  ) : (
                    'this session'
                  )}
                  ? This action cannot be undone.
                </p>

                {error && (
                  <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                type="button"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Session'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
