"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ActionButton } from "@/components/shared/action-button"
import { Button } from "@/components/ui/button"
import {
  startPickOrder,
  completePickOrder,
  createPackOrder,
} from "@/actions/fulfillment.actions"

interface PickActionsProps {
  pickId: string
  status: string
  canManage: boolean
  hasPackOrder: boolean
}

export function PickActions({ pickId, status, canManage, hasPackOrder }: PickActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (!canManage) return null

  function handleCreatePack() {
    startTransition(async () => {
      const result = await createPackOrder({ pickOrderId: pickId, packageCount: 1 })
      if (result.success) {
        toast.success(result.message)
        router.push(`/pack-orders/${result.data.id}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {status === "DRAFT" && (
        <ActionButton label="Start Picking" action={() => startPickOrder(pickId)} />
      )}
      {status === "IN_PROGRESS" && (
        <ActionButton label="Completedkan Picking" action={() => completePickOrder(pickId)} />
      )}
      {status === "COMPLETED" && !hasPackOrder && (
        <Button onClick={handleCreatePack} disabled={isPending}>
          {isPending ? "Creating..." : "Create Pack Order"}
        </Button>
      )}
    </div>
  )
}
