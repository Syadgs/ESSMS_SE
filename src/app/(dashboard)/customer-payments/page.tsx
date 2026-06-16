import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getCustomerPayments } from "@/actions/customer-payment.actions"
import { hasPermission } from "@/lib/permissions"
import { decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { CustomerPaymentsTable } from "@/components/customer-payments/customer-payments-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Role } from "@prisma/client"

export default async function CustomerPaymentsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "customer_payments", "create")) redirect("/dashboard")

  const payments = await getCustomerPayments()
  const data = payments.map((p) => ({
    id: p.id,
    paymentNumber: p.paymentNumber,
    invoiceNumber: p.invoice.invoiceNumber,
    customerName: p.invoice.customer.customerName,
    amount: decimalToNumber(p.amount),
    paymentMethod: p.paymentMethod,
    paymentDate: p.paymentDate.toISOString(),
  }))

  return (
    <>
      <Breadcrumb items={[{ label: "Customer Payments" }]} />
      <PageHeader title="Customer Payments" description="Payment from customers">
        <Button asChild>
          <Link href="/customer-payments/new">
            <Plus className="h-4 w-4 mr-1" />
            Record Payment
          </Link>
        </Button>
      </PageHeader>
      <CustomerPaymentsTable data={data} />
    </>
  )
}
