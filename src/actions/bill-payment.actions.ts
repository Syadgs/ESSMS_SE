"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { generateDocNumber } from "@/lib/generate-number"
import { hasPermission } from "@/lib/permissions"
import { Role } from "@prisma/client"
import type { ActionResult } from "@/types"
import { decimalToNumber } from "@/lib/utils"

const CreatePaymentSchema = z.object({
  billId: z.string().min(1, "Bill must be selected"),
  amount: z.number().positive("Jumlah payment must be greater than 0"),
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
    where: { status: { in: ["APPROVED", "PARTIALLY_PAID"] } },
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
      return { success: false, error: "You do not have permission" }
    }

    const validated = CreatePaymentSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const bill = await prisma.vendorBill.findUnique({ where: { id: validated.data.billId } })
    if (!bill) return { success: false, error: "Vendor Bill not found" }
    if (!["APPROVED", "PARTIALLY_PAID"].includes(bill.status)) {
      return { success: false, error: "Only bills with APPROVED or PARTIALLY_PAID status can be paid" }
    }

    const remaining = decimalToNumber(bill.totalAmount) - decimalToNumber(bill.paidAmount)
    if (validated.data.amount > remaining + 0.01) {
      return { success: false, error: `Amount exceeds remaining balance (${remaining.toLocaleString("id-ID")})` }
    }

    const paymentNumber = await generateDocNumber("PAY")
    const userId = session.user.id
    if (!userId) return { success: false, error: "Unauthorized" }

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
          paidById: userId,
        },
      })

      const newPaidAmount = decimalToNumber(bill.paidAmount) + validated.data.amount
      const isFullyPaid = newPaidAmount >= decimalToNumber(bill.totalAmount) - 0.01

      // Determine new bill status
      const newBillStatus = isFullyPaid ? "PAID" : "PARTIALLY_PAID"

      await tx.vendorBill.update({
        where: { id: bill.id },
        data: {
          paidAmount: newPaidAmount,
          status: newBillStatus,
        },
      })

      // Only update PO status for PO-based bills when fully paid
      if (isFullyPaid && bill.poId) {
        await tx.purchaseOrder.update({
          where: { id: bill.poId },
          data: { status: "PAID" },
        })
      }
    })

    revalidatePath("/bill-payments")
    revalidatePath(`/vendor-bills/${bill.id}`)
    revalidatePath("/vendor-bills")
    return {
      success: true,
      data: { id: bill.id },
      message: `Payment ${paymentNumber} recorded successfully`,
    }
  } catch (error) {
    console.error("createBillPayment error:", error)
    return { success: false, error: "A system error occurred" }
  }
}
