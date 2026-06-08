import { Role } from "@prisma/client"

export const PERMISSIONS = {
  items: {
    view: [
      Role.PURCHASING_MANAGER,
      Role.INVENTORY_MANAGER,
      Role.SALES_REP,
      Role.SALES_MANAGER,
      Role.ACCOUNTING_MANAGER,
      Role.AP_ANALYST,
      Role.AR_ANALYST,
      Role.ADMIN,
    ],
    create: [Role.INVENTORY_MANAGER, Role.ADMIN],
    edit: [Role.INVENTORY_MANAGER, Role.ADMIN],
  },
  inventory_adjustment: {
    create: [Role.INVENTORY_MANAGER, Role.ADMIN],
  },
  inventory_transfer: {
    create: [Role.INVENTORY_MANAGER, Role.ADMIN],
    confirm: [Role.INVENTORY_MANAGER, Role.ADMIN],
  },
  purchase_orders: {
    view: [
      Role.PURCHASING_MANAGER,
      Role.INVENTORY_MANAGER,
      Role.AP_ANALYST,
      Role.ACCOUNTING_MANAGER,
      Role.ADMIN,
    ],
    create: [Role.PURCHASING_MANAGER, Role.ADMIN],
    confirm: [Role.PURCHASING_MANAGER, Role.ADMIN],
  },
  goods_receipts: {
    view: [Role.INVENTORY_MANAGER, Role.PURCHASING_MANAGER, Role.ADMIN],
    create: [Role.INVENTORY_MANAGER, Role.ADMIN],
    confirm: [Role.INVENTORY_MANAGER, Role.ADMIN],
  },
  vendor_bills: {
    view: [Role.AP_ANALYST, Role.ACCOUNTING_MANAGER, Role.ADMIN],
    create: [Role.AP_ANALYST, Role.ADMIN],
    approve: [Role.ACCOUNTING_MANAGER, Role.ADMIN],
    pay: [Role.AP_ANALYST, Role.ADMIN],
  },
  sales_orders: {
    view: [
      Role.SALES_REP,
      Role.SALES_MANAGER,
      Role.INVENTORY_MANAGER,
      Role.AR_ANALYST,
      Role.ADMIN,
    ],
    create: [Role.SALES_REP, Role.ADMIN],
    approve: [Role.SALES_MANAGER, Role.ADMIN],
  },
  pick_pack_ship: {
    manage: [Role.INVENTORY_MANAGER, Role.ADMIN],
  },
  invoices: {
    view: [Role.AR_ANALYST, Role.SALES_MANAGER, Role.ADMIN],
    create: [Role.AR_ANALYST, Role.ADMIN],
  },
  customer_payments: {
    create: [Role.AR_ANALYST, Role.ADMIN],
  },
  suppliers: {
    view: [Role.PURCHASING_MANAGER, Role.AP_ANALYST, Role.ADMIN],
    create: [Role.PURCHASING_MANAGER, Role.ADMIN],
    edit: [Role.PURCHASING_MANAGER, Role.ADMIN],
  },
  customers: {
    view: [Role.SALES_REP, Role.SALES_MANAGER, Role.AR_ANALYST, Role.ADMIN],
    create: [Role.SALES_REP, Role.SALES_MANAGER, Role.ADMIN],
    edit: [Role.SALES_REP, Role.SALES_MANAGER, Role.ADMIN],
  },
  reports: {
    view: [
      Role.SALES_MANAGER,
      Role.PURCHASING_MANAGER,
      Role.ACCOUNTING_MANAGER,
      Role.ADMIN,
    ],
  },
} as const

export function hasPermission(
  userRole: Role,
  resource: keyof typeof PERMISSIONS,
  action: string
): boolean {
  const resourcePerms = PERMISSIONS[resource] as Record<string, Role[]>
  return resourcePerms[action]?.includes(userRole) ?? false
}
