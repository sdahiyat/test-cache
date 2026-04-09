'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, History } from 'lucide-react'
import { SessionVersion } from '@/lib/sessions'

interface VersionHistoryProps {
  sessionId: string
  initialVersions: SessionVersion[]
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatAbsoluteDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface VersionCardProps {
  version: SessionVersion
}

function VersionCard({ version }: VersionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const snapshot = version.snapshot as Record<string, unknown>

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center font-medium">
            v{version.version_number}
          </span>
          <div>
            <p className="text-xs font-medium text-gray-700">
              Version {version.version_number}
            </p>
            <p className="text-xs text-gray-400" title={formatAbsoluteDate(version.created_at)}>
              {formatRelativeTime(version.created_at)}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 bg-gray-50">
          <div className="mt-3 space-y-2">
            {Object.entries(snapshot)
              .filter(([key]) => key !== 'updated_at')
              .map(([key, value]) => {
                const label = key
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())

                let displayValue: string
                if (Array.isArray(value)) {
                  displayValue =
                    value.length === 0
                      ? 'No tasks'
                      : value.map((v, i) => `${i + 1}. ${v}`).join(', ')
                } else if (value === null || value === undefined) {
                  displayValue = '—'
                } else {
                  displayValue = String(value)
                }

                return (
                  <div key={key} className="text-xs">
                    <span className="text-gray-500 font-medium">{label}:</span>{' '}
                    <span className="text-gray-700">{displayValue}</span>
                  </div>
                )
              })}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Saved {formatAbsoluteDate(version.created_at)}
          </p>
        </div>
      )}
    </div>
  )
}

export default function VersionHistory({
  sessionId,
  initialVersions,
}: VersionHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [versions, setVersions] = useState<SessionVersion[]>(initialVersions)
  const [isLoading, setIsLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  async function handleToggle() {
    if (!isExpanded && !hasFetched) {
      // Fetch fresh versions on first expand
      setIsLoading(true)
      try {
        const response = await fetch(`/api/sessions/${sessionId}/versions`)
        if (response.ok) {
          const data = await response.json()
          setVersions(data)
        }
      } catch {
        // Keep initial versions on error
      } finally {
        setIsLoading(false)
        setHasFetched(true)
      }
    }
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-900">
            Version History
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {versions.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Clock className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Loading versions...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="py-6 text-center">
              <History className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No previous versions</p>
              <p className="text-xs text-gray-400 mt-1">
                Versions are saved automatically when you edit this session.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {versions.map((version) => (
                <VersionCard key={version.id} version={version} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
