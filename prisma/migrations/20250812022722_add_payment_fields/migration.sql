-- AlterTable
ALTER TABLE "payment_confirmations" ADD COLUMN "clientName" TEXT;
ALTER TABLE "payment_confirmations" ADD COLUMN "communicationMethod" TEXT;
ALTER TABLE "payment_confirmations" ADD COLUMN "managerPercentage" REAL;
ALTER TABLE "payment_confirmations" ADD COLUMN "productName" TEXT;
