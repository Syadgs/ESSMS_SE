import { PageHeader } from "@/components/shared/page-header"
import { PurchasesReportTable, PORow } from "./purchases-report-table"
import { prisma } from "@/lib/prisma"
import { decimalToNumber, formatCurrency, formatDate } from "@/lib/utils"

export default async function PurchasesReportPage() {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: {
      supplier: { select: { supplierName: true } },
      _count: { select: { items: true } },
    },
    orderBy: { orderDate: "desc" },
  })

  const data: PORow[] = purchaseOrders.map((po) => ({
    poNumber: po.poNumber,
    supplierName: po.supplier.supplierName,
    orderDate: formatDate(po.orderDate),
    totalAmount: decimalToNumber(po.totalAmount),
    status: po.status,
    itemCount: po._count.items,
    href: `/purchase-orders/${po.id}`,
  }))

  const totalPurchases = data.reduce((sum, row) => sum + row.totalAmount, 0)

  return (
    <div>
      <PageHeader
        title="Purchase Report"
        description={`${data.length} purchase order · Total: ${formatCurrency(totalPurchases)}`}
      />
      <PurchasesReportTable data={data} />
    </div>
  )
}
