"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"

export type SORow = {
  id: string
  soNumber: string
  customerName: string
  orderDate: string
  totalAmount: number
  status: string
}

const columns: ColumnDef<SORow>[] = [
  {
    accessorKey: "soNumber",
    header: "No. SO",
    cell: ({ row }) => (
      <Link href={`/sales-orders/${row.original.id}`} className="doc-number hover:underline">
        {row.original.soNumber}
      </Link>
    ),
  },
  { accessorKey: "customerName", header: "Customer" },
  {
    accessorKey: "orderDate",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.orderDate),
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-mono">{formatCurrency(row.original.totalAmount)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
]

export function SOTable({ data }: { data: SORow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="soNumber"
      searchPlaceholder="Search SO..."
      emptyTitle="No Sales Order"
      emptyDescription="Create sales order yet"
    />
  )
}
