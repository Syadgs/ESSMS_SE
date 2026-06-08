interface PageSkeletonProps {
  variant?: "list" | "form" | "detail"
}

export function PageSkeleton({ variant = "list" }: PageSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-4 w-4 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded-md" />
          <div className="h-4 w-96 bg-muted rounded-md" />
        </div>
        {variant === "list" && <div className="h-9 w-36 bg-muted rounded-md" />}
      </div>

      {variant === "list" && (
        <div className="space-y-4">
          <div className="h-9 w-64 bg-muted rounded-md" />
          <div className="h-72 bg-muted rounded-md border" />
        </div>
      )}

      {variant === "form" && (
        <div className="rounded-md border bg-card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-9 w-full bg-muted rounded-md" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <div className="h-9 w-24 bg-muted rounded-md" />
            <div className="h-9 w-32 bg-muted rounded-md" />
          </div>
        </div>
      )}

      {variant === "detail" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-md border bg-card p-6 space-y-4">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-5 w-full bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border bg-card p-6 space-y-4">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-48 bg-muted rounded-md" />
          </div>
        </div>
      )}
    </div>
  )
}
