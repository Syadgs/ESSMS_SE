import { prisma } from "@/lib/prisma"
import { decimalToNumber } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { markOverdueInvoices } from "@/lib/mark-overdue-invoices"
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
  await markOverdueInvoices()
  const { start, end } = getMonthRange()
  const now = new Date()
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  // 90 days ago for avg days to receive
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    poCount,
    soCount,
    stocks,
    outstandingBills,
    billsToPay,
    outstandingInvoices,
    overdueInvoicesCount,
    newCustomers,
    paidInvoices90d,
    pendingApprovalBills,
  ] = await Promise.all([
    prisma.purchaseOrder.count({
      where: { orderDate: { gte: start, lte: end }, status: { not: "CANCELLED" } },
    }),
    prisma.salesOrder.count({
      where: { orderDate: { gte: start, lte: end }, status: { not: "CANCELLED" } },
    }),
    prisma.inventoryStock.findMany({
      include: { item: { select: { costPrice: true } } },
    }),
    // Outstanding payables
    prisma.vendorBill.findMany({
      where: { status: { in: ["APPROVED", "PARTIALLY_PAID", "PENDING_APPROVAL"] } },
      select: { totalAmount: true, paidAmount: true },
    }),
    // Bills due within 7 days
    prisma.vendorBill.count({
      where: {
        status: { in: ["APPROVED", "PARTIALLY_PAID"] },
        dueDate: { lte: sevenDaysLater },
      },
    }),
    // Outstanding receivables
    prisma.invoice.findMany({
      where: { status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] } },
      select: { totalAmount: true, paidAmount: true },
    }),
    // Overdue invoice count
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    // New customers this month
    prisma.customer.count({ where: { createdAt: { gte: monthStart } } }),
    // Paid invoices in last 90 days (for avg days to receive)
    prisma.customerPayment.findMany({
      where: { createdAt: { gte: ninetyDaysAgo } },
      include: { invoice: { select: { invoiceDate: true } } },
    }),
    // Bills pending approval
    prisma.vendorBill.count({ where: { status: "PENDING_APPROVAL" } }),
  ])

  const totalStockValue = stocks.reduce(
    (sum, stock) => sum + stock.quantity * decimalToNumber(stock.item.costPrice),
    0
  )

  const outstandingPayables = outstandingBills.reduce(
    (sum, bill) => sum + decimalToNumber(bill.totalAmount) - decimalToNumber(bill.paidAmount),
    0
  )

  const outstandingReceivables = outstandingInvoices.reduce(
    (sum, inv) => sum + decimalToNumber(inv.totalAmount) - decimalToNumber(inv.paidAmount),
    0
  )

  // Avg days to receive: from invoiceDate to paymentDate
  let avgDaysToReceive = 0
  if (paidInvoices90d.length > 0) {
    const totalDays = paidInvoices90d.reduce((sum, payment) => {
      const invoiceDate = payment.invoice.invoiceDate.getTime()
      const paymentDate = payment.paymentDate.getTime()
      const days = Math.max(0, Math.floor((paymentDate - invoiceDate) / (1000 * 60 * 60 * 24)))
      return sum + days
    }, 0)
    avgDaysToReceive = Math.round(totalDays / paidInvoices90d.length)
  }

  return {
    poCount,
    soCount,
    totalStockValue,
    outstandingPayables,
    billsToPay,
    outstandingReceivables,
    overdueInvoicesCount,
    newCustomersThisMonth: newCustomers,
    avgDaysToReceive,
    pendingApprovalBills,
  }
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
  // Use item.reorderPoint instead of hardcoded 10
  const stocks = await prisma.inventoryStock.findMany({
    include: {
      item: { select: { id: true, itemCode: true, itemName: true, reorderPoint: true, itemType: true } },
      warehouse: { select: { warehouseName: true } },
    },
    where: {
      item: { itemType: "INVENTORY" },
    },
    orderBy: { quantity: "asc" },
  })

  return stocks
    .filter((stock) => stock.quantity < stock.item.reorderPoint)
    .map((stock) => ({
      itemId: stock.item.id,
      itemCode: stock.item.itemCode,
      itemName: stock.item.itemName,
      warehouseName: stock.warehouse.warehouseName,
      quantity: stock.quantity,
      reorderPoint: stock.item.reorderPoint,
    }))
}

// ─── Dashboard Widgets ────────────────────────────────────────────────────────

export async function getDashboardWidgets() {
  const [soPendingApproval, poPendingReceipt, overdueInvoices, billsToPay] = await Promise.all([
    prisma.salesOrder.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.purchaseOrder.count({ where: { status: { in: ["CONFIRMED", "PARTIALLY_RECEIVED"] } } }),
    prisma.invoice.aggregate({
      where: { status: "OVERDUE" },
      _count: true,
      _sum: { totalAmount: true, paidAmount: true },
    }),
    prisma.vendorBill.aggregate({
      where: { status: { in: ["APPROVED", "PARTIALLY_PAID"] } },
      _count: true,
      _sum: { totalAmount: true, paidAmount: true },
    }),
  ])

  return {
    soPendingApproval,
    poPendingReceipt,
    overdueInvoicesCount: overdueInvoices._count,
    overdueInvoicesAmount:
      decimalToNumber(overdueInvoices._sum.totalAmount ?? 0) -
      decimalToNumber(overdueInvoices._sum.paidAmount ?? 0),
    billsToPayCount: billsToPay._count,
    billsToPayAmount:
      decimalToNumber(billsToPay._sum.totalAmount ?? 0) -
      decimalToNumber(billsToPay._sum.paidAmount ?? 0),
  }
}
