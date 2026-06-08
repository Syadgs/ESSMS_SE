import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getSalesOrderById } from "@/actions/sales-order.actions"
import { hasPermission } from "@/lib/permissions"
import { formatCurrency, formatDate, decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { StatusBadge } from "@/components/shared/status-badge"
import { DocumentTimeline, SO_TIMELINE } from "@/components/shared/document-timeline"
import { LineItemsTable } from "@/components/shared/line-items-table"
import { SOActions } from "@/components/sales-orders/so-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function SalesOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "sales_orders", "view")) redirect("/dashboard")

  const so = await getSalesOrderById(id)
  if (!so) notFound()

  const lineItems = so.items.map((item) => ({
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
          { label: "Sales Orders", href: "/sales-orders" },
          { label: so.soNumber },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="doc-number text-base">{so.soNumber}</span>
            <StatusBadge status={so.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Dibuat {formatDate(so.orderDate)} oleh {so.createdBy.name}
          </p>
        </div>
        <SOActions
          soId={so.id}
          status={so.status}
          canCreate={hasPermission(role, "sales_orders", "create")}
          canApprove={hasPermission(role, "sales_orders", "approve")}
          canProcess={hasPermission(role, "pick_pack_ship", "manage")}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <DocumentTimeline steps={SO_TIMELINE} currentStatus={so.status} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Nama:</span> {so.customer.customerName}</p>
            <p><span className="text-muted-foreground">Kode:</span> {so.customer.customerCode}</p>
            {so.customer.contactPerson && (
              <p><span className="text-muted-foreground">Kontak:</span> {so.customer.contactPerson}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Tanggal Order:</span>{" "}
              {formatDate(so.orderDate)}
            </p>
            {so.deliveryDate && (
              <p>
                <span className="text-muted-foreground">Tanggal Kirim:</span>{" "}
                {formatDate(so.deliveryDate)}
              </p>
            )}
            {so.approvedBy && (
              <p>
                <span className="text-muted-foreground">Disetujui oleh:</span> {so.approvedBy.name}
              </p>
            )}
            {so.rejectionReason && (
              <p className="text-destructive">
                <span className="text-muted-foreground">Alasan Tolak:</span> {so.rejectionReason}
              </p>
            )}
            {so.notes && (
              <p><span className="text-muted-foreground">Catatan:</span> {so.notes}</p>
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
              <p className="text-xl font-semibold font-mono">{formatCurrency(so.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
