import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { getDepartments } from "@/actions/department-class.actions"
import { getClasses } from "@/actions/department-class.actions"
import { MasterDataTable } from "@/components/admin/master-data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  const [departments, classes] = await Promise.all([getDepartments(), getClasses()])

  return (
    <div>
      <PageHeader title="Master Data" description="Manage departments and classes for sales orders" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <MasterDataTable
              type="department"
              items={departments.map((d) => ({ id: d.id, code: d.code, name: d.name, isActive: d.isActive }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <MasterDataTable
              type="class"
              items={classes.map((c) => ({ id: c.id, code: c.code, name: c.name, isActive: c.isActive }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
