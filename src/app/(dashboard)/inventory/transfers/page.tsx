import Link from "next/link"
import { Plus } from "lucide-react"
import { getTransfers } from "@/actions/inventory.actions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { TransfersTable } from "@/components/inventory/transfers-table"
import { Button } from "@/components/ui/button"

export default async function TransfersPage() {
  const transfers = await getTransfers()

  const rows = transfers.map((trf) => ({
    id: trf.id,
    transferNumber: trf.transferNumber,
    itemName: trf.item.itemName,
    fromWarehouseName: trf.fromWarehouse.warehouseName,
    toWarehouseName: trf.toWarehouse.warehouseName,
    quantity: trf.quantity,
    status: trf.status,
    createdAt: trf.createdAt.toISOString(),
  }))

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Inventori" },
          { label: "Transfer Stok" },
        ]}
      />
      <PageHeader
        title="Transfer Stok"
        description="Kelola perpindahan stok antar gudang"
      >
        <Button asChild>
          <Link href="/inventory/transfers/new">
            <Plus className="h-4 w-4" />
            Transfer Baru
          </Link>
        </Button>
      </PageHeader>
      <TransfersTable data={rows} />
    </>
  )
}
