import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getInvoiceById } from "@/actions/invoice.actions"
import { hasPermission } from "@/lib/permissions"
import { formatCurrency, formatDate, decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { StatusBadge } from "@/components/shared/status-badge"
import { DocumentTimeline, INVOICE_TIMELINE } from "@/components/shared/document-timeline"
import { LineItemsTable } from "@/components/shared/line-items-table"
import { InvoiceActions } from "@/components/invoices/invoice-actions"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "invoices", "view")) redirect("/dashboard")

  const invoice = await getInvoiceById(id)
  if (!invoice) notFound()

  const lineItems = invoice.salesOrder.items.map((item) => ({
    itemCode: item.item.itemCode,
    itemName: item.item.itemName,
    quantity: item.quantity,
    unitPrice: decimalToNumber(item.unitPrice),
    subtotal: decimalToNumber(item.subtotal),
    unit: item.item.unit,
    discount: decimalToNumber(item.discount),
  }))

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Invoices", href: "/invoices" },
          { label: invoice.invoiceNumber },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="doc-number text-base">{invoice.invoiceNumber}</span>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Created {formatDate(invoice.invoiceDate)} by {invoice.createdBy.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </a>
          </Button>
          <InvoiceActions
            invoiceId={invoice.id}
            status={invoice.status}
            canCreate={hasPermission(role, "invoices", "create")}
          />
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <DocumentTimeline steps={INVOICE_TIMELINE} currentStatus={invoice.status} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Information Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Nama:</span> {invoice.customer.customerName}</p>
            <p><span className="text-muted-foreground">Kode:</span> {invoice.customer.customerCode}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Information Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">No. SO:</span>{" "}
              <span className="doc-number">{invoice.salesOrder.soNumber}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Overdue:</span>{" "}
              {formatDate(invoice.dueDate)}
            </p>
            <p>
              <span className="text-muted-foreground">Dibayar:</span>{" "}
              {formatCurrency(invoice.paidAmount)}
            </p>
            {invoice.notes && (
              <p><span className="text-muted-foreground">Notes:</span> {invoice.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <LineItemsTable items={lineItems} showDiscount />
          <div className="flex justify-end mt-4 pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-semibold font-mono">{formatCurrency(invoice.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
