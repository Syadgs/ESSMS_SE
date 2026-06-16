import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { getPhysicalInventoryWorksheet } from "@/lib/reports/physical-inventory"
import { PhysicalInventoryTable } from "@/components/inventory/physical-inventory-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Role } from "@prisma/client"

const ALLOWED_ROLES: Role[] = ["INVENTORY_MANAGER", "ADMIN"]

export default async function PhysicalInventoryPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (!ALLOWED_ROLES.includes(session.user.role as Role)) redirect("/dashboard")

  const rows = await getPhysicalInventoryWorksheet()

  return (
    <div>
      <PageHeader
        title="Worksheet Physical Inventory"
        description="Physical stock count worksheet by warehouse"
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Rows</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <p className="text-2xl font-bold">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Distinct Items</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <p className="text-2xl font-bold">{new Set(rows.map((r) => r.itemId)).size}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-amber-700">Below Reorder Point</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <p className="text-2xl font-bold text-amber-700">
              {rows.filter((r) => r.isBelowReorder).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <PhysicalInventoryTable rows={rows} />
        </CardContent>
      </Card>
    </div>
  )
}
