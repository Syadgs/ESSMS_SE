"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Eye } from "lucide-react"
import type { ItemType } from "@prisma/client"

export type ItemRow = {
  id: string
  itemCode: string
  itemName: string
  itemType: ItemType
  unitPrice: number
  unit: string
  category: string | null
}

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  INVENTORY: "Persediaan",
  NON_INVENTORY: "Non-Persediaan",
  SERVICE: "Jasa",
}

const columns: ColumnDef<ItemRow>[] = [
  {
    accessorKey: "itemCode",
    header: "Kode Item",
    cell: ({ row }) => (
      <Link href={`/items/${row.original.id}`} className="doc-number hover:underline">
        {row.original.itemCode}
      </Link>
    ),
  },
  {
    accessorKey: "itemName",
    header: "Nama Item",
  },
  {
    accessorKey: "itemType",
    header: "Tipe",
    cell: ({ row }) => ITEM_TYPE_LABELS[row.original.itemType],
  },
  {
    accessorKey: "unitPrice",
    header: "Harga Jual",
    cell: ({ row }) => formatCurrency(row.original.unitPrice),
  },
  {
    accessorKey: "unit",
    header: "Satuan",
  },
  {
    accessorKey: "category",
    header: "Kategori",
    cell: ({ row }) => row.original.category ?? "-",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/items/${row.original.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
]

interface ItemsTableProps {
  data: ItemRow[]
}

export function ItemsTable({ data }: ItemsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="itemName"
      searchPlaceholder="Cari nama item..."
      emptyTitle="Belum ada item"
      emptyDescription="Mulai dengan menambahkan item baru"
    />
  )
}
