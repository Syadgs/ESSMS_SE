"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hasPermission } from "@/lib/permissions"
import { generateDocNumber } from "@/lib/generate-number"
import { validateStatusTransition } from "@/lib/status-transitions"
import { Role } from "@prisma/client"
import type { ActionResult } from "@/types"

const AdjustmentSchema = z.object({
  itemId: z.string().min(1, "Item wajib dipilih"),
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  adjustmentType: z.enum(["INCREASE", "DECREASE"]),
  quantity: z.number().int().min(1, "Jumlah minimal 1"),
  reason: z.string().optional(),
})

const TransferSchema = z.object({
  itemId: z.string().min(1, "Item wajib dipilih"),
  fromWarehouseId: z.string().min(1, "Gudang asal wajib dipilih"),
  toWarehouseId: z.string().min(1, "Gudang tujuan wajib dipilih"),
  quantity: z.number().int().min(1, "Jumlah minimal 1"),
  notes: z.string().optional(),
})

export async function getWarehouses() {
  return prisma.warehouse.findMany({
    where: { isActive: true },
    orderBy: { warehouseName: "asc" },
  })
}

export async function getInventoryStocks() {
  return prisma.inventoryStock.findMany({
    include: {
      item: true,
      warehouse: true,
    },
    orderBy: [{ warehouse: { warehouseName: "asc" } }, { item: { itemName: "asc" } }],
  })
}

export async function getInventoryItems() {
  return prisma.item.findMany({
    where: { isActive: true, itemType: "INVENTORY" },
    orderBy: { itemName: "asc" },
  })
}

export async function getAdjustments() {
  const adjustments = await prisma.inventoryAdjustment.findMany({
    include: {
      item: true,
      adjustedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const warehouseIds = [...new Set(adjustments.map((a) => a.warehouseId))]
  const warehouses = await prisma.warehouse.findMany({
    where: { id: { in: warehouseIds } },
  })
  const warehouseMap = Object.fromEntries(warehouses.map((w) => [w.id, w]))

  return adjustments.map((adj) => ({
    ...adj,
    warehouse: warehouseMap[adj.warehouseId] ?? null,
  }))
}

export async function createAdjustment(
  formData: z.infer<typeof AdjustmentSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "inventory_adjustment", "create")) {
      return { success: false, error: "Anda tidak memiliki izin untuk tindakan ini" }
    }

    const validated = AdjustmentSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const { itemId, warehouseId, adjustmentType, quantity, reason } = validated.data

    const adjustment = await prisma.$transaction(async (tx) => {
      const stock = await tx.inventoryStock.findUnique({
        where: { itemId_warehouseId: { itemId, warehouseId } },
      })

      if (adjustmentType === "DECREASE") {
        const currentQty = stock?.quantity ?? 0
        if (currentQty < quantity) {
          throw new Error("Stok tidak mencukupi untuk pengurangan")
        }
      }

      const delta = adjustmentType === "INCREASE" ? quantity : -quantity

      if (stock) {
        await tx.inventoryStock.update({
          where: { id: stock.id },
          data: { quantity: stock.quantity + delta },
        })
      } else if (adjustmentType === "INCREASE") {
        await tx.inventoryStock.create({
          data: { itemId, warehouseId, quantity },
        })
      }

      return tx.inventoryAdjustment.create({
        data: {
          itemId,
          warehouseId,
          adjustmentType,
          quantity,
          reason: reason || null,
          adjustedById: session.user!.id!,
        },
      })
    })

    revalidatePath("/inventory/adjustments")
    return { success: true, data: { id: adjustment.id }, message: "Penyesuaian stok berhasil dibuat" }
  } catch (error) {
    console.error("createAdjustment error:", error)
    const message = error instanceof Error ? error.message : "Terjadi kesalahan sistem"
    return { success: false, error: message }
  }
}

export async function getTransfers() {
  return prisma.inventoryTransfer.findMany({
    include: {
      item: true,
      fromWarehouse: true,
      toWarehouse: true,
      transferredBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getTransferById(id: string) {
  return prisma.inventoryTransfer.findUnique({
    where: { id },
    include: {
      item: true,
      fromWarehouse: true,
      toWarehouse: true,
      transferredBy: { select: { name: true, email: true } },
    },
  })
}

export async function createTransfer(
  formData: z.infer<typeof TransferSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "inventory_transfer", "create")) {
      return { success: false, error: "Anda tidak memiliki izin untuk tindakan ini" }
    }

    const validated = TransferSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const { fromWarehouseId, toWarehouseId } = validated.data
    if (fromWarehouseId === toWarehouseId) {
      return { success: false, error: "Gudang asal dan tujuan tidak boleh sama" }
    }

    const transferNumber = await generateDocNumber("TRF")

    const transfer = await prisma.inventoryTransfer.create({
      data: {
        ...validated.data,
        transferNumber,
        notes: validated.data.notes || null,
        transferredById: session.user.id,
        status: "DRAFT",
      },
    })

    revalidatePath("/inventory/transfers")
    return { success: true, data: { id: transfer.id }, message: "Transfer stok berhasil dibuat" }
  } catch (error) {
    console.error("createTransfer error:", error)
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function completeTransfer(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "inventory_transfer", "confirm")) {
      return { success: false, error: "Anda tidak memiliki izin untuk tindakan ini" }
    }

    const transfer = await prisma.inventoryTransfer.findUnique({ where: { id } })
    if (!transfer) return { success: false, error: "Transfer tidak ditemukan" }

    const transition = validateStatusTransition("TRANSFER", transfer.status, "COMPLETED")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.$transaction(async (tx) => {
      const fromStock = await tx.inventoryStock.findUnique({
        where: {
          itemId_warehouseId: {
            itemId: transfer.itemId,
            warehouseId: transfer.fromWarehouseId,
          },
        },
      })

      if (!fromStock || fromStock.quantity < transfer.quantity) {
        throw new Error("Stok di gudang asal tidak mencukupi")
      }

      await tx.inventoryStock.update({
        where: { id: fromStock.id },
        data: { quantity: fromStock.quantity - transfer.quantity },
      })

      const toStock = await tx.inventoryStock.findUnique({
        where: {
          itemId_warehouseId: {
            itemId: transfer.itemId,
            warehouseId: transfer.toWarehouseId,
          },
        },
      })

      if (toStock) {
        await tx.inventoryStock.update({
          where: { id: toStock.id },
          data: { quantity: toStock.quantity + transfer.quantity },
        })
      } else {
        await tx.inventoryStock.create({
          data: {
            itemId: transfer.itemId,
            warehouseId: transfer.toWarehouseId,
            quantity: transfer.quantity,
          },
        })
      }

      await tx.inventoryTransfer.update({
        where: { id },
        data: { status: "COMPLETED" },
      })
    })

    revalidatePath("/inventory/transfers")
    revalidatePath(`/inventory/transfers/${id}`)
    return { success: true, data: undefined, message: "Transfer berhasil diselesaikan" }
  } catch (error) {
    console.error("completeTransfer error:", error)
    const message = error instanceof Error ? error.message : "Terjadi kesalahan sistem"
    return { success: false, error: message }
  }
}

export async function confirmTransfer(id: string): Promise<ActionResult> {
  return completeTransfer(id)
}

export async function cancelTransfer(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "inventory_transfer", "confirm")) {
      return { success: false, error: "Anda tidak memiliki izin untuk tindakan ini" }
    }

    const transfer = await prisma.inventoryTransfer.findUnique({ where: { id } })
    if (!transfer) return { success: false, error: "Transfer tidak ditemukan" }
    if (transfer.status !== "DRAFT") {
      return { success: false, error: "Transfer sudah diproses" }
    }

    await prisma.inventoryTransfer.update({
      where: { id },
      data: { status: "CANCELLED" },
    })

    revalidatePath("/inventory/transfers")
    revalidatePath(`/inventory/transfers/${id}`)
    return { success: true, data: undefined, message: "Transfer berhasil dibatalkan" }
  } catch (error) {
    console.error("cancelTransfer error:", error)
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}
