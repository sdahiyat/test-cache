export default function SessionSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-5 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-200 rounded-full w-16" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-4 bg-gray-200 rounded-full w-20" />
        <div className="h-4 bg-gray-200 rounded-full w-16" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
    </div>
  )
}

export function SessionListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <SessionSkeleton key={i} />
      ))}
    </div>
  )
}
