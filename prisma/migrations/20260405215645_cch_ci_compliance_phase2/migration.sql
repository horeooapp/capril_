/*
  Warnings:

  - You are about to drop the column `date_restitution` on the `cautions_bail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cautions_bail" DROP COLUMN "date_restitution",
ADD COLUMN     "cles_restituees_at" TIMESTAMP(3),
ADD COLUMN     "deadline_restitution" TIMESTAMP(3),
ADD COLUMN     "montant_retenu" DOUBLE PRECISION,
ADD COLUMN     "restitue_at" TIMESTAMP(3),
ADD COLUMN     "statut_restitution" TEXT NOT NULL DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "leases" ADD COLUMN     "acte_enregistrement_remis_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "preavis_bails" ADD COLUMN     "conteste_at" TIMESTAMP(3),
ADD COLUMN     "deadline_contestation" TIMESTAMP(3),
ADD COLUMN     "lettre_resiliation_envoyee_at" TIMESTAMP(3),
ADD COLUMN     "mode_envoi" TEXT;

-- AlterTable
ALTER TABLE "propositions_loyer" ADD COLUMN     "date_effet_demandee" TIMESTAMP(3),
ADD COLUMN     "date_notification" TIMESTAMP(3),
ADD COLUMN     "est_conforme_delai_ans" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "est_conforme_preavis" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "motif_nullite" TEXT;
