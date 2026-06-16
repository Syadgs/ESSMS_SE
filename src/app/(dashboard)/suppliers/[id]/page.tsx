import { notFound } from "next/navigation"
import { getSupplierById } from "@/actions/supplier.actions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate, decimalToNumber } from "@/lib/utils"

interface SupplierDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function SupplierDetailPage({ params }: SupplierDetailPageProps) {
  const { id } = await params
  const supplier = await getSupplierById(id)

  if (!supplier) notFound()

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Supplier", href: "/suppliers" },
          { label: supplier.supplierName },
        ]}
      />
      <PageHeader title={supplier.supplierName} description={`Kode: ${supplier.supplierCode}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Information Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Code Supplier</dt>
                <dd className="mt-1">
                  <span className="doc-number">{supplier.supplierCode}</span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={supplier.isActive ? "COMPLETED" : "CANCELLED"} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Contact Person</dt>
                <dd className="mt-1 font-medium">{supplier.contactPerson ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium">{supplier.email ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Telepon</dt>
                <dd className="mt-1 font-medium">{supplier.phone ?? "-"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Alamat</dt>
                <dd className="mt-1 font-medium">{supplier.address ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="mt-1 font-medium">{formatDate(supplier.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Diperbarui</dt>
                <dd className="mt-1 font-medium">{formatDate(supplier.updatedAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {supplier.purchaseOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No purchase order</p>
              ) : (
                <ul className="space-y-3">
                  {supplier.purchaseOrders.map((po) => (
                    <li key={po.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                      <span className="doc-number">{po.poNumber}</span>
                      <div className="text-right">
                        <StatusBadge status={po.status} />
                        <p className="text-muted-foreground mt-1">{formatCurrency(decimalToNumber(po.totalAmount))}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Bill Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {supplier.vendorBills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No vendor bill</p>
              ) : (
                <ul className="space-y-3">
                  {supplier.vendorBills.map((bill) => (
                    <li key={bill.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                      <span className="doc-number">{bill.billNumber}</span>
                      <div className="text-right">
                        <StatusBadge status={bill.status} />
                        <p className="text-muted-foreground mt-1">{formatCurrency(decimalToNumber(bill.totalAmount))}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
