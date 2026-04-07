-- AlterTable
ALTER TABLE "agence_profiles" ADD COLUMN     "nif" TEXT,
ADD COLUMN     "nif_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profession" TEXT,
ADD COLUMN     "salary" DOUBLE PRECISION;
