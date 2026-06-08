import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getShipmentById } from "@/actions/fulfillment.actions"
import { hasPermission } from "@/lib/permissions"
import { formatDate, decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { StatusBadge } from "@/components/shared/status-badge"
import { LineItemsTable } from "@/components/shared/line-items-table"
import { ShipmentActions } from "@/components/fulfillment/shipment-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "pick_pack_ship", "manage")) redirect("/dashboard")

  const shipment = await getShipmentById(id)
  if (!shipment) notFound()

  const lineItems = shipment.salesOrder.items.map((item) => ({
    itemCode: item.item.itemCode,
    itemName: item.item.itemName,
    quantity: item.quantity,
    unitPrice: decimalToNumber(item.unitPrice),
    subtotal: decimalToNumber(item.subtotal),
    unit: item.item.unit,
  }))

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Shipments", href: "/shipments" },
          { label: shipment.shipmentNumber },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="doc-number text-base">{shipment.shipmentNumber}</span>
            <StatusBadge status={shipment.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Dikirim {formatDate(shipment.shipDate)} oleh {shipment.shippedBy.name}
          </p>
        </div>
        <ShipmentActions
          shipmentId={shipment.id}
          status={shipment.status}
          canManage={hasPermission(role, "pick_pack_ship", "manage")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Pengiriman</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">No. SO:</span>{" "}
              <span className="doc-number">{shipment.salesOrder.soNumber}</span>
            </p>
            <p><span className="text-muted-foreground">Customer:</span> {shipment.salesOrder.customer.customerName}</p>
            <p><span className="text-muted-foreground">Gudang:</span> {shipment.packOrder.pickOrder.warehouse.warehouseName}</p>
            {shipment.carrier && (
              <p><span className="text-muted-foreground">Kurir:</span> {shipment.carrier}</p>
            )}
            {shipment.trackingNumber && (
              <p><span className="text-muted-foreground">No. Resi:</span> <span className="font-mono">{shipment.trackingNumber}</span></p>
            )}
            {shipment.notes && (
              <p><span className="text-muted-foreground">Catatan:</span> {shipment.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Item Dikirim</CardTitle>
        </CardHeader>
        <CardContent>
          <LineItemsTable items={lineItems} />
        </CardContent>
      </Card>
    </>
  )
}
