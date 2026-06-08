import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { prisma } from "@/lib/prisma"
import { decimalToNumber, formatCurrency, formatDate } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"

type SORow = {
  soNumber: string
  customerName: string
  orderDate: string
  totalAmount: number
  status: string
  itemCount: number
  href: string
}

const columns: ColumnDef<SORow>[] = [
  {
    accessorKey: "soNumber",
    header: "No. SO",
    cell: ({ row }) => (
      <Link href={row.original.href} className="doc-number hover:underline">
        {row.original.soNumber}
      </Link>
    ),
  },
  { accessorKey: "customerName", header: "Customer" },
  { accessorKey: "orderDate", header: "Tanggal Order" },
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
        title="Laporan Penjualan"
        description={`${data.length} sales order · Total: ${formatCurrency(totalSales)}`}
      />
      <DataTable
        columns={columns}
        data={data}
        searchKey="customerName"
        searchPlaceholder="Cari customer..."
        emptyDescription="Belum ada data sales order"
      />
    </div>
  )
}
