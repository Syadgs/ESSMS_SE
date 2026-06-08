import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getShipments } from "@/actions/fulfillment.actions"
import { hasPermission } from "@/lib/permissions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { ShipmentsTable } from "@/components/fulfillment/shipments-table"
import type { Role } from "@prisma/client"

export default async function ShipmentsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "pick_pack_ship", "manage")) redirect("/dashboard")

  const shipments = await getShipments()
  const data = shipments.map((s) => ({
    id: s.id,
    shipmentNumber: s.shipmentNumber,
    soNumber: s.salesOrder.soNumber,
    customerName: s.salesOrder.customer.customerName,
    carrier: s.carrier,
    shipDate: s.shipDate.toISOString(),
    status: s.status,
  }))

  return (
    <>
      <Breadcrumb items={[{ label: "Shipments" }]} />
      <PageHeader title="Shipments" description="Pengiriman barang ke customer" />
      <ShipmentsTable data={data} />
    </>
  )
}
