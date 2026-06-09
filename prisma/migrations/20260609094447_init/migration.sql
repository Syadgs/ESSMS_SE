-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PURCHASING_MANAGER', 'INVENTORY_MANAGER', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNTING_MANAGER', 'AP_ANALYST', 'AR_ANALYST', 'ADMIN');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('INVENTORY', 'NON_INVENTORY', 'SERVICE');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('INCREASE', 'DECREASE');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('DRAFT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "POStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'BILLED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GRStatus" AS ENUM ('DRAFT', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CASH', 'CHECK');

-- CreateEnum
CREATE TYPE "SOStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING', 'PICKING', 'PACKING', 'SHIPPED', 'INVOICED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PickStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PackStatus" AS ENUM ('DRAFT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ShipStatus" AS ENUM ('DRAFT', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "supplierCode" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "creditLimit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "warehouseName" TEXT NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "description" TEXT,
    "unitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "costPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_stocks" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_adjustments" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "adjustmentType" "AdjustmentType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "adjustedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transfers" (
    "id" TEXT NOT NULL,
    "transferNumber" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "fromWarehouseId" TEXT NOT NULL,
    "toWarehouseId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "transferredById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3),
    "totalAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "POStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipts" (
    "id" TEXT NOT NULL,
    "grNumber" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "receivedById" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "GRStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt_items" (
    "id" TEXT NOT NULL,
    "grId" TEXT NOT NULL,
    "poItemId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantityOrdered" INTEGER NOT NULL,
    "quantityReceived" INTEGER NOT NULL,

    CONSTRAINT "goods_receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_bills" (
    "id" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "grId" TEXT,
    "supplierId" TEXT NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "BillStatus" NOT NULL DEFAULT 'DRAFT',
    "rejectionNote" TEXT,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_payments" (
    "id" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "paidById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bill_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" TEXT NOT NULL,
    "soNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3),
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "status" "SOStatus" NOT NULL DEFAULT 'DRAFT',
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order_items" (
    "id" TEXT NOT NULL,
    "soId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL,
    "discount" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "sales_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pick_orders" (
    "id" TEXT NOT NULL,
    "soId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "pickedById" TEXT NOT NULL,
    "pickDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PickStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pick_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pack_orders" (
    "id" TEXT NOT NULL,
    "pickOrderId" TEXT NOT NULL,
    "packedById" TEXT NOT NULL,
    "packDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "packageCount" INTEGER NOT NULL DEFAULT 1,
    "totalWeight" DECIMAL(8,2),
    "status" "PackStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pack_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "shipmentNumber" TEXT NOT NULL,
    "packOrderId" TEXT NOT NULL,
    "soId" TEXT NOT NULL,
    "shippedById" TEXT NOT NULL,
    "shipDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "status" "ShipStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "soId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_payments" (
    "id" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "receivedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplierCode_key" ON "suppliers"("supplierCode");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customerCode_key" ON "customers"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "items_itemCode_key" ON "items"("itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_stocks_itemId_warehouseId_key" ON "inventory_stocks"("itemId", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_transfers_transferNumber_key" ON "inventory_transfers"("transferNumber");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_poNumber_key" ON "purchase_orders"("poNumber");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receipts_grNumber_key" ON "goods_receipts"("grNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_bills_billNumber_key" ON "vendor_bills"("billNumber");

-- CreateIndex
CREATE UNIQUE INDEX "bill_payments_paymentNumber_key" ON "bill_payments"("paymentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_soNumber_key" ON "sales_orders"("soNumber");

-- CreateIndex
CREATE UNIQUE INDEX "pack_orders_pickOrderId_key" ON "pack_orders"("pickOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_shipmentNumber_key" ON "shipments"("shipmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_packOrderId_key" ON "shipments"("packOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "customer_payments_paymentNumber_key" ON "customer_payments"("paymentNumber");

-- AddForeignKey
ALTER TABLE "inventory_stocks" ADD CONSTRAINT "inventory_stocks_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stocks" ADD CONSTRAINT "inventory_stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_adjustedById_fkey" FOREIGN KEY ("adjustedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_transferredById_fkey" FOREIGN KEY ("transferredById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_poId_fkey" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_poId_fkey" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_grId_fkey" FOREIGN KEY ("grId") REFERENCES "goods_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_poItemId_fkey" FOREIGN KEY ("poItemId") REFERENCES "purchase_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bills" ADD CONSTRAINT "vendor_bills_poId_fkey" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bills" ADD CONSTRAINT "vendor_bills_grId_fkey" FOREIGN KEY ("grId") REFERENCES "goods_receipts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bills" ADD CONSTRAINT "vendor_bills_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bills" ADD CONSTRAINT "vendor_bills_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bills" ADD CONSTRAINT "vendor_bills_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_billId_fkey" FOREIGN KEY ("billId") REFERENCES "vendor_bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_soId_fkey" FOREIGN KEY ("soId") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pick_orders" ADD CONSTRAINT "pick_orders_soId_fkey" FOREIGN KEY ("soId") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pick_orders" ADD CONSTRAINT "pick_orders_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pick_orders" ADD CONSTRAINT "pick_orders_pickedById_fkey" FOREIGN KEY ("pickedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_orders" ADD CONSTRAINT "pack_orders_pickOrderId_fkey" FOREIGN KEY ("pickOrderId") REFERENCES "pick_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_orders" ADD CONSTRAINT "pack_orders_packedById_fkey" FOREIGN KEY ("packedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_packOrderId_fkey" FOREIGN KEY ("packOrderId") REFERENCES "pack_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_soId_fkey" FOREIGN KEY ("soId") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_shippedById_fkey" FOREIGN KEY ("shippedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_soId_fkey" FOREIGN KEY ("soId") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_payments" ADD CONSTRAINT "customer_payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_payments" ADD CONSTRAINT "customer_payments_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
