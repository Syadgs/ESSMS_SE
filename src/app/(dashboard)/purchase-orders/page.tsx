import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPurchaseOrders } from "@/actions/purchase-order.actions"
import { hasPermission } from "@/lib/permissions"
import { decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { POTable } from "@/components/purchase-orders/po-table"
import { Plus } from "lucide-react"
import type { Role } from "@prisma/client"

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "purchase_orders", "view")) redirect("/dashboard")

  const { status } = await searchParams
  const orders = await getPurchaseOrders(status)
  const data = orders.map((po) => ({
    id: po.id,
    poNumber: po.poNumber,
    supplierName: po.supplier.supplierName,
    orderDate: po.orderDate.toISOString(),
    totalAmount: decimalToNumber(po.totalAmount),
    status: po.status,
  }))

  const canCreate = hasPermission(role, "purchase_orders", "create")

  return (
    <>
      <Breadcrumb items={[{ label: "Purchase Orders" }]} />
      <PageHeader title={status ? `Purchase Orders — ${status.replace(/_/g, " ")}` : "Purchase Orders"} description="Manage purchase orders to suppliers">
        {canCreate && (
          <Button asChild>
            <Link href="/purchase-orders/new">
              <Plus className="h-4 w-4 mr-1" />
              Create PO
            </Link>
          </Button>
        )}
      </PageHeader>
      <POTable data={data} />
    </>
  )
}
