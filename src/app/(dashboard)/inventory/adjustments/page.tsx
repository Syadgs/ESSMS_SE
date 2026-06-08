import Link from "next/link"
import { Plus } from "lucide-react"
import { getAdjustments } from "@/actions/inventory.actions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { AdjustmentsTable } from "@/components/inventory/adjustments-table"
import { Button } from "@/components/ui/button"

export default async function AdjustmentsPage() {
  const adjustments = await getAdjustments()

  const rows = adjustments.map((adj) => ({
    id: adj.id,
    itemName: adj.item.itemName,
    itemCode: adj.item.itemCode,
    warehouseName: adj.warehouse?.warehouseName ?? "-",
    adjustmentType: adj.adjustmentType,
    quantity: adj.quantity,
    reason: adj.reason,
    adjustedByName: adj.adjustedBy.name,
    createdAt: adj.createdAt.toISOString(),
  }))

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Inventori" },
          { label: "Penyesuaian Stok" },
        ]}
      />
      <PageHeader
        title="Penyesuaian Stok"
        description="Riwayat penambahan dan pengurangan stok inventori"
      >
        <Button asChild>
          <Link href="/inventory/adjustments/new">
            <Plus className="h-4 w-4" />
            Penyesuaian Baru
          </Link>
        </Button>
      </PageHeader>
      <AdjustmentsTable data={rows} />
    </>
  )
}
