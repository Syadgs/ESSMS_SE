"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hasPermission } from "@/lib/permissions"
import { Role } from "@prisma/client"
import type { ActionResult } from "@/types"
import bcrypt from "bcryptjs"

const CreateUserSchema = z.object({
  name: z.string().min(2, "Nama at least 2 characters"),
  email: z.string().email("Invalid email format"),
  role: z.nativeEnum(Role),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const UpdateUserSchema = z.object({
  name: z.string().min(2, "Nama at least 2 characters"),
  role: z.nativeEnum(Role),
  isActive: z.boolean(),
  password: z.string().optional(),
})

export async function getUsers() {
  const session = await auth()
  if (!session?.user) return []
  if (!hasPermission(session.user.role as Role, "admin", "manage")) return []
  return prisma.user.findMany({ orderBy: { createdAt: "desc" } })
}

export async function getUserById(id: string) {
  const session = await auth()
  if (!session?.user) return null
  if (!hasPermission(session.user.role as Role, "admin", "manage")) return null
  return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } })
}

export async function createUser(
  formData: z.infer<typeof CreateUserSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "admin", "manage")) {
      return { success: false, error: "Only ADMIN can manage users" }
    }

    const validated = CreateUserSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const exists = await prisma.user.findUnique({ where: { email: validated.data.email } })
    if (exists) return { success: false, error: "Email is already registered" }

    const hashedPassword = await bcrypt.hash(validated.data.password, 10)

    const user = await prisma.user.create({
      data: {
        name: validated.data.name,
        email: validated.data.email,
        role: validated.data.role,
        password: hashedPassword,
      },
    })

    revalidatePath("/admin/users")
    return { success: true, data: { id: user.id }, message: `Users ${user.name} created successfully` }
  } catch (error) {
    console.error("createUser error:", error)
    return { success: false, error: "A system error occurred" }
  }
}

export async function updateUser(
  id: string,
  formData: z.infer<typeof UpdateUserSchema>
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "admin", "manage")) {
      return { success: false, error: "Only ADMIN can manage users" }
    }

    const validated = UpdateUserSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const updateData: Record<string, unknown> = {
      name: validated.data.name,
      role: validated.data.role,
      isActive: validated.data.isActive,
    }

    if (validated.data.password && validated.data.password.length >= 6) {
      updateData.password = await bcrypt.hash(validated.data.password, 10)
    }

    await prisma.user.update({ where: { id }, data: updateData })

    revalidatePath("/admin/users")
    revalidatePath(`/admin/users/${id}/edit`)
    return { success: true, data: undefined, message: "Users updated successfully" }
  } catch (error) {
    return { success: false, error: "A system error occurred" }
  }
}

export async function deactivateUser(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "admin", "manage")) {
      return { success: false, error: "Only ADMIN can manage users" }
    }
    if (id === session.user.id) {
      return { success: false, error: "Cannot deactivate your own account" }
    }

    await prisma.user.update({ where: { id }, data: { isActive: false } })
    revalidatePath("/admin/users")
    return { success: true, data: undefined, message: "User deactivated successfully" }
  } catch (error) {
    return { success: false, error: "A system error occurred" }
  }
}
