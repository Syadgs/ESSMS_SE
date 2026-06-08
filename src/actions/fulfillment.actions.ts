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

const CreatePickSchema = z.object({
  soId: z.string().min(1),
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  notes: z.string().optional(),
})

const CreateShipmentSchema = z.object({
  packOrderId: z.string().min(1),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  notes: z.string().optional(),
})

const CreatePackSchema = z.object({
  pickOrderId: z.string().min(1),
  packageCount: z.number().int().positive().default(1),
  totalWeight: z.number().optional(),
  notes: z.string().optional(),
})

export async function getPickOrders() {
  return prisma.pickOrder.findMany({
    include: {
      salesOrder: { include: { customer: true } },
      warehouse: true,
      pickedBy: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getPickOrderById(id: string) {
  return prisma.pickOrder.findUnique({
    where: { id },
    include: {
      salesOrder: { include: { customer: true, items: { include: { item: true } } } },
      warehouse: true,
      pickedBy: true,
      packOrder: true,
    },
  })
}

export async function getPackOrders() {
  return prisma.packOrder.findMany({
    include: {
      pickOrder: { include: { salesOrder: { include: { customer: true } } } },
      packedBy: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getPackOrderById(id: string) {
  return prisma.packOrder.findUnique({
    where: { id },
    include: {
      pickOrder: {
        include: {
          salesOrder: { include: { customer: true, items: { include: { item: true } } } },
          warehouse: true,
        },
      },
      packedBy: true,
      shipment: true,
    },
  })
}

export async function getShipments() {
  return prisma.shipment.findMany({
    include: {
      salesOrder: { include: { customer: true } },
      shippedBy: true,
      packOrder: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getShipmentById(id: string) {
  return prisma.shipment.findUnique({
    where: { id },
    include: {
      salesOrder: { include: { customer: true, items: { include: { item: true } } } },
      shippedBy: true,
      packOrder: { include: { pickOrder: { include: { warehouse: true } } } },
    },
  })
}

export async function getApprovedSalesOrdersForPick() {
  return prisma.salesOrder.findMany({
    where: { status: { in: ["APPROVED", "PROCESSING"] } },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createPickOrder(
  formData: z.infer<typeof CreatePickSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "pick_pack_ship", "manage")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const validated = CreatePickSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const so = await prisma.salesOrder.findUnique({
      where: { id: validated.data.soId },
      include: { items: true },
    })
    if (!so) return { success: false, error: "Sales Order tidak ditemukan" }
    if (!["APPROVED", "PROCESSING"].includes(so.status)) {
      return { success: false, error: "SO harus berstatus APPROVED atau PROCESSING" }
    }

    for (const soItem of so.items) {
      const stock = await prisma.inventoryStock.findUnique({
        where: {
          itemId_warehouseId: {
            itemId: soItem.itemId,
            warehouseId: validated.data.warehouseId,
          },
        },
      })
      if (!stock || stock.quantity < soItem.quantity) {
        return { success: false, error: "Stok tidak mencukupi di gudang yang dipilih" }
      }
    }

    const pick = await prisma.$transaction(async (tx) => {
      if (so.status === "APPROVED") {
        await tx.salesOrder.update({
          where: { id: so.id },
          data: { status: "PROCESSING" },
        })
      }

      const created = await tx.pickOrder.create({
        data: {
          soId: validated.data.soId,
          warehouseId: validated.data.warehouseId,
          pickedById: session.user!.id,
          notes: validated.data.notes,
        },
      })

      await tx.salesOrder.update({
        where: { id: so.id },
        data: { status: "PICKING" },
      })

      return created
    })

    revalidatePath("/pick-orders")
    revalidatePath(`/sales-orders/${so.id}`)
    return { success: true, data: { id: pick.id }, message: "Pick Order berhasil dibuat" }
  } catch (error) {
    console.error("createPickOrder error:", error)
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function startPickOrder(pickId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "pick_pack_ship", "manage")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const pick = await prisma.pickOrder.findUnique({ where: { id: pickId } })
    if (!pick) return { success: false, error: "Pick Order tidak ditemukan" }

    const transition = validateStatusTransition("PICK", pick.status, "IN_PROGRESS")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.pickOrder.update({
      where: { id: pickId },
      data: { status: "IN_PROGRESS" },
    })

    revalidatePath(`/pick-orders/${pickId}`)
    return { success: true, data: undefined, message: "Picking dimulai" }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function confirmPick(pickId: string): Promise<ActionResult> {
  return completePickOrder(pickId)
}

export async function completePickOrder(pickId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "pick_pack_ship", "manage")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const pick = await prisma.pickOrder.findUnique({ where: { id: pickId } })
    if (!pick) return { success: false, error: "Pick Order tidak ditemukan" }

    const transition = validateStatusTransition("PICK", pick.status, "COMPLETED")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.pickOrder.update({
      where: { id: pickId },
      data: { status: "COMPLETED" },
    })

    revalidatePath(`/pick-orders/${pickId}`)
    return { success: true, data: undefined, message: "Picking selesai" }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function createPackOrder(
  formData: z.infer<typeof CreatePackSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "pick_pack_ship", "manage")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const validated = CreatePackSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const pick = await prisma.pickOrder.findUnique({
      where: { id: validated.data.pickOrderId },
      include: { packOrder: true },
    })
    if (!pick) return { success: false, error: "Pick Order tidak ditemukan" }
    if (pick.status !== "COMPLETED") {
      return { success: false, error: "Pick Order harus selesai terlebih dahulu" }
    }
    if (pick.packOrder) return { success: false, error: "Pack Order sudah ada" }

    const pack = await prisma.$transaction(async (tx) => {
      const created = await tx.packOrder.create({
        data: {
          pickOrderId: pick.id,
          packedById: session.user!.id,
          packageCount: validated.data.packageCount,
          totalWeight: validated.data.totalWeight,
          notes: validated.data.notes,
        },
      })

      await tx.salesOrder.update({
        where: { id: pick.soId },
        data: { status: "PACKING" },
      })

      return created
    })

    revalidatePath("/pack-orders")
    revalidatePath(`/pick-orders/${pick.id}`)
    return { success: true, data: { id: pack.id }, message: "Pack Order berhasil dibuat" }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function confirmPack(packId: string): Promise<ActionResult> {
  return completePackOrder(packId)
}

export async function completePackOrder(packId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "pick_pack_ship", "manage")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const pack = await prisma.packOrder.findUnique({ where: { id: packId } })
    if (!pack) return { success: false, error: "Pack Order tidak ditemukan" }

    const transition = validateStatusTransition("PACK", pack.status, "COMPLETED")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.packOrder.update({
      where: { id: packId },
      data: { status: "COMPLETED" },
    })

    revalidatePath(`/pack-orders/${packId}`)
    return { success: true, data: undefined, message: "Packing selesai" }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function createShipment(
  formData: z.infer<typeof CreateShipmentSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "pick_pack_ship", "manage")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const validated = CreateShipmentSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const pack = await prisma.packOrder.findUnique({
      where: { id: validated.data.packOrderId },
      include: { pickOrder: true, shipment: true },
    })
    if (!pack) return { success: false, error: "Pack Order tidak ditemukan" }
    if (pack.status !== "COMPLETED") {
      return { success: false, error: "Pack Order harus selesai terlebih dahulu" }
    }
    if (pack.shipment) return { success: false, error: "Shipment sudah ada" }

    const shipmentNumber = await generateDocNumber("SHP")

    const shipment = await prisma.shipment.create({
      data: {
        shipmentNumber,
        packOrderId: pack.id,
        soId: pack.pickOrder.soId,
        shippedById: session.user.id,
        trackingNumber: validated.data.trackingNumber,
        carrier: validated.data.carrier,
        notes: validated.data.notes,
      },
    })

    revalidatePath("/shipments")
    return { success: true, data: { id: shipment.id }, message: `Shipment ${shipmentNumber} berhasil dibuat` }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function confirmShipment(shipmentId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "pick_pack_ship", "manage")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        packOrder: { include: { pickOrder: true } },
        salesOrder: { include: { items: true } },
      },
    })
    if (!shipment) return { success: false, error: "Shipment tidak ditemukan" }

    const transition = validateStatusTransition("SHIP", shipment.status, "SHIPPED")
    if (!transition.valid) return { success: false, error: transition.error! }

    const warehouseId = shipment.packOrder.pickOrder.warehouseId

    await prisma.$transaction(async (tx) => {
      for (const soItem of shipment.salesOrder.items) {
        const stock = await tx.inventoryStock.findUnique({
          where: {
            itemId_warehouseId: { itemId: soItem.itemId, warehouseId },
          },
        })

        if (!stock || stock.quantity < soItem.quantity) {
          throw new Error(`Stok tidak cukup untuk item ${soItem.itemId}`)
        }

        await tx.inventoryStock.update({
          where: { itemId_warehouseId: { itemId: soItem.itemId, warehouseId } },
          data: { quantity: { decrement: soItem.quantity } },
        })
      }

      await tx.shipment.update({
        where: { id: shipmentId },
        data: { status: "SHIPPED" },
      })

      await tx.salesOrder.update({
        where: { id: shipment.soId },
        data: { status: "SHIPPED" },
      })
    })

    revalidatePath(`/shipments/${shipmentId}`)
    revalidatePath(`/sales-orders/${shipment.soId}`)
    return { success: true, data: undefined, message: "Shipment dikonfirmasi & stok dikurangi" }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan sistem"
    return { success: false, error: message }
  }
}

export async function deliverShipment(shipmentId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "pick_pack_ship", "manage")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } })
    if (!shipment) return { success: false, error: "Shipment tidak ditemukan" }

    const transition = validateStatusTransition("SHIP", shipment.status, "DELIVERED")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: "DELIVERED" },
    })

    revalidatePath(`/shipments/${shipmentId}`)
    return { success: true, data: undefined, message: "Shipment ditandai terkirim" }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}
