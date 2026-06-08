import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPOsForReceipt } from "@/actions/goods-receipt.actions"
import { getWarehouses } from "@/actions/inventory.actions"
import { hasPermission } from "@/lib/permissions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { GRForm } from "@/components/goods-receipts/gr-form"
import { Card, CardContent } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function NewGoodsReceiptPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "goods_receipts", "create")) redirect("/goods-receipts")

  const [purchaseOrders, warehouses] = await Promise.all([
    getPOsForReceipt(),
    getWarehouses(),
  ])

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Goods Receipt", href: "/goods-receipts" },
          { label: "Buat Baru" },
        ]}
      />
      <PageHeader title="Buat Goods Receipt" description="Catat penerimaan barang dari supplier" />
      <Card>
        <CardContent className="pt-6">
          <GRForm
            purchaseOrders={purchaseOrders.map((po) => ({
              value: po.id,
              label: `${po.poNumber} — ${po.supplier.supplierName}`,
              items: po.items.map((item) => ({
                id: item.id,
                itemId: item.itemId,
                itemName: `${item.item.itemCode} — ${item.item.itemName}`,
                quantity: item.quantity,
              })),
            }))}
            warehouses={warehouses.map((w) => ({
              value: w.id,
              label: w.warehouseName,
            }))}
          />
        </CardContent>
      </Card>
    </>
  )
}
