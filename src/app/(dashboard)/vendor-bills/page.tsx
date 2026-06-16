import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getVendorBills } from "@/actions/vendor-bill.actions"
import { hasPermission } from "@/lib/permissions"
import { decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { VendorBillsTable } from "@/components/vendor-bills/vendor-bills-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Role } from "@prisma/client"

export default async function VendorBillsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "vendor_bills", "view")) redirect("/dashboard")

  const { status } = await searchParams
  const bills = await getVendorBills(status)
  const data = bills.map((bill) => ({
    id: bill.id,
    billNumber: bill.billNumber,
    supplierName: bill.supplier.supplierName,
    // Nullable for standalone bills
    poNumber: bill.purchaseOrder?.poNumber ?? "—",
    billDate: bill.billDate.toISOString(),
    dueDate: bill.dueDate.toISOString(),
    totalAmount: decimalToNumber(bill.totalAmount),
    status: bill.status,
    billType: bill.billType,
  }))

  return (
    <>
      <Breadcrumb items={[{ label: "Vendor Bills" }]} />
      <PageHeader
        title={status ? `Vendor Bills — ${status.replace(/_/g, " ")}` : "Vendor Bills"}
        description="Bill from suppliers"
      >
        {hasPermission(role, "vendor_bills", "create") && (
          <Button asChild>
            <Link href="/vendor-bills/new">
              <Plus className="h-4 w-4 mr-1" />
              Create Bill
            </Link>
          </Button>
        )}
      </PageHeader>
      <VendorBillsTable data={data} />
    </>
  )
}
