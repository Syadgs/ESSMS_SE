import { auth } from "@/lib/auth"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import { ReminderPortlets } from "@/components/dashboard/reminder-portlets"
import { KpiScorecard } from "@/components/dashboard/kpi-scorecard"
import {
  getDashboardKpis,
  getLowStockItems,
  getRecentActivity,
  getSalesChartData,
  getDashboardWidgets,
} from "@/lib/dashboard-queries"
import { getRemindersForRole } from "@/lib/dashboard-reminders"
import { formatCurrency } from "@/lib/utils"
import {
  ShoppingCart,
  TrendingUp,
  Package,
  CreditCard,
  AlertCircle,
  FileWarning,
  PackageCheck,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function DashboardPage() {
  const session = await auth()
  const userRole = session?.user?.role as Role

  const [kpis, chartData, activities, lowStock, widgets, reminders] = await Promise.all([
    getDashboardKpis(),
    getSalesChartData(),
    getRecentActivity(),
    getLowStockItems(),
    getDashboardWidgets(),
    getRemindersForRole(userRole),
  ])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Today's supply chain operational summary"
      />

      {/* Reminder Portlets */}
      <ReminderPortlets reminders={reminders} />

      {/* Main KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard
          title="PO This Month"
          value={String(kpis.poCount)}
          icon={ShoppingCart}
          description="Active purchase orders"
        />
        <KpiCard
          title="SO This Month"
          value={String(kpis.soCount)}
          icon={TrendingUp}
          description="Active sales orders"
        />
        <KpiCard
          title="Total Stock Value"
          value={formatCurrency(kpis.totalStockValue)}
          icon={Package}
          description="Based on cost price"
        />
        <KpiCard
          title="Outstanding Payables"
          value={formatCurrency(kpis.outstandingPayables)}
          icon={CreditCard}
          description="Unpaid vendor bills"
        />
      </div>

      {/* KPI Scorecard */}
      <KpiScorecard
        outstandingReceivables={kpis.outstandingReceivables}
        outstandingPayables={kpis.outstandingPayables}
        avgDaysToReceive={kpis.avgDaysToReceive}
        newCustomersThisMonth={kpis.newCustomersThisMonth}
        pendingApprovalBills={kpis.pendingApprovalBills}
        overdueInvoicesCount={kpis.overdueInvoicesCount}
      />

      {/* Quick Action Widgets */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Link href="/sales-orders?status=PENDING_APPROVAL">
          <Card className="rounded-xl hover:bg-amber-50 border-amber-200 transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center gap-3 py-4 px-4">
              <div className="rounded-md bg-amber-100 p-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{widgets.soPendingApproval}</p>
                <p className="text-xs text-muted-foreground">SO Pending Approval</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/purchase-orders?status=CONFIRMED">
          <Card className="hover:bg-blue-50 border-blue-200 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 py-4 px-4">
              <div className="rounded-md bg-blue-100 p-2">
                <PackageCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{widgets.poPendingReceipt}</p>
                <p className="text-xs text-muted-foreground">PO Pending Receipt</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/invoices?status=OVERDUE">
          <Card className="hover:bg-red-50 border-red-200 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 py-4 px-4">
              <div className="rounded-md bg-red-100 p-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{widgets.overdueInvoicesCount}</p>
                <p className="text-xs text-muted-foreground">Invoice Overdue</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/vendor-bills?status=APPROVED">
          <Card className="hover:bg-purple-50 border-purple-200 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 py-4 px-4">
              <div className="rounded-md bg-purple-100 p-2">
                <FileWarning className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">{widgets.billsToPayCount}</p>
                <p className="text-xs text-muted-foreground">Bills Ready to Pay</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts + Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <SalesChart data={chartData} />
        <LowStockAlert items={lowStock} />
      </div>

      <RecentActivity activities={activities} />
    </div>
  )
}
