"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { formatCurrency, formatDate } from "@/lib/utils"

export type CustomerPaymentRow = {
  id: string
  paymentNumber: string
  invoiceNumber: string
  customerName: string
  amount: number
  paymentMethod: string
  paymentDate: string
}

const methodLabels: Record<string, string> = {
  BANK_TRANSFER: "Transfer Bank",
  CASH: "Tunai",
  CHECK: "Cek",
}

const columns: ColumnDef<CustomerPaymentRow>[] = [
  {
    accessorKey: "paymentNumber",
    header: "No. Pembayaran",
    cell: ({ row }) => (
      <span className="doc-number">{row.original.paymentNumber}</span>
    ),
  },
  { accessorKey: "invoiceNumber", header: "No. Invoice" },
  { accessorKey: "customerName", header: "Customer" },
  {
    accessorKey: "amount",
    header: "Jumlah",
    cell: ({ row }) => (
      <span className="font-mono">{formatCurrency(row.original.amount)}</span>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Metode",
    cell: ({ row }) => methodLabels[row.original.paymentMethod] ?? row.original.paymentMethod,
  },
  {
    accessorKey: "paymentDate",
    header: "Tanggal",
    cell: ({ row }) => formatDate(row.original.paymentDate),
  },
]

export function CustomerPaymentsTable({ data }: { data: CustomerPaymentRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="paymentNumber"
      searchPlaceholder="Cari nomor pembayaran..."
      emptyTitle="Belum ada pembayaran customer"
    />
  )
}
