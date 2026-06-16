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
  invoiceId: z.string().min(1, "Invoice must be selected"),
  amount: z.number().positive("Jumlah payment must be greater than 0"),
  paymentMethod: z.enum(["BANK_TRANSFER", "CASH", "CHECK"]),
  paymentDate: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
})

export async function getCustomerPayments() {
  return prisma.customerPayment.findMany({
    include: {
      invoice: { include: { customer: true } },
      receivedBy: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getInvoicesForPayment() {
  return prisma.invoice.findMany({
    where: { status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] } },
    include: { customer: true },
    orderBy: { dueDate: "asc" },
  })
}

export async function createCustomerPayment(
  formData: z.infer<typeof CreatePaymentSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "customer_payments", "create")) {
      return { success: false, error: "You do not have permission" }
    }

    const validated = CreatePaymentSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: validated.data.invoiceId },
      include: { salesOrder: true },
    })
    if (!invoice) return { success: false, error: "Invoice not found" }

    const remaining = decimalToNumber(invoice.totalAmount) - decimalToNumber(invoice.paidAmount)
    if (validated.data.amount > remaining) {
      return { success: false, error: `Amount exceeds remaining balance (${remaining})` }
    }

    const paymentNumber = await generateDocNumber("CPAY")
    const userId = session.user.id
    if (!userId) return { success: false, error: "Unauthorized" }

    await prisma.$transaction(async (tx) => {
      await tx.customerPayment.create({
        data: {
          paymentNumber,
          invoiceId: invoice.id,
          amount: validated.data.amount,
          paymentMethod: validated.data.paymentMethod,
          paymentDate: validated.data.paymentDate
            ? new Date(validated.data.paymentDate)
            : new Date(),
          referenceNumber: validated.data.referenceNumber,
          notes: validated.data.notes,
          receivedById: userId,
        },
      })

      const newPaidAmount = decimalToNumber(invoice.paidAmount) + validated.data.amount
      const total = decimalToNumber(invoice.totalAmount)
      const isFullyPaid = newPaidAmount >= total

      let newStatus: "PARTIALLY_PAID" | "PAID" = "PARTIALLY_PAID"
      if (isFullyPaid) newStatus = "PAID"

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { paidAmount: newPaidAmount, status: newStatus },
      })

      if (isFullyPaid) {
        await tx.salesOrder.update({
          where: { id: invoice.soId },
          data: { status: "PAID" },
        })
      }
    })

    revalidatePath("/customer-payments")
    revalidatePath(`/invoices/${invoice.id}`)
    return {
      success: true,
      data: { id: invoice.id },
      message: `Payment ${paymentNumber} recorded successfully`,
    }
  } catch (error) {
    console.error("createCustomerPayment error:", error)
    return { success: false, error: "A system error occurred" }
  }
}
