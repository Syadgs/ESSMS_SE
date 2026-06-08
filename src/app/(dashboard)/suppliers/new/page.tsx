import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { SupplierForm } from "@/components/suppliers/supplier-form"

export default function NewSupplierPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Supplier", href: "/suppliers" },
          { label: "Supplier Baru" },
        ]}
      />
      <PageHeader
        title="Supplier Baru"
        description="Tambahkan supplier baru ke master data"
      />
      <SupplierForm />
    </>
  )
}
