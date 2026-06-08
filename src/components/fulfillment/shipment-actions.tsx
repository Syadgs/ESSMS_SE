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
        <ActionButton label="Konfirmasi Pengiriman" action={() => confirmShipment(shipmentId)} />
      )}
      {status === "SHIPPED" && (
        <ActionButton
          label="Tandai Terkirim"
          action={() => deliverShipment(shipmentId)}
          variant="secondary"
        />
      )}
    </div>
  )
}
