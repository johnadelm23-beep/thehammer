-- Safe, additive migration for THE HAMMER Serial Number Lookup System.
-- Preserves all existing tables, products, categories, quotes, users, and customer data.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SerialType') THEN
    CREATE TYPE "SerialType" AS ENUM ('PUMP', 'MOTOR');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "Shipment" (
  "id" TEXT NOT NULL,
  "shipmentCode" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "shipmentDate" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "piNumber" TEXT NOT NULL,
  "totalQuantity" INTEGER,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Shipment_shipmentCode_key" ON "Shipment"("shipmentCode");
CREATE INDEX IF NOT EXISTS "Shipment_invoiceNumber_idx" ON "Shipment"("invoiceNumber");
CREATE INDEX IF NOT EXISTS "Shipment_piNumber_idx" ON "Shipment"("piNumber");

CREATE TABLE IF NOT EXISTS "SerialNumberRecord" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "productName" TEXT NOT NULL DEFAULT 'FIRE PUMP',
  "serialType" "SerialType" NOT NULL,
  "serialStart" TEXT NOT NULL,
  "serialEnd" TEXT NOT NULL,
  "rangeStartNum" BIGINT,
  "rangeEndNum" BIGINT,
  "isRange" BOOLEAN NOT NULL DEFAULT true,
  "productGroupId" TEXT,
  "productGroupModel" TEXT,
  "productModel" TEXT,
  "possibleModels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "relatedPumpSerial" TEXT,
  "relatedMotorSerial" TEXT,
  "requiresVerification" BOOLEAN NOT NULL DEFAULT false,
  "isOverlapping" BOOLEAN NOT NULL DEFAULT false,
  "overlapNote" TEXT,
  "productStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
  "unitDetails" JSONB,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SerialNumberRecord_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SerialNumberRecord_shipmentId_fkey"
    FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SerialNumberRecord_shipmentId_idx" ON "SerialNumberRecord"("shipmentId");
CREATE INDEX IF NOT EXISTS "SerialNumberRecord_serialType_idx" ON "SerialNumberRecord"("serialType");
CREATE INDEX IF NOT EXISTS "SerialNumberRecord_serialStart_idx" ON "SerialNumberRecord"("serialStart");
CREATE INDEX IF NOT EXISTS "SerialNumberRecord_serialEnd_idx" ON "SerialNumberRecord"("serialEnd");
CREATE INDEX IF NOT EXISTS "SerialNumberRecord_rangeStartNum_rangeEndNum_idx" ON "SerialNumberRecord"("rangeStartNum", "rangeEndNum");
CREATE INDEX IF NOT EXISTS "SerialNumberRecord_relatedPumpSerial_idx" ON "SerialNumberRecord"("relatedPumpSerial");
CREATE INDEX IF NOT EXISTS "SerialNumberRecord_relatedMotorSerial_idx" ON "SerialNumberRecord"("relatedMotorSerial");
CREATE INDEX IF NOT EXISTS "SerialNumberRecord_productGroupId_idx" ON "SerialNumberRecord"("productGroupId");
CREATE INDEX IF NOT EXISTS "SerialNumberRecord_productModel_idx" ON "SerialNumberRecord"("productModel");
CREATE INDEX IF NOT EXISTS "SerialNumberRecord_requiresVerification_idx" ON "SerialNumberRecord"("requiresVerification");
CREATE INDEX IF NOT EXISTS "SerialNumberRecord_isOverlapping_idx" ON "SerialNumberRecord"("isOverlapping");

