export function SkeletonLine({ width = "100%", height = "h-4", className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 ${height} ${className}`}
      style={{ width }}
    />
  );
}

export function SkeletonCard({ lines = 2, className = "" }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <SkeletonLine width="60%" height="h-4" />
          {lines >= 2 && <SkeletonLine width="35%" height="h-3" />}
        </div>
        <SkeletonLine width="48px" height="h-4" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-0">
      <div className="flex gap-4 border-b border-slate-200 px-2 py-2">
        <SkeletonLine width="40%" height="h-3" />
        <SkeletonLine width="25%" height="h-3" />
        <SkeletonLine width="20%" height="h-3" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-slate-100 px-2 py-3">
          <SkeletonLine width="40%" height="h-3.5" />
          <SkeletonLine width="25%" height="h-3.5" />
          <SkeletonLine width="20%" height="h-3.5" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="grid grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <SkeletonLine width="20px" height="h-3" className="mb-1" />
          <div className="flex h-40 w-full items-end rounded-md bg-slate-100 px-2 py-2">
            <div
              className="w-full animate-pulse rounded-md bg-slate-200"
              style={{ height: `${20 + Math.random() * 60}%` }}
            />
          </div>
          <SkeletonLine width="36px" height="h-3" className="mt-2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonSidebar({ items = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <SkeletonLine width="75%" height="h-3.5" />
          <SkeletonLine width="50%" height="h-2.5" className="mt-1.5" />
        </div>
      ))}
    </div>
  );
}

export function Spinner({ size = "sm", className = "" }) {
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6";
  return (
    <svg
      className={`animate-spin ${sizeClass} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
