"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"

export type VendorBillRow = {
  id: string
  billNumber: string
  supplierName: string
  poNumber: string
  billDate: string
  dueDate: string
  totalAmount: number
  status: string
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
  { accessorKey: "poNumber", header: "No. PO" },
  {
    accessorKey: "billDate",
    header: "Tanggal",
    cell: ({ row }) => formatDate(row.original.billDate),
  },
  {
    accessorKey: "dueDate",
    header: "Jatuh Tempo",
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
      searchPlaceholder="Cari nomor bill..."
      emptyTitle="Belum ada Vendor Bill"
      emptyDescription="Buat vendor bill dari purchase order"
    />
  )
}
