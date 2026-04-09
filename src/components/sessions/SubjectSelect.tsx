'use client'

import { Subject } from '@/types/database'
import { cn } from '@/lib/utils'

interface SubjectSelectProps {
  value: string
  onChange: (id: string) => void
  subjects: Subject[]
  required?: boolean
  error?: string
  disabled?: boolean
}

export default function SubjectSelect({
  value,
  onChange,
  subjects,
  required,
  error,
  disabled,
}: SubjectSelectProps) {
  // Group subjects by category
  const grouped = subjects.reduce<Record<string, Subject[]>>((acc, subject) => {
    const cat = subject.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(subject)
    return acc
  }, {})

  const categories = Object.keys(grouped).sort()

  return (
    <div className="w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 border rounded-lg bg-white text-gray-900 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <option value="">Select a subject...</option>
        {categories.map((category) => (
          <optgroup key={category} label={category}>
            {grouped[category].map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
