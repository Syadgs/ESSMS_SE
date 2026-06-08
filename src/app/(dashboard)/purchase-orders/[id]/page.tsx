import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getPurchaseOrderById } from "@/actions/purchase-order.actions"
import { hasPermission } from "@/lib/permissions"
import { formatCurrency, formatDate, decimalToNumber } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { StatusBadge } from "@/components/shared/status-badge"
import { DocumentTimeline, PO_TIMELINE } from "@/components/shared/document-timeline"
import { LineItemsTable } from "@/components/shared/line-items-table"
import { POActions } from "@/components/purchase-orders/po-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Role } from "@prisma/client"

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "purchase_orders", "view")) redirect("/dashboard")

  const po = await getPurchaseOrderById(id)
  if (!po) notFound()

  const lineItems = po.items.map((item) => ({
    itemCode: item.item.itemCode,
    itemName: item.item.itemName,
    quantity: item.quantity,
    unitPrice: decimalToNumber(item.unitPrice),
    subtotal: decimalToNumber(item.subtotal),
    unit: item.item.unit,
  }))

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Purchase Orders", href: "/purchase-orders" },
          { label: po.poNumber },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="doc-number text-base">{po.poNumber}</span>
            <StatusBadge status={po.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Dibuat {formatDate(po.orderDate)} oleh {po.createdBy.name}
          </p>
        </div>
        <POActions
          poId={po.id}
          status={po.status}
          canConfirm={hasPermission(role, "purchase_orders", "confirm")}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <DocumentTimeline steps={PO_TIMELINE} currentStatus={po.status} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Supplier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Nama:</span> {po.supplier.supplierName}</p>
            <p><span className="text-muted-foreground">Kode:</span> {po.supplier.supplierCode}</p>
            {po.supplier.contactPerson && (
              <p><span className="text-muted-foreground">Kontak:</span> {po.supplier.contactPerson}</p>
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
              {formatDate(po.orderDate)}
            </p>
            {po.expectedDate && (
              <p>
                <span className="text-muted-foreground">Diharapkan:</span>{" "}
                {formatDate(po.expectedDate)}
              </p>
            )}
            {po.notes && (
              <p><span className="text-muted-foreground">Catatan:</span> {po.notes}</p>
            )}
            <p>
              <span className="text-muted-foreground">GR:</span> {po.goodsReceipts.length} dokumen
            </p>
            <p>
              <span className="text-muted-foreground">Bill:</span> {po.vendorBills.length} dokumen
            </p>
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
              <p className="text-xl font-semibold font-mono">{formatCurrency(po.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
