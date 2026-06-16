import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { prisma } from "@/lib/prisma"
import { decimalToNumber, formatCurrency, formatDate } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"

type PORow = {
  poNumber: string
  supplierName: string
  orderDate: string
  totalAmount: number
  status: string
  itemCount: number
  href: string
}

const columns: ColumnDef<PORow>[] = [
  {
    accessorKey: "poNumber",
    header: "No. PO",
    cell: ({ row }) => (
      <Link href={row.original.href} className="doc-number hover:underline">
        {row.original.poNumber}
      </Link>
    ),
  },
  { accessorKey: "supplierName", header: "Supplier" },
  { accessorKey: "orderDate", header: "Date Order" },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{formatCurrency(row.original.totalAmount)}</span>
    ),
  },
  {
    accessorKey: "itemCount",
    header: "Item",
    cell: ({ row }) => <span>{row.original.itemCount} baris</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
]

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
      <DataTable
        columns={columns}
        data={data}
        searchKey="supplierName"
        searchPlaceholder="Cari supplier..."
        emptyDescription="No purchase order data yet"
      />
    </div>
  )
}
