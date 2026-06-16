import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { getWarehouses } from "@/actions/warehouse.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus } from "lucide-react"

export default async function AdminWarehousesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  const warehouses = await getWarehouses()

  return (
    <div>
      <PageHeader title="Manajemen Warehouses" description="Manage warehouse data">
        <Link href="/admin/warehouses/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Warehouses
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Warehouses</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((wh) => (
                <TableRow key={wh.id}>
                  <TableCell className="font-mono text-sm">{wh.warehouseCode ?? "—"}</TableCell>
                  <TableCell className="font-medium">{wh.warehouseName}</TableCell>
                  <TableCell className="text-muted-foreground">{wh.location ?? "—"}</TableCell>
                  <TableCell>
                    {wh.isActive ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">Inactive</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
