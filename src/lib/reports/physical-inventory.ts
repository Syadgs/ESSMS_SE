import { prisma } from "@/lib/prisma"

export interface PhysicalInventoryRow {
  itemId: string
  itemCode: string
  itemName: string
  unit: string
  category: string | null
  costingMethod: string
  warehouseId: string
  warehouseCode: string | null
  warehouseName: string
  systemQty: number
  reorderPoint: number
  isBelowReorder: boolean
}

export async function getPhysicalInventoryWorksheet(): Promise<PhysicalInventoryRow[]> {
  const stocks = await prisma.inventoryStock.findMany({
    include: {
      item: {
        select: {
          id: true,
          itemCode: true,
          itemName: true,
          unit: true,
          category: true,
          costingMethod: true,
          reorderPoint: true,
          itemType: true,
        },
      },
      warehouse: {
        select: {
          id: true,
          warehouseCode: true,
          warehouseName: true,
        },
      },
    },
    where: {
      item: { itemType: "INVENTORY" },
    },
    orderBy: [
      { item: { itemCode: "asc" } },
      { warehouse: { warehouseName: "asc" } },
    ],
  })

  return stocks.map((stock) => ({
    itemId: stock.item.id,
    itemCode: stock.item.itemCode,
    itemName: stock.item.itemName,
    unit: stock.item.unit,
    category: stock.item.category,
    costingMethod: stock.item.costingMethod,
    warehouseId: stock.warehouse.id,
    warehouseCode: stock.warehouse.warehouseCode,
    warehouseName: stock.warehouse.warehouseName,
    systemQty: stock.quantity,
    reorderPoint: stock.item.reorderPoint,
    isBelowReorder: stock.quantity < stock.item.reorderPoint,
  }))
}
