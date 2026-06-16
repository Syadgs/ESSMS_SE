import { prisma } from "@/lib/prisma"

/**
 * Menandai invoice SENT atau PARTIALLY_PAID yang sudah melewati dueDate sebagai OVERDUE.
 * Dipanggil secara lazy saat read invoice (lazy evaluation pattern).
 */
export async function markOverdueInvoices(): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.invoice.updateMany({
    where: {
      status: { in: ["SENT", "PARTIALLY_PAID"] },
      dueDate: { lt: today },
    },
    data: { status: "OVERDUE" },
  })
}
