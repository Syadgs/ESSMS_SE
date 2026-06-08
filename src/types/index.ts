import type { Role } from "@prisma/client"

export type ActionResult<T = void> =
  | { success: true; data: T; message: string }
  | { success: false; error: string }

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
}

export type LineItem = {
  itemId: string
  quantity: number
  unitPrice: number
  discount?: number
}

export type SelectOption = {
  value: string
  label: string
}
