'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { cn, getInitials } from '@/lib/utils'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  displayName: string
  onAvatarChange: (url: string | null) => void
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function AvatarUpload({
  currentAvatarUrl,
  displayName,
  onAvatarChange,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayUrl = previewUrl ?? currentAvatarUrl
  const initials = getInitials(displayName)

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null)

      // Client-side validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Please select a JPEG, PNG, WebP, or GIF image')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('Image must be smaller than 2MB')
        return
      }

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      setUploading(true)

      try {
        const formData = new FormData()
        formData.append('avatar', file)

        const res = await fetch('/api/profile/avatar', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to upload avatar')
          setPreviewUrl(null)
          return
        }

        // Success: update with the permanent URL from storage
        setPreviewUrl(null)
        onAvatarChange(data.avatar_url)
      } catch {
        setError('Network error. Please try again.')
        setPreviewUrl(null)
      } finally {
        setUploading(false)
        // Release the object URL
        URL.revokeObjectURL(objectUrl)
      }
    },
    [onAvatarChange]
  )

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fileInputRef.current?.click()
    }
  }

  async function handleRemoveAvatar() {
    if (!currentAvatarUrl && !previewUrl) return

    const confirmed = window.confirm('Are you sure you want to remove your profile photo?')
    if (!confirmed) return

    setError(null)
    setUploading(true)

    try {
      const res = await fetch('/api/profile/avatar', { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to remove avatar')
        return
      }

      setPreviewUrl(null)
      onAvatarChange(null)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar display + change overlay */}
      <div className="relative group">
        {/* Avatar image or initials */}
        <div className="h-24 w-24 rounded-full overflow-hidden bg-primary flex items-center justify-center">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={`${displayName}'s avatar`}
              width={96}
              height={96}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <span className="text-2xl font-semibold text-white" aria-hidden="true">
              {initials}
            </span>
          )}
        </div>

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <span className="sr-only">Uploading...</span>
            <svg
              className="w-6 h-6 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}

        {/* Change photo button overlay (shown on hover, not while uploading) */}
        {!uploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={handleKeyDown}
            className={cn(
              'absolute inset-0 rounded-full',
              'bg-black/0 group-hover:bg-black/40',
              'flex items-center justify-center',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:bg-black/40',
              'cursor-pointer'
            )}
            aria-label="Change profile photo"
          >
            <span
              className={cn(
                'text-white text-xs font-medium text-center px-1',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                'focus:opacity-100'
              )}
              aria-hidden="true"
            >
              Change
              <br />
              Photo
            </span>
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="sr-only"
        aria-label="Upload profile photo"
        tabIndex={-1}
      />

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-2 w-full">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium',
            'text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'transition-colors',
            uploading && 'opacity-60 cursor-not-allowed'
          )}
          aria-busy={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>

        {(currentAvatarUrl || previewUrl) && !uploading && (
          <button
            type="button"
            onClick={handleRemoveAvatar}
            className={cn(
              'w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium',
              'text-red-600 hover:bg-red-50',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
              'transition-colors'
            )}
          >
            Remove Photo
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 text-center" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs text-gray-400 text-center">
        JPEG, PNG, WebP or GIF · Max 2MB
      </p>
    </div>
  )
}
