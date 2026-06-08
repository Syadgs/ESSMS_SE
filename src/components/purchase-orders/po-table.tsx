"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"

export type PORow = {
  id: string
  poNumber: string
  supplierName: string
  orderDate: string
  totalAmount: number
  status: string
}

const columns: ColumnDef<PORow>[] = [
  {
    accessorKey: "poNumber",
    header: "No. PO",
    cell: ({ row }) => (
      <Link href={`/purchase-orders/${row.original.id}`} className="doc-number hover:underline">
        {row.original.poNumber}
      </Link>
    ),
  },
  { accessorKey: "supplierName", header: "Supplier" },
  {
    accessorKey: "orderDate",
    header: "Tanggal",
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

export function POTable({ data }: { data: PORow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="poNumber"
      searchPlaceholder="Cari nomor PO..."
      emptyTitle="Belum ada Purchase Order"
      emptyDescription="Buat purchase order pertama Anda"
    />
  )
}
