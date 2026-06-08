import Link from "next/link"
import { Plus } from "lucide-react"
import { getItems } from "@/actions/item.actions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { ItemsTable } from "@/components/items/items-table"
import { Button } from "@/components/ui/button"
import { decimalToNumber } from "@/lib/utils"

export default async function ItemsPage() {
  const items = await getItems()

  const rows = items.map((item) => ({
    id: item.id,
    itemCode: item.itemCode,
    itemName: item.itemName,
    itemType: item.itemType,
    unitPrice: decimalToNumber(item.unitPrice),
    unit: item.unit,
    category: item.category,
  }))

  return (
    <>
      <Breadcrumb items={[{ label: "Master Item" }]} />
      <PageHeader
        title="Master Item"
        description="Kelola data item, harga, dan informasi produk"
      >
        <Button asChild>
          <Link href="/items/new">
            <Plus className="h-4 w-4" />
            Item Baru
          </Link>
        </Button>
      </PageHeader>
      <ItemsTable data={rows} />
    </>
  )
}
