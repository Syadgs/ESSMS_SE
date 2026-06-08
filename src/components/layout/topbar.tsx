"use client"

import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import type { Role } from "@prisma/client"

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  PURCHASING_MANAGER: "Purchasing Manager",
  INVENTORY_MANAGER: "Inventory Manager",
  SALES_REP: "Sales Rep",
  SALES_MANAGER: "Sales Manager",
  ACCOUNTING_MANAGER: "Accounting Manager",
  AP_ANALYST: "AP Analyst",
  AR_ANALYST: "AR Analyst",
}

interface TopbarProps {
  userName: string
  userEmail: string
  userRole: Role
}

export function Topbar({ userName, userEmail, userRole }: TopbarProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-3 h-auto py-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[userRole]}</p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-navy-900 text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            Profil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
