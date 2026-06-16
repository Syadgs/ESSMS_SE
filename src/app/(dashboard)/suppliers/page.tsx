import Link from "next/link"
import { Plus } from "lucide-react"
import { getSuppliers } from "@/actions/supplier.actions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { SuppliersTable } from "@/components/suppliers/suppliers-table"
import { Button } from "@/components/ui/button"

export default async function SuppliersPage() {
  const suppliers = await getSuppliers()

  const rows = suppliers.map((s) => ({
    id: s.id,
    supplierCode: s.supplierCode,
    supplierName: s.supplierName,
    contactPerson: s.contactPerson,
    email: s.email,
    phone: s.phone,
  }))

  return (
    <>
      <Breadcrumb items={[{ label: "Supplier" }]} />
      <PageHeader
        title="Supplier"
        description="Manage suppliers and vendors"
      >
        <Button asChild>
          <Link href="/suppliers/new">
            <Plus className="h-4 w-4" />
            New Supplier
          </Link>
        </Button>
      </PageHeader>
      <SuppliersTable data={rows} />
    </>
  )
}
