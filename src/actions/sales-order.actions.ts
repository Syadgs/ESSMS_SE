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

const SOItemSchema = z.object({
  itemId: z.string().min(1, "Item wajib dipilih"),
  quantity: z.number().int().positive("Quantity harus > 0"),
  unitPrice: z.number().positive("Harga harus > 0"),
  discount: z.number().min(0).max(100).optional(),
})

const CreateSOSchema = z.object({
  customerId: z.string().min(1, "Customer wajib dipilih"),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(SOItemSchema).min(1, "Minimal 1 item"),
})

function calcSubtotal(qty: number, price: number, discount = 0) {
  return qty * price * (1 - discount / 100)
}

export async function getSalesOrders() {
  return prisma.salesOrder.findMany({
    include: { customer: true, createdBy: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getSalesOrderById(id: string) {
  return prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: true,
      approvedBy: true,
      items: { include: { item: true } },
      pickOrders: { include: { warehouse: true } },
      invoices: true,
      shipments: true,
    },
  })
}

export async function createSalesOrder(
  formData: z.infer<typeof CreateSOSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "sales_orders", "create")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const validated = CreateSOSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data
    const soNumber = await generateDocNumber("SO")
    const totalAmount = data.items.reduce(
      (sum, item) => sum + calcSubtotal(item.quantity, item.unitPrice, item.discount ?? 0),
      0
    )

    const so = await prisma.salesOrder.create({
      data: {
        soNumber,
        customerId: data.customerId,
        createdById: session.user.id,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        notes: data.notes,
        totalAmount,
        items: {
          create: data.items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount ?? 0,
            subtotal: calcSubtotal(item.quantity, item.unitPrice, item.discount ?? 0),
          })),
        },
      },
    })

    revalidatePath("/sales-orders")
    return { success: true, data: { id: so.id }, message: `Sales Order ${soNumber} berhasil dibuat` }
  } catch (error) {
    console.error("createSalesOrder error:", error)
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function submitSalesOrder(soId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "sales_orders", "create")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const so = await prisma.salesOrder.findUnique({ where: { id: soId } })
    if (!so) return { success: false, error: "Sales Order tidak ditemukan" }

    const transition = validateStatusTransition("SO", so.status, "PENDING_APPROVAL")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.salesOrder.update({
      where: { id: soId },
      data: { status: "PENDING_APPROVAL" },
    })

    revalidatePath(`/sales-orders/${soId}`)
    revalidatePath("/sales-orders")
    return { success: true, data: undefined, message: "Sales Order diajukan untuk persetujuan" }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function approveSalesOrder(soId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "sales_orders", "approve")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const so = await prisma.salesOrder.findUnique({ where: { id: soId } })
    if (!so) return { success: false, error: "Sales Order tidak ditemukan" }

    const transition = validateStatusTransition("SO", so.status, "APPROVED")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.salesOrder.update({
      where: { id: soId },
      data: { status: "APPROVED", approvedById: session.user.id },
    })

    revalidatePath(`/sales-orders/${soId}`)
    revalidatePath("/sales-orders")
    return { success: true, data: undefined, message: "Sales Order berhasil disetujui" }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function rejectSalesOrder(soId: string, rejectionReason: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "sales_orders", "approve")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const so = await prisma.salesOrder.findUnique({ where: { id: soId } })
    if (!so) return { success: false, error: "Sales Order tidak ditemukan" }

    await prisma.salesOrder.update({
      where: { id: soId },
      data: { status: "CANCELLED", rejectionReason },
    })

    revalidatePath(`/sales-orders/${soId}`)
    revalidatePath("/sales-orders")
    return { success: true, data: undefined, message: "Sales Order ditolak" }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function startSalesOrderProcessing(soId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "pick_pack_ship", "manage")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const so = await prisma.salesOrder.findUnique({ where: { id: soId } })
    if (!so) return { success: false, error: "Sales Order tidak ditemukan" }

    const transition = validateStatusTransition("SO", so.status, "PROCESSING")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.salesOrder.update({
      where: { id: soId },
      data: { status: "PROCESSING" },
    })

    revalidatePath(`/sales-orders/${soId}`)
    return { success: true, data: undefined, message: "Sales Order mulai diproses" }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}
