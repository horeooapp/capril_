-- scripts/pre-deploy.sql
-- Fichier généré pour contourner l'erreur Prisma "invalid input value for enum"

BEGIN;

-- 1. Convertir les champs ENUM existants en TEXT temporairement pour permettre le nettoyage des accents
-- (La transformation inverse en ENUM sera gérée nativement et sans erreur par npx prisma db push)
DO $$
BEGIN
    BEGIN ALTER TABLE "tickets_maintenance" ALTER COLUMN "statut" TYPE TEXT USING "statut"::text; EXCEPTION WHEN OTHERS THEN END;
    BEGIN ALTER TABLE "factures_utilities" ALTER COLUMN "statut" TYPE TEXT USING "statut"::text; EXCEPTION WHEN OTHERS THEN END;
    BEGIN ALTER TABLE "champions_commissions" ALTER COLUMN "statut" TYPE TEXT USING "statut"::text; EXCEPTION WHEN OTHERS THEN END;
    BEGIN ALTER TABLE "leases" ALTER COLUMN "mode_utilities" TYPE TEXT USING "mode_utilities"::text; EXCEPTION WHEN OTHERS THEN END;
    BEGIN ALTER TABLE "leases" ALTER COLUMN "modele_repartition" TYPE TEXT USING "modele_repartition"::text; EXCEPTION WHEN OTHERS THEN END;
END $$;

-- 2. Nettoyage des anciennes données (suppression des accents pour correspondre aux futurs Enums)
UPDATE "tickets_maintenance" SET "statut" = 'RESOLU' WHERE "statut" = 'RÉSOLU';
UPDATE "tickets_maintenance" SET "statut" = 'CLOTURE' WHERE "statut" = 'CLÔTURÉ';
UPDATE "tickets_maintenance" SET "statut" = 'CONTESTE' WHERE "statut" = 'CONTESTÉ';
UPDATE "factures_utilities" SET "statut" = 'PAYEE' WHERE "statut" = 'PAYÉE';

-- 3. Renommage préventif des colonnes camelCase pour éviter leur suppression (drop/add) par Prisma !!
DO $$ 
BEGIN
  -- Table properties
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='areaSqm') THEN ALTER TABLE "properties" RENAME COLUMN "areaSqm" TO "area_sqm"; END IF;
  
  -- Table leases
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='alerte30j') THEN ALTER TABLE "leases" RENAME COLUMN "alerte30j" TO "alerte_30j"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='alerte60j') THEN ALTER TABLE "leases" RENAME COLUMN "alerte60j" TO "alerte_60j"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='alerte90j') THEN ALTER TABLE "leases" RENAME COLUMN "alerte90j" TO "alerte_90j"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='draftData') THEN ALTER TABLE "leases" RENAME COLUMN "draftData" TO "draft_data"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='droitsDgiCalcules') THEN ALTER TABLE "leases" RENAME COLUMN "droitsDgiCalcules" TO "droits_dgi_calcules"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='fraisQapril') THEN ALTER TABLE "leases" RENAME COLUMN "fraisQapril" TO "frais_qapril"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='loiApplicable') THEN ALTER TABLE "leases" RENAME COLUMN "loiApplicable" TO "loi_applicable"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='qrCodeUrl') THEN ALTER TABLE "leases" RENAME COLUMN "qrCodeUrl" TO "qr_code_url"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='seuilJ15') THEN ALTER TABLE "leases" RENAME COLUMN "seuilJ15" TO "seuil_j15"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='seuilJ3') THEN ALTER TABLE "leases" RENAME COLUMN "seuilJ3" TO "seuil_j3"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='seuilJ7') THEN ALTER TABLE "leases" RENAME COLUMN "seuilJ7" TO "seuil_j7"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='sha256CalculeLe') THEN ALTER TABLE "leases" RENAME COLUMN "sha256CalculeLe" TO "sha256_calcule_le"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='sha256Hash') THEN ALTER TABLE "leases" RENAME COLUMN "sha256Hash" TO "sha256_hash"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='statutDraft') THEN ALTER TABLE "leases" RENAME COLUMN "statutDraft" TO "statut_draft"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='versionDraft') THEN ALTER TABLE "leases" RENAME COLUMN "versionDraft" TO "version_draft"; END IF;

  -- Table receipts
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='receipts' AND column_name='arcCertificationId') THEN ALTER TABLE "receipts" RENAME COLUMN "arcCertificationId" TO "arc_certification_id"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='receipts' AND column_name='arcDemande') THEN ALTER TABLE "receipts" RENAME COLUMN "arcDemande" TO "arc_demande"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='receipts' AND column_name='arcHorodatage') THEN ALTER TABLE "receipts" RENAME COLUMN "arcHorodatage" TO "arc_horodatage"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='receipts' AND column_name='commentaireInterne') THEN ALTER TABLE "receipts" RENAME COLUMN "commentaireInterne" TO "commentaire_interne"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='receipts' AND column_name='dateEncaissement') THEN ALTER TABLE "receipts" RENAME COLUMN "dateEncaissement" TO "date_encaissement"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='receipts' AND column_name='flagWebhookNonRecu') THEN ALTER TABLE "receipts" RENAME COLUMN "flagWebhookNonRecu" TO "flag_webhook_non_recu"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='receipts' AND column_name='moisConcerne') THEN ALTER TABLE "receipts" RENAME COLUMN "moisConcerne" TO "mois_concerne"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='receipts' AND column_name='preuveUrl') THEN ALTER TABLE "receipts" RENAME COLUMN "preuveUrl" TO "preuve_url"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='receipts' AND column_name='qrCodeUrl') THEN ALTER TABLE "receipts" RENAME COLUMN "qrCodeUrl" TO "qr_code_url"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='receipts' AND column_name='sha256CalculeLe') THEN ALTER TABLE "receipts" RENAME COLUMN "sha256CalculeLe" TO "sha256_calcule_le"; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='receipts' AND column_name='sha256Hash') THEN ALTER TABLE "receipts" RENAME COLUMN "sha256Hash" TO "sha256_hash"; END IF;

  -- Table tickets_maintenance
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets_maintenance' AND column_name='categorie_v2') THEN ALTER TABLE "tickets_maintenance" RENAME COLUMN "categorie_v2" TO "categorie"; END IF;
END $$;

-- Not needed anymore: Prisma db push s'occupera finement de la création dynamique des Enums
-- car toutes les dépendances strictes ("invalid enum value") ont été levées.

COMMIT;
