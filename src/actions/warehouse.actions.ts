"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hasPermission } from "@/lib/permissions"
import { Role } from "@prisma/client"
import type { ActionResult } from "@/types"

const WarehouseSchema = z.object({
  warehouseCode: z.string().min(1, "Code warehouse is required"),
  warehouseName: z.string().min(2, "Nama warehouse is required"),
  location: z.string().optional(),
})

export async function getWarehouses() {
  return prisma.warehouse.findMany({ orderBy: { warehouseName: "asc" } })
}

export async function createWarehouse(
  formData: z.infer<typeof WarehouseSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "admin", "manage")) {
      return { success: false, error: "Only ADMIN can manage warehouses" }
    }

    const validated = WarehouseSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const wh = await prisma.warehouse.create({
      data: {
        warehouseCode: validated.data.warehouseCode,
        warehouseName: validated.data.warehouseName,
        location: validated.data.location,
      },
    })

    revalidatePath("/admin/warehouses")
    return { success: true, data: { id: wh.id }, message: `Warehouses ${wh.warehouseName} created successfully` }
  } catch (error: unknown) {
    const msg = error instanceof Error && error.message.includes("Unique") ? "Code warehouse is already in use" : "A system error occurred"
    return { success: false, error: msg }
  }
}

export async function updateWarehouse(
  id: string,
  formData: z.infer<typeof WarehouseSchema> & { isActive: boolean }
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "admin", "manage")) {
      return { success: false, error: "Only ADMIN can manage warehouses" }
    }

    await prisma.warehouse.update({
      where: { id },
      data: {
        warehouseCode: formData.warehouseCode,
        warehouseName: formData.warehouseName,
        location: formData.location,
        isActive: formData.isActive,
      },
    })

    revalidatePath("/admin/warehouses")
    return { success: true, data: undefined, message: "Warehouses updated successfully" }
  } catch (error) {
    return { success: false, error: "A system error occurred" }
  }
}
