import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ArrowLeft } from 'lucide-react'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password – StudySync',
  description: 'Reset your StudySync account password',
}

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Branding */}
      <Link
        href="/"
        className="flex items-center gap-2 mb-8 text-primary-600 hover:text-primary-700 transition-colors"
      >
        <BookOpen className="h-7 w-7" />
        <span className="text-2xl font-bold tracking-tight">StudySync</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Forgot your password?</h1>
          <p className="text-sm text-gray-500 mt-1">
            No problem — we&apos;ll send you a reset link.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </main>
  )
}
