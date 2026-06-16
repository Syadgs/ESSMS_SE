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

const SOItemSchema = z.object({
  itemId: z.string().min(1, "Item must be selected"),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  unitPrice: z.number().positive("Harga must be greater than 0"),
  discount: z.number().min(0).max(100).optional(),
})

const CreateSOSchema = z.object({
  customerId: z.string().min(1, "Customer must be selected"),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
  departmentId: z.string().optional(),
  classId: z.string().optional(),
  taxCode: z.string().optional(),
  priceLevel: z.string().optional(),
  items: z.array(SOItemSchema).min(1, "At least 1 item"),
})

function calcSubtotal(qty: number, price: number, discount = 0) {
  return qty * price * (1 - discount / 100)
}

// ─── Helper: Stock Availability ──────────────────────────────────────────────

export async function getItemStockAvailability(itemId: string): Promise<number> {
  const stocks = await prisma.inventoryStock.findMany({
    where: { itemId },
    select: { quantity: true },
  })
  return stocks.reduce((sum, s) => sum + s.quantity, 0)
}

// ─── Helper: Customer Credit Info ────────────────────────────────────────────

export async function getCustomerCreditInfo(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { creditLimit: true, customerName: true },
  })
  if (!customer) return null

  // Sum outstanding AR: invoices SENT, PARTIALLY_PAID, OVERDUE
  const invoices = await prisma.invoice.findMany({
    where: {
      customerId,
      status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] },
    },
    select: { totalAmount: true, paidAmount: true },
  })

  const outstandingAR = invoices.reduce(
    (sum, inv) => sum + decimalToNumber(inv.totalAmount) - decimalToNumber(inv.paidAmount),
    0
  )

  const creditLimit = decimalToNumber(customer.creditLimit)
  const available = creditLimit === 0 ? Infinity : Math.max(0, creditLimit - outstandingAR)

  return {
    customerName: customer.customerName,
    creditLimit,
    outstandingAR,
    available,
    isUnlimited: creditLimit === 0,
  }
}

// ─── Validate Stock & Credit Limit ───────────────────────────────────────────

async function validateSOConstraints(
  customerId: string,
  items: Array<{ itemId: string; quantity: number; unitPrice: number; discount?: number }>,
  totalAmount: number
): Promise<{ valid: boolean; error?: string }> {
  // 1. Credit limit check
  const creditInfo = await getCustomerCreditInfo(customerId)
  if (creditInfo && !creditInfo.isUnlimited) {
    if (creditInfo.outstandingAR + totalAmount > creditInfo.creditLimit) {
      const available = Math.max(0, creditInfo.creditLimit - creditInfo.outstandingAR)
      return {
        valid: false,
        error: `Exceeds customer credit limit. Limit: Rp ${creditInfo.creditLimit.toLocaleString("id-ID")}, Outstanding AR: Rp ${creditInfo.outstandingAR.toLocaleString("id-ID")}, Tersedia: Rp ${available.toLocaleString("id-ID")}, Amount SO: Rp ${totalAmount.toLocaleString("id-ID")}`,
      }
    }
  }

  // 2. Stock availability check for INVENTORY items
  // Aggregate requested qty per item to avoid bypass with duplicated lines.
  const requestedQtyMap = new Map<string, number>()
  for (const soItem of items) {
    requestedQtyMap.set(soItem.itemId, (requestedQtyMap.get(soItem.itemId) ?? 0) + soItem.quantity)
  }

  const itemIds = Array.from(requestedQtyMap.keys())
  const itemDetails = await prisma.item.findMany({
    where: { id: { in: itemIds } },
    select: { id: true, itemType: true, itemName: true },
  })

  const stockErrors: string[] = []
  for (const [itemId, requestedQty] of requestedQtyMap.entries()) {
    const itemDetail = itemDetails.find((d) => d.id === itemId)
    if (!itemDetail || itemDetail.itemType !== "INVENTORY") continue

    const availableQty = await getItemStockAvailability(itemId)
    if (requestedQty > availableQty) {
      stockErrors.push(
        `${itemDetail.itemName}: diminta ${requestedQty}, tersedia ${availableQty}`
      )
    }
  }

  if (stockErrors.length > 0) {
    return {
      valid: false,
      error: `Insufficient stock:\n${stockErrors.join("\n")}`,
    }
  }

  return { valid: true }
}

// ─── Query Functions ──────────────────────────────────────────────────────────

export async function getSalesOrders(status?: string) {
  return prisma.salesOrder.findMany({
    where: status ? { status: status as never } : undefined,
    include: { customer: true, createdBy: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getSalesOrderById(id: string) {
  return prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: true,
      approvedBy: true,
      items: { include: { item: true } },
      pickOrders: { include: { warehouse: true } },
      invoices: true,
      shipments: true,
      department: true,
      class: true,
    },
  })
}

// ─── Create Sales Order ───────────────────────────────────────────────────────

export async function createSalesOrder(
  formData: z.infer<typeof CreateSOSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "sales_orders", "create")) {
      return { success: false, error: "You do not have permission" }
    }

    const validated = CreateSOSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data
    const soNumber = await generateDocNumber("SO")
    const totalAmount = data.items.reduce(
      (sum, item) => sum + calcSubtotal(item.quantity, item.unitPrice, item.discount ?? 0),
      0
    )

    // Validate constraints
    const validation = await validateSOConstraints(data.customerId, data.items, totalAmount)
    if (!validation.valid) {
      return { success: false, error: validation.error || "Validation failed" }
    }

    const so = await prisma.salesOrder.create({
      data: {
        soNumber,
        customerId: data.customerId,
        createdById: session.user.id,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        notes: data.notes,
        departmentId: data.departmentId || null,
        classId: data.classId || null,
        taxCode: data.taxCode || null,
        priceLevel: data.priceLevel || null,
        totalAmount,
        items: {
          create: data.items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount ?? 0,
            subtotal: calcSubtotal(item.quantity, item.unitPrice, item.discount ?? 0),
          })),
        },
      },
    })

    revalidatePath("/sales-orders")
    return { success: true, data: { id: so.id }, message: `Sales Order ${soNumber} created successfully` }
  } catch (error) {
    console.error("createSalesOrder error:", error)
    return { success: false, error: "A system error occurred" }
  }
}

// ─── Submit ───────────────────────────────────────────────────────────────────

export async function submitSalesOrder(soId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "sales_orders", "create")) {
      return { success: false, error: "You do not have permission" }
    }

    const so = await prisma.salesOrder.findUnique({
      where: { id: soId },
      include: { items: { include: { item: true } } },
    })
    if (!so) return { success: false, error: "Sales Order not found" }

    // Re-validate at submit time
    const totalAmount = decimalToNumber(so.totalAmount)
    const validation = await validateSOConstraints(
      so.customerId,
      so.items.map((i) => ({
        itemId: i.itemId,
        quantity: i.quantity,
        unitPrice: decimalToNumber(i.unitPrice),
        discount: decimalToNumber(i.discount),
      })),
      totalAmount
    )
    if (!validation.valid) {
      return { success: false, error: validation.error || "Validation failed" }
    }

    const transition = validateStatusTransition("SO", so.status, "PENDING_APPROVAL")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.salesOrder.update({
      where: { id: soId },
      data: { status: "PENDING_APPROVAL" },
    })

    revalidatePath(`/sales-orders/${soId}`)
    revalidatePath("/sales-orders")
    return { success: true, data: undefined, message: "Sales Order submitted for approval" }
  } catch (error) {
    return { success: false, error: "A system error occurred" }
  }
}

// ─── Approve ─────────────────────────────────────────────────────────────────

export async function approveSalesOrder(soId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "sales_orders", "approve")) {
      return { success: false, error: "You do not have permission" }
    }

    const so = await prisma.salesOrder.findUnique({ where: { id: soId } })
    if (!so) return { success: false, error: "Sales Order not found" }

    const transition = validateStatusTransition("SO", so.status, "APPROVED")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.salesOrder.update({
      where: { id: soId },
      data: { status: "APPROVED", approvedById: session.user.id },
    })

    revalidatePath(`/sales-orders/${soId}`)
    revalidatePath("/sales-orders")
    return { success: true, data: undefined, message: "Sales Order approved successfully" }
  } catch (error) {
    return { success: false, error: "A system error occurred" }
  }
}

// ─── Reject ──────────────────────────────────────────────────────────────────

export async function rejectSalesOrder(soId: string, rejectionReason: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "sales_orders", "approve")) {
      return { success: false, error: "You do not have permission" }
    }

    const so = await prisma.salesOrder.findUnique({ where: { id: soId } })
    if (!so) return { success: false, error: "Sales Order not found" }

    await prisma.salesOrder.update({
      where: { id: soId },
      data: { status: "CANCELLED", rejectionReason },
    })

    revalidatePath(`/sales-orders/${soId}`)
    revalidatePath("/sales-orders")
    return { success: true, data: undefined, message: "Sales Order rejected" }
  } catch (error) {
    return { success: false, error: "A system error occurred" }
  }
}

// ─── Start Processing ────────────────────────────────────────────────────────

export async function startSalesOrderProcessing(soId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!hasPermission(session.user.role as Role, "pick_pack_ship", "manage")) {
      return { success: false, error: "You do not have permission" }
    }

    const so = await prisma.salesOrder.findUnique({ where: { id: soId } })
    if (!so) return { success: false, error: "Sales Order not found" }

    const transition = validateStatusTransition("SO", so.status, "PROCESSING")
    if (!transition.valid) return { success: false, error: transition.error! }

    await prisma.salesOrder.update({
      where: { id: soId },
      data: { status: "PROCESSING" },
    })

    revalidatePath(`/sales-orders/${soId}`)
    return { success: true, data: undefined, message: "Sales order processing started" }
  } catch (error) {
    return { success: false, error: "A system error occurred" }
  }
}
