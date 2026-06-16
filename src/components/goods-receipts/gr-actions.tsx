"use client"

import { ActionButton } from "@/components/shared/action-button"
import { confirmGoodsReceipt } from "@/actions/goods-receipt.actions"

interface GRActionsProps {
  grId: string
  status: string
  canConfirm: boolean
}

export function GRActions({ grId, status, canConfirm }: GRActionsProps) {
  if (status !== "DRAFT" || !canConfirm) return null

  return (
    <ActionButton label="Confirm GR" action={() => confirmGoodsReceipt(grId)} />
  )
}
