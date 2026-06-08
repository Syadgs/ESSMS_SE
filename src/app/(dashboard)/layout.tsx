import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import type { Role } from "@prisma/client"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userRole = session.user.role as Role

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userRole={userRole} />
      <div className="pl-64">
        <Topbar
          userName={session.user.name ?? "User"}
          userEmail={session.user.email ?? ""}
          userRole={userRole}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
