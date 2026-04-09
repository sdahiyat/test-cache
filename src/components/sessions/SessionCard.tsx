'use client'

import Link from 'next/link'
import { BookOpen, Clock, CheckSquare, Calendar } from 'lucide-react'
import { StudySession } from '@/lib/sessions'

interface SessionCardProps {
  session: StudySession
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

const categoryColors: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700',
  Science: 'bg-green-100 text-green-700',
  Literature: 'bg-purple-100 text-purple-700',
  History: 'bg-amber-100 text-amber-700',
  Languages: 'bg-pink-100 text-pink-700',
  Technology: 'bg-cyan-100 text-cyan-700',
  Arts: 'bg-orange-100 text-orange-700',
}

function getSubjectColor(subjectName: string | null): string {
  if (!subjectName) return 'bg-gray-100 text-gray-600'
  for (const [key, value] of Object.entries(categoryColors)) {
    if (subjectName.toLowerCase().includes(key.toLowerCase())) return value
  }
  return 'bg-primary-100 text-primary-700'
}

export default function SessionCard({ session }: SessionCardProps) {
  return (
    <Link href={`/sessions/${session.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-2 flex-1">
            {session.name}
          </h3>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
              session.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {session.status}
          </span>
        </div>

        {/* Subject badge */}
        {session.subject_name && (
          <div className="flex items-center gap-1.5 mb-3">
            <BookOpen className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getSubjectColor(
                session.subject_name
              )}`}
            >
              {session.subject_name}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDuration(session.duration_minutes)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <CheckSquare className="h-3.5 w-3.5" />
            <span>{session.tasks.length} task{session.tasks.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-xs ml-auto">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(session.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
