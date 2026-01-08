-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_profileId_fkey";

-- DropForeignKey
ALTER TABLE "_BorrowedTools" DROP CONSTRAINT "_BorrowedTools_A_fkey";

-- DropForeignKey
ALTER TABLE "_BorrowedTools" DROP CONSTRAINT "_BorrowedTools_B_fkey";

-- DropForeignKey
ALTER TABLE "_RentedTools" DROP CONSTRAINT "_RentedTools_A_fkey";

-- DropForeignKey
ALTER TABLE "_RentedTools" DROP CONSTRAINT "_RentedTools_B_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "end",
DROP COLUMN "profileId",
DROP COLUMN "start",
DROP COLUMN "totalCents",
ADD COLUMN     "borrowerId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pickUpDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "returnDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "totalPrice" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "renterId",
ADD COLUMN     "renterId" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "_BorrowedTools";

-- DropTable
DROP TABLE "_RentedTools";

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

