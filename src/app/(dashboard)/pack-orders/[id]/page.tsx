import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getPackOrderById } from "@/actions/fulfillment.actions"
import { hasPermission } from "@/lib/permissions"
import { formatDate, decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { StatusBadge } from "@/components/shared/status-badge"
import { LineItemsTable } from "@/components/shared/line-items-table"
import { PackActions } from "@/components/fulfillment/pack-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function PackOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "pick_pack_ship", "manage")) redirect("/dashboard")

  const pack = await getPackOrderById(id)
  if (!pack) notFound()

  const lineItems = pack.pickOrder.salesOrder.items.map((item) => ({
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
          { label: "Pack Orders", href: "/pack-orders" },
          { label: pack.pickOrder.salesOrder.soNumber },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="doc-number text-base">{pack.pickOrder.salesOrder.soNumber}</span>
            <StatusBadge status={pack.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Pack {formatDate(pack.packDate)} oleh {pack.packedBy.name}
          </p>
        </div>
        <PackActions
          packId={pack.id}
          status={pack.status}
          canManage={hasPermission(role, "pick_pack_ship", "manage")}
          hasShipment={!!pack.shipment}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Packing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Customer:</span> {pack.pickOrder.salesOrder.customer.customerName}</p>
            <p><span className="text-muted-foreground">Gudang:</span> {pack.pickOrder.warehouse.warehouseName}</p>
            <p><span className="text-muted-foreground">Jumlah Paket:</span> {pack.packageCount}</p>
            {pack.totalWeight && (
              <p><span className="text-muted-foreground">Berat Total:</span> {decimalToNumber(pack.totalWeight)} kg</p>
            )}
            {pack.notes && (
              <p><span className="text-muted-foreground">Catatan:</span> {pack.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Item Dikemas</CardTitle>
        </CardHeader>
        <CardContent>
          <LineItemsTable items={lineItems} />
        </CardContent>
      </Card>
    </>
  )
}
