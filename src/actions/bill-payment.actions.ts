"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { generateDocNumber } from "@/lib/generate-number"
import { hasPermission } from "@/lib/permissions"
import { validateStatusTransition } from "@/lib/status-transitions"
import { Role } from "@prisma/client"
import type { ActionResult } from "@/types"
import { decimalToNumber } from "@/lib/utils"

const CreatePaymentSchema = z.object({
  billId: z.string().min(1, "Bill wajib dipilih"),
  amount: z.number().positive("Jumlah pembayaran harus > 0"),
  paymentMethod: z.enum(["BANK_TRANSFER", "CASH", "CHECK"]),
  paymentDate: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
})

export async function getBillPayments() {
  return prisma.billPayment.findMany({
    include: {
      vendorBill: { include: { supplier: true } },
      paidBy: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getApprovedBillsForPayment() {
  return prisma.vendorBill.findMany({
    where: { status: "APPROVED" },
    include: { supplier: true },
    orderBy: { dueDate: "asc" },
  })
}

export async function createBillPayment(
  formData: z.infer<typeof CreatePaymentSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "vendor_bills", "pay")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const validated = CreatePaymentSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const bill = await prisma.vendorBill.findUnique({ where: { id: validated.data.billId } })
    if (!bill) return { success: false, error: "Vendor Bill tidak ditemukan" }
    if (bill.status !== "APPROVED") {
      return { success: false, error: "Hanya bill berstatus APPROVED yang dapat dibayar" }
    }

    const remaining = decimalToNumber(bill.totalAmount) - decimalToNumber(bill.paidAmount)
    if (validated.data.amount > remaining) {
      return { success: false, error: `Jumlah melebihi sisa tagihan (${remaining})` }
    }

    const paymentNumber = await generateDocNumber("PAY")

    await prisma.$transaction(async (tx) => {
      await tx.billPayment.create({
        data: {
          paymentNumber,
          billId: bill.id,
          amount: validated.data.amount,
          paymentMethod: validated.data.paymentMethod,
          paymentDate: validated.data.paymentDate
            ? new Date(validated.data.paymentDate)
            : new Date(),
          referenceNumber: validated.data.referenceNumber,
          notes: validated.data.notes,
          paidById: session.user!.id,
        },
      })

      const newPaidAmount = decimalToNumber(bill.paidAmount) + validated.data.amount
      const isFullyPaid = newPaidAmount >= decimalToNumber(bill.totalAmount)

      await tx.vendorBill.update({
        where: { id: bill.id },
        data: {
          paidAmount: newPaidAmount,
          status: isFullyPaid ? "PAID" : "APPROVED",
        },
      })

      if (isFullyPaid) {
        await tx.purchaseOrder.update({
          where: { id: bill.poId },
          data: { status: "PAID" },
        })
      }
    })

    revalidatePath("/bill-payments")
    revalidatePath(`/vendor-bills/${bill.id}`)
    return {
      success: true,
      data: { id: bill.id },
      message: `Pembayaran ${paymentNumber} berhasil dicatat`,
    }
  } catch (error) {
    console.error("createBillPayment error:", error)
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}
