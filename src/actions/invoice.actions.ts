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
import { markOverdueInvoices } from "@/lib/mark-overdue-invoices"

const CreateInvoiceSchema = z.object({
  soId: z.string().min(1, "Sales Order must be selected"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
})

export async function getInvoices(status?: string) {
  await markOverdueInvoices()
  return prisma.invoice.findMany({
    where: status ? { status: status as never } : undefined,
    include: { customer: true, salesOrder: true, createdBy: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getInvoiceById(id: string) {
  await markOverdueInvoices()
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      salesOrder: { include: { items: { include: { item: true } } } },
      createdBy: true,
      payments: true,
    },
  })
}

export async function getShippedSalesOrdersForInvoice() {
  return prisma.salesOrder.findMany({
    where: { status: { in: ["SHIPPED", "INVOICED"] } },
    include: { customer: true, invoices: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createInvoice(
  formData: z.infer<typeof CreateInvoiceSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "invoices", "create")) {
      return { success: false, error: "You do not have permission" }
    }

    const validated = CreateInvoiceSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const so = await prisma.salesOrder.findUnique({ where: { id: validated.data.soId } })
    if (!so) return { success: false, error: "Sales Order not found" }
    if (so.status !== "SHIPPED") {
      return { success: false, error: "Only SHIPPED sales orders can be invoiced" }
    }

    const invoiceNumber = await generateDocNumber("INV")
    const userId = session.user.id
    if (!userId) return { success: false, error: "Unauthorized" }

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          invoiceNumber,
          soId: so.id,
          customerId: so.customerId,
          dueDate: validated.data.dueDate
            ? new Date(validated.data.dueDate)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default +30 days
          totalAmount: so.totalAmount,
          notes: validated.data.notes,
          createdById: userId,
        },
      })

      await tx.salesOrder.update({
        where: { id: so.id },
        data: { status: "INVOICED" },
      })

      return created
    })

    revalidatePath("/invoices")
    revalidatePath(`/sales-orders/${so.id}`)
    return { success: true, data: { id: invoice.id }, message: `Invoice ${invoiceNumber} created successfully` }
  } catch (error) {
    console.error("createInvoice error:", error)
    return { success: false, error: "A system error occurred" }
  }
}

export async function sendInvoice(invoiceId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "invoices", "create")) {
      return { success: false, error: "You do not have permission" }
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (!invoice) return { success: false, error: "Invoice not found" }

    const transition = validateStatusTransition("INVOICE", invoice.status, "SENT")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "SENT" },
    })

    revalidatePath(`/invoices/${invoiceId}`)
    revalidatePath("/invoices")
    return { success: true, data: undefined, message: "Invoice sent successfully" }
  } catch (error) {
    return { success: false, error: "A system error occurred" }
  }
}
