"use client"

import { useEffect, useRef, useState } from "react"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronDown, LogOut, Menu, User } from "lucide-react"
import type { Role } from "@prisma/client"
import { cn } from "@/lib/utils"

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
  onMenuClick?: () => void
}

export function Topbar({ userName, userEmail, userRole, onMenuClick }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false)
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [menuOpen])

  const handleSignOut = () => {
    setMenuOpen(false)
    signOut({ callbackUrl: "/login" })
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between gap-4 border-b bg-white px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0 lg:hidden">
          <p className="text-sm font-semibold truncate">ESSMS</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
            {ROLE_LABELS[userRole]}
          </p>
        </div>
      </div>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Open account menu"
          className={cn(
            "flex items-center gap-2 sm:gap-3 rounded-lg border bg-white px-2 py-2 sm:px-3",
            "hover:bg-slate-50 transition-colors cursor-pointer",
            menuOpen && "ring-2 ring-navy-900/20 border-navy-900/30"
          )}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-tight text-left">{userName}</p>
            <p className="text-xs text-muted-foreground text-left">{ROLE_LABELS[userRole]}</p>
          </div>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-navy-900 text-white text-xs">{initials}</AvatarFallback>
          </Avatar>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              menuOpen && "rotate-180"
            )}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] z-[9999] w-56 rounded-lg border bg-white py-1 shadow-xl"
          >
            <div className="px-3 py-2 border-b">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>

            <button
              type="button"
              role="menuitem"
              disabled
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed opacity-50"
            >
              <User className="h-4 w-4" />
              Profile
            </button>

            <div className="my-1 border-t" />

            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
