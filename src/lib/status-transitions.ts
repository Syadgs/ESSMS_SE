export const VALID_TRANSITIONS = {
  PO: {
    DRAFT: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PARTIALLY_RECEIVED", "FULLY_RECEIVED", "CANCELLED"],
    PARTIALLY_RECEIVED: ["FULLY_RECEIVED"],
    FULLY_RECEIVED: ["BILLED"],
    BILLED: ["PAID"],
  },
  SO: {
    DRAFT: ["PENDING_APPROVAL", "CANCELLED"],
    PENDING_APPROVAL: ["APPROVED", "CANCELLED"],
    APPROVED: ["PROCESSING"],
    PROCESSING: ["PICKING"],
    PICKING: ["PACKING"],
    PACKING: ["SHIPPED"],
    SHIPPED: ["INVOICED"],
    INVOICED: ["PAID"],
  },
  BILL: {
    DRAFT: ["PENDING_APPROVAL"],
    PENDING_APPROVAL: ["APPROVED", "REJECTED"],
    APPROVED: ["PARTIALLY_PAID", "PAID"],
    PARTIALLY_PAID: ["PAID"],
  },
  GR: {
    DRAFT: ["CONFIRMED"],
  },
  PICK: {
    DRAFT: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  },
  PACK: {
    DRAFT: ["COMPLETED", "CANCELLED"],
  },
  SHIP: {
    DRAFT: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
  },
  INVOICE: {
    DRAFT: ["SENT"],
    SENT: ["PARTIALLY_PAID", "PAID", "OVERDUE"],
    PARTIALLY_PAID: ["PAID"],
    OVERDUE: ["PARTIALLY_PAID", "PAID"],
  },
  TRANSFER: {
    DRAFT: ["COMPLETED", "CANCELLED"],
  },
} as const

export type DocType = keyof typeof VALID_TRANSITIONS

export function validateStatusTransition(
  docType: DocType,
  currentStatus: string,
  newStatus: string
): { valid: boolean; error?: string } {
  const transitions = VALID_TRANSITIONS[docType] as unknown as Record<string, readonly string[]>
  const allowed = transitions[currentStatus]

  if (!allowed) {
    return { valid: false, error: `Status ${currentStatus} cannot be changed` }
  }

  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      error: `Transisi of ${currentStatus} to ${newStatus} is not allowed`,
    }
  }

  return { valid: true }
}
