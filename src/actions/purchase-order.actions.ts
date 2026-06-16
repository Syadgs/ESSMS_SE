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

const POItemSchema = z.object({
  itemId: z.string().min(1, "Item must be selected"),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  unitPrice: z.number().positive("Harga must be greater than 0"),
})

const CreatePOSchema = z.object({
  supplierId: z.string().min(1, "Supplier must be selected"),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(POItemSchema).min(1, "At least 1 item"),
})

export async function getPurchaseOrders(status?: string) {
  return prisma.purchaseOrder.findMany({
    where: status ? { status: status as never } : undefined,
    include: { supplier: true, createdBy: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getPurchaseOrderById(id: string) {
  return prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      createdBy: true,
      items: { include: { item: true } },
      goodsReceipts: true,
      vendorBills: true,
    },
  })
}

export async function getConfirmedPurchaseOrders() {
  return prisma.purchaseOrder.findMany({
    where: { status: { in: ["CONFIRMED", "PARTIALLY_RECEIVED"] } },
    include: { supplier: true, items: { include: { item: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function createPurchaseOrder(
  formData: z.infer<typeof CreatePOSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "purchase_orders", "create")) {
      return { success: false, error: "You do not have permission for this action" }
    }

    const validated = CreatePOSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data
    const poNumber = await generateDocNumber("PO")
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: data.supplierId,
        createdById: session.user.id,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        notes: data.notes,
        totalAmount,
        items: {
          create: data.items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
      },
    })

    revalidatePath("/purchase-orders")
    return { success: true, data: { id: po.id }, message: `Purchase Order ${poNumber} created successfully` }
  } catch (error) {
    console.error("createPurchaseOrder error:", error)
    return { success: false, error: "A system error occurred" }
  }
}

export async function confirmPurchaseOrder(poId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "purchase_orders", "confirm")) {
      return { success: false, error: "You do not have permission" }
    }

    const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } })
    if (!po) return { success: false, error: "Purchase Order not found" }

    const transition = validateStatusTransition("PO", po.status, "CONFIRMED")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: "CONFIRMED" },
    })

    revalidatePath(`/purchase-orders/${poId}`)
    revalidatePath("/purchase-orders")
    return { success: true, data: undefined, message: "Purchase Order confirmed successfully" }
  } catch (error) {
    console.error("confirmPurchaseOrder error:", error)
    return { success: false, error: "A system error occurred" }
  }
}

export async function cancelPurchaseOrder(poId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "purchase_orders", "confirm")) {
      return { success: false, error: "You do not have permission" }
    }

    const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } })
    if (!po) return { success: false, error: "Purchase Order not found" }

    const transition = validateStatusTransition("PO", po.status, "CANCELLED")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: "CANCELLED" },
    })

    revalidatePath(`/purchase-orders/${poId}`)
    revalidatePath("/purchase-orders")
    return { success: true, data: undefined, message: "Purchase Order cancelled successfully" }
  } catch (error) {
    return { success: false, error: "A system error occurred" }
  }
}
