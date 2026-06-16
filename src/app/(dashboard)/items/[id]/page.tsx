import Link from "next/link"
import { notFound } from "next/navigation"
import { Pencil } from "lucide-react"
import { getItemById } from "@/actions/item.actions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate, decimalToNumber } from "@/lib/utils"
import type { ItemType } from "@prisma/client"

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  INVENTORY: "Inventory",
  NON_INVENTORY: "Non-Inventory",
  SERVICE: "Service",
}

interface ItemDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params
  const item = await getItemById(id)

  if (!item) notFound()

  const totalStock = item.inventoryStocks.reduce((sum, s) => sum + s.quantity, 0)

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Master Item", href: "/items" },
          { label: item.itemName },
        ]}
      />
      <PageHeader title={item.itemName} description={`Kode: ${item.itemCode}`}>
        <Button variant="outline" asChild>
          <Link href={`/items/${id}/edit`}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Information Item</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Code Item</dt>
                <dd className="mt-1">
                  <span className="doc-number">{item.itemCode}</span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="mt-1 font-medium">{ITEM_TYPE_LABELS[item.itemType]}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Unit Price</dt>
                <dd className="mt-1 font-medium">{formatCurrency(decimalToNumber(item.unitPrice))}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Cost Price</dt>
                <dd className="mt-1 font-medium">{formatCurrency(decimalToNumber(item.costPrice))}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Unit</dt>
                <dd className="mt-1 font-medium">{item.unit}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Kategori</dt>
                <dd className="mt-1 font-medium">{item.category ?? "-"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Deskripsi</dt>
                <dd className="mt-1 font-medium">{item.description ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="mt-1 font-medium">{formatDate(item.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Diperbarui</dt>
                <dd className="mt-1 font-medium">{formatDate(item.updatedAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stok</CardTitle>
          </CardHeader>
          <CardContent>
            {item.itemType !== "INVENTORY" ? (
              <p className="text-sm text-muted-foreground">Item ini bukan tipe persediaan</p>
            ) : item.inventoryStocks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stock on record</p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md bg-navy-900/5 border border-navy-900/10 p-4">
                  <p className="text-sm text-muted-foreground">Total Stok</p>
                  <p className="text-2xl font-serif text-navy-900 mt-1">
                    {totalStock} <span className="text-base font-sans text-muted-foreground">{item.unit}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  {item.inventoryStocks.map((stock) => (
                    <div
                      key={stock.id}
                      className="flex justify-between items-center py-2 border-b last:border-0 text-sm"
                    >
                      <span>{stock.warehouse.warehouseName}</span>
                      <span className="font-medium">
                        {stock.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
