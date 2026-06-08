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

const GRItemSchema = z.object({
  poItemId: z.string().min(1),
  itemId: z.string().min(1),
  quantityOrdered: z.number().int().positive(),
  quantityReceived: z.number().int().min(0),
})

const CreateGRSchema = z.object({
  poId: z.string().min(1, "PO wajib dipilih"),
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  notes: z.string().optional(),
  items: z.array(GRItemSchema).min(1, "Minimal 1 item"),
})

export async function getPOsForReceipt() {
  return prisma.purchaseOrder.findMany({
    where: { status: { in: ["CONFIRMED", "PARTIALLY_RECEIVED"] } },
    include: {
      supplier: true,
      items: { include: { item: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getGoodsReceipts() {
  return prisma.goodsReceipt.findMany({
    include: {
      purchaseOrder: { include: { supplier: true } },
      warehouse: true,
      receivedBy: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getGoodsReceiptById(id: string) {
  return prisma.goodsReceipt.findUnique({
    where: { id },
    include: {
      purchaseOrder: { include: { supplier: true } },
      warehouse: true,
      receivedBy: true,
      items: { include: { item: true, poItem: true } },
    },
  })
}

export async function createGoodsReceipt(
  formData: z.infer<typeof CreateGRSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "goods_receipts", "create")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const validated = CreateGRSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data
    const hasReceived = data.items.some((i) => i.quantityReceived > 0)
    if (!hasReceived) {
      return { success: false, error: "Minimal 1 item harus memiliki qty diterima > 0" }
    }

    const po = await prisma.purchaseOrder.findUnique({ where: { id: data.poId } })
    if (!po) return { success: false, error: "Purchase Order tidak ditemukan" }
    if (!["CONFIRMED", "PARTIALLY_RECEIVED"].includes(po.status)) {
      return { success: false, error: "PO harus berstatus CONFIRMED atau PARTIALLY_RECEIVED" }
    }

    const grNumber = await generateDocNumber("GR")

    const gr = await prisma.goodsReceipt.create({
      data: {
        grNumber,
        poId: data.poId,
        warehouseId: data.warehouseId,
        receivedById: session.user.id,
        notes: data.notes,
        items: {
          create: data.items
            .filter((i) => i.quantityReceived > 0)
            .map((item) => ({
              poItemId: item.poItemId,
              itemId: item.itemId,
              quantityOrdered: item.quantityOrdered,
              quantityReceived: item.quantityReceived,
            })),
        },
      },
    })

    revalidatePath("/goods-receipts")
    return { success: true, data: { id: gr.id }, message: `Goods Receipt ${grNumber} berhasil dibuat` }
  } catch (error) {
    console.error("createGoodsReceipt error:", error)
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

async function updatePOReceiptStatus(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  poId: string
) {
  const po = await tx.purchaseOrder.findUnique({ where: { id: poId } })
  if (!po) return

  const poItems = await tx.purchaseOrderItem.findMany({
    where: { poId },
    include: {
      goodsReceiptItems: {
        where: { goodsReceipt: { status: "CONFIRMED" } },
      },
    },
  })

  let allFullyReceived = true
  let anyReceived = false

  for (const poItem of poItems) {
    const totalReceived = poItem.goodsReceiptItems.reduce((sum, gri) => sum + gri.quantityReceived, 0)
    if (totalReceived > 0) anyReceived = true
    if (totalReceived < poItem.quantity) allFullyReceived = false
  }

  let newStatus: "PARTIALLY_RECEIVED" | "FULLY_RECEIVED" | null = null
  if (allFullyReceived && anyReceived) newStatus = "FULLY_RECEIVED"
  else if (anyReceived) newStatus = "PARTIALLY_RECEIVED"

  if (newStatus && po.status !== newStatus) {
    const transition = validateStatusTransition("PO", po.status, newStatus)
    if (transition.valid) {
      await tx.purchaseOrder.update({
        where: { id: poId },
        data: { status: newStatus },
      })
    }
  }
}

export async function confirmGoodsReceipt(grId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "goods_receipts", "confirm")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const gr = await prisma.goodsReceipt.findUnique({
      where: { id: grId },
      include: { items: true },
    })
    if (!gr) return { success: false, error: "Goods Receipt tidak ditemukan" }

    const transition = validateStatusTransition("GR", gr.status, "CONFIRMED")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.$transaction(async (tx) => {
      await tx.goodsReceipt.update({
        where: { id: grId },
        data: { status: "CONFIRMED" },
      })

      for (const item of gr.items) {
        await tx.inventoryStock.upsert({
          where: {
            itemId_warehouseId: { itemId: item.itemId, warehouseId: gr.warehouseId },
          },
          create: {
            itemId: item.itemId,
            warehouseId: gr.warehouseId,
            quantity: item.quantityReceived,
          },
          update: {
            quantity: { increment: item.quantityReceived },
          },
        })
      }

      await updatePOReceiptStatus(tx, gr.poId)
    })

    revalidatePath(`/goods-receipts/${grId}`)
    revalidatePath("/goods-receipts")
    revalidatePath(`/purchase-orders/${gr.poId}`)
    return { success: true, data: undefined, message: "Goods Receipt berhasil dikonfirmasi & stok diperbarui" }
  } catch (error) {
    console.error("confirmGoodsReceipt error:", error)
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}
