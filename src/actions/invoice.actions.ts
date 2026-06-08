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

const CreateInvoiceSchema = z.object({
  soId: z.string().min(1, "Sales Order wajib dipilih"),
  dueDate: z.string().min(1, "Tanggal jatuh tempo wajib diisi"),
  notes: z.string().optional(),
})

export async function getInvoices() {
  return prisma.invoice.findMany({
    include: { customer: true, salesOrder: true, createdBy: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getInvoiceById(id: string) {
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
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const validated = CreateInvoiceSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const so = await prisma.salesOrder.findUnique({ where: { id: validated.data.soId } })
    if (!so) return { success: false, error: "Sales Order tidak ditemukan" }
    if (so.status !== "SHIPPED") {
      return { success: false, error: "Hanya SO berstatus SHIPPED yang dapat diinvoice" }
    }

    const invoiceNumber = await generateDocNumber("INV")

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          invoiceNumber,
          soId: so.id,
          customerId: so.customerId,
          dueDate: new Date(validated.data.dueDate),
          totalAmount: so.totalAmount,
          notes: validated.data.notes,
          createdById: session.user!.id,
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
    return { success: true, data: { id: invoice.id }, message: `Invoice ${invoiceNumber} berhasil dibuat` }
  } catch (error) {
    console.error("createInvoice error:", error)
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function sendInvoice(invoiceId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "invoices", "create")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (!invoice) return { success: false, error: "Invoice tidak ditemukan" }

    const transition = validateStatusTransition("INVOICE", invoice.status, "SENT")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "SENT" },
    })

    revalidatePath(`/invoices/${invoiceId}`)
    revalidatePath("/invoices")
    return { success: true, data: undefined, message: "Invoice berhasil dikirim" }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}
