"use client"

import { useState } from "react"
import { ActionButton } from "@/components/shared/action-button"
import { RejectDialog } from "@/components/shared/reject-dialog"
import { Button } from "@/components/ui/button"
import {
  submitSalesOrder,
  approveSalesOrder,
  rejectSalesOrder,
  startSalesOrderProcessing,
} from "@/actions/sales-order.actions"

interface SOActionsProps {
  soId: string
  status: string
  canCreate: boolean
  canApprove: boolean
  canProcess: boolean
}

export function SOActions({ soId, status, canCreate, canApprove, canProcess }: SOActionsProps) {
  const [showReject, setShowReject] = useState(false)

  return (
    <div className="flex gap-2 flex-wrap">
      {status === "DRAFT" && canCreate && (
        <ActionButton label="Ajukan Persetujuan" action={() => submitSalesOrder(soId)} />
      )}
      {status === "PENDING_APPROVAL" && canApprove && (
        <>
          <ActionButton label="Setujui" action={() => approveSalesOrder(soId)} />
          <Button variant="destructive" onClick={() => setShowReject(true)}>
            Tolak
          </Button>
          <RejectDialog
            open={showReject}
            onOpenChange={setShowReject}
            title="Tolak Sales Order"
            description="Berikan alasan penolakan sales order ini."
            action={(note) => rejectSalesOrder(soId, note)}
          />
        </>
      )}
      {status === "APPROVED" && canProcess && (
        <ActionButton label="Mulai Proses" action={() => startSalesOrderProcessing(soId)} />
      )}
    </div>
  )
}
