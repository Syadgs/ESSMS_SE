import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getInvoices } from "@/actions/invoice.actions"
import { hasPermission } from "@/lib/permissions"
import { decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { InvoicesTable } from "@/components/invoices/invoices-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Role } from "@prisma/client"

export default async function InvoicesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "invoices", "view")) redirect("/dashboard")

  const invoices = await getInvoices()
  const data = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    soNumber: inv.salesOrder.soNumber,
    customerName: inv.customer.customerName,
    invoiceDate: inv.invoiceDate.toISOString(),
    dueDate: inv.dueDate.toISOString(),
    totalAmount: decimalToNumber(inv.totalAmount),
    status: inv.status,
  }))

  return (
    <>
      <Breadcrumb items={[{ label: "Invoices" }]} />
      <PageHeader title="Invoices" description="Tagihan penjualan ke customer">
        {hasPermission(role, "invoices", "create") && (
          <Button asChild>
            <Link href="/invoices/new">
              <Plus className="h-4 w-4 mr-1" />
              Buat Invoice
            </Link>
          </Button>
        )}
      </PageHeader>
      <InvoicesTable data={data} />
    </>
  )
}
