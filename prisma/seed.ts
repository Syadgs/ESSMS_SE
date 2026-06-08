import { PrismaClient, Role, ItemType } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const PASSWORD = "password123"

async function main() {
  console.log("🌱 Seeding ESSMS database...")

  // Clear existing data (child tables first)
  await prisma.billPayment.deleteMany()
  await prisma.vendorBill.deleteMany()
  await prisma.goodsReceiptItem.deleteMany()
  await prisma.goodsReceipt.deleteMany()
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.customerPayment.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.shipment.deleteMany()
  await prisma.packOrder.deleteMany()
  await prisma.pickOrder.deleteMany()
  await prisma.salesOrderItem.deleteMany()
  await prisma.salesOrder.deleteMany()
  await prisma.inventoryAdjustment.deleteMany()
  await prisma.inventoryTransfer.deleteMany()
  await prisma.inventoryStock.deleteMany()
  await prisma.item.deleteMany()
  await prisma.warehouse.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash(PASSWORD, 10)

  // ─── Users (8 roles) ───────────────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Budi Santoso",
        email: "purchasing@essms.com",
        password: hashedPassword,
        role: Role.PURCHASING_MANAGER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Siti Rahayu",
        email: "inventory@essms.com",
        password: hashedPassword,
        role: Role.INVENTORY_MANAGER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Andi Wijaya",
        email: "sales@essms.com",
        password: hashedPassword,
        role: Role.SALES_REP,
      },
    }),
    prisma.user.create({
      data: {
        name: "Dewi Lestari",
        email: "salesmanager@essms.com",
        password: hashedPassword,
        role: Role.SALES_MANAGER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Rudi Hartono",
        email: "accounting@essms.com",
        password: hashedPassword,
        role: Role.ACCOUNTING_MANAGER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Maya Putri",
        email: "ap@essms.com",
        password: hashedPassword,
        role: Role.AP_ANALYST,
      },
    }),
    prisma.user.create({
      data: {
        name: "Fajar Nugroho",
        email: "ar@essms.com",
        password: hashedPassword,
        role: Role.AR_ANALYST,
      },
    }),
    prisma.user.create({
      data: {
        name: "Admin ESSMS",
        email: "admin@essms.com",
        password: hashedPassword,
        role: Role.ADMIN,
      },
    }),
  ])

  const [purchasing, inventory, salesRep, salesManager, accounting, apAnalyst] = users

  // ─── Warehouses ────────────────────────────────────────────────────────────
  const [whMain, whBranch] = await Promise.all([
    prisma.warehouse.create({
      data: { warehouseName: "Gudang Utama Jakarta", location: "Jakarta Pusat" },
    }),
    prisma.warehouse.create({
      data: { warehouseName: "Gudang Cabang Surabaya", location: "Surabaya" },
    }),
  ])

  // ─── Items (7 INVENTORY, 2 NON_INVENTORY, 1 SERVICE) ─────────────────────
  const items = await Promise.all([
    prisma.item.create({
      data: {
        itemCode: "ITM-001",
        itemName: "Laptop Dell Latitude 5540",
        itemType: ItemType.INVENTORY,
        unitPrice: 12500000,
        costPrice: 9800000,
        unit: "unit",
        category: "Elektronik",
      },
    }),
    prisma.item.create({
      data: {
        itemCode: "ITM-002",
        itemName: "Monitor LG 27 inch",
        itemType: ItemType.INVENTORY,
        unitPrice: 3500000,
        costPrice: 2700000,
        unit: "unit",
        category: "Elektronik",
      },
    }),
    prisma.item.create({
      data: {
        itemCode: "ITM-003",
        itemName: "Keyboard Mechanical",
        itemType: ItemType.INVENTORY,
        unitPrice: 850000,
        costPrice: 600000,
        unit: "unit",
        category: "Aksesoris",
      },
    }),
    prisma.item.create({
      data: {
        itemCode: "ITM-004",
        itemName: "Mouse Wireless Logitech",
        itemType: ItemType.INVENTORY,
        unitPrice: 450000,
        costPrice: 320000,
        unit: "unit",
        category: "Aksesoris",
      },
    }),
    prisma.item.create({
      data: {
        itemCode: "ITM-005",
        itemName: "Kertas A4 80gsm",
        itemType: ItemType.INVENTORY,
        unitPrice: 45000,
        costPrice: 35000,
        unit: "rim",
        category: "ATK",
      },
    }),
    prisma.item.create({
      data: {
        itemCode: "ITM-006",
        itemName: "Tinta Printer Hitam",
        itemType: ItemType.INVENTORY,
        unitPrice: 180000,
        costPrice: 120000,
        unit: "pcs",
        category: "ATK",
      },
    }),
    prisma.item.create({
      data: {
        itemCode: "ITM-007",
        itemName: "Headset USB",
        itemType: ItemType.INVENTORY,
        unitPrice: 550000,
        costPrice: 400000,
        unit: "unit",
        category: "Aksesoris",
      },
    }),
    prisma.item.create({
      data: {
        itemCode: "ITM-008",
        itemName: "Kabel HDMI 2m",
        itemType: ItemType.NON_INVENTORY,
        unitPrice: 75000,
        costPrice: 50000,
        unit: "pcs",
        category: "Aksesoris",
      },
    }),
    prisma.item.create({
      data: {
        itemCode: "ITM-009",
        itemName: "Adaptor USB-C",
        itemType: ItemType.NON_INVENTORY,
        unitPrice: 120000,
        costPrice: 85000,
        unit: "pcs",
        category: "Aksesoris",
      },
    }),
    prisma.item.create({
      data: {
        itemCode: "ITM-010",
        itemName: "Jasa Instalasi IT",
        itemType: ItemType.SERVICE,
        unitPrice: 500000,
        costPrice: 0,
        unit: "jam",
        category: "Jasa",
      },
    }),
  ])

  const [laptop, monitor, keyboard, mouse, paper, ink, headset] = items

  // ─── Inventory Stocks (some low stock < 10) ───────────────────────────────
  await Promise.all([
    prisma.inventoryStock.create({ data: { itemId: laptop.id, warehouseId: whMain.id, quantity: 25 } }),
    prisma.inventoryStock.create({ data: { itemId: monitor.id, warehouseId: whMain.id, quantity: 15 } }),
    prisma.inventoryStock.create({ data: { itemId: keyboard.id, warehouseId: whMain.id, quantity: 5 } }),
    prisma.inventoryStock.create({ data: { itemId: mouse.id, warehouseId: whMain.id, quantity: 3 } }),
    prisma.inventoryStock.create({ data: { itemId: paper.id, warehouseId: whMain.id, quantity: 120 } }),
    prisma.inventoryStock.create({ data: { itemId: ink.id, warehouseId: whMain.id, quantity: 8 } }),
    prisma.inventoryStock.create({ data: { itemId: headset.id, warehouseId: whBranch.id, quantity: 6 } }),
    prisma.inventoryStock.create({ data: { itemId: monitor.id, warehouseId: whBranch.id, quantity: 4 } }),
  ])

  // ─── Suppliers & Customers ─────────────────────────────────────────────────
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        supplierCode: "SUP-001",
        supplierName: "PT Teknologi Maju",
        contactPerson: "Bambang",
        email: "bambang@teknologimaju.co.id",
        phone: "021-5550101",
      },
    }),
    prisma.supplier.create({
      data: {
        supplierCode: "SUP-002",
        supplierName: "CV Sumber Elektronik",
        contactPerson: "Rina",
        email: "rina@sumberelektronik.co.id",
        phone: "021-5550102",
      },
    }),
    prisma.supplier.create({
      data: {
        supplierCode: "SUP-003",
        supplierName: "PT ATK Nusantara",
        contactPerson: "Hendra",
        email: "hendra@atknusantara.co.id",
        phone: "021-5550103",
      },
    }),
    prisma.supplier.create({
      data: {
        supplierCode: "SUP-004",
        supplierName: "UD Mitra Komputer",
        contactPerson: "Yanto",
        email: "yanto@mitracomputer.co.id",
        phone: "031-5550104",
      },
    }),
    prisma.supplier.create({
      data: {
        supplierCode: "SUP-005",
        supplierName: "PT Global Supply",
        contactPerson: "Lina",
        email: "lina@globalsupply.co.id",
        phone: "021-5550105",
      },
    }),
  ])

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        customerCode: "CUS-001",
        customerName: "PT Maju Bersama",
        contactPerson: "Agus",
        email: "agus@majubersama.co.id",
        creditLimit: 50000000,
      },
    }),
    prisma.customer.create({
      data: {
        customerCode: "CUS-002",
        customerName: "CV Kreatif Digital",
        contactPerson: "Wulan",
        email: "wulan@kreatifdigital.co.id",
        creditLimit: 25000000,
      },
    }),
    prisma.customer.create({
      data: {
        customerCode: "CUS-003",
        customerName: "PT Solusi Enterprise",
        contactPerson: "Eko",
        email: "eko@solusienterprise.co.id",
        creditLimit: 100000000,
      },
    }),
    prisma.customer.create({
      data: {
        customerCode: "CUS-004",
        customerName: "UD Berkah Jaya",
        contactPerson: "Sari",
        email: "sari@berkahjaya.co.id",
        creditLimit: 15000000,
      },
    }),
    prisma.customer.create({
      data: {
        customerCode: "CUS-005",
        customerName: "PT Inovasi Teknologi",
        contactPerson: "Dimas",
        email: "dimas@inovasitek.co.id",
        creditLimit: 75000000,
      },
    }),
  ])

  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 15)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 10)
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 5)

  // ─── PO 1: CONFIRMED ───────────────────────────────────────────────────────
  const poConfirmedTotal = 5 * 9800000 + 10 * 2700000
  const poConfirmed = await prisma.purchaseOrder.create({
    data: {
      poNumber: `PO-${now.getFullYear()}-0001`,
      supplierId: suppliers[0].id,
      createdById: purchasing.id,
      orderDate: thisMonth,
      expectedDate: new Date(thisMonth.getTime() + 14 * 24 * 60 * 60 * 1000),
      totalAmount: poConfirmedTotal,
      status: "CONFIRMED",
      notes: "PO konfirmasi menunggu penerimaan barang",
      items: {
        create: [
          {
            itemId: laptop.id,
            quantity: 5,
            unitPrice: 9800000,
            subtotal: 5 * 9800000,
          },
          {
            itemId: monitor.id,
            quantity: 10,
            unitPrice: 2700000,
            subtotal: 10 * 2700000,
          },
        ],
      },
    },
    include: { items: true },
  })

  // ─── PO 2: PAID (full flow: GR → Bill → Payment) ──────────────────────────
  const poPaidLaptopQty = 10
  const poPaidKeyboardQty = 20
  const poPaidTotal = poPaidLaptopQty * 9800000 + poPaidKeyboardQty * 600000

  const poPaid = await prisma.purchaseOrder.create({
    data: {
      poNumber: `PO-${now.getFullYear()}-0002`,
      supplierId: suppliers[1].id,
      createdById: purchasing.id,
      orderDate: lastMonth,
      expectedDate: new Date(lastMonth.getTime() + 7 * 24 * 60 * 60 * 1000),
      totalAmount: poPaidTotal,
      status: "PAID",
      notes: "PO lengkap: diterima, ditagih, dan dibayar",
      items: {
        create: [
          {
            itemId: laptop.id,
            quantity: poPaidLaptopQty,
            unitPrice: 9800000,
            subtotal: poPaidLaptopQty * 9800000,
          },
          {
            itemId: keyboard.id,
            quantity: poPaidKeyboardQty,
            unitPrice: 600000,
            subtotal: poPaidKeyboardQty * 600000,
          },
        ],
      },
    },
    include: { items: true },
  })

  const [poPaidLaptopItem, poPaidKeyboardItem] = poPaid.items

  const grPaid = await prisma.goodsReceipt.create({
    data: {
      grNumber: `GR-${now.getFullYear()}-0001`,
      poId: poPaid.id,
      receivedById: inventory.id,
      warehouseId: whMain.id,
      receivedDate: new Date(lastMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: "CONFIRMED",
      notes: "Penerimaan lengkap sesuai PO",
      items: {
        create: [
          {
            poItemId: poPaidLaptopItem.id,
            itemId: laptop.id,
            quantityOrdered: poPaidLaptopQty,
            quantityReceived: poPaidLaptopQty,
          },
          {
            poItemId: poPaidKeyboardItem.id,
            itemId: keyboard.id,
            quantityOrdered: poPaidKeyboardQty,
            quantityReceived: poPaidKeyboardQty,
          },
        ],
      },
    },
  })

  // Update stock from GR
  await prisma.inventoryStock.update({
    where: { itemId_warehouseId: { itemId: laptop.id, warehouseId: whMain.id } },
    data: { quantity: { increment: poPaidLaptopQty } },
  })
  await prisma.inventoryStock.update({
    where: { itemId_warehouseId: { itemId: keyboard.id, warehouseId: whMain.id } },
    data: { quantity: { increment: poPaidKeyboardQty } },
  })

  const billPaid = await prisma.vendorBill.create({
    data: {
      billNumber: `BILL-${now.getFullYear()}-0001`,
      poId: poPaid.id,
      grId: grPaid.id,
      supplierId: suppliers[1].id,
      billDate: new Date(lastMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
      dueDate: new Date(lastMonth.getTime() + 40 * 24 * 60 * 60 * 1000),
      totalAmount: poPaidTotal,
      paidAmount: poPaidTotal,
      status: "PAID",
      createdById: apAnalyst.id,
      approvedById: accounting.id,
    },
  })

  await prisma.billPayment.create({
    data: {
      paymentNumber: `PAY-${now.getFullYear()}-0001`,
      billId: billPaid.id,
      amount: poPaidTotal,
      paymentDate: new Date(lastMonth.getTime() + 15 * 24 * 60 * 60 * 1000),
      paymentMethod: "BANK_TRANSFER",
      referenceNumber: "TRF-2025-001",
      notes: "Pembayaran lunas PO-0002",
      paidById: apAnalyst.id,
    },
  })

  // ─── SO 1: PENDING_APPROVAL ────────────────────────────────────────────────
  const soPendingTotal = 3 * 12500000 + 5 * 3500000
  await prisma.salesOrder.create({
    data: {
      soNumber: `SO-${now.getFullYear()}-0001`,
      customerId: customers[0].id,
      createdById: salesRep.id,
      orderDate: thisMonth,
      deliveryDate: new Date(thisMonth.getTime() + 7 * 24 * 60 * 60 * 1000),
      totalAmount: soPendingTotal,
      status: "PENDING_APPROVAL",
      notes: "Menunggu persetujuan sales manager",
      items: {
        create: [
          {
            itemId: laptop.id,
            quantity: 3,
            unitPrice: 12500000,
            discount: 0,
            subtotal: 3 * 12500000,
          },
          {
            itemId: monitor.id,
            quantity: 5,
            unitPrice: 3500000,
            discount: 0,
            subtotal: 5 * 3500000,
          },
        ],
      },
    },
  })

  // ─── SO 2: SHIPPED (full flow: Pick → Pack → Ship) ────────────────────────
  const soShippedMouseQty = 15
  const soShippedHeadsetQty = 8
  const soShippedTotal = soShippedMouseQty * 450000 + soShippedHeadsetQty * 550000

  const soShipped = await prisma.salesOrder.create({
    data: {
      soNumber: `SO-${now.getFullYear()}-0002`,
      customerId: customers[2].id,
      createdById: salesRep.id,
      approvedById: salesManager.id,
      orderDate: twoMonthsAgo,
      deliveryDate: new Date(twoMonthsAgo.getTime() + 5 * 24 * 60 * 60 * 1000),
      totalAmount: soShippedTotal,
      status: "SHIPPED",
      notes: "Order dikirim ke customer enterprise",
      items: {
        create: [
          {
            itemId: mouse.id,
            quantity: soShippedMouseQty,
            unitPrice: 450000,
            discount: 0,
            subtotal: soShippedMouseQty * 450000,
          },
          {
            itemId: headset.id,
            quantity: soShippedHeadsetQty,
            unitPrice: 550000,
            discount: 0,
            subtotal: soShippedHeadsetQty * 550000,
          },
        ],
      },
    },
  })

  const pickOrder = await prisma.pickOrder.create({
    data: {
      soId: soShipped.id,
      warehouseId: whMain.id,
      pickedById: inventory.id,
      pickDate: new Date(twoMonthsAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: "COMPLETED",
      notes: "Picking selesai",
    },
  })

  const packOrder = await prisma.packOrder.create({
    data: {
      pickOrderId: pickOrder.id,
      packedById: inventory.id,
      packDate: new Date(twoMonthsAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
      packageCount: 2,
      totalWeight: 12.5,
      status: "COMPLETED",
      notes: "2 paket siap kirim",
    },
  })

  await prisma.shipment.create({
    data: {
      shipmentNumber: `SHP-${now.getFullYear()}-0001`,
      packOrderId: packOrder.id,
      soId: soShipped.id,
      shippedById: inventory.id,
      shipDate: new Date(twoMonthsAgo.getTime() + 4 * 24 * 60 * 60 * 1000),
      trackingNumber: "JNE-8829103746",
      carrier: "JNE",
      status: "SHIPPED",
      notes: "Dikirim via JNE Reguler",
    },
  })

  // Deduct stock for shipped SO
  await prisma.inventoryStock.update({
    where: { itemId_warehouseId: { itemId: mouse.id, warehouseId: whMain.id } },
    data: { quantity: { decrement: soShippedMouseQty } },
  })
  await prisma.inventoryStock.update({
    where: { itemId_warehouseId: { itemId: headset.id, warehouseId: whBranch.id } },
    data: { quantity: { decrement: soShippedHeadsetQty } },
  })

  // Additional SO for chart data (previous months)
  await prisma.salesOrder.create({
    data: {
      soNumber: `SO-${now.getFullYear()}-0003`,
      customerId: customers[1].id,
      createdById: salesRep.id,
      approvedById: salesManager.id,
      orderDate: lastMonth,
      totalAmount: 8500000,
      status: "APPROVED",
      items: {
        create: [
          {
            itemId: keyboard.id,
            quantity: 10,
            unitPrice: 850000,
            discount: 0,
            subtotal: 8500000,
          },
        ],
      },
    },
  })

  console.log("✅ Seed completed!")
  console.log(`   Users: ${users.length} (password: ${PASSWORD})`)
  console.log(`   Warehouses: 2`)
  console.log(`   Items: 10 (7 INVENTORY, 2 NON_INVENTORY, 1 SERVICE)`)
  console.log(`   Suppliers: 5, Customers: 5`)
  console.log(`   PO: ${poConfirmed.poNumber} (CONFIRMED), ${poPaid.poNumber} (PAID)`)
  console.log(`   SO: SO-${now.getFullYear()}-0001 (PENDING_APPROVAL), SO-${now.getFullYear()}-0002 (SHIPPED)`)
  console.log(`   Login: admin@essms.com / ${PASSWORD}`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
