import { cn } from "@/lib/utils"
import {
  FileText,
  CheckCircle2,
  Package,
  CreditCard,
  Truck,
  Send,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react"

export type TimelineStep = {
  key: string
  label: string
  icon?: LucideIcon
}

interface DocumentTimelineProps {
  steps: TimelineStep[]
  currentStatus: string
  className?: string
}

const DEFAULT_ICONS: Record<string, LucideIcon> = {
  DRAFT: FileText,
  PENDING_APPROVAL: ClipboardCheck,
  CONFIRMED: CheckCircle2,
  APPROVED: CheckCircle2,
  PARTIALLY_RECEIVED: Package,
  FULLY_RECEIVED: Package,
  BILLED: FileText,
  PAID: CreditCard,
  PROCESSING: Package,
  PICKING: Package,
  PACKING: Package,
  SHIPPED: Truck,
  INVOICED: Send,
  SENT: Send,
}

function getStepState(stepKey: string, currentStatus: string, steps: TimelineStep[]) {
  const currentIndex = steps.findIndex((s) => s.key === currentStatus)
  const stepIndex = steps.findIndex((s) => s.key === stepKey)

  if (stepIndex < currentIndex) return "completed"
  if (stepIndex === currentIndex) return "active"
  return "pending"
}

export function DocumentTimeline({ steps, currentStatus, className }: DocumentTimelineProps) {
  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto py-4", className)}>
      {steps.map((step, index) => {
        const state = getStepState(step.key, currentStatus, steps)
        const Icon = step.icon ?? DEFAULT_ICONS[step.key] ?? FileText

        return (
          <div key={step.key} className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md border-2 transition-colors",
                  state === "completed" && "border-emerald-500 bg-emerald-50 text-emerald-600",
                  state === "active" && "border-amber-500 bg-amber-50 text-amber-600",
                  state === "pending" && "border-slate-200 bg-slate-50 text-slate-400"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center",
                  state === "completed" && "text-emerald-700",
                  state === "active" && "text-amber-700",
                  state === "pending" && "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 shrink-0",
                  state === "completed" ? "bg-emerald-400" : "bg-slate-200"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export const PO_TIMELINE: TimelineStep[] = [
  { key: "DRAFT", label: "Draft" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PARTIALLY_RECEIVED", label: "Partial Receipt" },
  { key: "FULLY_RECEIVED", label: "Fully Received" },
  { key: "BILLED", label: "Billed" },
  { key: "PAID", label: "Paid" },
]

export const SO_TIMELINE: TimelineStep[] = [
  { key: "DRAFT", label: "Draft" },
  { key: "PENDING_APPROVAL", label: "Approval" },
  { key: "APPROVED", label: "Approved" },
  { key: "PROCESSING", label: "Processing" },
  { key: "PICKING", label: "Picking" },
  { key: "PACKING", label: "Packing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "INVOICED", label: "Invoiced" },
  { key: "PAID", label: "Paid" },
]

export const BILL_TIMELINE: TimelineStep[] = [
  { key: "DRAFT", label: "Draft" },
  { key: "PENDING_APPROVAL", label: "Approval" },
  { key: "APPROVED", label: "Approved" },
  { key: "PAID", label: "Paid" },
]

export const GR_TIMELINE: TimelineStep[] = [
  { key: "DRAFT", label: "Draft" },
  { key: "CONFIRMED", label: "Confirmed" },
]

export const INVOICE_TIMELINE: TimelineStep[] = [
  { key: "DRAFT", label: "Draft" },
  { key: "SENT", label: "Shipped" },
  { key: "PARTIALLY_PAID", label: "Sebagian" },
  { key: "PAID", label: "Paid" },
]
