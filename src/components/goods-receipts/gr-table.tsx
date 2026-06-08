"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate } from "@/lib/utils"

export type GRRow = {
  id: string
  grNumber: string
  poNumber: string
  supplierName: string
  warehouseName: string
  receivedDate: string
  status: string
}

const columns: ColumnDef<GRRow>[] = [
  {
    accessorKey: "grNumber",
    header: "No. GR",
    cell: ({ row }) => (
      <Link href={`/goods-receipts/${row.original.id}`} className="doc-number hover:underline">
        {row.original.grNumber}
      </Link>
    ),
  },
  { accessorKey: "poNumber", header: "No. PO" },
  { accessorKey: "supplierName", header: "Supplier" },
  { accessorKey: "warehouseName", header: "Gudang" },
  {
    accessorKey: "receivedDate",
    header: "Tanggal",
    cell: ({ row }) => formatDate(row.original.receivedDate),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
]

export function GRTable({ data }: { data: GRRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="grNumber"
      searchPlaceholder="Cari nomor GR..."
      emptyTitle="Belum ada Goods Receipt"
    />
  )
}
