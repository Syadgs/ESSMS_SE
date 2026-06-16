"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ActionButton } from "@/components/shared/action-button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { confirmPurchaseOrder, cancelPurchaseOrder } from "@/actions/purchase-order.actions"

interface POActionsProps {
  poId: string
  status: string
  canConfirm: boolean
}

export function POActions({ poId, status, canConfirm }: POActionsProps) {
  const router = useRouter()
  const [showCancel, setShowCancel] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (status !== "DRAFT" || !canConfirm) return null

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelPurchaseOrder(poId)
      if (result.success) {
        toast.success(result.message)
        setShowCancel(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex gap-2">
      <ActionButton label="Confirm PO" action={() => confirmPurchaseOrder(poId)} />
      <Button variant="destructive" onClick={() => setShowCancel(true)}>
        Cancelkan
      </Button>
      <ConfirmDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        title="Cancelkan Purchase Order"
        description="Are you sure you want to cancel this PO?"
        variant="danger"
        confirmLabel="Ya, Cancelkan"
        loading={isPending}
        onConfirm={handleCancel}
      />
    </div>
  )
}
