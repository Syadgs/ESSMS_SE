import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { CustomerForm } from "@/components/customers/customer-form"

export default function NewCustomerPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Pelanggan", href: "/customers" },
          { label: "Pelanggan Baru" },
        ]}
      />
      <PageHeader
        title="Pelanggan Baru"
        description="Tambahkan pelanggan baru ke master data"
      />
      <CustomerForm />
    </>
  )
}
