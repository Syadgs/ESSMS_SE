import { Role } from "@prisma/client"

export type RouteConfig = {
  pathPrefix: string
  allowedRoles: Role[]
}

// Maps root paths to allowed roles
export const ROUTE_PERMISSIONS: RouteConfig[] = [
  {
    pathPrefix: "/admin",
    allowedRoles: ["ADMIN"],
  },
  {
    pathPrefix: "/items",
    allowedRoles: ["ADMIN", "INVENTORY_MANAGER", "PURCHASING_MANAGER", "SALES_REP", "SALES_MANAGER"],
  },
  {
    pathPrefix: "/inventory",
    allowedRoles: ["ADMIN", "INVENTORY_MANAGER"],
  },
  {
    pathPrefix: "/purchase-orders",
    allowedRoles: ["ADMIN", "PURCHASING_MANAGER", "INVENTORY_MANAGER", "AP_ANALYST", "ACCOUNTING_MANAGER"],
  },
  {
    pathPrefix: "/goods-receipts",
    allowedRoles: ["ADMIN", "INVENTORY_MANAGER"],
  },
  {
    pathPrefix: "/vendor-bills",
    allowedRoles: ["ADMIN", "AP_ANALYST", "ACCOUNTING_MANAGER"],
  },
  {
    pathPrefix: "/bill-payments",
    allowedRoles: ["ADMIN", "AP_ANALYST"],
  },
  {
    pathPrefix: "/sales-orders",
    allowedRoles: ["ADMIN", "SALES_REP", "SALES_MANAGER", "INVENTORY_MANAGER", "AR_ANALYST"],
  },
  {
    pathPrefix: "/pick-orders",
    allowedRoles: ["ADMIN", "INVENTORY_MANAGER"],
  },
  {
    pathPrefix: "/pack-orders",
    allowedRoles: ["ADMIN", "INVENTORY_MANAGER"],
  },
  {
    pathPrefix: "/shipments",
    allowedRoles: ["ADMIN", "INVENTORY_MANAGER"],
  },
  {
    pathPrefix: "/invoices",
    allowedRoles: ["ADMIN", "AR_ANALYST", "SALES_MANAGER"],
  },
  {
    pathPrefix: "/customer-payments",
    allowedRoles: ["ADMIN", "AR_ANALYST"],
  },
  {
    pathPrefix: "/suppliers",
    allowedRoles: ["ADMIN", "PURCHASING_MANAGER", "AP_ANALYST"],
  },
  {
    pathPrefix: "/customers",
    allowedRoles: ["ADMIN", "SALES_REP", "SALES_MANAGER", "AR_ANALYST"],
  },
  {
    pathPrefix: "/reports/inventory",
    allowedRoles: ["ADMIN", "INVENTORY_MANAGER", "PURCHASING_MANAGER"],
  },
  {
    pathPrefix: "/reports/purchases",
    allowedRoles: ["ADMIN", "PURCHASING_MANAGER", "ACCOUNTING_MANAGER"],
  },
  {
    pathPrefix: "/reports/sales",
    allowedRoles: ["ADMIN", "SALES_MANAGER", "AR_ANALYST"],
  },
  {
    pathPrefix: "/reports/ar-aging",
    allowedRoles: ["ADMIN", "AR_ANALYST", "ACCOUNTING_MANAGER"],
  },
  {
    pathPrefix: "/reports/ap-aging",
    allowedRoles: ["ADMIN", "AP_ANALYST", "ACCOUNTING_MANAGER"],
  },
  {
    pathPrefix: "/reports/physical-inventory",
    allowedRoles: ["ADMIN", "INVENTORY_MANAGER"],
  },
  {
    pathPrefix: "/reports",
    allowedRoles: [
      "ADMIN",
      "INVENTORY_MANAGER",
      "PURCHASING_MANAGER",
      "ACCOUNTING_MANAGER",
      "SALES_MANAGER",
      "AR_ANALYST",
      "AP_ANALYST",
    ],
  },
]

/**
 * Checks if a user has access to a specific path
 */
export function canAccessRoute(path: string, userRole: Role): boolean {
  // Always allow access to dashboard and profile
  if (path === "/dashboard" || path === "/profile") return true

  // Find the most specific match first (longest pathPrefix)
  const sortedConfigs = [...ROUTE_PERMISSIONS].sort((a, b) => b.pathPrefix.length - a.pathPrefix.length)
  
  for (const config of sortedConfigs) {
    // Exact match or sub-route
    if (path === config.pathPrefix || path.startsWith(`${config.pathPrefix}/`)) {
      return config.allowedRoles.includes(userRole)
    }
  }

  // If no specific prefix matches, we allow it (or we could deny by default)
  // Let's deny by default for security if it's an unrecognized protected route
  // But wait, there might be api routes. We should only restrict known prefixes
  return true
}
