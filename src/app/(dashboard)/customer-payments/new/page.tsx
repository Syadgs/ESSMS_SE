import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getInvoicesForPayment } from "@/actions/customer-payment.actions"
import { hasPermission } from "@/lib/permissions"
import { decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { CustomerPaymentForm } from "@/components/customer-payments/customer-payment-form"
import { Card, CardContent } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function NewCustomerPaymentPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "customer_payments", "create")) redirect("/customer-payments")

  const invoices = await getInvoicesForPayment()

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Customer Payments", href: "/customer-payments" },
          { label: "New Entry" },
        ]}
      />
      <PageHeader title="Record Payment Customer" description="Receive customer invoice payment" />
      <Card>
        <CardContent className="pt-6">
          <CustomerPaymentForm
            invoices={invoices.map((inv) => ({
              value: inv.id,
              label: `${inv.invoiceNumber} — ${inv.customer.customerName}`,
              remaining:
                decimalToNumber(inv.totalAmount) - decimalToNumber(inv.paidAmount),
            }))}
          />
        </CardContent>
      </Card>
    </>
  )
}
