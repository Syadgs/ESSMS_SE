import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { CustomerForm } from "@/components/customers/customer-form"

export default function NewCustomerPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Customers", href: "/customers" },
          { label: "Customers Baru" },
        ]}
      />
      <PageHeader
        title="Customers Baru"
        description="Add customer to master data"
      />
      <CustomerForm />
    </>
  )
}
