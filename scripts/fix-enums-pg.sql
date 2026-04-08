-- CREATE ENUMS IF THEY DO NOT EXIST

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'ANAH_AGENT', 'CDC_AGENT', 'LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'TENANT', 'NON_CERTIFIED_AGENT', 'CHAMPION');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CDCDepositStatus') THEN
        CREATE TYPE "CDCDepositStatus" AS ENUM ('AWAITING_PAYMENT', 'PENDING', 'CONSIGNED', 'RETURN_REQUESTED', 'RETURNED', 'FORFEITED');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CDCDepositInitiator') THEN
        CREATE TYPE "CDCDepositInitiator" AS ENUM ('OWNER', 'AGENCY', 'ADMIN');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LeaseStatus') THEN
        CREATE TYPE "LeaseStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION', 'PENDING_DEPOSIT', 'ACTIVE', 'ACTIVE_DECLARATIF', 'LOYER_IMPAYE', 'MISE_EN_DEMEURE', 'CLEMENCE_EN_COURS', 'REPRISE_PROCEDURE', 'DEMANDE_RESILIATION', 'TERMINATED', 'CANCELLED', 'ARCHIVED');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TypeBail') THEN
        CREATE TYPE "TypeBail" AS ENUM ('ECRIT', 'DECLARATIF_BDQ', 'DECLARATIF_EN_COURS_FORMALISATION');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PlanTier') THEN
        CREATE TYPE "PlanTier" AS ENUM ('LOCATAIRE', 'ESSENTIEL', 'PRO', 'PREMIUM', 'INSTITUTIONNEL');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PlanStatus') THEN
        CREATE TYPE "PlanStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED', 'BROKEN', 'COMPLETED');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InsuranceStatus') THEN
        CREATE TYPE "InsuranceStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InsuranceClaimStatus') THEN
        CREATE TYPE "InsuranceClaimStatus" AS ENUM ('OPEN', 'PROCESSING', 'RESOLVED', 'REJECTED');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MediationStatus') THEN
        CREATE TYPE "MediationStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DisputeStatus') THEN
        CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'WAITING_RESPONSE', 'IN_MEDIATION', 'RESOLVED', 'ESCALATED', 'CLOSED');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PrepaymentRequestStatus') THEN
        CREATE TYPE "PrepaymentRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FiscalStatus') THEN
        CREATE TYPE "FiscalStatus" AS ENUM ('EN_ATTENTE_DECLARATION', 'NOTIFIE', 'EN_COURS_PAIEMENT', 'PAYE_CONFIRME', 'ENREGISTRE', 'ECHEC_PAIEMENT', 'PAIEMENT_PARTIEL', 'DECLARATION_EN_RETARD', 'IGNORE_PAR_BAILLEUR', 'RENOUVELE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MandateType') THEN
        CREATE TYPE "MandateType" AS ENUM ('EXCLUSIVE', 'SIMPLE', 'CO_EXCLUSIVE', 'DIRECT');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MandateStatus') THEN
        CREATE TYPE "MandateStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'DRAFT');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DeclencheurEnum') THEN
        CREATE TYPE "DeclencheurEnum" AS ENUM ('SOLDE_BAS', 'FIN_DE_MOIS', 'CREDIT_GENERE', 'RAPPEL_MENSUEL', 'MANUEL');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ManagementMode') THEN
        CREATE TYPE "ManagementMode" AS ENUM ('AGENCY', 'DIRECT', 'MIXED');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ColocRole') THEN
        CREATE TYPE "ColocRole" AS ENUM ('PRINCIPAL', 'SECONDAIRE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ColocMode') THEN
        CREATE TYPE "ColocMode" AS ENUM ('GROUPE', 'INDIVIDUEL', 'LIBRE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LoyerStatut') THEN
        CREATE TYPE "LoyerStatut" AS ENUM ('EN_ATTENTE', 'PARTIEL', 'COMPLET', 'EXCEDENT', 'IMPAYE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TerrainUsage') THEN
        CREATE TYPE "TerrainUsage" AS ENUM ('PARKING_VEHICULES', 'PARKING_CAMIONS', 'COMMERCE_TEMPORAIRE', 'STOCKAGE', 'AGRICULTURE', 'EVENEMENTIEL', 'INDUSTRIEL', 'AUTRE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Periodicite') THEN
        CREATE TYPE "Periodicite" AS ENUM ('JOURNALIER', 'HEBDOMADAIRE', 'MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL', 'FORFAIT');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VisibEnum') THEN
        CREATE TYPE "VisibEnum" AS ENUM ('INVISIBLE', 'INVITATION_PROPRIO', 'INVITATION_AGENCE', 'TOUS');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvitStatutEnum') THEN
        CREATE TYPE "InvitStatutEnum" AS ENUM ('ENVOYEE', 'VUE', 'ACCEPTEE', 'REFUSEE', 'EXPIREE', 'ANNULEE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UtilityMode') THEN
        CREATE TYPE "UtilityMode" AS ENUM ('INDIVIDUEL_LOCATAIRE', 'PARTAGE_PROPRIO', 'INDIVIDUEL_PROPRIO', 'MIXTE', 'NON_APPLICABLE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RepartitionModel') THEN
        CREATE TYPE "RepartitionModel" AS ENUM ('PRORATA_CHAMBRE', 'FORFAIT_FIXE', 'USAGE_DECLARE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UtilityType') THEN
        CREATE TYPE "UtilityType" AS ENUM ('CIE', 'SODECI');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UtilityStatus') THEN
        CREATE TYPE "UtilityStatus" AS ENUM ('EN_COURS', 'PAYEE', 'EN_RETARD', 'PARTIELLE', 'EN_ATTENTE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MaintenanceCategory') THEN
        CREATE TYPE "MaintenanceCategory" AS ENUM ('MAI_EL', 'MAI_EA', 'MAI_TO', 'MAI_SE', 'MAI_SA', 'MAI_PC', 'MAI_AU', 'MAI_DI');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MaintenanceStatus') THEN
        CREATE TYPE "MaintenanceStatus" AS ENUM ('EN_ATTENTE', 'PRIS_EN_CHARGE', 'RESOLU', 'CONTESTE', 'LITIGE', 'CLOTURE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReversalStatus') THEN
        CREATE TYPE "ReversalStatus" AS ENUM ('NONE', 'SUCCESS', 'PENDING', 'REVERSED', 'FAILED');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReversalType') THEN
        CREATE TYPE "ReversalType" AS ENUM ('AGENCY_COMMISSION', 'LANDLORD_RENT');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentCanal') THEN
        CREATE TYPE "PaymentCanal" AS ENUM ('ORANGE', 'MTN', 'WAVE', 'MOOV', 'CINETPAY_M17', 'SMS_DECLARATIF', 'SMS', 'WHATSAPP', 'EMAIL', 'PUSH', 'APP_CHAT');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentPgwStatus') THEN
        CREATE TYPE "PaymentPgwStatus" AS ENUM ('INITIEE', 'EN_ATTENTE_PAIEMENT', 'CONFIRMEE', 'ECHEC', 'EXPIREE', 'DECLAREE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EdlType') THEN
        CREATE TYPE "EdlType" AS ENUM ('ENTREE', 'SORTIE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SigDoc') THEN
        CREATE TYPE "SigDoc" AS ENUM ('BAIL', 'BAIL_COMMERCIAL', 'MANDAT', 'EDL', 'ACCORD_MEDIATION', 'AVENANT');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SigStatut') THEN
        CREATE TYPE "SigStatut" AS ENUM ('EN_ATTENTE', 'SIGNE', 'REFUSE', 'EXPIRE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CandStatut') THEN
        CREATE TYPE "CandStatut" AS ENUM ('SOUMISE', 'EN_ETUDE', 'ACCEPTEE', 'REFUSEE', 'CONVERTIE_LOCATAIRE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ChargeType') THEN
        CREATE TYPE "ChargeType" AS ENUM ('EAU', 'ELECTRICITE_COMMUNE', 'GARDIENNAGE', 'NETTOYAGE', 'TOM', 'AUTRE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AgendaType') THEN
        CREATE TYPE "AgendaType" AS ENUM ('VISITE', 'EDL_ENTREE', 'EDL_SORTIE', 'REMISE_CLES', 'REUNION_PROPRIO', 'TRAVAUX', 'ECHEANCE_BAIL', 'AUTRE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LegalType') THEN
        CREATE TYPE "LegalType" AS ENUM ('PRE_NOTICE', 'COMMAND_TO_PAY', 'TERMINATION_NOTICE', 'EVICTION_ORDER');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MigrationStatus') THEN
        CREATE TYPE "MigrationStatus" AS ENUM ('UPLOADE', 'EN_ANALYSE', 'RAPPORT_GENERE', 'COMMITE', 'ERREUR');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InspectionStatus') THEN
        CREATE TYPE "InspectionStatus" AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InspectionType') THEN
        CREATE TYPE "InspectionType" AS ENUM ('ENTRY', 'EXIT');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RoomStatus') THEN
        CREATE TYPE "RoomStatus" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReminderType') THEN
        CREATE TYPE "ReminderType" AS ENUM ('D_MINUS_5', 'D_DAY', 'D_PLUS_5', 'LEGAL_NOTICE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BdqStatut') THEN
        CREATE TYPE "BdqStatut" AS ENUM ('PENDING_LOCATAIRE', 'CONFIRME', 'CONFIRME_AGENT', 'CONFIRME_MEDIATION', 'DECLARATIF_SANS_REPONSE', 'DECLARATIF_UNILATERAL', 'CONTESTE', 'FORMALISE', 'ARCHIVE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BdqConvStatut') THEN
        CREATE TYPE "BdqConvStatut" AS ENUM ('EN_COURS', 'EN_PAUSE', 'COMPLETE', 'ABANDONNE', 'EXPIRE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotifCanal') THEN
        CREATE TYPE "NotifCanal" AS ENUM ('WHATSAPP', 'SMS', 'EMAIL', 'PUSH');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotifStatut') THEN
        CREATE TYPE "NotifStatut" AS ENUM ('EN_ATTENTE', 'ENVOYE', 'LIVRE', 'LU', 'ECHEC', 'ANNULE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BienRole') THEN
        CREATE TYPE "BienRole" AS ENUM ('OWNER', 'INTERMEDIAIRE', 'AGENCE', 'FIELD_AGENT');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProfilInterm') THEN
        CREATE TYPE "ProfilInterm" AS ENUM ('PARENT_AMI', 'NOTAIRE', 'HUISSIER', 'AVOCAT');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RegStatut') THEN
        CREATE TYPE "RegStatut" AS ENUM ('EN_COURS', 'PROLONGE_RECEPISSE', 'PROLONGE_FORMATION', 'REGULARISE', 'BASCULE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DeclStatut') THEN
        CREATE TYPE "DeclStatut" AS ENUM ('EN_ATTENTE', 'CONFIRME', 'CONTESTE', 'EXPIRE', 'AUTO_GENERE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PromoType') THEN
        CREATE TYPE "PromoType" AS ENUM ('MOIS_GRATUITS', 'REMISE_POURCENTAGE', 'REMISE_MONTANT', 'PRIX_FIXE', 'ESSAI_ETENDU');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NegocieType') THEN
        CREATE TYPE "NegocieType" AS ENUM ('ABONNEMENT_DEROGATOIRE', 'QUITTANCE_DEROGATOIRE', 'ENREGISTREMENT_DEROGATOIRE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SignalCatEnum') THEN
        CREATE TYPE "SignalCatEnum" AS ENUM ('FUITE_EAU', 'ELECTRICITE', 'PORTE_SERRURE', 'NUISANCE', 'DEGRADATION', 'AUTRE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SignalStatutEnum') THEN
        CREATE TYPE "SignalStatutEnum" AS ENUM ('ENVOYE', 'VU_PROPRIO', 'EN_COURS', 'RESOLU', 'NON_RESOLU_FERME');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CautionDestEnum') THEN
        CREATE TYPE "CautionDestEnum" AS ENUM ('PROPRIETAIRE', 'CDC_CI', 'AUTRE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PreavisStatutEnum') THEN
        CREATE TYPE "PreavisStatutEnum" AS ENUM ('EMIS', 'ACCUSE', 'ETAT_LIEUX_PLANIFIE', 'CLOS');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EdlStatut') THEN
        CREATE TYPE "EdlStatut" AS ENUM ('EN_COURS', 'SOUMIS_LOCATAIRE', 'CONFIRME', 'CONTESTE', 'CERTIFIE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProspectStatut') THEN
        CREATE TYPE "ProspectStatut" AS ENUM ('A_RAPPELER', 'EN_DISCUSSION', 'INSCRIT', 'PAS_INTERESSE', 'PERDU');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CommType') THEN
        CREATE TYPE "CommType" AS ENUM ('BAIL_FORMEL', 'BDQ_CONFIRME', 'FORMALISATION', 'RECRUTEMENT', 'BONUS');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProfileType') THEN
        CREATE TYPE "ProfileType" AS ENUM ('LANDLORD', 'CERTIFIED_AGENCY', 'NON_CERTIFIED_AGENCY', 'INTERMEDIARY', 'DIASPORA', 'TENANT');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TypePropriete') THEN
        CREATE TYPE "TypePropriete" AS ENUM ('IMMEUBLE', 'COUR', 'RESIDENCE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CommissionStatut') THEN
        CREATE TYPE "CommissionStatut" AS ENUM ('EN_ATTENTE', 'VALIDE', 'PAYE', 'ANNULE');
    END IF;
END $$;


-- Auto-generated enum coercions for PostgreSQL
DO $$
BEGIN
  BEGIN
    ALTER TABLE "fiscal_dossiers" ALTER COLUMN "statut" TYPE "FiscalStatus" USING "statut"::text::"FiscalStatus";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "disputes" ALTER COLUMN "status" TYPE "DisputeStatus" USING "status"::text::"DisputeStatus";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "cdc_deposits" ALTER COLUMN "initiator" TYPE "CDCDepositInitiator" USING "initiator"::text::"CDCDepositInitiator";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "users" ALTER COLUMN "active_plan_tier" TYPE "PlanTier" USING "active_plan_tier"::text::"PlanTier";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "insurance_claims" ALTER COLUMN "status" TYPE "InsuranceClaimStatus" USING "status"::text::"InsuranceClaimStatus";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "mediations" ALTER COLUMN "status" TYPE "MediationStatus" USING "status"::text::"MediationStatus";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "prepayment_requests" ALTER COLUMN "status" TYPE "PrepaymentRequestStatus" USING "status"::text::"PrepaymentRequestStatus";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "land_lease_info" ALTER COLUMN "usage_declare" TYPE "TerrainUsage" USING "usage_declare"::text::"TerrainUsage";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "land_lease_info" ALTER COLUMN "periodicite_loyer" TYPE "Periodicite" USING "periodicite_loyer"::text::"Periodicite";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "leases" ALTER COLUMN "mode_utilities" TYPE "UtilityMode" USING "mode_utilities"::text::"UtilityMode";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "leases" ALTER COLUMN "modele_repartition" TYPE "RepartitionModel" USING "modele_repartition"::text::"RepartitionModel";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "ticket_maintenance" ALTER COLUMN "statut" TYPE "MaintenanceStatus" USING "statut"::text::"MaintenanceStatus";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "ticket_maintenance" ALTER COLUMN "categorie" TYPE "MaintenanceCategory" USING "categorie"::text::"MaintenanceCategory";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "agences_regularisation" ALTER COLUMN "statut" TYPE "RegStatut" USING "statut"::text::"RegStatut";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "sms_declarations" ALTER COLUMN "statut" TYPE "DeclStatut" USING "statut"::text::"DeclStatut";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "tarif_negocie" ALTER COLUMN "type" TYPE "NegocieType" USING "type"::text::"NegocieType";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "signalements_locataire" ALTER COLUMN "categorie" TYPE "SignalCatEnum" USING "categorie"::text::"SignalCatEnum";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "signalements_locataire" ALTER COLUMN "statut" TYPE "SignalStatutEnum" USING "statut"::text::"SignalStatutEnum";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "preavis_bail" ALTER COLUMN "statut" TYPE "PreavisStatutEnum" USING "statut"::text::"PreavisStatutEnum";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "etats_des_lieux" ALTER COLUMN "statut" TYPE "EdlStatut" USING "statut"::text::"EdlStatut";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

  BEGIN
    ALTER TABLE "champion_prospects" ALTER COLUMN "statut" TYPE "ProspectStatut" USING "statut"::text::"ProspectStatut";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;
  
  -- Also fix reversals
  BEGIN
    ALTER TABLE "reversal_transactions" ALTER COLUMN "status" TYPE "ReversalStatus" USING "status"::text::"ReversalStatus";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;
  
  BEGIN
    ALTER TABLE "payments_pgw" ALTER COLUMN "reversal_status" TYPE "ReversalStatus" USING "reversal_status"::text::"ReversalStatus";
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed: %', SQLERRM; END;

END $$;
