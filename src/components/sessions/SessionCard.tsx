'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Clock, BookOpen, CheckSquare, MoreVertical, Edit2 } from 'lucide-react'
import { SessionWithSubject } from '@/types/database'
import { cn, formatDuration, formatRelativeTime } from '@/lib/utils'
import DeleteSessionButton from './DeleteSessionButton'

interface SessionCardProps {
  session: SessionWithSubject
  onDelete?: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700',
  Science: 'bg-green-100 text-green-700',
  'Computer Science': 'bg-purple-100 text-purple-700',
  'Language Arts': 'bg-yellow-100 text-yellow-700',
  History: 'bg-orange-100 text-orange-700',
  Geography: 'bg-teal-100 text-teal-700',
  Arts: 'bg-pink-100 text-pink-700',
  Music: 'bg-indigo-100 text-indigo-700',
  'Physical Education': 'bg-red-100 text-red-700',
  Other: 'bg-gray-100 text-gray-700',
}

function getCategoryColor(category?: string): string {
  if (!category) return CATEGORY_COLORS.Other
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other
}

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-green-100 text-green-700', dotClass: 'bg-green-500' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-600', dotClass: 'bg-gray-400' },
  completed: { label: 'Completed', className: 'bg-blue-100 text-blue-700', dotClass: 'bg-blue-500' },
}

export default function SessionCard({ session, onDelete }: SessionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const status = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.active

  return (
    <div className="relative group bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200">
      <Link href={`/sessions/${session.id}`} className="block p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 pr-8">
          <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">
            {session.name}
          </h3>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Subject badge */}
          {session.subject && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                getCategoryColor(session.subject.category)
              )}
            >
              <BookOpen className="h-3 w-3" />
              {session.subject.name}
            </span>
          )}

          {/* Duration badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <Clock className="h-3 w-3" />
            {formatDuration(session.duration_minutes)}
          </span>

          {/* Tasks badge */}
          {session.tasks.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              <CheckSquare className="h-3 w-3" />
              {session.tasks.length} task{session.tasks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {formatRelativeTime(session.created_at)}
          </span>

          {/* Status indicator */}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
              status.className
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', status.dotClass)} />
            {status.label}
          </span>
        </div>
      </Link>

      {/* Action menu (visible on hover) */}
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.preventDefault()
            setMenuOpen((prev) => !prev)
          }}
          className={cn(
            'p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            'transition-all duration-150',
            menuOpen ? 'opacity-100 bg-gray-100' : 'opacity-0 group-hover:opacity-100'
          )}
          type="button"
          aria-label="Session actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36 animate-in fade-in slide-in-from-top-1">
              <Link
                href={`/sessions/${session.id}/edit`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Link>
              <div className="px-3 py-1">
                <DeleteSessionButton
                  sessionId={session.id}
                  sessionName={session.name}
                  onDelete={() => {
                    setMenuOpen(false)
                    onDelete?.()
                  }}
                  className="w-full text-left"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
