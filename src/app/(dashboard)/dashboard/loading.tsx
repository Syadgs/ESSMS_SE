import { PageHeader } from "@/components/shared/page-header"

export default function DashboardLoading() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Today's supply chain operational summary" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-md border bg-muted animate-pulse" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="h-[380px] rounded-md border bg-muted animate-pulse" />
        <div className="h-[380px] rounded-md border bg-muted animate-pulse" />
      </div>

      <div className="h-72 rounded-md border bg-muted animate-pulse" />
    </div>
  )
}
