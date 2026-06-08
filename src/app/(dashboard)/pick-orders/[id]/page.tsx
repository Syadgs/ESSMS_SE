import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getPickOrderById } from "@/actions/fulfillment.actions"
import { hasPermission } from "@/lib/permissions"
import { formatDate, decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { StatusBadge } from "@/components/shared/status-badge"
import { LineItemsTable } from "@/components/shared/line-items-table"
import { PickActions } from "@/components/fulfillment/pick-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function PickOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "pick_pack_ship", "manage")) redirect("/dashboard")

  const pick = await getPickOrderById(id)
  if (!pick) notFound()

  const lineItems = pick.salesOrder.items.map((item) => ({
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
          { label: "Pick Orders", href: "/pick-orders" },
          { label: pick.salesOrder.soNumber },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="doc-number text-base">{pick.salesOrder.soNumber}</span>
            <StatusBadge status={pick.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Pick {formatDate(pick.pickDate)} oleh {pick.pickedBy.name}
          </p>
        </div>
        <PickActions
          pickId={pick.id}
          status={pick.status}
          canManage={hasPermission(role, "pick_pack_ship", "manage")}
          hasPackOrder={!!pick.packOrder}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Customer:</span> {pick.salesOrder.customer.customerName}</p>
            <p><span className="text-muted-foreground">Gudang:</span> {pick.warehouse.warehouseName}</p>
            {pick.notes && (
              <p><span className="text-muted-foreground">Catatan:</span> {pick.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Item untuk Di-pick</CardTitle>
        </CardHeader>
        <CardContent>
          <LineItemsTable items={lineItems} />
        </CardContent>
      </Card>
    </>
  )
}
