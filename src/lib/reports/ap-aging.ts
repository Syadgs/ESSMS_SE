import { prisma } from "@/lib/prisma"
import { decimalToNumber } from "@/lib/utils"

export interface APAgingRow {
  supplierId: string
  supplierCode: string
  supplierName: string
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

function getBucket(daysPastDue: number): keyof Omit<APAgingRow, "supplierId" | "supplierCode" | "supplierName" | "total"> {
  if (daysPastDue <= 0) return "current"
  if (daysPastDue <= 30) return "days1_30"
  if (daysPastDue <= 60) return "days31_60"
  if (daysPastDue <= 90) return "days61_90"
  return "days90plus"
}

export async function getAPAgingReport(): Promise<APAgingRow[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const bills = await prisma.vendorBill.findMany({
    where: {
      status: { in: ["APPROVED", "PARTIALLY_PAID", "PENDING_APPROVAL"] },
    },
    include: {
      supplier: {
        select: { id: true, supplierCode: true, supplierName: true },
      },
    },
  })

  const supplierMap = new Map<string, APAgingRow>()

  for (const bill of bills) {
    const outstanding = decimalToNumber(bill.totalAmount) - decimalToNumber(bill.paidAmount)
    if (outstanding <= 0) continue

    const daysPastDue = getDaysPastDue(bill.dueDate, today)
    const bucket = getBucket(daysPastDue)

    const supplierId = bill.supplier.id
    if (!supplierMap.has(supplierId)) {
      supplierMap.set(supplierId, {
        supplierId,
        supplierCode: bill.supplier.supplierCode,
        supplierName: bill.supplier.supplierName,
        current: 0,
        days1_30: 0,
        days31_60: 0,
        days61_90: 0,
        days90plus: 0,
        total: 0,
      })
    }

    const row = supplierMap.get(supplierId)!
    row[bucket] += outstanding
    row.total += outstanding
  }

  return Array.from(supplierMap.values()).sort((a, b) =>
    a.supplierName.localeCompare(b.supplierName)
  )
}
