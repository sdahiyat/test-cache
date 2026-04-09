import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Set New Password – StudySync',
  description: 'Set a new password for your StudySync account',
}

export default function ResetPasswordPage() {
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
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Set new password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose a strong password for your account.
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </main>
  )
}
