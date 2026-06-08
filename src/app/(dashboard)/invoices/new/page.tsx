import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getShippedSalesOrdersForInvoice } from "@/actions/invoice.actions"
import { hasPermission } from "@/lib/permissions"
import { decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { InvoiceForm } from "@/components/invoices/invoice-form"
import { Card, CardContent } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function NewInvoicePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "invoices", "create")) redirect("/invoices")

  const salesOrders = await getShippedSalesOrdersForInvoice()
  const eligible = salesOrders.filter((so) => so.status === "SHIPPED")

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Invoices", href: "/invoices" },
          { label: "Buat Baru" },
        ]}
      />
      <PageHeader title="Buat Invoice" description="Buat tagihan dari sales order yang sudah dikirim" />
      <Card>
        <CardContent className="pt-6">
          <InvoiceForm
            salesOrders={eligible.map((so) => ({
              value: so.id,
              label: `${so.soNumber} — ${so.customer.customerName}`,
              total: decimalToNumber(so.totalAmount),
            }))}
          />
        </CardContent>
      </Card>
    </>
  )
}
