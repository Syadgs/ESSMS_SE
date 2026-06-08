import { notFound } from "next/navigation"
import { getTransferById } from "@/actions/inventory.actions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { TransferActions } from "@/components/inventory/transfer-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatDateTime } from "@/lib/utils"

interface TransferDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TransferDetailPage({ params }: TransferDetailPageProps) {
  const { id } = await params
  const transfer = await getTransferById(id)

  if (!transfer) notFound()

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Transfer Stok", href: "/inventory/transfers" },
          { label: transfer.transferNumber },
        ]}
      />
      <PageHeader title="Detail Transfer Stok" description={`Nomor: ${transfer.transferNumber}`}>
        {transfer.status === "DRAFT" && <TransferActions transferId={id} />}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Informasi Transfer</CardTitle>
            <StatusBadge status={transfer.status} />
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">No. Transfer</dt>
                <dd className="mt-1">
                  <span className="doc-number">{transfer.transferNumber}</span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Item</dt>
                <dd className="mt-1 font-medium">
                  <span className="doc-number mr-2">{transfer.item.itemCode}</span>
                  {transfer.item.itemName}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Gudang Asal</dt>
                <dd className="mt-1 font-medium">{transfer.fromWarehouse.warehouseName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Gudang Tujuan</dt>
                <dd className="mt-1 font-medium">{transfer.toWarehouse.warehouseName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Jumlah</dt>
                <dd className="mt-1 font-medium text-navy-900">
                  {transfer.quantity} {transfer.item.unit}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Ditransfer Oleh</dt>
                <dd className="mt-1 font-medium">{transfer.transferredBy.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tanggal Dibuat</dt>
                <dd className="mt-1 font-medium">{formatDateTime(transfer.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Terakhir Diperbarui</dt>
                <dd className="mt-1 font-medium">{formatDate(transfer.updatedAt)}</dd>
              </div>
              {transfer.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Catatan</dt>
                  <dd className="mt-1 font-medium">{transfer.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
              <p className="text-muted-foreground">Perpindahan</p>
              <p className="font-medium mt-1">{transfer.fromWarehouse.warehouseName}</p>
              <p className="text-muted-foreground text-center my-1">↓</p>
              <p className="font-medium">{transfer.toWarehouse.warehouseName}</p>
            </div>
            <div className="rounded-md bg-navy-900/5 border border-navy-900/10 p-4">
              <p className="text-muted-foreground">Kuantitas Transfer</p>
              <p className="text-2xl font-serif text-navy-900 mt-1">
                {transfer.quantity}{" "}
                <span className="text-base font-sans text-muted-foreground">{transfer.item.unit}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
