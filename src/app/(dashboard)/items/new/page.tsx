import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { ItemForm } from "@/components/items/item-form"

export default function NewItemPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Master Item", href: "/items" },
          { label: "New Item" },
        ]}
      />
      <PageHeader
        title="New Item"
        description="Add item to master data"
      />
      <ItemForm />
    </>
  )
}
