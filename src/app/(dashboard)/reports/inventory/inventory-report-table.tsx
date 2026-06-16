"use client"

import { DataTable } from "@/components/shared/data-table"
import { formatCurrency } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type StockRow = {
  itemCode: string
  itemName: string
  itemType: string
  warehouseName: string
  quantity: number
  unit: string
  costPrice: number
  stockValue: number
}

const columns: ColumnDef<StockRow>[] = [
  { accessorKey: "itemCode", header: "Code Item" },
  { accessorKey: "itemName", header: "Item Name" },
  {
    accessorKey: "itemType",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.itemType}
      </Badge>
    ),
  },
  { accessorKey: "warehouseName", header: "Warehouses" },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => (
      <span className={row.original.quantity < 10 ? "text-red-600 font-semibold" : ""}>
        {row.original.quantity} {row.original.unit}
      </span>
    ),
  },
  {
    accessorKey: "costPrice",
    header: "Cost Price",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{formatCurrency(row.original.costPrice)}</span>
    ),
  },
  {
    accessorKey: "stockValue",
    header: "Amount Stok",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {formatCurrency(row.original.stockValue)}
      </span>
    ),
  },
]

export function InventoryReportTable({ data }: { data: StockRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="itemName"
      searchPlaceholder="Cari item..."
      emptyDescription="No data stok inventori"
    />
  )
}
