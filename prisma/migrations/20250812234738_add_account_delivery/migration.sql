-- CreateTable
CREATE TABLE "AccountDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientName" TEXT NOT NULL,
    "clientUser" TEXT NOT NULL,
    "clientContact" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "productDetails" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "purchaseDate" DATETIME NOT NULL,
    "deliveryUser" TEXT,
    "deliveryPass" TEXT,
    "deliveryEmail" TEXT,
    "deliveryInstructions" TEXT,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "AccountDelivery_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
