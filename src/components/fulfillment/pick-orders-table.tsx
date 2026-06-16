"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate } from "@/lib/utils"

export type PickOrderRow = {
  id: string
  soNumber: string
  customerName: string
  warehouseName: string
  pickDate: string
  status: string
}

const columns: ColumnDef<PickOrderRow>[] = [
  {
    accessorKey: "soNumber",
    header: "No. SO",
    cell: ({ row }) => (
      <Link href={`/pick-orders/${row.original.id}`} className="doc-number hover:underline">
        {row.original.soNumber}
      </Link>
    ),
  },
  { accessorKey: "customerName", header: "Customer" },
  { accessorKey: "warehouseName", header: "Warehouses" },
  {
    accessorKey: "pickDate",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.pickDate),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
]

export function PickOrdersTable({ data }: { data: PickOrderRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="soNumber"
      searchPlaceholder="Search SO..."
      emptyTitle="No Pick Order"
    />
  )
}
