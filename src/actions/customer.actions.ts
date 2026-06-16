"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hasPermission } from "@/lib/permissions"
import { Role } from "@prisma/client"
import type { ActionResult } from "@/types"

const CustomerSchema = z.object({
  customerCode: z.string().min(1, "Code customer is required"),
  customerName: z.string().min(1, "Nama customer is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.number().min(0),
})

export async function getCustomers() {
  return prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      salesOrders: { take: 5, orderBy: { createdAt: "desc" } },
      invoices: { take: 5, orderBy: { createdAt: "desc" } },
    },
  })
}

export async function createCustomer(
  formData: z.infer<typeof CustomerSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "customers", "create")) {
      return { success: false, error: "You do not have permission for this action" }
    }

    const validated = CustomerSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const existing = await prisma.customer.findUnique({
      where: { customerCode: validated.data.customerCode },
    })
    if (existing) return { success: false, error: "Code customer is already in use" }

    const data = {
      ...validated.data,
      email: validated.data.email || null,
    }

    const customer = await prisma.customer.create({ data })
    revalidatePath("/customers")
    return { success: true, data: { id: customer.id }, message: "Customers created successfully" }
  } catch (error) {
    console.error("createCustomer error:", error)
    return { success: false, error: "A system error occurred" }
  }
}

export async function updateCustomer(
  id: string,
  formData: z.infer<typeof CustomerSchema>
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "customers", "edit")) {
      return { success: false, error: "You do not have permission for this action" }
    }

    const validated = CustomerSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = {
      ...validated.data,
      email: validated.data.email || null,
    }

    await prisma.customer.update({ where: { id }, data })
    revalidatePath("/customers")
    revalidatePath(`/customers/${id}`)
    return { success: true, data: undefined, message: "Customers updated successfully" }
  } catch (error) {
    console.error("updateCustomer error:", error)
    return { success: false, error: "A system error occurred" }
  }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "customers", "edit")) {
      return { success: false, error: "You do not have permission for this action" }
    }

    await prisma.customer.update({ where: { id }, data: { isActive: false } })
    revalidatePath("/customers")
    return { success: true, data: undefined, message: "Customer deactivated successfully" }
  } catch (error) {
    console.error("deleteCustomer error:", error)
    return { success: false, error: "A system error occurred" }
  }
}
