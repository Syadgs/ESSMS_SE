import { prisma } from "@/lib/prisma"
import { markOverdueInvoices } from "@/lib/mark-overdue-invoices"
import { decimalToNumber } from "@/lib/utils"

export interface ARAgingRow {
  customerId: string
  customerCode: string
  customerName: string
  current: number       // not yet due
  days1_30: number      // 1-30 days past due
  days31_60: number     // 31-60 days past due
  days61_90: number     // 61-90 days past due
  days90plus: number    // > 90 days past due
  total: number
}

function getDaysPastDue(dueDate: Date, today: Date): number {
  const diff = today.getTime() - dueDate.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getBucket(daysPastDue: number): keyof Omit<ARAgingRow, "customerId" | "customerCode" | "customerName" | "total"> {
  if (daysPastDue <= 0) return "current"
  if (daysPastDue <= 30) return "days1_30"
  if (daysPastDue <= 60) return "days31_60"
  if (daysPastDue <= 90) return "days61_90"
  return "days90plus"
}

export async function getARAgingReport(): Promise<ARAgingRow[]> {
  await markOverdueInvoices()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const invoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] },
    },
    include: {
      customer: {
        select: { id: true, customerCode: true, customerName: true },
      },
    },
  })

  const customerMap = new Map<string, ARAgingRow>()

  for (const invoice of invoices) {
    const outstanding = decimalToNumber(invoice.totalAmount) - decimalToNumber(invoice.paidAmount)
    if (outstanding <= 0) continue

    const daysPastDue = getDaysPastDue(invoice.dueDate, today)
    const bucket = getBucket(daysPastDue)

    const customerId = invoice.customer.id
    if (!customerMap.has(customerId)) {
      customerMap.set(customerId, {
        customerId,
        customerCode: invoice.customer.customerCode,
        customerName: invoice.customer.customerName,
        current: 0,
        days1_30: 0,
        days31_60: 0,
        days61_90: 0,
        days90plus: 0,
        total: 0,
      })
    }

    const row = customerMap.get(customerId)!
    row[bucket] += outstanding
    row.total += outstanding
  }

  return Array.from(customerMap.values()).sort((a, b) =>
    a.customerName.localeCompare(b.customerName)
  )
}
