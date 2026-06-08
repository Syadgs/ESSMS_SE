"use client"

import { ActionButton } from "@/components/shared/action-button"
import { sendInvoice } from "@/actions/invoice.actions"

interface InvoiceActionsProps {
  invoiceId: string
  status: string
  canCreate: boolean
}

export function InvoiceActions({ invoiceId, status, canCreate }: InvoiceActionsProps) {
  if (!canCreate || status !== "DRAFT") return null

  return <ActionButton label="Kirim Invoice" action={() => sendInvoice(invoiceId)} />
}
