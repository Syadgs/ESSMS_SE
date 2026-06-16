import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { SupplierForm } from "@/components/suppliers/supplier-form"

export default function NewSupplierPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Supplier", href: "/suppliers" },
          { label: "New Supplier" },
        ]}
      />
      <PageHeader
        title="New Supplier"
        description="Add supplier to master data"
      />
      <SupplierForm />
    </>
  )
}
