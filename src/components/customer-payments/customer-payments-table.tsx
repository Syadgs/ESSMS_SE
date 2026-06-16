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
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Tunai",
  CHECK: "Cek",
}

const columns: ColumnDef<CustomerPaymentRow>[] = [
  {
    accessorKey: "paymentNumber",
    header: "Payment No.",
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
    header: "Method",
    cell: ({ row }) => methodLabels[row.original.paymentMethod] ?? row.original.paymentMethod,
  },
  {
    accessorKey: "paymentDate",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.paymentDate),
  },
]

export function CustomerPaymentsTable({ data }: { data: CustomerPaymentRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="paymentNumber"
      searchPlaceholder="Search payment..."
      emptyTitle="No payment customer"
    />
  )
}
