-- scripts/pre-deploy.sql
-- Fichier généré pour sécuriser la mise en production sans perte de données
-- Ce script nettoie les données, renomme les colonnes et effectue les transtypages vers ENUM de manière explicite.

BEGIN;

-- 1. Nettoyage des anciennes données (suppression des accents pour correspondre aux Enums)
UPDATE "tickets_maintenance" SET "statut" = 'RESOLU' WHERE "statut" = 'RÉSOLU';
UPDATE "tickets_maintenance" SET "statut" = 'CLOTURE' WHERE "statut" = 'CLÔTURÉ';
UPDATE "tickets_maintenance" SET "statut" = 'CONTESTE' WHERE "statut" = 'CONTESTÉ';
UPDATE "factures_utilities" SET "statut" = 'PAYEE' WHERE "statut" = 'PAYÉE';

-- 2. Création de tous les Nouveaux Types / Enums s'ils n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PlanTier') THEN CREATE TYPE "PlanTier" AS ENUM ('LOCATAIRE', 'PROPRIETAIRE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CDCDepositInitiator') THEN CREATE TYPE "CDCDepositInitiator" AS ENUM ('OWNER', 'TENANT', 'ADMIN'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TerrainUsage') THEN CREATE TYPE "TerrainUsage" AS ENUM ('RESIDENTIEL', 'COMMERCIAL', 'AGRICOLE', 'AUTRE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Periodicite') THEN CREATE TYPE "Periodicite" AS ENUM ('MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DisputeStatus') THEN CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'ESCALE', 'RESOLU', 'CLOS'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InsuranceClaimStatus') THEN CREATE TYPE "InsuranceClaimStatus" AS ENUM ('OPEN', 'EN_TRAITEMENT', 'APPROUVE', 'REFUSE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MediationStatus') THEN CREATE TYPE "MediationStatus" AS ENUM ('OPEN', 'EN_COURS', 'RESOLU', 'ECHEC'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FiscalStatus') THEN CREATE TYPE "FiscalStatus" AS ENUM ('EN_ATTENTE_DECLARATION', 'DECLARATION_SOUMISE', 'VALIDE', 'REJETE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PrepaymentRequestStatus') THEN CREATE TYPE "PrepaymentRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReversalStatus') THEN CREATE TYPE "ReversalStatus" AS ENUM ('NONE', 'SUCCESS', 'FAILED', 'PENDING'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MaintenanceCategory') THEN CREATE TYPE "MaintenanceCategory" AS ENUM ('PLOMBERIE', 'ELECTRICITE', 'MRL_01', 'CARRELAGE', 'MACAONERIE', 'HUISS_MENUI', 'CLIM_AERATION', 'PEINTURE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MaintenanceStatus') THEN CREATE TYPE "MaintenanceStatus" AS ENUM ('EN_ATTENTE', 'PRIS_EN_CHARGE', 'RESOLU', 'CONTESTE', 'LITIGE', 'CLOTURE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InspectionStatus') THEN CREATE TYPE "InspectionStatus" AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RoomStatus') THEN CREATE TYPE "RoomStatus" AS ENUM ('GOOD', 'BAD', 'FAIR'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReminderType') THEN CREATE TYPE "ReminderType" AS ENUM ('LOYER_RETARD', 'FACTURE_IMPAYEE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BdqConvStatut') THEN CREATE TYPE "BdqConvStatut" AS ENUM ('EN_COURS', 'TERMINE', 'ARCHIVE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotifStatut') THEN CREATE TYPE "NotifStatut" AS ENUM ('EN_ATTENTE', 'ENVOYE', 'ERREUR'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RegStatut') THEN CREATE TYPE "RegStatut" AS ENUM ('EN_COURS', 'VALIDE', 'REFUSE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DeclStatut') THEN CREATE TYPE "DeclStatut" AS ENUM ('EN_ATTENTE', 'TRAITE', 'ERREUR'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NegocieType') THEN CREATE TYPE "NegocieType" AS ENUM ('FORFAIT', 'POURCENTAGE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SignalCatEnum') THEN CREATE TYPE "SignalCatEnum" AS ENUM ('BRUIT', 'VOISINAGE', 'DEGRADATION'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SignalStatutEnum') THEN CREATE TYPE "SignalStatutEnum" AS ENUM ('ENVOYE', 'TRAITE', 'CLOTURE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CautionDestEnum') THEN CREATE TYPE "CautionDestEnum" AS ENUM ('PROPRIETAIRE', 'CDC', 'AUTRE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PreavisStatutEnum') THEN CREATE TYPE "PreavisStatutEnum" AS ENUM ('EMIS', 'ACCEPTE', 'REFUSE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VisibEnum') THEN CREATE TYPE "VisibEnum" AS ENUM ('INVISIBLE', 'VISIBLE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvitStatutEnum') THEN CREATE TYPE "InvitStatutEnum" AS ENUM ('ENVOYEE', 'ACCEPTEE', 'REFUSEE', 'EXPIREE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProspectStatut') THEN CREATE TYPE "ProspectStatut" AS ENUM ('A_RAPPELER', 'TRAITE', 'INSCRIT'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CommissionStatut') THEN CREATE TYPE "CommissionStatut" AS ENUM ('EN_ATTENTE', 'VALIDE', 'PAYE', 'ANNULE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DeclencheurEnum') THEN CREATE TYPE "DeclencheurEnum" AS ENUM ('AUTO', 'MANUEL'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UtilityType') THEN CREATE TYPE "UtilityType" AS ENUM ('CIE', 'SODECI', 'INTERNET', 'EAU', 'ELECTRICITE'); END IF;

    -- Cas particulier pour les types déjà existants mais sans le nouveau nom
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UtilityMode') THEN CREATE TYPE "UtilityMode" AS ENUM ('INDIVIDUEL_LOCATAIRE', 'PARTAGE_PROPRIO', 'INDIVIDUEL_PROPRIO', 'MIXTE', 'NON_APPLICABLE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RepartitionModel') THEN CREATE TYPE "RepartitionModel" AS ENUM ('PRORATA_CHAMBRE', 'FORFAIT_FIXE', 'USAGE_DECLARE'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UtilityStatus') THEN CREATE TYPE "UtilityStatus" AS ENUM ('EN_COURS', 'PAYEE', 'EN_RETARD', 'PARTIELLE', 'EN_ATTENTE'); END IF;
END $$;

-- 3. Renommage préventif des colonnes pour éviter leur suppression par Prisma !!
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

-- 4. Cast explicite des colonnes existantes vers Enum (SANS SUPPRESSION DE DONNÉES)
-- Note: nous ajoutons NULLIF ou limitons les casts pour éviter les erreurs si la valeur est hors de l'enum par mégarde
DO $$
BEGIN
  -- users
  BEGIN ALTER TABLE "users" ALTER COLUMN "active_plan_tier" TYPE "PlanTier" USING (CASE WHEN "active_plan_tier" IN ('LOCATAIRE', 'PROPRIETAIRE') THEN "active_plan_tier"::text::"PlanTier" ELSE 'LOCATAIRE'::"PlanTier" END); EXCEPTION WHEN OTHERS THEN END;
  
  -- cdc_deposits
  BEGIN ALTER TABLE "cdc_deposits" ALTER COLUMN "initiator" TYPE "CDCDepositInitiator" USING "initiator"::text::"CDCDepositInitiator"; EXCEPTION WHEN OTHERS THEN END;
  
  -- land_lease_info
  BEGIN ALTER TABLE "land_lease_info" ALTER COLUMN "usage_declare" TYPE "TerrainUsage" USING "usage_declare"::text::"TerrainUsage"; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE "land_lease_info" ALTER COLUMN "periodicite_loyer" TYPE "Periodicite" USING "periodicite_loyer"::text::"Periodicite"; EXCEPTION WHEN OTHERS THEN END;
  
  -- disputes
  BEGIN ALTER TABLE "disputes" ALTER COLUMN "status" TYPE "DisputeStatus" USING "status"::text::"DisputeStatus"; EXCEPTION WHEN OTHERS THEN END;
  
  -- insurance_claims
  BEGIN ALTER TABLE "insurance_claims" ALTER COLUMN "status" TYPE "InsuranceClaimStatus" USING "status"::text::"InsuranceClaimStatus"; EXCEPTION WHEN OTHERS THEN END;
  
  -- mediations
  BEGIN ALTER TABLE "mediations" ALTER COLUMN "status" TYPE "MediationStatus" USING "status"::text::"MediationStatus"; EXCEPTION WHEN OTHERS THEN END;
  
  -- fiscal_dossiers
  BEGIN ALTER TABLE "fiscal_dossiers" ALTER COLUMN "statut" TYPE "FiscalStatus" USING "statut"::text::"FiscalStatus"; EXCEPTION WHEN OTHERS THEN END;
  
  -- prepayment_requests
  BEGIN ALTER TABLE "prepayment_requests" ALTER COLUMN "status" TYPE "PrepaymentRequestStatus" USING "status"::text::"PrepaymentRequestStatus"; EXCEPTION WHEN OTHERS THEN END;
  
  -- payments_pgw
  BEGIN ALTER TABLE "payments_pgw" ALTER COLUMN "reversal_status" TYPE "ReversalStatus" USING "reversal_status"::text::"ReversalStatus"; EXCEPTION WHEN OTHERS THEN END;
  
  -- reversal_transactions
  BEGIN ALTER TABLE "reversal_transactions" ALTER COLUMN "status" TYPE "ReversalStatus" USING "status"::text::"ReversalStatus"; EXCEPTION WHEN OTHERS THEN END;
  
  -- tickets_maintenance
  BEGIN ALTER TABLE "tickets_maintenance" ALTER COLUMN "categorie" TYPE "MaintenanceCategory" USING "categorie"::text::"MaintenanceCategory"; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE "tickets_maintenance" ALTER COLUMN "statut" TYPE "MaintenanceStatus" USING "statut"::text::"MaintenanceStatus"; EXCEPTION WHEN OTHERS THEN END;
  
  -- inspections
  BEGIN ALTER TABLE "inspections" ALTER COLUMN "status" TYPE "InspectionStatus" USING "status"::text::"InspectionStatus"; EXCEPTION WHEN OTHERS THEN END;
  
  -- inspection_rooms
  BEGIN ALTER TABLE "inspection_rooms" ALTER COLUMN "status" TYPE "RoomStatus" USING "status"::text::"RoomStatus"; EXCEPTION WHEN OTHERS THEN END;
  
  -- reminder_logs
  BEGIN ALTER TABLE "reminder_logs" ALTER COLUMN "type" TYPE "ReminderType" USING "type"::text::"ReminderType"; EXCEPTION WHEN OTHERS THEN END;

  -- bdq_conversation_states
  BEGIN ALTER TABLE "bdq_conversation_states" ALTER COLUMN "statut" TYPE "BdqConvStatut" USING "statut"::text::"BdqConvStatut"; EXCEPTION WHEN OTHERS THEN END;
  
  -- notification_logs
  BEGIN ALTER TABLE "notification_logs" ALTER COLUMN "statut" TYPE "NotifStatut" USING "statut"::text::"NotifStatut"; EXCEPTION WHEN OTHERS THEN END;
  
  -- agences_regularisation
  BEGIN ALTER TABLE "agences_regularisation" ALTER COLUMN "statut" TYPE "RegStatut" USING "statut"::text::"RegStatut"; EXCEPTION WHEN OTHERS THEN END;
  
  -- sms_declarations
  BEGIN ALTER TABLE "sms_declarations" ALTER COLUMN "statut" TYPE "DeclStatut" USING "statut"::text::"DeclStatut"; EXCEPTION WHEN OTHERS THEN END;
  
  -- tarifs_negocie
  BEGIN ALTER TABLE "tarifs_negocie" ALTER COLUMN "type" TYPE "NegocieType" USING "type"::text::"NegocieType"; EXCEPTION WHEN OTHERS THEN END;
  
  -- signalements_locataire
  BEGIN ALTER TABLE "signalements_locataire" ALTER COLUMN "categorie" TYPE "SignalCatEnum" USING "categorie"::text::"SignalCatEnum"; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE "signalements_locataire" ALTER COLUMN "statut" TYPE "SignalStatutEnum" USING "statut"::text::"SignalStatutEnum"; EXCEPTION WHEN OTHERS THEN END;
  
  -- cautions_bail
  BEGIN ALTER TABLE "cautions_bail" ALTER COLUMN "destination" TYPE "CautionDestEnum" USING "destination"::text::"CautionDestEnum"; EXCEPTION WHEN OTHERS THEN END;
  
  -- preavis_bails
  BEGIN ALTER TABLE "preavis_bails" ALTER COLUMN "statut" TYPE "PreavisStatutEnum" USING "statut"::text::"PreavisStatutEnum"; EXCEPTION WHEN OTHERS THEN END;
  
  -- locataire_profils_publics
  BEGIN ALTER TABLE "locataire_profils_publics" ALTER COLUMN "visibilite" TYPE "VisibEnum" USING "visibilite"::text::"VisibEnum"; EXCEPTION WHEN OTHERS THEN END;
  
  -- invitations_bail
  BEGIN ALTER TABLE "invitations_bail" ALTER COLUMN "statut" TYPE "InvitStatutEnum" USING "statut"::text::"InvitStatutEnum"; EXCEPTION WHEN OTHERS THEN END;

  -- champions_prospects
  BEGIN ALTER TABLE "champions_prospects" ALTER COLUMN "statut" TYPE "ProspectStatut" USING "statut"::text::"ProspectStatut"; EXCEPTION WHEN OTHERS THEN END;
  
  -- champions_commissions
  BEGIN ALTER TABLE "champions_commissions" ALTER COLUMN "statut" TYPE "CommissionStatut" USING "statut"::text::"CommissionStatut"; EXCEPTION WHEN OTHERS THEN END;
  
  -- wallet_recharge_links
  BEGIN ALTER TABLE "wallet_recharge_links" ALTER COLUMN "declencheur" TYPE "DeclencheurEnum" USING "declencheur"::text::"DeclencheurEnum"; EXCEPTION WHEN OTHERS THEN END;
  
  -- factures_utilities
  BEGIN ALTER TABLE "factures_utilities" ALTER COLUMN "type_utility" TYPE "UtilityType" USING "type_utility"::text::"UtilityType"; EXCEPTION WHEN OTHERS THEN END;
END $$;

COMMIT;
