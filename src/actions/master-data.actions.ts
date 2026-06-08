"use server"

import { prisma } from "@/lib/prisma"

export async function getSuppliers() {
  return prisma.supplier.findMany({
    where: { isActive: true },
    orderBy: { supplierName: "asc" },
  })
}

export async function getCustomers() {
  return prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { customerName: "asc" },
  })
}

export async function getWarehouses() {
  return prisma.warehouse.findMany({
    where: { isActive: true },
    orderBy: { warehouseName: "asc" },
  })
}
