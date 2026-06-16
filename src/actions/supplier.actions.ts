"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hasPermission } from "@/lib/permissions"
import { Role } from "@prisma/client"
import type { ActionResult } from "@/types"

const SupplierSchema = z.object({
  supplierCode: z.string().min(1, "Code supplier is required"),
  supplierName: z.string().min(1, "Nama supplier is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export async function getSuppliers() {
  return prisma.supplier.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getSupplierById(id: string) {
  return prisma.supplier.findUnique({
    where: { id },
    include: {
      purchaseOrders: { take: 5, orderBy: { createdAt: "desc" } },
      vendorBills: { take: 5, orderBy: { createdAt: "desc" } },
    },
  })
}

export async function createSupplier(
  formData: z.infer<typeof SupplierSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "suppliers", "create")) {
      return { success: false, error: "You do not have permission for this action" }
    }

    const validated = SupplierSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const existing = await prisma.supplier.findUnique({
      where: { supplierCode: validated.data.supplierCode },
    })
    if (existing) return { success: false, error: "Code supplier is already in use" }

    const data = {
      ...validated.data,
      email: validated.data.email || null,
    }

    const supplier = await prisma.supplier.create({ data })
    revalidatePath("/suppliers")
    return { success: true, data: { id: supplier.id }, message: "Supplier created successfully" }
  } catch (error) {
    console.error("createSupplier error:", error)
    return { success: false, error: "A system error occurred" }
  }
}

export async function updateSupplier(
  id: string,
  formData: z.infer<typeof SupplierSchema>
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "suppliers", "edit")) {
      return { success: false, error: "You do not have permission for this action" }
    }

    const validated = SupplierSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = {
      ...validated.data,
      email: validated.data.email || null,
    }

    await prisma.supplier.update({ where: { id }, data })
    revalidatePath("/suppliers")
    revalidatePath(`/suppliers/${id}`)
    return { success: true, data: undefined, message: "Supplier updated successfully" }
  } catch (error) {
    console.error("updateSupplier error:", error)
    return { success: false, error: "A system error occurred" }
  }
}

export async function deleteSupplier(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "suppliers", "edit")) {
      return { success: false, error: "You do not have permission for this action" }
    }

    await prisma.supplier.update({ where: { id }, data: { isActive: false } })
    revalidatePath("/suppliers")
    return { success: true, data: undefined, message: "Supplier deactivated successfully" }
  } catch (error) {
    console.error("deleteSupplier error:", error)
    return { success: false, error: "A system error occurred" }
  }
}
