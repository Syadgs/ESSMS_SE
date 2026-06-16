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
import { decimalToNumber } from "@/lib/utils"

// ─── Schemas ─────────────────────────────────────────────────────────────────

const BillLineItemSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unitPrice: z.number().positive("Harga must be greater than 0"),
  poItemId: z.string().optional(),
  grItemId: z.string().optional(),
})

const CreatePOBillSchema = z.object({
  billType: z.literal("PO_BASED"),
  poId: z.string().min(1, "PO must be selected"),
  grId: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
  lineItems: z.array(BillLineItemSchema).min(1, "At least 1 line item"),
})

const CreateStandaloneBillSchema = z.object({
  billType: z.literal("STANDALONE"),
  supplierId: z.string().min(1, "Supplier must be selected"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
  lineItems: z.array(BillLineItemSchema).min(1, "At least 1 line item"),
})

const CreateBillSchema = z.discriminatedUnion("billType", [
  CreatePOBillSchema,
  CreateStandaloneBillSchema,
])

// ─── 3-Way Match Validation ───────────────────────────────────────────────────

interface LineItemInput {
  itemId?: string
  poItemId?: string
  grItemId?: string
  quantity: number
  unitPrice: number
}

interface MatchError {
  line: number
  field: string
  message: string
}

export async function validateThreeWayMatch(
  poId: string,
  grId: string | undefined,
  lineItems: LineItemInput[]
): Promise<{
  valid: boolean
  matchStatus: "MATCHED" | "MISMATCH" | "PENDING"
  errors: MatchError[]
}> {
  const errors: MatchError[] = []

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: { items: true },
  })
  if (!po) return { valid: false, matchStatus: "MISMATCH", errors: [{ line: 0, field: "po", message: "PO not found" }] }

  const gr = grId
    ? await prisma.goodsReceipt.findUnique({ where: { id: grId }, include: { items: true } })
    : null

  lineItems.forEach((lineItem, index) => {
    const lineNum = index + 1

    // Find matching PO item
    const poItem = lineItem.poItemId
      ? po.items.find((p) => p.id === lineItem.poItemId)
      : po.items.find((p) => p.itemId === lineItem.itemId)

    if (!poItem) {
      errors.push({ line: lineNum, field: "item", message: `Line ${lineNum}: Item not found on PO` })
      return
    }

    // Check qty <= PO qty
    if (lineItem.quantity > poItem.quantity) {
      errors.push({
        line: lineNum,
        field: "quantity",
        message: `Line ${lineNum}: Quantity bill (${lineItem.quantity}) exceeds quantity PO (${poItem.quantity})`,
      })
    }

    // Check unit price (tolerance 0.01)
    const priceDiff = Math.abs(lineItem.unitPrice - decimalToNumber(poItem.unitPrice))
    if (priceDiff > 0.01) {
      errors.push({
        line: lineNum,
        field: "unitPrice",
        message: `Line ${lineNum}: Harga bill (${lineItem.unitPrice}) does not match price PO (${decimalToNumber(poItem.unitPrice)})`,
      })
    }

    // Check against GR if linked
    if (gr) {
      const grItem = lineItem.grItemId
        ? gr.items.find((g) => g.id === lineItem.grItemId)
        : gr.items.find((g) => g.itemId === lineItem.itemId)

      if (!grItem) {
        errors.push({
          line: lineNum,
          field: "grItem",
          message: `Line ${lineNum}: Item not found on selected GR`,
        })
      } else if (lineItem.quantity > grItem.quantityReceived) {
        errors.push({
          line: lineNum,
          field: "quantity",
          message: `Line ${lineNum}: Quantity bill (${lineItem.quantity}) exceeds quantity received on GR (${grItem.quantityReceived})`,
        })
      }
    }
  })

  if (errors.length > 0) {
    return { valid: false, matchStatus: "MISMATCH", errors }
  }
  return { valid: true, matchStatus: "MATCHED", errors: [] }
}

// ─── Query Functions ──────────────────────────────────────────────────────────

export async function getBills() {
  return getVendorBills()
}

export async function getVendorBills(status?: string) {
  return prisma.vendorBill.findMany({
    where: status ? { status: status as never } : undefined,
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
      goodsReceipt: { include: { items: { include: { item: true } } } },
      createdBy: true,
      approvedBy: true,
      payments: true,
      items: { include: { item: true } },
    },
  })
}

export async function getPOsForBilling() {
  return prisma.purchaseOrder.findMany({
    where: { status: { in: ["FULLY_RECEIVED", "PARTIALLY_RECEIVED", "BILLED"] } },
    include: {
      supplier: true,
      goodsReceipts: { where: { status: "CONFIRMED" } },
      items: { include: { item: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getSuppliersForBill() {
  return prisma.supplier.findMany({
    where: { isActive: true },
    orderBy: { supplierName: "asc" },
  })
}

export async function getGRsForPO(poId: string) {
  return prisma.goodsReceipt.findMany({
    where: { poId, status: "CONFIRMED" },
    include: { items: { include: { item: true } } },
    orderBy: { createdAt: "desc" },
  })
}

// ─── Create Vendor Bill ───────────────────────────────────────────────────────

export async function createVendorBill(
  formData: z.infer<typeof CreateBillSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "vendor_bills", "create")) {
      return { success: false, error: "You do not have permission" }
    }

    const validated = CreateBillSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data
    const totalAmount = data.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const billNumber = await generateDocNumber("BILL")

    if (data.billType === "PO_BASED") {
      const po = await prisma.purchaseOrder.findUnique({
        where: { id: data.poId },
        include: { supplier: true },
      })
      if (!po) return { success: false, error: "Purchase Order not found" }

      // Validate 3-way match
      const matchResult = await validateThreeWayMatch(data.poId, data.grId, data.lineItems)

      const bill = await prisma.vendorBill.create({
        data: {
          billNumber,
          billType: "PO_BASED",
          matchStatus: matchResult.matchStatus,
          poId: po.id,
          grId: data.grId || null,
          supplierId: po.supplierId,
          dueDate: new Date(data.dueDate),
          totalAmount,
          createdById: userId,
          items: {
            create: data.lineItems.map((li) => ({
              itemId: li.itemId || null,
              description: li.description || null,
              quantity: li.quantity,
              unitPrice: li.unitPrice,
              subtotal: li.quantity * li.unitPrice,
              poItemId: li.poItemId || null,
              grItemId: li.grItemId || null,
            })),
          },
        },
      })

      revalidatePath("/vendor-bills")
      const matchMsg = matchResult.valid ? " — 3-way match: MATCHED" : " — 3-way match: MISMATCH"
      return {
        success: true,
        data: { id: bill.id },
        message: `Vendor Bill ${billNumber} created successfully${matchMsg}`,
      }
    } else {
      // STANDALONE
      const bill = await prisma.vendorBill.create({
        data: {
          billNumber,
          billType: "STANDALONE",
          matchStatus: "NOT_APPLICABLE",
          supplierId: data.supplierId,
          dueDate: new Date(data.dueDate),
          totalAmount,
          createdById: userId,
          items: {
            create: data.lineItems.map((li) => ({
              itemId: li.itemId || null,
              description: li.description || null,
              quantity: li.quantity,
              unitPrice: li.unitPrice,
              subtotal: li.quantity * li.unitPrice,
            })),
          },
        },
      })

      revalidatePath("/vendor-bills")
      return {
        success: true,
        data: { id: bill.id },
        message: `Standalone Bill ${billNumber} created successfully`,
      }
    }
  } catch (error) {
    console.error("createVendorBill error:", error)
    return { success: false, error: "A system error occurred" }
  }
}

// ─── Submit ───────────────────────────────────────────────────────────────────

export async function submitVendorBill(billId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "vendor_bills", "create")) {
      return { success: false, error: "You do not have permission" }
    }

    const bill = await prisma.vendorBill.findUnique({ where: { id: billId } })
    if (!bill) return { success: false, error: "Vendor Bill not found" }

    // PO-based bills must be MATCHED before submission.
    if (bill.billType === "PO_BASED" && bill.matchStatus !== "MATCHED") {
      return {
        success: false,
        error: "PO-based bills can only be submitted when 3-way match = MATCHED.",
      }
    }

    const transition = validateStatusTransition("BILL", bill.status, "PENDING_APPROVAL")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.vendorBill.update({
      where: { id: billId },
      data: { status: "PENDING_APPROVAL" },
    })

    revalidatePath(`/vendor-bills/${billId}`)
    revalidatePath("/vendor-bills")
    return { success: true, data: undefined, message: "Vendor bill submitted for approval" }
  } catch (error) {
    return { success: false, error: "A system error occurred" }
  }
}

// ─── Approve ─────────────────────────────────────────────────────────────────

export async function approveVendorBill(billId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "vendor_bills", "approve")) {
      return { success: false, error: "You do not have permission" }
    }

    const bill = await prisma.vendorBill.findUnique({ where: { id: billId } })
    if (!bill) return { success: false, error: "Vendor Bill not found" }

    const transition = validateStatusTransition("BILL", bill.status, "APPROVED")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.$transaction(async (tx) => {
      await tx.vendorBill.update({
        where: { id: billId },
        data: { status: "APPROVED", approvedById: session.user!.id },
      })
      // Only update PO if PO-based bill
      if (bill.poId) {
        await tx.purchaseOrder.update({
          where: { id: bill.poId },
          data: { status: "BILLED" },
        })
      }
    })

    revalidatePath(`/vendor-bills/${billId}`)
    revalidatePath("/vendor-bills")
    return { success: true, data: undefined, message: "Vendor Bill approved successfully" }
  } catch (error) {
    return { success: false, error: "A system error occurred" }
  }
}

// ─── Reject ──────────────────────────────────────────────────────────────────

export async function rejectVendorBill(billId: string, rejectionNote: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "vendor_bills", "approve")) {
      return { success: false, error: "You do not have permission" }
    }

    const bill = await prisma.vendorBill.findUnique({ where: { id: billId } })
    if (!bill) return { success: false, error: "Vendor Bill not found" }

    const transition = validateStatusTransition("BILL", bill.status, "REJECTED")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.vendorBill.update({
      where: { id: billId },
      data: { status: "REJECTED", rejectionNote },
    })

    revalidatePath(`/vendor-bills/${billId}`)
    revalidatePath("/vendor-bills")
    return { success: true, data: undefined, message: "Vendor Bill rejected" }
  } catch (error) {
    return { success: false, error: "A system error occurred" }
  }
}
