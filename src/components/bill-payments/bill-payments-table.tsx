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
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Tunai",
  CHECK: "Cek",
}

const columns: ColumnDef<BillPaymentRow>[] = [
  {
    accessorKey: "paymentNumber",
    header: "Payment No.",
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
    header: "Method",
    cell: ({ row }) => methodLabels[row.original.paymentMethod] ?? row.original.paymentMethod,
  },
  {
    accessorKey: "paymentDate",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.paymentDate),
  },
]

export function BillPaymentsTable({ data }: { data: BillPaymentRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="paymentNumber"
      searchPlaceholder="Search payment..."
      emptyTitle="No payment"
      emptyDescription="Record vendor bill payments"
    />
  )
}
