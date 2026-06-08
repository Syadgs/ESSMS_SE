import { getInventoryItems, getWarehouses } from "@/actions/inventory.actions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { AdjustmentForm } from "@/components/inventory/adjustment-form"

export default async function NewAdjustmentPage() {
  const [items, warehouses] = await Promise.all([getInventoryItems(), getWarehouses()])

  const itemOptions = items.map((item) => ({
    value: item.id,
    label: `${item.itemCode} — ${item.itemName}`,
  }))

  const warehouseOptions = warehouses.map((wh) => ({
    value: wh.id,
    label: wh.warehouseName,
  }))

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Penyesuaian Stok", href: "/inventory/adjustments" },
          { label: "Penyesuaian Baru" },
        ]}
      />
      <PageHeader
        title="Penyesuaian Stok Baru"
        description="Tambah atau kurangi stok item di gudang tertentu"
      />
      <AdjustmentForm itemOptions={itemOptions} warehouseOptions={warehouseOptions} />
    </>
  )
}
