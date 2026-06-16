import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getApprovedBillsForPayment } from "@/actions/bill-payment.actions"
import { hasPermission } from "@/lib/permissions"
import { decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { BillPaymentForm } from "@/components/bill-payments/bill-payment-form"
import { Card, CardContent } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function NewBillPaymentPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "vendor_bills", "pay")) redirect("/bill-payments")

  const bills = await getApprovedBillsForPayment()

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Bill Payments", href: "/bill-payments" },
          { label: "New Entry" },
        ]}
      />
      <PageHeader title="Record Payment" description="Pay approved vendor bills" />
      <Card>
        <CardContent className="pt-6">
          <BillPaymentForm
            bills={bills.map((bill) => ({
              value: bill.id,
              label: `${bill.billNumber} — ${bill.supplier.supplierName}`,
              remaining:
                decimalToNumber(bill.totalAmount) - decimalToNumber(bill.paidAmount),
            }))}
          />
        </CardContent>
      </Card>
    </>
  )
}
