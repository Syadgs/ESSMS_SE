import { notFound } from "next/navigation"
import { getCustomerById } from "@/actions/customer.actions"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate, decimalToNumber } from "@/lib/utils"

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params
  const customer = await getCustomerById(id)

  if (!customer) notFound()

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Pelanggan", href: "/customers" },
          { label: customer.customerName },
        ]}
      />
      <PageHeader title={customer.customerName} description={`Kode: ${customer.customerCode}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Kode Pelanggan</dt>
                <dd className="mt-1">
                  <span className="doc-number">{customer.customerCode}</span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={customer.isActive ? "COMPLETED" : "CANCELLED"} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Kontak Person</dt>
                <dd className="mt-1 font-medium">{customer.contactPerson ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium">{customer.email ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Telepon</dt>
                <dd className="mt-1 font-medium">{customer.phone ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Batas Kredit</dt>
                <dd className="mt-1 font-medium text-amber-700">
                  {formatCurrency(decimalToNumber(customer.creditLimit))}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Alamat</dt>
                <dd className="mt-1 font-medium">{customer.address ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Dibuat</dt>
                <dd className="mt-1 font-medium">{formatDate(customer.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Diperbarui</dt>
                <dd className="mt-1 font-medium">{formatDate(customer.updatedAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Order Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.salesOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada sales order</p>
              ) : (
                <ul className="space-y-3">
                  {customer.salesOrders.map((so) => (
                    <li key={so.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                      <span className="doc-number">{so.soNumber}</span>
                      <div className="text-right">
                        <StatusBadge status={so.status} />
                        <p className="text-muted-foreground mt-1">{formatCurrency(decimalToNumber(so.totalAmount))}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada invoice</p>
              ) : (
                <ul className="space-y-3">
                  {customer.invoices.map((inv) => (
                    <li key={inv.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                      <span className="doc-number">{inv.invoiceNumber}</span>
                      <div className="text-right">
                        <StatusBadge status={inv.status} />
                        <p className="text-muted-foreground mt-1">{formatCurrency(decimalToNumber(inv.totalAmount))}</p>
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
