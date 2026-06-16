"use client"

import Link from "next/link"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"

export type SORow = {
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

export function SalesReportTable({ data }: { data: SORow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="customerName"
      searchPlaceholder="Cari customer..."
      emptyDescription="No sales order data yet"
    />
  )
}
