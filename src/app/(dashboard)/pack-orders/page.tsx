import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPackOrders } from "@/actions/fulfillment.actions"
import { hasPermission } from "@/lib/permissions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { PackOrdersTable } from "@/components/fulfillment/pack-orders-table"
import type { Role } from "@prisma/client"

export default async function PackOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "pick_pack_ship", "manage")) redirect("/dashboard")

  const packs = await getPackOrders()
  const data = packs.map((pack) => ({
    id: pack.id,
    soNumber: pack.pickOrder.salesOrder.soNumber,
    customerName: pack.pickOrder.salesOrder.customer.customerName,
    packageCount: pack.packageCount,
    packDate: pack.packDate.toISOString(),
    status: pack.status,
  }))

  return (
    <>
      <Breadcrumb items={[{ label: "Pack Orders" }]} />
      <PageHeader title="Pack Orders" description="Packing for shipment" />
      <PackOrdersTable data={data} />
    </>
  )
}
