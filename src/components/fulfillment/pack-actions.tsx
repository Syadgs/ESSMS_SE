"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ActionButton } from "@/components/shared/action-button"
import { Button } from "@/components/ui/button"
import { completePackOrder, createShipment } from "@/actions/fulfillment.actions"

interface PackActionsProps {
  packId: string
  status: string
  canManage: boolean
  hasShipment: boolean
}

export function PackActions({ packId, status, canManage, hasShipment }: PackActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (!canManage) return null

  function handleCreateShipment() {
    startTransition(async () => {
      const result = await createShipment({ packOrderId: packId })
      if (result.success) {
        toast.success(result.message)
        router.push(`/shipments/${result.data.id}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {status === "DRAFT" && (
        <ActionButton label="Completedkan Packing" action={() => completePackOrder(packId)} />
      )}
      {status === "COMPLETED" && !hasShipment && (
        <Button onClick={handleCreateShipment} disabled={isPending}>
          {isPending ? "Creating..." : "Create Shipment"}
        </Button>
      )}
    </div>
  )
}
