import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getGoodsReceiptById } from "@/actions/goods-receipt.actions"
import { hasPermission } from "@/lib/permissions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { StatusBadge } from "@/components/shared/status-badge"
import { DocumentTimeline, GR_TIMELINE } from "@/components/shared/document-timeline"
import { GRActions } from "@/components/goods-receipts/gr-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Role } from "@prisma/client"

export default async function GoodsReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, "goods_receipts", "view")) redirect("/dashboard")

  const gr = await getGoodsReceiptById(id)
  if (!gr) notFound()

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Goods Receipt", href: "/goods-receipts" },
          { label: gr.grNumber },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="doc-number text-base">{gr.grNumber}</span>
            <StatusBadge status={gr.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Diterima {formatDate(gr.receivedDate)} oleh {gr.receivedBy.name}
          </p>
        </div>
        <GRActions
          grId={gr.id}
          status={gr.status}
          canConfirm={hasPermission(role, "goods_receipts", "confirm")}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <DocumentTimeline steps={GR_TIMELINE} currentStatus={gr.status} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi PO & Supplier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">No. PO:</span>{" "}
              <span className="doc-number">{gr.purchaseOrder.poNumber}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Supplier:</span>{" "}
              {gr.purchaseOrder.supplier.supplierName}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Penerimaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Gudang:</span>{" "}
              {gr.warehouse.warehouseName}
            </p>
            <p>
              <span className="text-muted-foreground">Tanggal:</span>{" "}
              {formatDate(gr.receivedDate)}
            </p>
            {gr.notes && (
              <p><span className="text-muted-foreground">Catatan:</span> {gr.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Item Diterima</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty Order</TableHead>
                <TableHead className="text-right">Qty Diterima</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gr.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="font-mono text-xs">{item.item.itemCode}</span>
                    <span className="ml-2">{item.item.itemName}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono">{item.quantityOrdered}</TableCell>
                  <TableCell className="text-right font-mono">{item.quantityReceived}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-4 pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total PO</p>
              <p className="text-xl font-semibold font-mono">
                {formatCurrency(gr.purchaseOrder.totalAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
