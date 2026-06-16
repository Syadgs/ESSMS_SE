import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { getUserById } from "@/actions/user.actions"
import { EditUserForm } from "@/components/admin/edit-user-form"
import { Card, CardContent } from "@/components/ui/card"

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  const { id } = await params
  const user = await getUserById(id)
  if (!user) notFound()

  return (
    <div>
      <PageHeader title="Edit Users" description={`Editing account: ${user.name}`} />
      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <EditUserForm user={user} />
        </CardContent>
      </Card>
    </div>
  )
}
