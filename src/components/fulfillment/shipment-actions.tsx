"use client"

import { ActionButton } from "@/components/shared/action-button"
import { confirmShipment, deliverShipment } from "@/actions/fulfillment.actions"

interface ShipmentActionsProps {
  shipmentId: string
  status: string
  canManage: boolean
}

export function ShipmentActions({ shipmentId, status, canManage }: ShipmentActionsProps) {
  if (!canManage) return null

  return (
    <div className="flex gap-2 flex-wrap">
      {status === "DRAFT" && (
        <ActionButton label="Confirm Shipment" action={() => confirmShipment(shipmentId)} />
      )}
      {status === "SHIPPED" && (
        <ActionButton
          label="Tandai Sent"
          action={() => deliverShipment(shipmentId)}
          variant="secondary"
        />
      )}
    </div>
  )
}
