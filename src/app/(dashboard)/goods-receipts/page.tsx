import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getGoodsReceipts } from "@/actions/goods-receipt.actions"
import { hasPermission } from "@/lib/permissions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { GRTable } from "@/components/goods-receipts/gr-table"
import { Plus } from "lucide-react"
import type { Role } from "@prisma/client"

export default async function GoodsReceiptsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = session.user.role as Role
  if (!hasPermission(role, "goods_receipts", "view")) redirect("/dashboard")

  const receipts = await getGoodsReceipts()
  const data = receipts.map((gr) => ({
    id: gr.id,
    grNumber: gr.grNumber,
    poNumber: gr.purchaseOrder.poNumber ?? "",
    supplierName: gr.purchaseOrder.supplier?.supplierName ?? "",
    warehouseName: gr.warehouse.warehouseName,
    receivedDate: gr.receivedDate.toISOString(),
    status: gr.status,
  }))

  return (
    <>
      <Breadcrumb items={[{ label: "Goods Receipt" }]} />
      <PageHeader title="Goods Receipt" description="Penerimaan barang dari supplier">
        {hasPermission(role, "goods_receipts", "create") && (
          <Button asChild>
            <Link href="/goods-receipts/new"><Plus className="h-4 w-4 mr-1" />Buat GR</Link>
          </Button>
        )}
      </PageHeader>
      <GRTable data={data} />
    </>
  )
}
