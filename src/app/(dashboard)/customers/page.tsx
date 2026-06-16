import Link from "next/link"
import { Plus } from "lucide-react"
import { getCustomers } from "@/actions/customer.actions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { CustomersTable } from "@/components/customers/customers-table"
import { Button } from "@/components/ui/button"
import { decimalToNumber } from "@/lib/utils"

export default async function CustomersPage() {
  const customers = await getCustomers()

  const rows = customers.map((c) => ({
    id: c.id,
    customerCode: c.customerCode,
    customerName: c.customerName,
    contactPerson: c.contactPerson,
    email: c.email,
    phone: c.phone,
    creditLimit: decimalToNumber(c.creditLimit),
  }))

  return (
    <>
      <Breadcrumb items={[{ label: "Customers" }]} />
      <PageHeader
        title="Customers"
        description="Manage customers and credit limits"
      >
        <Button asChild>
          <Link href="/customers/new">
            <Plus className="h-4 w-4" />
            Customers Baru
          </Link>
        </Button>
      </PageHeader>
      <CustomersTable data={rows} />
    </>
  )
}
