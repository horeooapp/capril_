/*
  Warnings:

  - A unique constraint covering the columns `[numero_agrement]` on the table `agence_profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "agence_profiles" ADD COLUMN     "agrement_date" TIMESTAMP(3),
ADD COLUMN     "garantie_financiere" TEXT,
ADD COLUMN     "numero_agrement" TEXT,
ADD COLUMN     "rc_pro" TEXT,
ADD COLUMN     "statut_legal" TEXT NOT NULL DEFAULT 'NON_AGREE';

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "en_vente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locataire_renonce_preemption" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preemption_notifiee_at" TIMESTAMP(3),
ADD COLUMN     "prix_vente_fcfa" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "agence_profiles_numero_agrement_key" ON "agence_profiles"("numero_agrement");
