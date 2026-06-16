import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { CreateWarehouseForm } from "@/components/admin/create-warehouse-form"
import { Card, CardContent } from "@/components/ui/card"

export default async function NewWarehousePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  return (
    <div>
      <PageHeader title="Add Warehouses" description="Register a new warehouse" />
      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <CreateWarehouseForm />
        </CardContent>
      </Card>
    </div>
  )
}
