import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getBillPayments } from "@/actions/bill-payment.actions"
import { hasPermission } from "@/lib/permissions"
import { decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { BillPaymentsTable } from "@/components/bill-payments/bill-payments-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Role } from "@prisma/client"

export default async function BillPaymentsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "vendor_bills", "pay")) redirect("/dashboard")

  const payments = await getBillPayments()
  const data = payments.map((p) => ({
    id: p.id,
    paymentNumber: p.paymentNumber,
    billNumber: p.vendorBill.billNumber,
    supplierName: p.vendorBill.supplier.supplierName,
    amount: decimalToNumber(p.amount),
    paymentMethod: p.paymentMethod,
    paymentDate: p.paymentDate.toISOString(),
  }))

  return (
    <>
      <Breadcrumb items={[{ label: "Bill Payments" }]} />
      <PageHeader title="Bill Payments" description="Pembayaran tagihan supplier">
        <Button asChild>
          <Link href="/bill-payments/new">
            <Plus className="h-4 w-4 mr-1" />
            Catat Pembayaran
          </Link>
        </Button>
      </PageHeader>
      <BillPaymentsTable data={data} />
    </>
  )
}
