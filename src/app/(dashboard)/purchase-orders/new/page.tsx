import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSuppliers } from "@/actions/master-data.actions"
import { getItems } from "@/actions/item.actions"
import { hasPermission } from "@/lib/permissions"
import { decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { POForm } from "@/components/purchase-orders/po-form"
import { Card, CardContent } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function NewPurchaseOrderPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "purchase_orders", "create")) redirect("/purchase-orders")

  const [suppliers, items] = await Promise.all([getSuppliers(), getItems()])

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Purchase Orders", href: "/purchase-orders" },
          { label: "Create New" },
        ]}
      />
      <PageHeader title="Create Purchase Order" description="Isi detail pesanan pembelian" />
      <Card>
        <CardContent className="pt-6">
          <POForm
            suppliers={suppliers.map((s) => ({
              value: s.id,
              label: `${s.supplierCode} — ${s.supplierName}`,
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
