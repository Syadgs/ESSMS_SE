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
        <ActionButton label="Submit for Approval" action={() => submitSalesOrder(soId)} />
      )}
      {status === "PENDING_APPROVAL" && canApprove && (
        <>
          <ActionButton label="Approve" action={() => approveSalesOrder(soId)} />
          <Button variant="destructive" onClick={() => setShowReject(true)}>
            Reject
          </Button>
          <RejectDialog
            open={showReject}
            onOpenChange={setShowReject}
            title="Reject Sales Order"
            description="Provide a reason for rejecting this sales order."
            action={(note) => rejectSalesOrder(soId, note)}
          />
        </>
      )}
      {status === "APPROVED" && canProcess && (
        <ActionButton label="Start Processing" action={() => startSalesOrderProcessing(soId)} />
      )}
    </div>
  )
}
