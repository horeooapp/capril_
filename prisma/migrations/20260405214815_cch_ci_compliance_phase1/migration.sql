/*
  Warnings:

  - You are about to drop the column `estCourEntiere` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `niveau` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `nomBien` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `nomComplet` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `typePropriete` on the `properties` table. All the data in the column will be lost.
  - You are about to alter the column `declared_rent_fcfa` on the `properties` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "leases" ADD COLUMN     "avance_loyer" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "avance_loyer_conforme_at" TIMESTAMP(3),
ADD COLUMN     "mode_creation" TEXT NOT NULL DEFAULT 'NUMERIQUE',
ALTER COLUMN "loiApplicable" SET DEFAULT 'Loi n°2019-576 du 26 juin 2019',
ALTER COLUMN "preavis_requis_mois" SET DEFAULT 3;

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "estCourEntiere",
DROP COLUMN "niveau",
DROP COLUMN "nomBien",
DROP COLUMN "nomComplet",
DROP COLUMN "typePropriete",
ALTER COLUMN "declared_rent_fcfa" SET DATA TYPE INTEGER;
