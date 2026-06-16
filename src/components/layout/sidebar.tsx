"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ArrowUpDown,
  ArrowRightLeft,
  ShoppingCart,
  PackageCheck,
  FileText,
  CreditCard,
  TrendingUp,
  ScanLine,
  Archive,
  Truck,
  Receipt,
  Banknote,
  Building2,
  Users,
  BarChart3,
  AlertTriangle,
  ClipboardList,
  UserCog,
  Warehouse,
  Settings,
  BookOpen,
  X,
} from "lucide-react"
import type { Role } from "@prisma/client"
import { Button } from "@/components/ui/button"

type MenuItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: (Role | "ALL")[]
}

type MenuSection = {
  section: string
  items: MenuItem[]
}

const menuItems: MenuSection[] = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ALL"] },
    ],
  },
  {
    section: "Item Management",
    items: [
      {
        label: "Item Master",
        href: "/items",
        icon: Package,
        roles: ["INVENTORY_MANAGER", "ADMIN", "PURCHASING_MANAGER", "SALES_REP", "SALES_MANAGER"],
      },
      {
        label: "Adjustments",
        href: "/inventory/adjustments",
        icon: ArrowUpDown,
        roles: ["INVENTORY_MANAGER", "ADMIN"],
      },
      {
        label: "Transfers",
        href: "/inventory/transfers",
        icon: ArrowRightLeft,
        roles: ["INVENTORY_MANAGER", "ADMIN"],
      },
    ],
  },
  {
    section: "Procure to Pay",
    items: [
      {
        label: "Purchase Orders",
        href: "/purchase-orders",
        icon: ShoppingCart,
        roles: ["PURCHASING_MANAGER", "INVENTORY_MANAGER", "AP_ANALYST", "ACCOUNTING_MANAGER", "ADMIN"],
      },
      {
        label: "Goods Receipt",
        href: "/goods-receipts",
        icon: PackageCheck,
        roles: ["INVENTORY_MANAGER", "ADMIN"],
      },
      {
        label: "Vendor Bills",
        href: "/vendor-bills",
        icon: FileText,
        roles: ["AP_ANALYST", "ACCOUNTING_MANAGER", "ADMIN"],
      },
      {
        label: "Bill Payments",
        href: "/bill-payments",
        icon: CreditCard,
        roles: ["AP_ANALYST", "ADMIN"],
      },
    ],
  },
  {
    section: "Order to Cash",
    items: [
      {
        label: "Sales Orders",
        href: "/sales-orders",
        icon: TrendingUp,
        roles: ["SALES_REP", "SALES_MANAGER", "INVENTORY_MANAGER", "AR_ANALYST", "ADMIN"],
      },
      { label: "Pick Orders", href: "/pick-orders", icon: ScanLine, roles: ["INVENTORY_MANAGER", "ADMIN"] },
      { label: "Pack Orders", href: "/pack-orders", icon: Archive, roles: ["INVENTORY_MANAGER", "ADMIN"] },
      { label: "Shipments", href: "/shipments", icon: Truck, roles: ["INVENTORY_MANAGER", "ADMIN"] },
      {
        label: "Invoices",
        href: "/invoices",
        icon: Receipt,
        roles: ["AR_ANALYST", "SALES_MANAGER", "ADMIN"],
      },
      {
        label: "Customer Payments",
        href: "/customer-payments",
        icon: Banknote,
        roles: ["AR_ANALYST", "ADMIN"],
      },
    ],
  },
  {
    section: "Master Data",
    items: [
      {
        label: "Suppliers",
        href: "/suppliers",
        icon: Building2,
        roles: ["PURCHASING_MANAGER", "AP_ANALYST", "ADMIN"],
      },
      {
        label: "Customers",
        href: "/customers",
        icon: Users,
        roles: ["SALES_REP", "SALES_MANAGER", "AR_ANALYST", "ADMIN"],
      },
    ],
  },
  {
    section: "Reports",
    items: [
      {
        label: "All Reports",
        href: "/reports",
        icon: BookOpen,
        roles: ["INVENTORY_MANAGER", "ADMIN", "PURCHASING_MANAGER", "ACCOUNTING_MANAGER", "SALES_MANAGER", "AR_ANALYST", "AP_ANALYST"],
      },
      {
        label: "Inventory Report",
        href: "/reports/inventory",
        icon: BarChart3,
        roles: ["INVENTORY_MANAGER", "ADMIN", "PURCHASING_MANAGER"],
      },
      {
        label: "Purchase Report",
        href: "/reports/purchases",
        icon: BarChart3,
        roles: ["PURCHASING_MANAGER", "ACCOUNTING_MANAGER", "ADMIN"],
      },
      {
        label: "Sales Report",
        href: "/reports/sales",
        icon: BarChart3,
        roles: ["SALES_MANAGER", "AR_ANALYST", "ADMIN"],
      },
      {
        label: "AR Aging",
        href: "/reports/ar-aging",
        icon: AlertTriangle,
        roles: ["AR_ANALYST", "ACCOUNTING_MANAGER", "ADMIN"],
      },
      {
        label: "AP Aging",
        href: "/reports/ap-aging",
        icon: AlertTriangle,
        roles: ["AP_ANALYST", "ACCOUNTING_MANAGER", "ADMIN"],
      },
      {
        label: "Physical Inventory",
        href: "/reports/physical-inventory",
        icon: ClipboardList,
        roles: ["INVENTORY_MANAGER", "ADMIN"],
      },
    ],
  },
  {
    section: "Admin",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: UserCog,
        roles: ["ADMIN"],
      },
      {
        label: "Warehouses",
        href: "/admin/warehouses",
        icon: Warehouse,
        roles: ["ADMIN"],
      },
      {
        label: "Dept & Class",
        href: "/admin/departments",
        icon: Settings,
        roles: ["ADMIN"],
      },
    ],
  },
]

function canAccess(roles: (Role | "ALL")[], userRole: Role) {
  return roles.includes("ALL") || roles.includes(userRole)
}

interface SidebarProps {
  userRole: Role
  open?: boolean
  onClose?: () => void
}

function SidebarNav({ userRole, onNavigate }: { userRole: Role; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3">
      {menuItems.map((section) => {
        const visibleItems = section.items.filter((item) => canAccess(item.roles, userRole))
        if (visibleItems.length === 0) return null

        return (
          <div key={section.section} className="mb-4">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
              {section.section}
            </p>
            <ul className="space-y-0.5">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isActive
                          ? "bg-amber-500/20 text-amber-400 font-medium"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

export function Sidebar({ userRole, open = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "sidebar fixed left-0 top-0 z-50 flex h-screen w-64 flex-col text-white transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div>
            <h2 className="text-lg font-serif tracking-wide">ESSMS</h2>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">Supply Chain</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white/70 hover:text-white hover:bg-white/10"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <SidebarNav userRole={userRole} onNavigate={onClose} />
      </aside>
    </>
  )
}
