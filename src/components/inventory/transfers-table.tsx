"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Eye } from "lucide-react"
import type { TransferStatus } from "@prisma/client"

export type TransferRow = {
  id: string
  transferNumber: string
  itemName: string
  fromWarehouseName: string
  toWarehouseName: string
  quantity: number
  status: TransferStatus
  createdAt: string
}

const columns: ColumnDef<TransferRow>[] = [
  {
    accessorKey: "transferNumber",
    header: "No. Transfer",
    cell: ({ row }) => (
      <Link href={`/inventory/transfers/${row.original.id}`} className="doc-number hover:underline">
        {row.original.transferNumber}
      </Link>
    ),
  },
  {
    accessorKey: "itemName",
    header: "Item",
  },
  {
    accessorKey: "fromWarehouseName",
    header: "From Warehouse",
  },
  {
    accessorKey: "toWarehouseName",
    header: "To Warehouse",
  },
  {
    accessorKey: "quantity",
    header: "Jumlah",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/inventory/transfers/${row.original.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
]

interface TransfersTableProps {
  data: TransferRow[]
}

export function TransfersTable({ data }: TransfersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="transferNumber"
      searchPlaceholder="Search transfer..."
      emptyTitle="No stock transfer"
      emptyDescription="Create stock transfer "
    />
  )
}
