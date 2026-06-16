import {
  PrismaClient,
  Role,
  ItemType,
  CostingMethod,
  BillType,
  MatchStatus,
} from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const PASSWORD = "password123"

async function main() {
  console.log("🌱 Seeding ESSMS database...")

  // Clear existing data (child tables first)
  await prisma.billPayment.deleteMany()
  await prisma.vendorBillItem.deleteMany()
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
  await prisma.department.deleteMany()
  await prisma.class.deleteMany()
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
        email: "sales.rep@essms.com",
        password: hashedPassword,
        role: Role.SALES_REP,
      },
    }),
    prisma.user.create({
      data: {
        name: "Dewi Lestari",
        email: "sales.manager@essms.com",
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

  // ─── Departments ───────────────────────────────────────────────────────────
  const [deptSales, deptIT, deptFinance, deptOperations] = await Promise.all([
    prisma.department.create({ data: { code: "DEPT-SALES", name: "Sales & Marketing", isActive: true } }),
    prisma.department.create({ data: { code: "DEPT-IT", name: "Information Technology", isActive: true } }),
    prisma.department.create({ data: { code: "DEPT-FIN", name: "Finance & Accounting", isActive: true } }),
    prisma.department.create({ data: { code: "DEPT-OPS", name: "Operations", isActive: true } }),
  ])

  // ─── Classes ───────────────────────────────────────────────────────────────
  const [classA, classB, classC] = await Promise.all([
    prisma.class.create({ data: { code: "CLASS-A", name: "Kelas A - Premium", isActive: true } }),
    prisma.class.create({ data: { code: "CLASS-B", name: "Kelas B - Standard", isActive: true } }),
    prisma.class.create({ data: { code: "CLASS-C", name: "Kelas C - Economy", isActive: true } }),
  ])

  // ─── Warehouses ────────────────────────────────────────────────────────────
  const [whMain, whBranch] = await Promise.all([
    prisma.warehouse.create({
      data: { warehouseCode: "WH-001", warehouseName: "Gudang Utama Jakarta", location: "Jakarta Pusat" },
    }),
    prisma.warehouse.create({
      data: { warehouseCode: "WH-002", warehouseName: "Gudang Cabang Surabaya", location: "Surabaya" },
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
        costingMethod: CostingMethod.AVERAGE,
        taxCode: "PPN11",
        reorderPoint: 5,
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
        costingMethod: CostingMethod.AVERAGE,
        taxCode: "PPN11",
        reorderPoint: 10,
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
        costingMethod: CostingMethod.FIFO,
        taxCode: "PPN11",
        reorderPoint: 10,
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
        costingMethod: CostingMethod.FIFO,
        taxCode: "PPN11",
        reorderPoint: 10,
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
        costingMethod: CostingMethod.AVERAGE,
        taxCode: "NON_TAX",
        reorderPoint: 20,
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
        costingMethod: CostingMethod.AVERAGE,
        taxCode: "PPN11",
        reorderPoint: 15,
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
        costingMethod: CostingMethod.STANDARD,
        taxCode: "PPN11",
        reorderPoint: 8,
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
        costingMethod: CostingMethod.AVERAGE,
        taxCode: "PPN11",
        reorderPoint: 0,
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
        costingMethod: CostingMethod.AVERAGE,
        taxCode: "PPN11",
        reorderPoint: 0,
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
        costingMethod: CostingMethod.STANDARD,
        taxCode: "NON_TAX",
        reorderPoint: 0,
      },
    }),
  ])

  const [laptop, monitor, keyboard, mouse, paper, ink, headset] = items

  // ─── Inventory Stocks (some low stock < reorderPoint) ─────────────────────
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
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)

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
          { itemId: laptop.id, quantity: 5, unitPrice: 9800000, subtotal: 5 * 9800000 },
          { itemId: monitor.id, quantity: 10, unitPrice: 2700000, subtotal: 10 * 2700000 },
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
          { itemId: laptop.id, quantity: poPaidLaptopQty, unitPrice: 9800000, subtotal: poPaidLaptopQty * 9800000 },
          { itemId: keyboard.id, quantity: poPaidKeyboardQty, unitPrice: 600000, subtotal: poPaidKeyboardQty * 600000 },
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
          { poItemId: poPaidLaptopItem.id, itemId: laptop.id, quantityOrdered: poPaidLaptopQty, quantityReceived: poPaidLaptopQty },
          { poItemId: poPaidKeyboardItem.id, itemId: keyboard.id, quantityOrdered: poPaidKeyboardQty, quantityReceived: poPaidKeyboardQty },
        ],
      },
    },
    include: { items: true },
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

  const [grLaptopItem, grKeyboardItem] = grPaid.items

  const billPaid = await prisma.vendorBill.create({
    data: {
      billNumber: `BILL-${now.getFullYear()}-0001`,
      billType: BillType.PO_BASED,
      matchStatus: MatchStatus.MATCHED,
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
      items: {
        create: [
          {
            itemId: laptop.id,
            description: "Laptop Dell Latitude 5540",
            quantity: poPaidLaptopQty,
            unitPrice: 9800000,
            subtotal: poPaidLaptopQty * 9800000,
            poItemId: poPaidLaptopItem.id,
            grItemId: grLaptopItem.id,
          },
          {
            itemId: keyboard.id,
            description: "Keyboard Mechanical",
            quantity: poPaidKeyboardQty,
            unitPrice: 600000,
            subtotal: poPaidKeyboardQty * 600000,
            poItemId: poPaidKeyboardItem.id,
            grItemId: grKeyboardItem.id,
          },
        ],
      },
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

  // ─── PO 3: BILLED (APPROVED, partial payment → PARTIALLY_PAID sample) ─────
  const poBilledTotal = 5 * 2700000 + 30 * 35000
  const poBilled = await prisma.purchaseOrder.create({
    data: {
      poNumber: `PO-${now.getFullYear()}-0003`,
      supplierId: suppliers[2].id,
      createdById: purchasing.id,
      orderDate: twoMonthsAgo,
      totalAmount: poBilledTotal,
      status: "BILLED",
      items: {
        create: [
          { itemId: monitor.id, quantity: 5, unitPrice: 2700000, subtotal: 5 * 2700000 },
          { itemId: paper.id, quantity: 30, unitPrice: 35000, subtotal: 30 * 35000 },
        ],
      },
    },
    include: { items: true },
  })
  const [poBilledMonitorItem, poBilledPaperItem] = poBilled.items

  const grBilled = await prisma.goodsReceipt.create({
    data: {
      grNumber: `GR-${now.getFullYear()}-0002`,
      poId: poBilled.id,
      receivedById: inventory.id,
      warehouseId: whMain.id,
      status: "CONFIRMED",
      items: {
        create: [
          { poItemId: poBilledMonitorItem.id, itemId: monitor.id, quantityOrdered: 5, quantityReceived: 5 },
          { poItemId: poBilledPaperItem.id, itemId: paper.id, quantityOrdered: 30, quantityReceived: 30 },
        ],
      },
    },
    include: { items: true },
  })
  const [grBilledMonitorItem, grBilledPaperItem] = grBilled.items

  const billPartiallyPaid = await prisma.vendorBill.create({
    data: {
      billNumber: `BILL-${now.getFullYear()}-0002`,
      billType: BillType.PO_BASED,
      matchStatus: MatchStatus.MATCHED,
      poId: poBilled.id,
      grId: grBilled.id,
      supplierId: suppliers[2].id,
      billDate: new Date(twoMonthsAgo.getTime() + 10 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // due in 7 days
      totalAmount: poBilledTotal,
      paidAmount: 5000000,
      status: "PARTIALLY_PAID",
      createdById: apAnalyst.id,
      approvedById: accounting.id,
      items: {
        create: [
          {
            itemId: monitor.id,
            description: "Monitor LG 27 inch",
            quantity: 5,
            unitPrice: 2700000,
            subtotal: 5 * 2700000,
            poItemId: poBilledMonitorItem.id,
            grItemId: grBilledMonitorItem.id,
          },
          {
            itemId: paper.id,
            description: "Kertas A4 80gsm",
            quantity: 30,
            unitPrice: 35000,
            subtotal: 30 * 35000,
            poItemId: poBilledPaperItem.id,
            grItemId: grBilledPaperItem.id,
          },
        ],
      },
    },
  })

  await prisma.billPayment.create({
    data: {
      paymentNumber: `PAY-${now.getFullYear()}-0002`,
      billId: billPartiallyPaid.id,
      amount: 5000000,
      paymentDate: new Date(twoMonthsAgo.getTime() + 15 * 24 * 60 * 60 * 1000),
      paymentMethod: "BANK_TRANSFER",
      referenceNumber: "TRF-2025-002",
      notes: "Pembayaran sebagian",
      paidById: apAnalyst.id,
    },
  })

  // ─── Standalone Bill sample ────────────────────────────────────────────────
  const billStandalone = await prisma.vendorBill.create({
    data: {
      billNumber: `BILL-${now.getFullYear()}-0003`,
      billType: BillType.STANDALONE,
      matchStatus: MatchStatus.NOT_APPLICABLE,
      supplierId: suppliers[3].id,
      billDate: thisMonth,
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      totalAmount: 3500000,
      status: "APPROVED",
      createdById: apAnalyst.id,
      approvedById: accounting.id,
      items: {
        create: [
          {
            description: "Sewa Gudang Bulan Juni 2026",
            quantity: 1,
            unitPrice: 2500000,
            subtotal: 2500000,
          },
          {
            description: "Biaya Listrik Gudang",
            quantity: 1,
            unitPrice: 1000000,
            subtotal: 1000000,
          },
        ],
      },
    },
  })

  // ─── SO 1: PENDING_APPROVAL ────────────────────────────────────────────────
  const soPendingTotal = 3 * 12500000 + 5 * 3500000
  await prisma.salesOrder.create({
    data: {
      soNumber: `SO-${now.getFullYear()}-0001`,
      customerId: customers[0].id,
      createdById: salesRep.id,
      departmentId: deptSales.id,
      classId: classA.id,
      orderDate: thisMonth,
      deliveryDate: new Date(thisMonth.getTime() + 7 * 24 * 60 * 60 * 1000),
      totalAmount: soPendingTotal,
      status: "PENDING_APPROVAL",
      taxCode: "PPN11",
      priceLevel: "Retail",
      notes: "Menunggu persetujuan sales manager",
      items: {
        create: [
          { itemId: laptop.id, quantity: 3, unitPrice: 12500000, discount: 0, subtotal: 3 * 12500000 },
          { itemId: monitor.id, quantity: 5, unitPrice: 3500000, discount: 0, subtotal: 5 * 3500000 },
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
      departmentId: deptIT.id,
      classId: classB.id,
      orderDate: twoMonthsAgo,
      deliveryDate: new Date(twoMonthsAgo.getTime() + 5 * 24 * 60 * 60 * 1000),
      totalAmount: soShippedTotal,
      status: "SHIPPED",
      taxCode: "PPN11",
      priceLevel: "Wholesale",
      notes: "Order dikirim ke customer enterprise",
      items: {
        create: [
          { itemId: mouse.id, quantity: soShippedMouseQty, unitPrice: 450000, discount: 0, subtotal: soShippedMouseQty * 450000 },
          { itemId: headset.id, quantity: soShippedHeadsetQty, unitPrice: 550000, discount: 0, subtotal: soShippedHeadsetQty * 550000 },
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

  // ─── SO 3: INVOICED + OVERDUE Invoice ────────────────────────────────────
  const soInvoicedTotal = 10 * 850000
  const soInvoiced = await prisma.salesOrder.create({
    data: {
      soNumber: `SO-${now.getFullYear()}-0003`,
      customerId: customers[1].id,
      createdById: salesRep.id,
      approvedById: salesManager.id,
      orderDate: threeMonthsAgo,
      totalAmount: soInvoicedTotal,
      status: "INVOICED",
      items: {
        create: [
          { itemId: keyboard.id, quantity: 10, unitPrice: 850000, discount: 0, subtotal: soInvoicedTotal },
        ],
      },
    },
  })

  // Create overdue invoice (dueDate 60 days ago)
  await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${now.getFullYear()}-0001`,
      soId: soInvoiced.id,
      customerId: customers[1].id,
      invoiceDate: new Date(threeMonthsAgo.getTime() + 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago = OVERDUE
      totalAmount: soInvoicedTotal,
      paidAmount: 0,
      status: "OVERDUE",
      notes: "Invoice overdue — belum dibayar",
      createdById: users[6].id, // AR analyst
    },
  })

  // ─── SO 4: INVOICED + PARTIALLY_PAID invoice ─────────────────────────────
  const soInvoiced4Total = 5 * 12500000
  const soInvoiced4 = await prisma.salesOrder.create({
    data: {
      soNumber: `SO-${now.getFullYear()}-0004`,
      customerId: customers[0].id,
      createdById: salesRep.id,
      approvedById: salesManager.id,
      orderDate: lastMonth,
      totalAmount: soInvoiced4Total,
      status: "INVOICED",
      departmentId: deptSales.id,
      classId: classA.id,
      items: {
        create: [
          { itemId: laptop.id, quantity: 5, unitPrice: 12500000, discount: 0, subtotal: soInvoiced4Total },
        ],
      },
    },
  })

  const invoice4 = await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${now.getFullYear()}-0002`,
      soId: soInvoiced4.id,
      customerId: customers[0].id,
      invoiceDate: new Date(lastMonth.getTime() + 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // due in 14 days
      totalAmount: soInvoiced4Total,
      paidAmount: 25000000,
      status: "PARTIALLY_PAID",
      createdById: users[6].id,
    },
  })

  await prisma.customerPayment.create({
    data: {
      paymentNumber: `CPAY-${now.getFullYear()}-0001`,
      invoiceId: invoice4.id,
      amount: 25000000,
      paymentDate: new Date(lastMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
      paymentMethod: "BANK_TRANSFER",
      referenceNumber: "TRF-CUST-001",
      notes: "Pembayaran sebagian",
      receivedById: users[6].id,
    },
  })

  // ─── Additional SO for chart data (previous months) ───────────────────────
  await prisma.salesOrder.create({
    data: {
      soNumber: `SO-${now.getFullYear()}-0005`,
      customerId: customers[3].id,
      createdById: salesRep.id,
      approvedById: salesManager.id,
      orderDate: twoMonthsAgo,
      totalAmount: 8500000,
      status: "APPROVED",
      items: {
        create: [
          { itemId: keyboard.id, quantity: 10, unitPrice: 850000, discount: 0, subtotal: 8500000 },
        ],
      },
    },
  })

  console.log("✅ Seed completed!")
  console.log(`   Users: ${users.length} (password: ${PASSWORD})`)
  console.log(`   Departments: 4, Classes: 3`)
  console.log(`   Warehouses: 2 (WH-001, WH-002)`)
  console.log(`   Items: 10 (7 INVENTORY, 2 NON_INVENTORY, 1 SERVICE)`)
  console.log(`   Suppliers: 5, Customers: 5`)
  console.log(`   POs: CONFIRMED, PAID, BILLED`)
  console.log(`   Bills: PO-based PAID, PO-based PARTIALLY_PAID, Standalone APPROVED`)
  console.log(`   SOs: PENDING_APPROVAL, SHIPPED, INVOICED (overdue), INVOICED (partial)`)
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
