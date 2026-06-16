"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hasPermission } from "@/lib/permissions"
import { Role } from "@prisma/client"
import type { ActionResult } from "@/types"

const MasterSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(2, "Nama is required"),
})

// ─── Departments ──────────────────────────────────────────────────────────────

export async function getDepartments() {
  return prisma.department.findMany({ orderBy: { name: "asc" } })
}

export async function createDepartment(
  formData: z.infer<typeof MasterSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "admin", "manage")) {
      return { success: false, error: "Only ADMIN can manage master data" }
    }

    const validated = MasterSchema.safeParse(formData)
    if (!validated.success) return { success: false, error: validated.error.errors[0].message }

    const dept = await prisma.department.create({
      data: { code: validated.data.code, name: validated.data.name },
    })

    revalidatePath("/admin/departments")
    return { success: true, data: { id: dept.id }, message: `Departments ${dept.name} created successfully` }
  } catch {
    return { success: false, error: "Code is already in use or a system error occurred" }
  }
}

export async function updateDepartment(
  id: string,
  formData: z.infer<typeof MasterSchema> & { isActive: boolean }
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "admin", "manage")) {
      return { success: false, error: "Only ADMIN can manage master data" }
    }

    await prisma.department.update({
      where: { id },
      data: { code: formData.code, name: formData.name, isActive: formData.isActive },
    })

    revalidatePath("/admin/departments")
    return { success: true, data: undefined, message: "Departments updated successfully" }
  } catch {
    return { success: false, error: "A system error occurred" }
  }
}

// ─── Classes ──────────────────────────────────────────────────────────────────

export async function getClasses() {
  return prisma.class.findMany({ orderBy: { name: "asc" } })
}

export async function createClass(
  formData: z.infer<typeof MasterSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "admin", "manage")) {
      return { success: false, error: "Only ADMIN can manage master data" }
    }

    const validated = MasterSchema.safeParse(formData)
    if (!validated.success) return { success: false, error: validated.error.errors[0].message }

    const cls = await prisma.class.create({
      data: { code: validated.data.code, name: validated.data.name },
    })

    revalidatePath("/admin/classes")
    return { success: true, data: { id: cls.id }, message: `Classes ${cls.name} created successfully` }
  } catch {
    return { success: false, error: "Code is already in use or a system error occurred" }
  }
}

export async function updateClass(
  id: string,
  formData: z.infer<typeof MasterSchema> & { isActive: boolean }
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "admin", "manage")) {
      return { success: false, error: "Only ADMIN can manage master data" }
    }

    await prisma.class.update({
      where: { id },
      data: { code: formData.code, name: formData.name, isActive: formData.isActive },
    })

    revalidatePath("/admin/classes")
    return { success: true, data: undefined, message: "Classes updated successfully" }
  } catch {
    return { success: false, error: "A system error occurred" }
  }
}
