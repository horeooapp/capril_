-- Auto-generated enum coercions for PostgreSQL
DO $$
BEGIN
  BEGIN
    ALTER TABLE "fiscal_dossiers" ALTER COLUMN "statut" TYPE "FiscalStatus" USING "statut"::text::"FiscalStatus";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "disputes" ALTER COLUMN "status" TYPE "DisputeStatus" USING "status"::text::"DisputeStatus";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "cdc_deposits" ALTER COLUMN "initiator" TYPE "CDCDepositInitiator" USING "initiator"::text::"CDCDepositInitiator";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "users" ALTER COLUMN "active_plan_tier" TYPE "PlanTier" USING "active_plan_tier"::text::"PlanTier";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "insurance_claims" ALTER COLUMN "status" TYPE "InsuranceClaimStatus" USING "status"::text::"InsuranceClaimStatus";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "mediations" ALTER COLUMN "status" TYPE "MediationStatus" USING "status"::text::"MediationStatus";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "prepayment_requests" ALTER COLUMN "status" TYPE "PrepaymentRequestStatus" USING "status"::text::"PrepaymentRequestStatus";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "land_lease_info" ALTER COLUMN "usage_declare" TYPE "TerrainUsage" USING "usage_declare"::text::"TerrainUsage";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "land_lease_info" ALTER COLUMN "periodicite_loyer" TYPE "Periodicite" USING "periodicite_loyer"::text::"Periodicite";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "leases" ALTER COLUMN "mode_utilities" TYPE "UtilityMode" USING "mode_utilities"::text::"UtilityMode";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "leases" ALTER COLUMN "modele_repartition" TYPE "RepartitionModel" USING "modele_repartition"::text::"RepartitionModel";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "ticket_maintenance" ALTER COLUMN "statut" TYPE "MaintenanceStatus" USING "statut"::text::"MaintenanceStatus";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "ticket_maintenance" ALTER COLUMN "categorie" TYPE "MaintenanceCategory" USING "categorie"::text::"MaintenanceCategory";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "agences_regularisation" ALTER COLUMN "statut" TYPE "RegStatut" USING "statut"::text::"RegStatut";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "sms_declarations" ALTER COLUMN "statut" TYPE "DeclStatut" USING "statut"::text::"DeclStatut";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "tarif_negocie" ALTER COLUMN "type" TYPE "NegocieType" USING "type"::text::"NegocieType";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "signalements_locataire" ALTER COLUMN "categorie" TYPE "SignalCatEnum" USING "categorie"::text::"SignalCatEnum";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "signalements_locataire" ALTER COLUMN "statut" TYPE "SignalStatutEnum" USING "statut"::text::"SignalStatutEnum";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "preavis_bail" ALTER COLUMN "statut" TYPE "PreavisStatutEnum" USING "statut"::text::"PreavisStatutEnum";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "etats_des_lieux" ALTER COLUMN "statut" TYPE "EdlStatut" USING "statut"::text::"EdlStatut";
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER TABLE "champion_prospects" ALTER COLUMN "statut" TYPE "ProspectStatut" USING "statut"::text::"ProspectStatut";
  EXCEPTION WHEN OTHERS THEN END;
  
  -- Also fix reversals
  BEGIN
    ALTER TABLE "reversal_transactions" ALTER COLUMN "status" TYPE "ReversalStatus" USING "status"::text::"ReversalStatus";
  EXCEPTION WHEN OTHERS THEN END;
  
  BEGIN
    ALTER TABLE "payments_pgw" ALTER COLUMN "reversal_status" TYPE "ReversalStatus" USING "reversal_status"::text::"ReversalStatus";
  EXCEPTION WHEN OTHERS THEN END;

END $$;
