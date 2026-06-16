import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import type { Role } from "@prisma/client"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userRole = session.user.role as Role

  return (
    <DashboardShell
      userRole={userRole}
      userName={session.user.name ?? "User"}
      userEmail={session.user.email ?? ""}
    >
      {children}
    </DashboardShell>
  )
}
