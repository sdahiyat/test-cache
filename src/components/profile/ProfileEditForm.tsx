'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn, canChangeUsername, isValidUsername } from '@/lib/utils'
import { STUDY_FOCUS_OPTIONS } from '@/types/database'
import type { Profile, StudyFocus, UpdateProfileInput } from '@/types/database'

interface ProfileEditFormProps {
  profile: Profile
  onSuccess?: (profile: Profile) => void
}

interface FormErrors {
  display_name?: string
  username?: string
  bio?: string
  general?: string
}

type UsernameAvailability = 'available' | 'taken' | 'checking' | 'error' | null

export default function ProfileEditForm({ profile, onSuccess }: ProfileEditFormProps) {
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [studyFocus, setStudyFocus] = useState<StudyFocus | ''>(
    (profile.study_focus as StudyFocus) ?? ''
  )
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [usernameAvailability, setUsernameAvailability] = useState<UsernameAvailability>(null)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { allowed: canChangeUser, daysRemaining } = canChangeUsername(profile.username_updated_at)

  // Check username availability with debounce
  const checkUsernameAvailability = useCallback(
    async (value: string) => {
      // Skip if same as current username
      if (value.toLowerCase() === profile.username.toLowerCase()) {
        setUsernameAvailability(null)
        return
      }

      if (!isValidUsername(value)) {
        setUsernameAvailability(null)
        return
      }

      setUsernameAvailability('checking')

      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(value)}`)
        if (res.status === 404) {
          setUsernameAvailability('available')
        } else if (res.ok) {
          setUsernameAvailability('taken')
        } else {
          setUsernameAvailability('error')
        }
      } catch {
        setUsernameAvailability('error')
      }
    },
    [profile.username]
  )

  useEffect(() => {
    if (!canChangeUser) return

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (username === profile.username) {
      setUsernameAvailability(null)
      return
    }

    debounceTimer.current = setTimeout(() => {
      checkUsernameAvailability(username)
    }, 500)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [username, canChangeUser, profile.username, checkUsernameAvailability])

  function validateForm(): FormErrors {
    const newErrors: FormErrors = {}

    if (!displayName.trim()) {
      newErrors.display_name = 'Display name is required'
    } else if (displayName.trim().length < 2) {
      newErrors.display_name = 'Display name must be at least 2 characters'
    } else if (displayName.trim().length > 50) {
      newErrors.display_name = 'Display name must be 50 characters or fewer'
    }

    if (!username) {
      newErrors.username = 'Username is required'
    } else if (!isValidUsername(username)) {
      newErrors.username = 'Username must be 3-20 characters using only letters, numbers, and underscores'
    }

    if (bio.length > 300) {
      newErrors.bio = 'Bio must be 300 characters or fewer'
    }

    return newErrors
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSuccessMessage('')
    setErrors({})

    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    // Don't submit if username is taken
    if (usernameAvailability === 'taken') {
      setErrors({ username: 'This username is already taken' })
      return
    }

    setLoading(true)

    const body: UpdateProfileInput = {
      display_name: displayName.trim(),
      bio: bio || null,
      study_focus: (studyFocus as StudyFocus) || null,
    }

    // Only include username if it changed and change is allowed
    if (username !== profile.username && canChangeUser) {
      body.username = username
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ general: data.error || 'Failed to update profile' })
        }
        return
      }

      setSuccessMessage('Profile updated successfully!')
      setUsernameAvailability(null)
      onSuccess?.(data.profile)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  function getUsernameStatusElement() {
    if (!canChangeUser) return null

    const currentUsername = username.toLowerCase()
    const originalUsername = profile.username.toLowerCase()
    if (currentUsername === originalUsername) return null

    if (!isValidUsername(username)) return null

    if (usernameAvailability === 'checking') {
      return <span className="text-xs text-gray-500 mt-1">Checking availability...</span>
    }
    if (usernameAvailability === 'available') {
      return <span className="text-xs text-green-600 mt-1">✓ Username is available</span>
    }
    if (usernameAvailability === 'taken') {
      return <span className="text-xs text-red-600 mt-1">✗ Username is already taken</span>
    }
    return null
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* General error */}
      {errors.general && (
        <div
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          role="alert"
        >
          {errors.general}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div
          className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm"
          role="status"
        >
          {successMessage}
        </div>
      )}

      {/* Display Name */}
      <div>
        <label
          htmlFor="display-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Display Name <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={cn(
            'w-full px-3 py-2 rounded-lg border text-gray-900 placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-colors',
            errors.display_name
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          )}
          placeholder="Your full name"
          maxLength={50}
          aria-required="true"
          aria-describedby={errors.display_name ? 'display-name-error' : undefined}
          aria-invalid={!!errors.display_name}
        />
        {errors.display_name && (
          <p id="display-name-error" className="text-xs text-red-600 mt-1" role="alert">
            {errors.display_name}
          </p>
        )}
      </div>

      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Username <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        {!canChangeUser && (
          <p className="text-xs text-amber-600 mb-1 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            You can change your username again in {daysRemaining} day{daysRemaining === 1 ? '' : 's'}
          </p>
        )}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm pointer-events-none">
            @
          </span>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            disabled={!canChangeUser}
            className={cn(
              'w-full pl-7 pr-3 py-2 rounded-lg border text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'transition-colors',
              errors.username
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-white hover:border-gray-300',
              !canChangeUser && 'opacity-60 cursor-not-allowed bg-gray-50'
            )}
            placeholder="your_username"
            maxLength={20}
            aria-required="true"
            aria-describedby={errors.username ? 'username-error' : 'username-hint'}
            aria-invalid={!!errors.username}
          />
        </div>
        <div id="username-hint" className="mt-1">
          {errors.username ? (
            <p id="username-error" className="text-xs text-red-600" role="alert">
              {errors.username}
            </p>
          ) : (
            getUsernameStatusElement()
          )}
          {!errors.username && !getUsernameStatusElement() && (
            <p className="text-xs text-gray-500">
              3-20 characters, letters, numbers, and underscores only
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className={cn(
            'w-full px-3 py-2 rounded-lg border text-gray-900 placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-colors resize-none',
            errors.bio
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          )}
          placeholder="Tell others about your study goals..."
          maxLength={310} // Allow slight overrun so counter shows red
          aria-describedby={errors.bio ? 'bio-error' : 'bio-count'}
          aria-invalid={!!errors.bio}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.bio ? (
            <p id="bio-error" className="text-xs text-red-600" role="alert">
              {errors.bio}
            </p>
          ) : (
            <span />
          )}
          <span
            id="bio-count"
            className={cn(
              'text-xs',
              bio.length > 300 ? 'text-red-600 font-medium' : 'text-gray-400'
            )}
            aria-live="polite"
            aria-label={`${bio.length} of 300 characters used`}
          >
            {bio.length}/300
          </span>
        </div>
      </div>

      {/* Study Focus */}
      <div>
        <label
          htmlFor="study-focus"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Study Focus
        </label>
        <select
          id="study-focus"
          value={studyFocus}
          onChange={(e) => setStudyFocus(e.target.value as StudyFocus | '')}
          className={cn(
            'w-full px-3 py-2 rounded-lg border text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-colors',
            'border-gray-200 bg-white hover:border-gray-300'
          )}
        >
          <option value="">Select a focus area...</option>
          {STUDY_FOCUS_OPTIONS.map((focus) => (
            <option key={focus} value={focus}>
              {focus}
            </option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || bio.length > 300}
        className={cn(
          'w-full py-2.5 px-4 rounded-lg font-medium text-white',
          'bg-primary hover:bg-primary/90 active:bg-primary/80',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'transition-colors',
          (loading || bio.length > 300) && 'opacity-60 cursor-not-allowed'
        )}
        aria-busy={loading}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
