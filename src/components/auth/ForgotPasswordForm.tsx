'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ForgotPasswordForm() {
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    const { error: authError } = await resetPassword(email)
    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Check your inbox</h2>
        <p className="text-sm text-gray-600 max-w-sm mx-auto">
          Password reset email sent to{' '}
          <span className="font-medium text-gray-800">{email}</span>. Follow the
          link in the email to set a new password.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <p className="text-sm text-gray-600">
        Enter the email address associated with your account and we&apos;ll send
        you a link to reset your password.
      </p>

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm',
              'bg-white text-gray-900 placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'border-gray-300'
            )}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full flex items-center justify-center gap-2',
          'py-2.5 px-4 rounded-lg text-sm font-semibold',
          'bg-primary-600 hover:bg-primary-700 text-white',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          'transition-colors duration-150'
        )}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Sending…' : 'Send reset link'}
      </button>

      {/* Back to login */}
      <p className="text-center text-sm text-gray-600">
        Remember your password?{' '}
        <Link
          href="/login"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
