-- AlterTable: Rename columns to preserve data
ALTER TABLE "Booking" RENAME COLUMN "renterId" TO "rentedById";
ALTER TABLE "Booking" RENAME COLUMN "borrowerId" TO "borrowedById";
