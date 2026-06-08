import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { ItemForm } from "@/components/items/item-form"

export default function NewItemPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Master Item", href: "/items" },
          { label: "Item Baru" },
        ]}
      />
      <PageHeader
        title="Item Baru"
        description="Tambahkan item baru ke master data"
      />
      <ItemForm />
    </>
  )
}
