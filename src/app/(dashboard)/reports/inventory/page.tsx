import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { prisma } from "@/lib/prisma"
import { decimalToNumber, formatCurrency } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

type StockRow = {
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
  { accessorKey: "itemCode", header: "Kode Item" },
  { accessorKey: "itemName", header: "Nama Item" },
  {
    accessorKey: "itemType",
    header: "Tipe",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.itemType}
      </Badge>
    ),
  },
  { accessorKey: "warehouseName", header: "Gudang" },
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
    header: "Harga Pokok",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{formatCurrency(row.original.costPrice)}</span>
    ),
  },
  {
    accessorKey: "stockValue",
    header: "Nilai Stok",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {formatCurrency(row.original.stockValue)}
      </span>
    ),
  },
]

export default async function InventoryReportPage() {
  const stocks = await prisma.inventoryStock.findMany({
    include: {
      item: true,
      warehouse: true,
    },
    orderBy: [{ item: { itemName: "asc" } }, { warehouse: { warehouseName: "asc" } }],
  })

  const data: StockRow[] = stocks.map((stock) => {
    const costPrice = decimalToNumber(stock.item.costPrice)
    return {
      itemCode: stock.item.itemCode,
      itemName: stock.item.itemName,
      itemType: stock.item.itemType,
      warehouseName: stock.warehouse.warehouseName,
      quantity: stock.quantity,
      unit: stock.item.unit,
      costPrice,
      stockValue: stock.quantity * costPrice,
    }
  })

  const totalValue = data.reduce((sum, row) => sum + row.stockValue, 0)

  return (
    <div>
      <PageHeader
        title="Laporan Stok"
        description={`Total nilai stok: ${formatCurrency(totalValue)}`}
      />
      <DataTable
        columns={columns}
        data={data}
        searchKey="itemName"
        searchPlaceholder="Cari item..."
        emptyDescription="Belum ada data stok inventori"
      />
    </div>
  )
}
