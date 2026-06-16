import { PageHeader } from "@/components/shared/page-header"
import { InventoryReportTable, StockRow } from "./inventory-report-table"
import { prisma } from "@/lib/prisma"
import { decimalToNumber, formatCurrency } from "@/lib/utils"

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
        title="Inventory Report"
        description={`Total stock value: ${formatCurrency(totalValue)}`}
      />
      <InventoryReportTable data={data} />
    </div>
  )
}
