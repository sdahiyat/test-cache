'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, History } from 'lucide-react'
import { StudySessionVersion, Subject } from '@/types/database'
import { cn, formatDate, formatDuration } from '@/lib/utils'

interface VersionHistoryProps {
  versions: StudySessionVersion[]
  subjects: Subject[]
}

export default function VersionHistory({ versions, subjects }: VersionHistoryProps) {
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null)

  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <History className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No edit history yet</p>
        <p className="text-xs mt-1 text-gray-400">Changes will appear here after the first edit</p>
      </div>
    )
  }

  function getSubjectName(subjectId: string | null): string {
    if (!subjectId) return 'No subject'
    return subjects.find((s) => s.id === subjectId)?.name ?? 'Unknown subject'
  }

  function toggleVersion(versionNumber: number) {
    setExpandedVersion(expandedVersion === versionNumber ? null : versionNumber)
  }

  return (
    <div className="space-y-2">
      {versions.map((version) => {
        const isExpanded = expandedVersion === version.version_number

        return (
          <div
            key={version.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleVersion(version.version_number)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 text-left',
                'hover:bg-gray-50 transition-colors',
                isExpanded && 'bg-gray-50'
              )}
              type="button"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                  v{version.version_number}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{version.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {formatDate(version.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex gap-2 text-xs text-gray-500">
                  <span>{getSubjectName(version.subject_id)}</span>
                  <span>·</span>
                  <span>{formatDuration(version.duration_minutes)}</span>
                  <span>·</span>
                  <span>{version.tasks.length} task{version.tasks.length !== 1 ? 's' : ''}</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                <div className="pt-3 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Subject</p>
                      <p className="font-medium text-gray-900">{getSubjectName(version.subject_id)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                      <p className="font-medium text-gray-900">{formatDuration(version.duration_minutes)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Tasks</p>
                      <p className="font-medium text-gray-900">{version.tasks.length}</p>
                    </div>
                  </div>

                  {version.tasks.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">Task List</p>
                      <ul className="space-y-1">
                        {version.tasks.map((task, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="flex-shrink-0 w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center mt-0.5">
                              <span className="text-xs text-gray-400">{i + 1}</span>
                            </span>
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
