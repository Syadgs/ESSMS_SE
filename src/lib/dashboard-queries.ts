import { prisma } from "@/lib/prisma"
import { decimalToNumber } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { ActivityItem } from "@/components/dashboard/recent-activity"
import type { LowStockItem } from "@/components/dashboard/low-stock-alert"
import type { SalesChartData } from "@/components/dashboard/sales-chart"

function getMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export async function getDashboardKpis() {
  const { start, end } = getMonthRange()

  const [poCount, soCount, stocks, outstandingBills] = await Promise.all([
    prisma.purchaseOrder.count({
      where: { orderDate: { gte: start, lte: end }, status: { not: "CANCELLED" } },
    }),
    prisma.salesOrder.count({
      where: { orderDate: { gte: start, lte: end }, status: { not: "CANCELLED" } },
    }),
    prisma.inventoryStock.findMany({
      include: { item: { select: { costPrice: true } } },
    }),
    prisma.vendorBill.findMany({
      where: {
        status: { in: ["APPROVED", "PENDING_APPROVAL"] },
      },
      select: { totalAmount: true, paidAmount: true },
    }),
  ])

  const totalStockValue = stocks.reduce(
    (sum, stock) => sum + stock.quantity * decimalToNumber(stock.item.costPrice),
    0
  )

  const outstandingPayables = outstandingBills.reduce(
    (sum, bill) => sum + decimalToNumber(bill.totalAmount) - decimalToNumber(bill.paidAmount),
    0
  )

  return { poCount, soCount, totalStockValue, outstandingPayables }
}

export async function getSalesChartData(): Promise<SalesChartData[]> {
  const now = new Date()
  const months: { start: Date; end: Date; label: string }[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      start: d,
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999),
      label: format(d, "MMM yyyy", { locale: id }),
    })
  }

  const results = await Promise.all(
    months.map(async ({ start, end, label }) => {
      const orders = await prisma.salesOrder.findMany({
        where: {
          orderDate: { gte: start, lte: end },
          status: { not: "CANCELLED" },
        },
        select: { totalAmount: true },
      })

      return {
        month: label,
        total: orders.reduce((sum, o) => sum + decimalToNumber(o.totalAmount), 0),
        count: orders.length,
      }
    })
  )

  return results
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const [purchaseOrders, salesOrders] = await Promise.all([
    prisma.purchaseOrder.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { supplier: { select: { supplierName: true } } },
    }),
    prisma.salesOrder.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { customerName: true } } },
    }),
  ])

  const activities: ActivityItem[] = [
    ...purchaseOrders.map((po) => ({
      id: po.id,
      type: "PO" as const,
      docNumber: po.poNumber,
      partyName: po.supplier.supplierName,
      totalAmount: decimalToNumber(po.totalAmount),
      status: po.status,
      date: po.orderDate,
      href: `/purchase-orders/${po.id}`,
    })),
    ...salesOrders.map((so) => ({
      id: so.id,
      type: "SO" as const,
      docNumber: so.soNumber,
      partyName: so.customer.customerName,
      totalAmount: decimalToNumber(so.totalAmount),
      status: so.status,
      date: so.orderDate,
      href: `/sales-orders/${so.id}`,
    })),
  ]

  return activities
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10)
}

export async function getLowStockItems(): Promise<LowStockItem[]> {
  const stocks = await prisma.inventoryStock.findMany({
    where: { quantity: { lt: 10 } },
    include: {
      item: { select: { id: true, itemCode: true, itemName: true } },
      warehouse: { select: { warehouseName: true } },
    },
    orderBy: { quantity: "asc" },
  })

  return stocks.map((stock) => ({
    itemId: stock.item.id,
    itemCode: stock.item.itemCode,
    itemName: stock.item.itemName,
    warehouseName: stock.warehouse.warehouseName,
    quantity: stock.quantity,
  }))
}
