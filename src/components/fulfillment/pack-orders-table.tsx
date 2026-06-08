"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate } from "@/lib/utils"

export type PackOrderRow = {
  id: string
  soNumber: string
  customerName: string
  packageCount: number
  packDate: string
  status: string
}

const columns: ColumnDef<PackOrderRow>[] = [
  {
    accessorKey: "soNumber",
    header: "No. SO",
    cell: ({ row }) => (
      <Link href={`/pack-orders/${row.original.id}`} className="doc-number hover:underline">
        {row.original.soNumber}
      </Link>
    ),
  },
  { accessorKey: "customerName", header: "Customer" },
  {
    accessorKey: "packageCount",
    header: "Paket",
    cell: ({ row }) => <span className="font-mono">{row.original.packageCount}</span>,
  },
  {
    accessorKey: "packDate",
    header: "Tanggal",
    cell: ({ row }) => formatDate(row.original.packDate),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
]

export function PackOrdersTable({ data }: { data: PackOrderRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="soNumber"
      searchPlaceholder="Cari nomor SO..."
      emptyTitle="Belum ada Pack Order"
    />
  )
}
