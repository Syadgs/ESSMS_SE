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
          { label: "Stock Adjustments", href: "/inventory/adjustments" },
          { label: "Adjustment Baru" },
        ]}
      />
      <PageHeader
        title="Stock Adjustments Baru"
        description="Increase or decrease stock in a warehouse"
      />
      <AdjustmentForm itemOptions={itemOptions} warehouseOptions={warehouseOptions} />
    </>
  )
}
