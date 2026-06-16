"use client"

import Link from "next/link"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"

export type PORow = {
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

export function PurchasesReportTable({ data }: { data: PORow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="supplierName"
      searchPlaceholder="Cari supplier..."
      emptyDescription="No purchase order data yet"
    />
  )
}
