import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  FileText,
  ClipboardList,
} from "lucide-react"
import type { Role } from "@prisma/client"

const REPORT_ITEMS = [
  {
    title: "Inventory Report Inventaris",
    description: "Stock summary by item and warehouse",
    href: "/reports/inventory",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    roles: ["INVENTORY_MANAGER", "ADMIN", "PURCHASING_MANAGER"] as Role[],
  },
  {
    title: "Purchase Report",
    description: "Purchase order and spending analysis",
    href: "/reports/purchases",
    icon: ShoppingCart,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    roles: ["PURCHASING_MANAGER", "ACCOUNTING_MANAGER", "ADMIN"] as Role[],
  },
  {
    title: "Sales Report",
    description: "Sales order and revenue analysis",
    href: "/reports/sales",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
    roles: ["SALES_MANAGER", "AR_ANALYST", "ADMIN"] as Role[],
  },
  {
    title: "Reports AR Aging",
    description: "Analisis piutang dagang berdasarkan umur",
    href: "/reports/ar-aging",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    roles: ["AR_ANALYST", "ACCOUNTING_MANAGER", "ADMIN"] as Role[],
  },
  {
    title: "Reports AP Aging",
    description: "Analisis hutang dagang berdasarkan umur",
    href: "/reports/ap-aging",
    icon: FileText,
    color: "text-red-600",
    bgColor: "bg-red-50",
    roles: ["AP_ANALYST", "ACCOUNTING_MANAGER", "ADMIN"] as Role[],
  },
  {
    title: "Worksheet Physical Inventory",
    description: "Physical stock count worksheet",
    href: "/reports/physical-inventory",
    icon: ClipboardList,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    roles: ["INVENTORY_MANAGER", "ADMIN"] as Role[],
  },
]

export default async function ReportsIndexPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userRole = session.user.role as Role
  const visibleReports = REPORT_ITEMS.filter((r) => r.roles.includes(userRole))

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Select a report to view"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleReports.map((report) => {
          const Icon = report.icon
          return (
            <Link key={report.href} href={report.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <span className={`rounded-lg p-2.5 ${report.bgColor}`}>
                    <Icon className={`h-5 w-5 ${report.color}`} />
                  </span>
                  <CardTitle className="text-base leading-tight">{report.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {visibleReports.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No reports available for your role.
        </p>
      )}
    </div>
  )
}
