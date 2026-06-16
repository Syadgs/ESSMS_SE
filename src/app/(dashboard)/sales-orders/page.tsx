import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSalesOrders } from "@/actions/sales-order.actions"
import { hasPermission } from "@/lib/permissions"
import { decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { SOTable } from "@/components/sales-orders/so-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Role } from "@prisma/client"

export default async function SalesOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "sales_orders", "view")) redirect("/dashboard")

  const { status } = await searchParams
  const orders = await getSalesOrders(status)
  const data = orders.map((so) => ({
    id: so.id,
    soNumber: so.soNumber,
    customerName: so.customer.customerName,
    orderDate: so.orderDate.toISOString(),
    totalAmount: decimalToNumber(so.totalAmount),
    status: so.status,
  }))

  return (
    <>
      <Breadcrumb items={[{ label: "Sales Orders" }]} />
      <PageHeader
        title={status ? `Sales Orders — ${status.replace(/_/g, " ")}` : "Sales Orders"}
        description="Manage pesanan penjualan"
      >
        {hasPermission(role, "sales_orders", "create") && (
          <Button asChild>
            <Link href="/sales-orders/new">
              <Plus className="h-4 w-4 mr-1" />
              Create SO
            </Link>
          </Button>
        )}
      </PageHeader>
      <SOTable data={data} />
    </>
  )
}
