"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { formatDate } from "@/lib/utils"
import type { AdjustmentType } from "@prisma/client"

export type AdjustmentRow = {
  id: string
  itemName: string
  itemCode: string
  warehouseName: string
  adjustmentType: AdjustmentType
  quantity: number
  reason: string | null
  adjustedByName: string
  createdAt: string
}

const ADJUSTMENT_TYPE_LABELS: Record<AdjustmentType, string> = {
  INCREASE: "Penambahan",
  DECREASE: "Pengurangan",
}

const columns: ColumnDef<AdjustmentRow>[] = [
  {
    accessorKey: "createdAt",
    header: "Tanggal",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: "itemCode",
    header: "Kode Item",
    cell: ({ row }) => <span className="doc-number">{row.original.itemCode}</span>,
  },
  {
    accessorKey: "itemName",
    header: "Nama Item",
  },
  {
    accessorKey: "warehouseName",
    header: "Gudang",
  },
  {
    accessorKey: "adjustmentType",
    header: "Tipe",
    cell: ({ row }) => ADJUSTMENT_TYPE_LABELS[row.original.adjustmentType],
  },
  {
    accessorKey: "quantity",
    header: "Jumlah",
  },
  {
    accessorKey: "reason",
    header: "Alasan",
    cell: ({ row }) => row.original.reason ?? "-",
  },
  {
    accessorKey: "adjustedByName",
    header: "Disesuaikan Oleh",
  },
]

interface AdjustmentsTableProps {
  data: AdjustmentRow[]
}

export function AdjustmentsTable({ data }: AdjustmentsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="itemName"
      searchPlaceholder="Cari nama item..."
      emptyTitle="Belum ada penyesuaian stok"
      emptyDescription="Buat penyesuaian stok baru untuk memulai"
    />
  )
}
