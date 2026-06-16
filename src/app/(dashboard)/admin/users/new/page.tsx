import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { CreateUserForm } from "@/components/admin/create-user-form"
import { Card, CardContent } from "@/components/ui/card"

export default async function NewUserPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  return (
    <div>
      <PageHeader title="Add Users Baru" description="Create a new system user account" />
      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <CreateUserForm />
        </CardContent>
      </Card>
    </div>
  )
}
