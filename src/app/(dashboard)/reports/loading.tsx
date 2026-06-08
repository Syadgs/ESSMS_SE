import { PageHeader } from "@/components/shared/page-header"

export default function ReportsLoading() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
        <div className="h-4 w-72 bg-muted animate-pulse rounded-md" />
      </div>
      <div className="space-y-4">
        <div className="h-9 w-64 bg-muted animate-pulse rounded-md" />
        <div className="h-96 bg-muted animate-pulse rounded-md" />
      </div>
    </div>
  )
}
