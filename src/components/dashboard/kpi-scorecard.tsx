"use client"

import {
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  FileText,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface KpiScorecardProps {
  outstandingReceivables: number
  outstandingPayables: number
  avgDaysToReceive: number
  newCustomersThisMonth: number
  pendingApprovalBills: number
  overdueInvoicesCount: number
}

interface ScoreItem {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  subLabel?: string
}

export function KpiScorecard({
  outstandingReceivables,
  outstandingPayables,
  avgDaysToReceive,
  newCustomersThisMonth,
  pendingApprovalBills,
  overdueInvoicesCount,
}: KpiScorecardProps) {
  const items: ScoreItem[] = [
    {
      label: "Outstanding Receivables",
      value: formatCurrency(outstandingReceivables),
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      subLabel: "Total outstanding A/R",
    },
    {
      label: "Outstanding Payables",
      value: formatCurrency(outstandingPayables),
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      subLabel: "Total A/P outstanding",
    },
    {
      label: "Avg. Days to Collect",
      value: `${avgDaysToReceive} days`,
      icon: Clock,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      subLabel: "Avg. days to collect (90 days)",
    },
    {
      label: "New Customers",
      value: String(newCustomersThisMonth),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      subLabel: "This month",
    },
    {
      label: "Bill Pending Approval",
      value: String(pendingApprovalBills),
      icon: FileText,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      subLabel: "Vendor bill pending",
    },
    {
      label: "Invoice Overdue",
      value: String(overdueInvoicesCount),
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      subLabel: "Invoice overdue",
    },
  ]

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        KPI Scorecard
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="rounded-xl overflow-hidden h-full">
              <CardHeader className="pb-1 pt-3 px-4">
                <div className="flex items-center gap-2">
                  <span className={`rounded-md p-1.5 ${item.bgColor}`}>
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </span>
                  <CardTitle className="text-xs font-medium text-muted-foreground leading-tight">
                    {item.label}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-3 px-4">
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                {item.subLabel && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.subLabel}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
