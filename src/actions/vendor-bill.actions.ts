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

const CreateBillSchema = z.object({
  poId: z.string().min(1, "PO wajib dipilih"),
  grId: z.string().optional(),
  dueDate: z.string().min(1, "Tanggal jatuh tempo wajib diisi"),
  notes: z.string().optional(),
})

export async function getBills() {
  return getVendorBills()
}

export async function getVendorBills() {
  return prisma.vendorBill.findMany({
    include: { supplier: true, purchaseOrder: true, createdBy: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getBillById(id: string) {
  return getVendorBillById(id)
}

export async function getVendorBillById(id: string) {
  return prisma.vendorBill.findUnique({
    where: { id },
    include: {
      supplier: true,
      purchaseOrder: { include: { items: { include: { item: true } } } },
      goodsReceipt: true,
      createdBy: true,
      approvedBy: true,
      payments: true,
    },
  })
}

export async function getPOsForBilling() {
  return prisma.purchaseOrder.findMany({
    where: { status: { in: ["FULLY_RECEIVED", "PARTIALLY_RECEIVED", "BILLED"] } },
    include: { supplier: true, goodsReceipts: { where: { status: "CONFIRMED" } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function createVendorBill(
  formData: z.infer<typeof CreateBillSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "vendor_bills", "create")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const validated = CreateBillSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: validated.data.poId },
      include: { supplier: true },
    })
    if (!po) return { success: false, error: "Purchase Order tidak ditemukan" }

    const billNumber = await generateDocNumber("BILL")

    const bill = await prisma.vendorBill.create({
      data: {
        billNumber,
        poId: po.id,
        grId: validated.data.grId || null,
        supplierId: po.supplierId,
        dueDate: new Date(validated.data.dueDate),
        totalAmount: po.totalAmount,
        createdById: session.user.id,
      },
    })

    revalidatePath("/vendor-bills")
    return { success: true, data: { id: bill.id }, message: `Vendor Bill ${billNumber} berhasil dibuat` }
  } catch (error) {
    console.error("createVendorBill error:", error)
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function submitVendorBill(billId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "vendor_bills", "create")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const bill = await prisma.vendorBill.findUnique({ where: { id: billId } })
    if (!bill) return { success: false, error: "Vendor Bill tidak ditemukan" }

    const transition = validateStatusTransition("BILL", bill.status, "PENDING_APPROVAL")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.vendorBill.update({
      where: { id: billId },
      data: { status: "PENDING_APPROVAL" },
    })

    revalidatePath(`/vendor-bills/${billId}`)
    revalidatePath("/vendor-bills")
    return { success: true, data: undefined, message: "Vendor Bill berhasil diajukan untuk persetujuan" }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function approveVendorBill(billId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "vendor_bills", "approve")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const bill = await prisma.vendorBill.findUnique({ where: { id: billId } })
    if (!bill) return { success: false, error: "Vendor Bill tidak ditemukan" }

    const transition = validateStatusTransition("BILL", bill.status, "APPROVED")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.$transaction(async (tx) => {
      await tx.vendorBill.update({
        where: { id: billId },
        data: { status: "APPROVED", approvedById: session.user!.id },
      })
      await tx.purchaseOrder.update({
        where: { id: bill.poId },
        data: { status: "BILLED" },
      })
    })

    revalidatePath(`/vendor-bills/${billId}`)
    revalidatePath("/vendor-bills")
    return { success: true, data: undefined, message: "Vendor Bill berhasil disetujui" }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function rejectVendorBill(billId: string, rejectionNote: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "vendor_bills", "approve")) {
      return { success: false, error: "Anda tidak memiliki izin" }
    }

    const bill = await prisma.vendorBill.findUnique({ where: { id: billId } })
    if (!bill) return { success: false, error: "Vendor Bill tidak ditemukan" }

    const transition = validateStatusTransition("BILL", bill.status, "REJECTED")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.vendorBill.update({
      where: { id: billId },
      data: { status: "REJECTED", rejectionNote },
    })

    revalidatePath(`/vendor-bills/${billId}`)
    revalidatePath("/vendor-bills")
    return { success: true, data: undefined, message: "Vendor Bill ditolak" }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}
