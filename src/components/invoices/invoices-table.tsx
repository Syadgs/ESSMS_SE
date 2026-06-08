"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"

export type InvoiceRow = {
  id: string
  invoiceNumber: string
  soNumber: string
  customerName: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  status: string
}

const columns: ColumnDef<InvoiceRow>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "No. Invoice",
    cell: ({ row }) => (
      <Link href={`/invoices/${row.original.id}`} className="doc-number hover:underline">
        {row.original.invoiceNumber}
      </Link>
    ),
  },
  { accessorKey: "soNumber", header: "No. SO" },
  { accessorKey: "customerName", header: "Customer" },
  {
    accessorKey: "invoiceDate",
    header: "Tanggal",
    cell: ({ row }) => formatDate(row.original.invoiceDate),
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

export function InvoicesTable({ data }: { data: InvoiceRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="invoiceNumber"
      searchPlaceholder="Cari nomor invoice..."
      emptyTitle="Belum ada Invoice"
      emptyDescription="Buat invoice dari sales order yang sudah dikirim"
    />
  )
}
