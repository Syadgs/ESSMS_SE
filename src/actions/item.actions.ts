"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hasPermission } from "@/lib/permissions"
import { Role } from "@prisma/client"
import type { ActionResult } from "@/types"

const ItemSchema = z.object({
  itemCode: z.string().min(1, "Code item is required"),
  itemName: z.string().min(1, "Nama item is required"),
  itemType: z.enum(["INVENTORY", "NON_INVENTORY", "SERVICE"]),
  description: z.string().optional(),
  unitPrice: z.number().min(0),
  costPrice: z.number().min(0),
  unit: z.string().min(1),
  category: z.string().optional(),
})

export async function getItems() {
  return prisma.item.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getItemById(id: string) {
  return prisma.item.findUnique({
    where: { id },
    include: {
      inventoryStocks: { include: { warehouse: true } },
    },
  })
}

export async function createItem(formData: z.infer<typeof ItemSchema>): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "items", "create")) {
      return { success: false, error: "You do not have permission for this action" }
    }

    const validated = ItemSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const existing = await prisma.item.findUnique({ where: { itemCode: validated.data.itemCode } })
    if (existing) return { success: false, error: "Code item is already in use" }

    const item = await prisma.item.create({ data: validated.data })
    revalidatePath("/items")
    return { success: true, data: { id: item.id }, message: "Item created successfully" }
  } catch (error) {
    console.error("createItem error:", error)
    return { success: false, error: "A system error occurred" }
  }
}

export async function updateItem(
  id: string,
  formData: z.infer<typeof ItemSchema>
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "items", "edit")) {
      return { success: false, error: "You do not have permission for this action" }
    }

    const validated = ItemSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    await prisma.item.update({ where: { id }, data: validated.data })
    revalidatePath("/items")
    revalidatePath(`/items/${id}`)
    return { success: true, data: undefined, message: "Item updated successfully" }
  } catch (error) {
    console.error("updateItem error:", error)
    return { success: false, error: "A system error occurred" }
  }
}

export async function deleteItem(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "items", "edit")) {
      return { success: false, error: "You do not have permission" }
    }

    await prisma.item.update({ where: { id }, data: { isActive: false } })
    revalidatePath("/items")
    return { success: true, data: undefined, message: "Item deactivated successfully" }
  } catch (error) {
    return { success: false, error: "A system error occurred" }
  }
}
