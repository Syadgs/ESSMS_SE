import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPOsForBilling } from "@/actions/vendor-bill.actions"
import { hasPermission } from "@/lib/permissions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { VendorBillForm } from "@/components/vendor-bills/vendor-bill-form"
import { Card, CardContent } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function NewVendorBillPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "vendor_bills", "create")) redirect("/vendor-bills")

  const purchaseOrders = await getPOsForBilling()

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Vendor Bills", href: "/vendor-bills" },
          { label: "Buat Baru" },
        ]}
      />
      <PageHeader title="Buat Vendor Bill" description="Buat tagihan dari purchase order" />
      <Card>
        <CardContent className="pt-6">
          <VendorBillForm
            purchaseOrders={purchaseOrders.map((po) => ({
              value: po.id,
              label: `${po.poNumber} — ${po.supplier.supplierName}`,
              grOptions: po.goodsReceipts.map((gr) => ({
                value: gr.id,
                label: gr.grNumber,
              })),
            }))}
          />
        </CardContent>
      </Card>
    </>
  )
}
