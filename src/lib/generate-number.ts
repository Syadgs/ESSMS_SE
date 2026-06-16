import { prisma } from "@/lib/prisma"

const PREFIX_TABLE_MAP: Record<string, { table: string; field: string }> = {
  PO: { table: "purchase_orders", field: "poNumber" },
  GR: { table: "goods_receipts", field: "grNumber" },
  BILL: { table: "vendor_bills", field: "billNumber" },
  PAY: { table: "bill_payments", field: "paymentNumber" },
  SO: { table: "sales_orders", field: "soNumber" },
  SHP: { table: "shipments", field: "shipmentNumber" },
  INV: { table: "invoices", field: "invoiceNumber" },
  CPAY: { table: "customer_payments", field: "paymentNumber" },
  TRF: { table: "inventory_transfers", field: "transferNumber" },
}

/**
 * Generate document number dengan format PREFIX-YYYY-NNNN
 * Menggunakan transaction untuk menghindari race condition
 */
export async function generateDocNumber(prefix: string): Promise<string> {
  const year = new Date().getFullYear()
  const pattern = `${prefix}-${year}-`

  return prisma.$transaction(async (tx) => {
    const config = PREFIX_TABLE_MAP[prefix]
    if (!config) {
      throw new Error(`Prefix tidak dikenal: ${prefix}`)
    }

    // Search terakhir untuk prefix dan tahun ini
    let lastNumber: string | null = null

    switch (prefix) {
      case "PO": {
        const last = await tx.purchaseOrder.findFirst({
          where: { poNumber: { startsWith: pattern } },
          orderBy: { poNumber: "desc" },
        })
        lastNumber = last?.poNumber ?? null
        break
      }
      case "GR": {
        const last = await tx.goodsReceipt.findFirst({
          where: { grNumber: { startsWith: pattern } },
          orderBy: { grNumber: "desc" },
        })
        lastNumber = last?.grNumber ?? null
        break
      }
      case "BILL": {
        const last = await tx.vendorBill.findFirst({
          where: { billNumber: { startsWith: pattern } },
          orderBy: { billNumber: "desc" },
        })
        lastNumber = last?.billNumber ?? null
        break
      }
      case "PAY": {
        const last = await tx.billPayment.findFirst({
          where: { paymentNumber: { startsWith: pattern } },
          orderBy: { paymentNumber: "desc" },
        })
        lastNumber = last?.paymentNumber ?? null
        break
      }
      case "SO": {
        const last = await tx.salesOrder.findFirst({
          where: { soNumber: { startsWith: pattern } },
          orderBy: { soNumber: "desc" },
        })
        lastNumber = last?.soNumber ?? null
        break
      }
      case "SHP": {
        const last = await tx.shipment.findFirst({
          where: { shipmentNumber: { startsWith: pattern } },
          orderBy: { shipmentNumber: "desc" },
        })
        lastNumber = last?.shipmentNumber ?? null
        break
      }
      case "INV": {
        const last = await tx.invoice.findFirst({
          where: { invoiceNumber: { startsWith: pattern } },
          orderBy: { invoiceNumber: "desc" },
        })
        lastNumber = last?.invoiceNumber ?? null
        break
      }
      case "CPAY": {
        const last = await tx.customerPayment.findFirst({
          where: { paymentNumber: { startsWith: pattern } },
          orderBy: { paymentNumber: "desc" },
        })
        lastNumber = last?.paymentNumber ?? null
        break
      }
      case "TRF": {
        const last = await tx.inventoryTransfer.findFirst({
          where: { transferNumber: { startsWith: pattern } },
          orderBy: { transferNumber: "desc" },
        })
        lastNumber = last?.transferNumber ?? null
        break
      }
    }

    let nextSeq = 1
    if (lastNumber) {
      const parts = lastNumber.split("-")
      const seq = parseInt(parts[2] ?? "0", 10)
      nextSeq = seq + 1
    }

    return `${pattern}${String(nextSeq).padStart(4, "0")}`
  })
}
