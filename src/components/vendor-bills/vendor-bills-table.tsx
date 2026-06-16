"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export type VendorBillRow = {
  id: string
  billNumber: string
  supplierName: string
  poNumber: string
  billDate: string
  dueDate: string
  totalAmount: number
  status: string
  billType?: string
}

const columns: ColumnDef<VendorBillRow>[] = [
  {
    accessorKey: "billNumber",
    header: "No. Bill",
    cell: ({ row }) => (
      <Link href={`/vendor-bills/${row.original.id}`} className="doc-number hover:underline">
        {row.original.billNumber}
      </Link>
    ),
  },
  { accessorKey: "supplierName", header: "Supplier" },
  {
    accessorKey: "billType",
    header: "Type",
    cell: ({ row }) => {
      const billType = row.original.billType
      return billType === "STANDALONE" ? (
        <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">Standalone</Badge>
      ) : (
        <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">PO-Based</Badge>
      )
    },
  },
  {
    accessorKey: "poNumber",
    header: "No. PO",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">{row.original.poNumber}</span>
    ),
  },
  {
    accessorKey: "billDate",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.billDate),
  },
  {
    accessorKey: "dueDate",
    header: "Overdue",
    cell: ({ row }) => formatDate(row.original.dueDate),
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

export function VendorBillsTable({ data }: { data: VendorBillRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="billNumber"
      searchPlaceholder="Search bill..."
      emptyTitle="No Vendor Bill"
      emptyDescription="Create vendor bill from purchase order or standalone"
    />
  )
}
