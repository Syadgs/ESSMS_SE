import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

export interface Reminder {
  id: string
  title: string
  count: number
  href: string
  priority: "high" | "medium" | "low"
  description?: string
}

export async function getRemindersForRole(role: Role): Promise<Reminder[]> {
  const reminders: Reminder[] = []

  // ─── SALES_MANAGER ─────────────────────────────────────────────────────────
  if (role === "SALES_MANAGER" || role === "ADMIN") {
    const soPendingApproval = await prisma.salesOrder.count({
      where: { status: "PENDING_APPROVAL" },
    })
    if (soPendingApproval > 0) {
      reminders.push({
        id: "so-pending-approval",
        title: "Sales Order Pending Approval",
        count: soPendingApproval,
        href: "/sales-orders?status=PENDING_APPROVAL",
        priority: "high",
        description: "SO needs approval or rejection",
      })
    }
  }

  // ─── INVENTORY_MANAGER ─────────────────────────────────────────────────────
  if (role === "INVENTORY_MANAGER" || role === "ADMIN") {
    const [soToFulfill, poToReceive, pickInProgress] = await Promise.all([
      prisma.salesOrder.count({ where: { status: { in: ["APPROVED", "PROCESSING"] } } }),
      prisma.purchaseOrder.count({ where: { status: { in: ["CONFIRMED", "PARTIALLY_RECEIVED"] } } }),
      prisma.pickOrder.count({ where: { status: "IN_PROGRESS" } }),
    ])

    if (soToFulfill > 0) {
      reminders.push({
        id: "so-to-fulfill",
        title: "Sales Order Perlu Processing",
        count: soToFulfill,
        href: "/sales-orders?status=APPROVED",
        priority: "high",
        description: "Approved SO ready for fulfillment",
      })
    }
    if (poToReceive > 0) {
      reminders.push({
        id: "po-to-receive",
        title: "Purchase Orders to Receive",
        count: poToReceive,
        href: "/purchase-orders?status=CONFIRMED",
        priority: "medium",
        description: "PO needs goods receipt",
      })
    }
    if (pickInProgress > 0) {
      reminders.push({
        id: "pick-in-progress",
        title: "Pick Order In Progress",
        count: pickInProgress,
        href: "/pick-orders",
        priority: "low",
        description: "Pick orders currently in progress",
      })
    }
  }

  // ─── AR_ANALYST ────────────────────────────────────────────────────────────
  if (role === "AR_ANALYST" || role === "ADMIN") {
    const [overdueInvoices, soShippedNotInvoiced] = await Promise.all([
      prisma.invoice.count({ where: { status: { in: ["OVERDUE"] } } }),
      prisma.salesOrder.count({ where: { status: "SHIPPED" } }),
    ])

    if (overdueInvoices > 0) {
      reminders.push({
        id: "overdue-invoices",
        title: "Invoice Overdue",
        count: overdueInvoices,
        href: "/invoices?status=OVERDUE",
        priority: "high",
        description: "Invoices past due date",
      })
    }
    if (soShippedNotInvoiced > 0) {
      reminders.push({
        id: "so-shipped-not-invoiced",
        title: "SO Shipped Not Invoiced",
        count: soShippedNotInvoiced,
        href: "/sales-orders?status=SHIPPED",
        priority: "medium",
        description: "Shipped SO needs invoicing",
      })
    }
  }

  // ─── AP_ANALYST ────────────────────────────────────────────────────────────
  if (role === "AP_ANALYST" || role === "ADMIN") {
    const [billsDraft, billsToPay] = await Promise.all([
      prisma.vendorBill.count({ where: { status: "DRAFT" } }),
      prisma.vendorBill.count({ where: { status: { in: ["APPROVED", "PARTIALLY_PAID"] } } }),
    ])

    if (billsDraft > 0) {
      reminders.push({
        id: "bills-draft",
        title: "Vendor Bill Drafts",
        count: billsDraft,
        href: "/vendor-bills?status=DRAFT",
        priority: "medium",
        description: "Bill perlu submitted for approval",
      })
    }
    if (billsToPay > 0) {
      reminders.push({
        id: "bills-to-pay",
        title: "Vendor Bills Ready to Pay",
        count: billsToPay,
        href: "/vendor-bills?status=APPROVED",
        priority: "high",
        description: "Approved bills need payment",
      })
    }
  }

  // ─── ACCOUNTING_MANAGER ────────────────────────────────────────────────────
  if (role === "ACCOUNTING_MANAGER" || role === "ADMIN") {
    const billsPendingApproval = await prisma.vendorBill.count({
      where: { status: "PENDING_APPROVAL" },
    })

    if (billsPendingApproval > 0) {
      reminders.push({
        id: "bills-pending-approval",
        title: "Vendor Bill Pending Approval",
        count: billsPendingApproval,
        href: "/vendor-bills?status=PENDING_APPROVAL",
        priority: "high",
        description: "Bill perlu disetujui by Accounting Manager",
      })
    }
  }

  // ─── PURCHASING_MANAGER ────────────────────────────────────────────────────
  if (role === "PURCHASING_MANAGER" || role === "ADMIN") {
    const poDraft = await prisma.purchaseOrder.count({
      where: { status: "DRAFT" },
    })

    if (poDraft > 0) {
      reminders.push({
        id: "po-draft",
        title: "Purchase Order Drafts",
        count: poDraft,
        href: "/purchase-orders?status=DRAFT",
        priority: "medium",
        description: "PO needs confirmation to supplier",
      })
    }
  }

  return reminders
}
