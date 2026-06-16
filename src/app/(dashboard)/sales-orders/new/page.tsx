import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getCustomers } from "@/actions/customer.actions"
import { getItems } from "@/actions/item.actions"
import { hasPermission } from "@/lib/permissions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { SOForm } from "@/components/sales-orders/so-form"
import { Card, CardContent } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function NewSalesOrderPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "sales_orders", "create")) redirect("/sales-orders")

  const [customers, items] = await Promise.all([getCustomers(), getItems()])

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Sales Orders", href: "/sales-orders" },
          { label: "Create New" },
        ]}
      />
      <PageHeader title="Create Sales Order" description="Fill in sales order details" />
      <Card>
        <CardContent className="pt-6">
          <SOForm
            customers={customers.map((c) => ({
              value: c.id,
              label: `${c.customerCode} — ${c.customerName}`,
            }))}
            itemOptions={items.map((i) => ({
              value: i.id,
              label: `${i.itemCode} — ${i.itemName}`,
            }))}
          />
        </CardContent>
      </Card>
    </>
  )
}
