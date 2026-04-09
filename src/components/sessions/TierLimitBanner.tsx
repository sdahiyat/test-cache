'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, AlertTriangle, Info, Zap } from 'lucide-react'

interface TierLimitBannerProps {
  count: number
  limit: number
  isPro: boolean
}

export default function TierLimitBanner({ count, limit, isPro }: TierLimitBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  // Don't show for pro users or if dismissed
  if (isPro || dismissed) return null

  const isAtLimit = count >= limit
  const isNearLimit = count >= limit - 1 // 4/5

  if (!isNearLimit) return null

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border mb-6 ${
        isAtLimit
          ? 'bg-amber-50 border-amber-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {isAtLimit ? (
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        ) : (
          <Info className="h-5 w-5 text-blue-500" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Progress indicator */}
        <div className="flex items-center gap-3 mb-1">
          <span
            className={`text-sm font-semibold ${
              isAtLimit ? 'text-amber-800' : 'text-blue-800'
            }`}
          >
            {count}/{limit} sessions used
          </span>
          {/* Progress bar */}
          <div className="flex-1 max-w-32 bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                isAtLimit ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min((count / limit) * 100, 100)}%` }}
            />
          </div>
        </div>

        <p
          className={`text-xs ${isAtLimit ? 'text-amber-700' : 'text-blue-700'}`}
        >
          {isAtLimit
            ? 'You have reached the free tier limit. '
            : 'You are approaching the free tier limit. '}
          <Link
            href="/upgrade"
            className={`inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:no-underline ${
              isAtLimit
                ? 'text-amber-800 hover:text-amber-900'
                : 'text-blue-800 hover:text-blue-900'
            }`}
          >
            <Zap className="h-3 w-3" />
            Upgrade to Pro for unlimited sessions
          </Link>
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className={`flex-shrink-0 p-1 rounded-md transition-colors ${
          isAtLimit
            ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-100'
            : 'text-blue-400 hover:text-blue-600 hover:bg-blue-100'
        }`}
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
