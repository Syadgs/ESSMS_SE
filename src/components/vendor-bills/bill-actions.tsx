"use client"

import { useState } from "react"
import { ActionButton } from "@/components/shared/action-button"
import { RejectDialog } from "@/components/shared/reject-dialog"
import { Button } from "@/components/ui/button"
import {
  submitVendorBill,
  approveVendorBill,
  rejectVendorBill,
} from "@/actions/vendor-bill.actions"

interface BillActionsProps {
  billId: string
  status: string
  canCreate: boolean
  canApprove: boolean
}

export function BillActions({ billId, status, canCreate, canApprove }: BillActionsProps) {
  const [showReject, setShowReject] = useState(false)

  return (
    <div className="flex gap-2 flex-wrap">
      {status === "DRAFT" && canCreate && (
        <ActionButton label="Ajukan Persetujuan" action={() => submitVendorBill(billId)} />
      )}
      {status === "PENDING_APPROVAL" && canApprove && (
        <>
          <ActionButton label="Setujui" action={() => approveVendorBill(billId)} />
          <Button variant="destructive" onClick={() => setShowReject(true)}>
            Tolak
          </Button>
          <RejectDialog
            open={showReject}
            onOpenChange={setShowReject}
            title="Tolak Vendor Bill"
            description="Berikan alasan penolakan vendor bill ini."
            action={(note) => rejectVendorBill(billId, note)}
          />
        </>
      )}
    </div>
  )
}
