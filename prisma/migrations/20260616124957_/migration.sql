/*
  Warnings:

  - A unique constraint covering the columns `[warehouseCode]` on the table `warehouses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CostingMethod" AS ENUM ('FIFO', 'LIFO', 'AVERAGE', 'STANDARD');

-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('PO_BASED', 'STANDALONE');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'MATCHED', 'MISMATCH');

-- AlterEnum
ALTER TYPE "BillStatus" ADD VALUE 'PARTIALLY_PAID';

-- DropForeignKey
ALTER TABLE "vendor_bills" DROP CONSTRAINT "vendor_bills_poId_fkey";

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "costingMethod" "CostingMethod" NOT NULL DEFAULT 'AVERAGE',
ADD COLUMN     "reorderPoint" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "taxCode" TEXT DEFAULT 'PPN11';

-- AlterTable
ALTER TABLE "sales_orders" ADD COLUMN     "classId" TEXT,
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "priceLevel" TEXT,
ADD COLUMN     "taxCode" TEXT;

-- AlterTable
ALTER TABLE "vendor_bills" ADD COLUMN     "billType" "BillType" NOT NULL DEFAULT 'PO_BASED',
ADD COLUMN     "matchStatus" "MatchStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
ALTER COLUMN "poId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "warehouses" ADD COLUMN     "warehouseCode" TEXT;

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_bill_items" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "itemId" TEXT,
    "description" TEXT,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "poItemId" TEXT,
    "grItemId" TEXT,

    CONSTRAINT "vendor_bill_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "classes_code_key" ON "classes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_warehouseCode_key" ON "warehouses"("warehouseCode");

-- AddForeignKey
ALTER TABLE "vendor_bills" ADD CONSTRAINT "vendor_bills_poId_fkey" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bill_items" ADD CONSTRAINT "vendor_bill_items_billId_fkey" FOREIGN KEY ("billId") REFERENCES "vendor_bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bill_items" ADD CONSTRAINT "vendor_bill_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bill_items" ADD CONSTRAINT "vendor_bill_items_poItemId_fkey" FOREIGN KEY ("poItemId") REFERENCES "purchase_order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bill_items" ADD CONSTRAINT "vendor_bill_items_grItemId_fkey" FOREIGN KEY ("grItemId") REFERENCES "goods_receipt_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
