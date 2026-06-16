import { PageHeader } from "@/components/shared/page-header"
import { SalesReportTable, SORow } from "./sales-report-table"
import { prisma } from "@/lib/prisma"
import { decimalToNumber, formatCurrency, formatDate } from "@/lib/utils"

export default async function SalesReportPage() {
  const salesOrders = await prisma.salesOrder.findMany({
    include: {
      customer: { select: { customerName: true } },
      _count: { select: { items: true } },
    },
    orderBy: { orderDate: "desc" },
  })

  const data: SORow[] = salesOrders.map((so) => ({
    soNumber: so.soNumber,
    customerName: so.customer.customerName,
    orderDate: formatDate(so.orderDate),
    totalAmount: decimalToNumber(so.totalAmount),
    status: so.status,
    itemCount: so._count.items,
    href: `/sales-orders/${so.id}`,
  }))

  const totalSales = data.reduce((sum, row) => sum + row.totalAmount, 0)

  return (
    <div>
      <PageHeader
        title="Sales Report"
        description={`${data.length} sales order · Total: ${formatCurrency(totalSales)}`}
      />
      <SalesReportTable data={data} />
    </div>
  )
}
