import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { getUsers } from "@/actions/user.actions"
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
import { Plus, Pencil } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Role } from "@prisma/client"

const ROLE_LABELS: Record<string, string> = {
  PURCHASING_MANAGER: "Purchasing Manager",
  INVENTORY_MANAGER: "Inventory Manager",
  SALES_REP: "Sales Representative",
  SALES_MANAGER: "Sales Manager",
  ACCOUNTING_MANAGER: "Accounting Manager",
  AP_ANALYST: "AP Analyst",
  AR_ANALYST: "AR Analyst",
  ADMIN: "Administrator",
}

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  const users = await getUsers()

  return (
    <div>
      <PageHeader
        title="Manajemen Users"
        description="Manage users and system access"
      >
        <Link href="/admin/users/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Users
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {ROLE_LABELS[user.role] ?? user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                    </Link>
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
