import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getVendorBillById } from "@/actions/vendor-bill.actions"
import { hasPermission } from "@/lib/permissions"
import { formatCurrency, formatDate, decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { StatusBadge } from "@/components/shared/status-badge"
import { DocumentTimeline, BILL_TIMELINE } from "@/components/shared/document-timeline"
import { LineItemsTable } from "@/components/shared/line-items-table"
import { BillActions } from "@/components/vendor-bills/bill-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function VendorBillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "vendor_bills", "view")) redirect("/dashboard")

  const bill = await getVendorBillById(id)
  if (!bill) notFound()

  const lineItems = bill.items.map((item) => ({
    itemCode: item.item?.itemCode || "-",
    itemName: item.item?.itemName || item.description || "-",
    quantity: decimalToNumber(item.quantity),
    unitPrice: decimalToNumber(item.unitPrice),
    subtotal: decimalToNumber(item.subtotal),
    unit: item.item?.unit || "-",
  }))

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Vendor Bills", href: "/vendor-bills" },
          { label: bill.billNumber },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="doc-number text-base">{bill.billNumber}</span>
            <StatusBadge status={bill.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Created {formatDate(bill.billDate)} by {bill.createdBy.name}
          </p>
        </div>
        <BillActions
          billId={bill.id}
          status={bill.status}
          canCreate={hasPermission(role, "vendor_bills", "create")}
          canApprove={hasPermission(role, "vendor_bills", "approve")}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <DocumentTimeline steps={BILL_TIMELINE} currentStatus={bill.status} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Information Supplier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Nama:</span> {bill.supplier.supplierName}</p>
            <p><span className="text-muted-foreground">Kode:</span> {bill.supplier.supplierCode}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Information Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">No. PO:</span>{" "}
              {bill.purchaseOrder ? (
                <span className="doc-number">{bill.purchaseOrder.poNumber}</span>
              ) : (
                <span className="text-muted-foreground italic">Standalone</span>
              )}
            </p>
            <p>
              <span className="text-muted-foreground">Overdue:</span>{" "}
              {formatDate(bill.dueDate)}
            </p>
            <p>
              <span className="text-muted-foreground">Dibayar:</span>{" "}
              {formatCurrency(bill.paidAmount)}
            </p>
            {bill.rejectionNote && (
              <p className="text-destructive">
                <span className="text-muted-foreground">Reason Rejection:</span> {bill.rejectionNote}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <LineItemsTable items={lineItems} />
          <div className="flex justify-end mt-4 pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-semibold font-mono">{formatCurrency(bill.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
