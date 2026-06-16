import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { getARAgingReport } from "@/lib/reports/ar-aging"
import { formatCurrency } from "@/lib/utils"
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

const ALLOWED_ROLES: Role[] = ["AR_ANALYST", "ACCOUNTING_MANAGER", "ADMIN"]

export default async function ARAgingPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (!ALLOWED_ROLES.includes(session.user.role as Role)) redirect("/dashboard")

  const rows = await getARAgingReport()

  const totals = rows.reduce(
    (acc, row) => ({
      current: acc.current + row.current,
      days1_30: acc.days1_30 + row.days1_30,
      days31_60: acc.days31_60 + row.days31_60,
      days61_90: acc.days61_90 + row.days61_90,
      days90plus: acc.days90plus + row.days90plus,
      total: acc.total + row.total,
    }),
    { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, days90plus: 0, total: 0 }
  )

  return (
    <div>
      <PageHeader
        title="Reports AR Aging"
        description="Accounts receivable aging analysis"
      />

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-6">
        {[
          { label: "Current", value: totals.current, color: "text-green-600" },
          { label: "1-30 Days", value: totals.days1_30, color: "text-blue-600" },
          { label: "31-60 Days", value: totals.days31_60, color: "text-amber-600" },
          { label: "61-90 Days", value: totals.days61_90, color: "text-orange-600" },
          { label: "> 90 Days", value: totals.days90plus, color: "text-red-600" },
          { label: "Grand Total", value: totals.total, color: "text-foreground font-bold" },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <p className={`text-sm font-semibold ${item.color}`}>{formatCurrency(item.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detail by Customer</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No outstanding receivables.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">1-30 Days</TableHead>
                    <TableHead className="text-right">31-60 Days</TableHead>
                    <TableHead className="text-right">61-90 Days</TableHead>
                    <TableHead className="text-right">&gt; 90 Days</TableHead>
                    <TableHead className="text-right font-semibold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.customerId}>
                      <TableCell className="font-mono text-xs">{row.customerCode}</TableCell>
                      <TableCell className="font-medium">{row.customerName}</TableCell>
                      <TableCell className="text-right text-green-700">{formatCurrency(row.current)}</TableCell>
                      <TableCell className="text-right text-blue-700">{formatCurrency(row.days1_30)}</TableCell>
                      <TableCell className="text-right text-amber-700">{formatCurrency(row.days31_60)}</TableCell>
                      <TableCell className="text-right text-orange-700">{formatCurrency(row.days61_90)}</TableCell>
                      <TableCell className="text-right text-red-700 font-medium">{formatCurrency(row.days90plus)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(row.total)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>TOTAL</TableCell>
                    <TableCell className="text-right text-green-700">{formatCurrency(totals.current)}</TableCell>
                    <TableCell className="text-right text-blue-700">{formatCurrency(totals.days1_30)}</TableCell>
                    <TableCell className="text-right text-amber-700">{formatCurrency(totals.days31_60)}</TableCell>
                    <TableCell className="text-right text-orange-700">{formatCurrency(totals.days61_90)}</TableCell>
                    <TableCell className="text-right text-red-700">{formatCurrency(totals.days90plus)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.total)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
