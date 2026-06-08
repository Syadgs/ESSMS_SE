import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  getPickOrders,
  getApprovedSalesOrdersForPick,
} from "@/actions/fulfillment.actions"
import { getWarehouses } from "@/actions/inventory.actions"
import { hasPermission } from "@/lib/permissions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { PickOrdersTable } from "@/components/fulfillment/pick-orders-table"
import { PickForm } from "@/components/fulfillment/pick-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function PickOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "pick_pack_ship", "manage")) redirect("/dashboard")

  const [picks, salesOrders, warehouses] = await Promise.all([
    getPickOrders(),
    getApprovedSalesOrdersForPick(),
    getWarehouses(),
  ])

  const data = picks.map((pick) => ({
    id: pick.id,
    soNumber: pick.salesOrder.soNumber,
    customerName: pick.salesOrder.customer.customerName,
    warehouseName: pick.warehouse.warehouseName,
    pickDate: pick.pickDate.toISOString(),
    status: pick.status,
  }))

  return (
    <>
      <Breadcrumb items={[{ label: "Pick Orders" }]} />
      <PageHeader title="Pick Orders" description="Pengambilan barang dari gudang" />

      {salesOrders.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Buat Pick Order Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <PickForm
              salesOrders={salesOrders.map((so) => ({
                value: so.id,
                label: `${so.soNumber} — ${so.customer.customerName}`,
              }))}
              warehouses={warehouses.map((w) => ({
                value: w.id,
                label: w.warehouseName,
              }))}
            />
          </CardContent>
        </Card>
      )}

      <PickOrdersTable data={data} />
    </>
  )
}
