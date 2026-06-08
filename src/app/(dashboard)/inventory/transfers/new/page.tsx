import { getInventoryItems, getWarehouses } from "@/actions/inventory.actions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { TransferForm } from "@/components/inventory/transfer-form"

export default async function NewTransferPage() {
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
          { label: "Transfer Stok", href: "/inventory/transfers" },
          { label: "Transfer Baru" },
        ]}
      />
      <PageHeader
        title="Transfer Stok Baru"
        description="Pindahkan stok item dari satu gudang ke gudang lain"
      />
      <TransferForm itemOptions={itemOptions} warehouseOptions={warehouseOptions} />
    </>
  )
}
