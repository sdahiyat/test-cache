export default function SettingsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar skeleton */}
        <div className="w-full md:w-56 flex-shrink-0 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-full rounded-lg animate-pulse bg-gray-200"
            />
          ))}
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-8 w-48 animate-pulse bg-gray-200 rounded" />
          <div className="h-64 w-full animate-pulse bg-gray-200 rounded-xl" />
          <div className="h-32 w-full animate-pulse bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
