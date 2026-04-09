'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'

interface SessionDeleteButtonProps {
  sessionId: string
  sessionName: string
  onDeleted?: () => void
}

export default function SessionDeleteButton({
  sessionId,
  sessionName,
  onDeleted,
}: SessionDeleteButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const body = await response.json()
        setError(body.error ?? 'Failed to delete session')
        return
      }

      if (onDeleted) {
        onDeleted()
      } else {
        router.push('/sessions')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-800 mb-2">
              Delete &ldquo;{sessionName}&rdquo;?{' '}
              <span className="font-normal text-red-700">
                This cannot be undone.
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="h-3 w-3 animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false)
                  setError(null)
                }}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-red-600">{error}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </button>
  )
}
