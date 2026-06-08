"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { formatCurrency, formatDate } from "@/lib/utils"

export type BillPaymentRow = {
  id: string
  paymentNumber: string
  billNumber: string
  supplierName: string
  amount: number
  paymentMethod: string
  paymentDate: string
}

const methodLabels: Record<string, string> = {
  BANK_TRANSFER: "Transfer Bank",
  CASH: "Tunai",
  CHECK: "Cek",
}

const columns: ColumnDef<BillPaymentRow>[] = [
  {
    accessorKey: "paymentNumber",
    header: "No. Pembayaran",
    cell: ({ row }) => (
      <span className="doc-number">{row.original.paymentNumber}</span>
    ),
  },
  { accessorKey: "billNumber", header: "No. Bill" },
  { accessorKey: "supplierName", header: "Supplier" },
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

export function BillPaymentsTable({ data }: { data: BillPaymentRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="paymentNumber"
      searchPlaceholder="Cari nomor pembayaran..."
      emptyTitle="Belum ada pembayaran"
      emptyDescription="Catat pembayaran vendor bill"
    />
  )
}
