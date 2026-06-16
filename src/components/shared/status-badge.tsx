import { cn } from "@/lib/utils"

type StatusVariant = "slate" | "yellow" | "blue" | "green" | "red" | "orange"

const STATUS_MAP: Record<string, StatusVariant> = {
  DRAFT: "slate",
  PENDING_APPROVAL: "yellow",
  CONFIRMED: "blue",
  APPROVED: "blue",
  PROCESSING: "blue",
  IN_PROGRESS: "blue",
  PARTIALLY_RECEIVED: "blue",
  PARTIALLY_PAID: "yellow",
  SENT: "blue",
  COMPLETED: "green",
  PAID: "green",
  SHIPPED: "green",
  DELIVERED: "green",
  FULLY_RECEIVED: "green",
  BILLED: "blue",
  INVOICED: "blue",
  PICKING: "blue",
  PACKING: "blue",
  REJECTED: "red",
  CANCELLED: "red",
  OVERDUE: "orange",
}

const VARIANT_STYLES: Record<StatusVariant, string> = {
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  green: "bg-emerald-100 text-emerald-800 border-emerald-200",
  red: "bg-red-100 text-red-800 border-red-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending Approval",
  CONFIRMED: "Confirmed",
  APPROVED: "Approved",
  PROCESSING: "Processing",
  IN_PROGRESS: "In Progress",
  PARTIALLY_RECEIVED: "Partially Received",
  PARTIALLY_PAID: "Partially Paid",
  SENT: "Sent",
  COMPLETED: "Completed",
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Sent",
  FULLY_RECEIVED: "Fully Received",
  BILLED: "Billed",
  INVOICED: "Invoiced",
  PICKING: "Picking",
  PACKING: "Packing",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  OVERDUE: "Overdue",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_MAP[status] ?? "slate"
  const label = STATUS_LABELS[status] ?? status.replace(/_/g, " ")

  return (
    <span className={cn("status-chip border", VARIANT_STYLES[variant], className)}>
      {label}
    </span>
  )
}
