import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import {
  getDashboardKpis,
  getLowStockItems,
  getRecentActivity,
  getSalesChartData,
} from "@/lib/dashboard-queries"
import { formatCurrency } from "@/lib/utils"
import { ShoppingCart, TrendingUp, Package, CreditCard } from "lucide-react"

export default async function DashboardPage() {
  const [kpis, chartData, activities, lowStock] = await Promise.all([
    getDashboardKpis(),
    getSalesChartData(),
    getRecentActivity(),
    getLowStockItems(),
  ])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Ringkasan operasional supply chain hari ini"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard
          title="PO Bulan Ini"
          value={String(kpis.poCount)}
          icon={ShoppingCart}
          description="Purchase order aktif"
        />
        <KpiCard
          title="SO Bulan Ini"
          value={String(kpis.soCount)}
          icon={TrendingUp}
          description="Sales order aktif"
        />
        <KpiCard
          title="Total Nilai Stok"
          value={formatCurrency(kpis.totalStockValue)}
          icon={Package}
          description="Berdasarkan harga pokok"
        />
        <KpiCard
          title="Outstanding Payables"
          value={formatCurrency(kpis.outstandingPayables)}
          icon={CreditCard}
          description="Tagihan vendor belum lunas"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <SalesChart data={chartData} />
        <LowStockAlert items={lowStock} />
      </div>

      <RecentActivity activities={activities} />
    </div>
  )
}
