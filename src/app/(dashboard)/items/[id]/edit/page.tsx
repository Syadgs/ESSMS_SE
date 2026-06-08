import { notFound } from "next/navigation"
import { getItemById } from "@/actions/item.actions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { ItemForm } from "@/components/items/item-form"
import { decimalToNumber } from "@/lib/utils"

interface EditItemPageProps {
  params: Promise<{ id: string }>
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const { id } = await params
  const item = await getItemById(id)

  if (!item) notFound()

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Master Item", href: "/items" },
          { label: item.itemName, href: `/items/${id}` },
          { label: "Edit" },
        ]}
      />
      <PageHeader
        title="Edit Item"
        description={`Perbarui data untuk ${item.itemName}`}
      />
      <ItemForm
        itemId={id}
        defaultValues={{
          itemCode: item.itemCode,
          itemName: item.itemName,
          itemType: item.itemType,
          description: item.description ?? "",
          unitPrice: decimalToNumber(item.unitPrice),
          costPrice: decimalToNumber(item.costPrice),
          unit: item.unit,
          category: item.category ?? "",
        }}
      />
    </>
  )
}
