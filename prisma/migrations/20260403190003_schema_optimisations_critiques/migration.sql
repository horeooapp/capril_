-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'ANAH_AGENT', 'CDC_AGENT', 'LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'TENANT', 'NON_CERTIFIED_AGENT', 'CHAMPION');

-- CreateEnum
CREATE TYPE "CDCDepositStatus" AS ENUM ('AWAITING_PAYMENT', 'PENDING', 'CONSIGNED', 'RETURN_REQUESTED', 'RETURNED', 'FORFEITED');

-- CreateEnum
CREATE TYPE "CDCDepositInitiator" AS ENUM ('OWNER', 'AGENCY', 'ADMIN');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION', 'PENDING_DEPOSIT', 'ACTIVE', 'ACTIVE_DECLARATIF', 'LOYER_IMPAYE', 'MISE_EN_DEMEURE', 'CLEMENCE_EN_COURS', 'REPRISE_PROCEDURE', 'DEMANDE_RESILIATION', 'TERMINATED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TypeBail" AS ENUM ('ECRIT', 'DECLARATIF_BDQ', 'DECLARATIF_EN_COURS_FORMALISATION');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('LOCATAIRE', 'ESSENTIEL', 'PRO', 'PREMIUM', 'INSTITUTIONNEL');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED', 'BROKEN', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InsuranceClaimStatus" AS ENUM ('OPEN', 'PROCESSING', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MediationStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'WAITING_RESPONSE', 'IN_MEDIATION', 'RESOLVED', 'ESCALATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PrepaymentRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FiscalStatus" AS ENUM ('EN_ATTENTE_DECLARATION', 'NOTIFIE', 'EN_COURS_PAIEMENT', 'PAYE_CONFIRME', 'ENREGISTRE', 'ECHEC_PAIEMENT', 'PAIEMENT_PARTIEL', 'DECLARATION_EN_RETARD', 'IGNORE_PAR_BAILLEUR', 'RENOUVELE');

-- CreateEnum
CREATE TYPE "MandateType" AS ENUM ('EXCLUSIVE', 'SIMPLE', 'CO_EXCLUSIVE', 'DIRECT');

-- CreateEnum
CREATE TYPE "MandateStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'DRAFT');

-- CreateEnum
CREATE TYPE "DeclencheurEnum" AS ENUM ('SOLDE_BAS', 'FIN_DE_MOIS', 'CREDIT_GENERE', 'RAPPEL_MENSUEL', 'MANUEL');

-- CreateEnum
CREATE TYPE "ManagementMode" AS ENUM ('AGENCY', 'DIRECT', 'MIXED');

-- CreateEnum
CREATE TYPE "ColocRole" AS ENUM ('PRINCIPAL', 'SECONDAIRE');

-- CreateEnum
CREATE TYPE "ColocMode" AS ENUM ('GROUPE', 'INDIVIDUEL', 'LIBRE');

-- CreateEnum
CREATE TYPE "LoyerStatut" AS ENUM ('EN_ATTENTE', 'PARTIEL', 'COMPLET', 'EXCEDENT', 'IMPAYE');

-- CreateEnum
CREATE TYPE "TerrainUsage" AS ENUM ('PARKING_VEHICULES', 'PARKING_CAMIONS', 'COMMERCE_TEMPORAIRE', 'STOCKAGE', 'AGRICULTURE', 'EVENEMENTIEL', 'INDUSTRIEL', 'AUTRE');

-- CreateEnum
CREATE TYPE "Periodicite" AS ENUM ('JOURNALIER', 'HEBDOMADAIRE', 'MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL', 'FORFAIT');

-- CreateEnum
CREATE TYPE "VisibEnum" AS ENUM ('INVISIBLE', 'INVITATION_PROPRIO', 'INVITATION_AGENCE', 'TOUS');

-- CreateEnum
CREATE TYPE "InvitStatutEnum" AS ENUM ('ENVOYEE', 'VUE', 'ACCEPTEE', 'REFUSEE', 'EXPIREE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "UtilityMode" AS ENUM ('INDIVIDUEL_LOCATAIRE', 'PARTAGÉ_PROPRIO', 'INDIVIDUEL_PROPRIO', 'MIXTE', 'NON_APPLICABLE');

-- CreateEnum
CREATE TYPE "RepartitionModel" AS ENUM ('PRORATA_CHAMBRE', 'FORFAIT_FIXE', 'USAGE_DÉCLARÉ');

-- CreateEnum
CREATE TYPE "UtilityType" AS ENUM ('CIE', 'SODECI');

-- CreateEnum
CREATE TYPE "UtilityStatus" AS ENUM ('EN_COURS', 'PAYÉE', 'EN_RETARD', 'PARTIELLE', 'EN_ATTENTE');

-- CreateEnum
CREATE TYPE "MaintenanceCategory" AS ENUM ('MAI_EL', 'MAI_EA', 'MAI_TO', 'MAI_SE', 'MAI_SA', 'MAI_PC', 'MAI_AU', 'MAI_DI');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('EN_ATTENTE', 'PRIS_EN_CHARGE', 'RÉSOLU', 'CONTESTÉ', 'LITIGE', 'CLÔTURÉ');

-- CreateEnum
CREATE TYPE "ReversalStatus" AS ENUM ('PENDING', 'REVERSED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReversalType" AS ENUM ('AGENCY_COMMISSION', 'LANDLORD_RENT');

-- CreateEnum
CREATE TYPE "PaymentCanal" AS ENUM ('ORANGE', 'MTN', 'WAVE', 'MOOV', 'CINETPAY_M17', 'SMS_DECLARATIF', 'SMS', 'WHATSAPP', 'EMAIL', 'PUSH', 'APP_CHAT');

-- CreateEnum
CREATE TYPE "PaymentPgwStatus" AS ENUM ('INITIEE', 'EN_ATTENTE_PAIEMENT', 'CONFIRMEE', 'ECHEC', 'EXPIREE', 'DECLAREE');

-- CreateEnum
CREATE TYPE "EdlType" AS ENUM ('ENTREE', 'SORTIE');

-- CreateEnum
CREATE TYPE "SigDoc" AS ENUM ('BAIL', 'BAIL_COMMERCIAL', 'MANDAT', 'EDL', 'ACCORD_MEDIATION', 'AVENANT');

-- CreateEnum
CREATE TYPE "SigStatut" AS ENUM ('EN_ATTENTE', 'SIGNE', 'REFUSE', 'EXPIRE');

-- CreateEnum
CREATE TYPE "CandStatut" AS ENUM ('SOUMISE', 'EN_ETUDE', 'ACCEPTEE', 'REFUSEE', 'CONVERTIE_LOCATAIRE');

-- CreateEnum
CREATE TYPE "ChargeType" AS ENUM ('EAU', 'ELECTRICITE_COMMUNE', 'GARDIENNAGE', 'NETTOYAGE', 'TOM', 'AUTRE');

-- CreateEnum
CREATE TYPE "AgendaType" AS ENUM ('VISITE', 'EDL_ENTREE', 'EDL_SORTIE', 'REMISE_CLES', 'REUNION_PROPRIO', 'TRAVAUX', 'ECHEANCE_BAIL', 'AUTRE');

-- CreateEnum
CREATE TYPE "LegalType" AS ENUM ('PRE_NOTICE', 'COMMAND_TO_PAY', 'TERMINATION_NOTICE', 'EVICTION_ORDER');

-- CreateEnum
CREATE TYPE "MigrationStatus" AS ENUM ('UPLOADE', 'EN_ANALYSE', 'RAPPORT_GENERE', 'COMMITE', 'ERREUR');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('ENTRY', 'EXIT');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('D_MINUS_5', 'D_DAY', 'D_PLUS_5', 'LEGAL_NOTICE');

-- CreateEnum
CREATE TYPE "BdqStatut" AS ENUM ('PENDING_LOCATAIRE', 'CONFIRME', 'CONFIRME_AGENT', 'CONFIRME_MEDIATION', 'DECLARATIF_SANS_REPONSE', 'DECLARATIF_UNILATERAL', 'CONTESTE', 'FORMALISE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "BdqConvStatut" AS ENUM ('EN_COURS', 'EN_PAUSE', 'COMPLETE', 'ABANDONNE', 'EXPIRE');

-- CreateEnum
CREATE TYPE "NotifCanal" AS ENUM ('WHATSAPP', 'SMS', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "NotifStatut" AS ENUM ('EN_ATTENTE', 'ENVOYE', 'LIVRE', 'LU', 'ECHEC', 'ANNULE');

-- CreateEnum
CREATE TYPE "BienRole" AS ENUM ('OWNER', 'INTERMEDIAIRE', 'AGENCE', 'FIELD_AGENT');

-- CreateEnum
CREATE TYPE "ProfilInterm" AS ENUM ('PARENT_AMI', 'NOTAIRE', 'HUISSIER', 'AVOCAT');

-- CreateEnum
CREATE TYPE "RegStatut" AS ENUM ('EN_COURS', 'PROLONGE_RECEPISSE', 'PROLONGE_FORMATION', 'REGULARISE', 'BASCULE');

-- CreateEnum
CREATE TYPE "DeclStatut" AS ENUM ('EN_ATTENTE', 'CONFIRME', 'CONTESTE', 'EXPIRE', 'AUTO_GENERE');

-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('MOIS_GRATUITS', 'REMISE_POURCENTAGE', 'REMISE_MONTANT', 'PRIX_FIXE', 'ESSAI_ETENDU');

-- CreateEnum
CREATE TYPE "NegocieType" AS ENUM ('ABONNEMENT_DEROGATOIRE', 'QUITTANCE_DEROGATOIRE', 'ENREGISTREMENT_DEROGATOIRE');

-- CreateEnum
CREATE TYPE "SignalCatEnum" AS ENUM ('FUITE_EAU', 'ELECTRICITE', 'PORTE_SERRURE', 'NUISANCE', 'DEGRADATION', 'AUTRE');

-- CreateEnum
CREATE TYPE "SignalStatutEnum" AS ENUM ('ENVOYE', 'VU_PROPRIO', 'EN_COURS', 'RESOLU', 'NON_RESOLU_FERME');

-- CreateEnum
CREATE TYPE "CautionDestEnum" AS ENUM ('PROPRIETAIRE', 'CDC_CI', 'AUTRE');

-- CreateEnum
CREATE TYPE "PreavisStatutEnum" AS ENUM ('EMIS', 'ACCUSE', 'ETAT_LIEUX_PLANIFIE', 'CLOS');

-- CreateEnum
CREATE TYPE "EdlStatut" AS ENUM ('EN_COURS', 'SOUMIS_LOCATAIRE', 'CONFIRME', 'CONTESTE', 'CERTIFIE');

-- CreateEnum
CREATE TYPE "ProspectStatut" AS ENUM ('A_RAPPELER', 'EN_DISCUSSION', 'INSCRIT', 'PAS_INTERESSE', 'PERDU');

-- CreateEnum
CREATE TYPE "CommType" AS ENUM ('BAIL_FORMEL', 'BDQ_CONFIRME', 'FORMALISATION', 'RECRUTEMENT', 'BONUS');

-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('LANDLORD', 'CERTIFIED_AGENCY', 'NON_CERTIFIED_AGENCY', 'INTERMEDIARY', 'DIASPORA', 'TENANT');

-- CreateEnum
CREATE TYPE "TypePropriete" AS ENUM ('IMMEUBLE', 'COUR', 'RESIDENCE');

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "phone" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "birth_date" TIMESTAMP(3),
    "birth_place" TEXT,
    "neighborhood" TEXT,
    "avatar_url" TEXT,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'TENANT',
    "profile_type" "ProfileType",
    "kyc_level" INTEGER NOT NULL DEFAULT 0,
    "kyc_status" TEXT NOT NULL DEFAULT 'pending',
    "status" TEXT NOT NULL DEFAULT 'active',
    "password" TEXT,
    "is_certified" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "capacite_active" TEXT DEFAULT 'PROPRIETAIRE',
    "legal_entity_id" TEXT,
    "preferred_lang" TEXT DEFAULT 'fr',
    "notification_prefs" JSONB,
    "maposte_id" TEXT,
    "push_token" TEXT,
    "white_label_config" JSONB,
    "company_reg_number" TEXT,
    "tax_id" TEXT,
    "agency_config" JSONB,
    "active_plan_tier" TEXT NOT NULL DEFAULT 'LOCATAIRE',
    "plan_expires_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "legal_entities" (
    "entity_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "legal_form" TEXT,
    "rccm_number" TEXT NOT NULL,
    "nif_number" TEXT,
    "registered_address" TEXT,
    "activity_sector" TEXT,
    "bank_account" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_entities_pkey" PRIMARY KEY ("entity_id")
);

-- CreateTable
CREATE TABLE "identity_documents" (
    "doc_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "legal_entity_id" TEXT,
    "doc_type" TEXT NOT NULL,
    "doc_number" TEXT NOT NULL,
    "doc_number_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "birth_date" TIMESTAMP(3),
    "nationality" TEXT,
    "issuing_country" TEXT,
    "expiry_date" TIMESTAMP(3),
    "mrz_raw_data" TEXT,
    "scan_s3_key" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verified_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "rejection_reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_documents_pkey" PRIMARY KEY ("doc_id")
);

-- CreateTable
CREATE TABLE "properties" (
    "typePropriete" "TypePropriete",
    "nomBien" TEXT,
    "nomComplet" TEXT,
    "niveau" TEXT,
    "estCourEntiere" BOOLEAN NOT NULL DEFAULT false,
    "property_id" TEXT NOT NULL,
    "property_code" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "property_type" TEXT NOT NULL,
    "lease_type" TEXT NOT NULL DEFAULT 'residential',
    "commune" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "area_sqm" DOUBLE PRECISION,
    "rooms" INTEGER,
    "bedrooms" INTEGER,
    "name" TEXT,
    "unit_label" TEXT,
    "type_structure" TEXT NOT NULL DEFAULT 'INDEPENDANT',
    "parent_property_id" TEXT,
    "city" TEXT,
    "declared_rent_fcfa" DOUBLE PRECISION,
    "digital_postal_address" TEXT,
    "gps_latitude" DOUBLE PRECISION,
    "gps_longitude" DOUBLE PRECISION,
    "amenities" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "documents" JSONB,
    "verified_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "managed_by" TEXT,
    "management_mode" TEXT NOT NULL DEFAULT 'DIRECT',
    "superficie_m2" DOUBLE PRECISION,
    "usage_terrain" TEXT,
    "reference_cadastre" TEXT,
    "is_horeoo" BOOLEAN NOT NULL DEFAULT false,
    "horeoo_discount" DOUBLE PRECISION,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "source_migration_id" TEXT,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("property_id")
);

-- CreateTable
CREATE TABLE "property_images" (
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "s3_key" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "sha256Hash" TEXT,
    "sha256CalculeLe" TIMESTAMP(3),
    "qrCodeUrl" TEXT,
    "statutDraft" TEXT NOT NULL DEFAULT 'ACTIF',
    "versionDraft" INTEGER NOT NULL DEFAULT 1,
    "draftData" JSONB,
    "loiApplicable" TEXT NOT NULL DEFAULT 'Loi N°2018-575 du 13 juin 2018',
    "droitsDgiCalcules" DOUBLE PRECISION,
    "fraisQapril" DOUBLE PRECISION,
    "alerte90j" BOOLEAN NOT NULL DEFAULT true,
    "alerte60j" BOOLEAN NOT NULL DEFAULT true,
    "alerte30j" BOOLEAN NOT NULL DEFAULT true,
    "seuilJ3" BOOLEAN NOT NULL DEFAULT true,
    "seuilJ7" BOOLEAN NOT NULL DEFAULT true,
    "seuilJ15" BOOLEAN NOT NULL DEFAULT true,
    "lease_id" TEXT NOT NULL,
    "lease_reference" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "landlord_entity_id" TEXT,
    "tenant_id" TEXT,
    "tenant_entity_id" TEXT,
    "agent_id" TEXT,
    "mandate_id" TEXT,
    "lease_type" TEXT NOT NULL DEFAULT 'residential',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "duration_months" INTEGER NOT NULL,
    "rent_amount" INTEGER NOT NULL,
    "charges_amount" INTEGER NOT NULL DEFAULT 0,
    "payment_day" INTEGER NOT NULL DEFAULT 5,
    "deposit_amount" INTEGER NOT NULL DEFAULT 0,
    "paiement_avance" BOOLEAN NOT NULL DEFAULT true,
    "type_gestion" TEXT DEFAULT 'directe',
    "bailleur_masque" BOOLEAN NOT NULL DEFAULT false,
    "status" "LeaseStatus" NOT NULL DEFAULT 'DRAFT',
    "import_mode" BOOLEAN NOT NULL DEFAULT false,
    "type_bail" "TypeBail" NOT NULL DEFAULT 'ECRIT',
    "confirmation_locataire_sms" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_locataire_at" TIMESTAMP(3),
    "preavis_requis_mois" INTEGER DEFAULT 1,
    "signed_at" TIMESTAMP(3),
    "terminated_at" TIMESTAMP(3),
    "termination_reason" TEXT,
    "commercial_data" JSONB,
    "is_signed_electronically" BOOLEAN NOT NULL DEFAULT false,
    "signing_otp" TEXT,
    "signature_context" JSONB,
    "mode_utilities" TEXT NOT NULL DEFAULT 'NON_APPLICABLE',
    "identifiant_cie" TEXT,
    "identifiant_sodeci" TEXT,
    "modele_repartition" TEXT NOT NULL DEFAULT 'PRORATA_CHAMBRE',
    "forfait_utilities_mensuel" DOUBLE PRECISION,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "source_migration_id" TEXT,
    "score_consent" BOOLEAN NOT NULL DEFAULT false,
    "nb_pages_bail" INTEGER,
    "droits_enregistrement" DOUBLE PRECISION,
    "frais_timbre" DOUBLE PRECISION,
    "total_fiscal_bail" DOUBLE PRECISION,
    "statut_fiscal" TEXT NOT NULL DEFAULT 'NON_CALCULÉ',
    "recu_fiscal_url" TEXT,
    "recu_fiscal_hash" TEXT,
    "deadline_enregistrement" TIMESTAMP(3),
    "cert_enregistrement_dgi_url" TEXT,

    CONSTRAINT "leases_pkey" PRIMARY KEY ("lease_id")
);

-- CreateTable
CREATE TABLE "payment_intents" (
    "id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "operator" TEXT NOT NULL,
    "operator_ref" TEXT,
    "payer_phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sha256Hash" TEXT,
    "sha256CalculeLe" TIMESTAMP(3),
    "qrCodeUrl" TEXT,
    "moisConcerne" TEXT,
    "dateEncaissement" TIMESTAMP(3),
    "flagWebhookNonRecu" BOOLEAN NOT NULL DEFAULT false,
    "preuveUrl" TEXT,
    "arcDemande" BOOLEAN NOT NULL DEFAULT false,
    "arcCertificationId" TEXT,
    "arcHorodatage" TIMESTAMP(3),
    "commentaireInterne" TEXT,
    "receipt_id" TEXT NOT NULL,
    "receipt_ref" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "period_month" TEXT NOT NULL,
    "rent_amount" INTEGER NOT NULL,
    "charges_amount" INTEGER NOT NULL DEFAULT 0,
    "total_amount" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_ref" TEXT,
    "paid_at" TIMESTAMP(3),
    "pdf_url" TEXT,
    "qr_token" TEXT,
    "receipt_hash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "declarative" BOOLEAN NOT NULL DEFAULT false,
    "digital_delivery_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("receipt_id")
);

-- CreateTable
CREATE TABLE "lease_arrears" (
    "id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unpaid',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_arrears_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_phases" (
    "id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "phase_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "action_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "procedure_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cdc_deposits" (
    "id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "initiator" TEXT NOT NULL DEFAULT 'OWNER',
    "cdc_reference" TEXT,
    "status" "CDCDepositStatus" NOT NULL DEFAULT 'PENDING',
    "proof_hash" TEXT,
    "consigned_at" TIMESTAMP(3),
    "returned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cdc_deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mandates" (
    "id" TEXT NOT NULL,
    "mandate_ref" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "mandateType" "MandateType" NOT NULL,
    "commission_pct" DOUBLE PRECISION,
    "commission_fixed" INTEGER,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" "MandateStatus" NOT NULL DEFAULT 'DRAFT',
    "scope" TEXT[],
    "signed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancelled_by" TEXT,
    "cancel_reason" TEXT,
    "proof_hash" TEXT,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mandates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mandate_history" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "mandate_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "type_mandat" TEXT NOT NULL,
    "periode_debut" TIMESTAMP(3) NOT NULL,
    "periode_fin" TIMESTAMP(3),
    "baux_actifs_transferes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mandate_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colocataires" (
    "coloc_id" TEXT NOT NULL,
    "bail_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ColocRole" NOT NULL DEFAULT 'SECONDAIRE',
    "part_loyer" INTEGER,
    "pct_loyer" DOUBLE PRECISION,
    "mode_paiement" TEXT NOT NULL DEFAULT 'INDIVIDUEL',
    "date_entree" TIMESTAMP(3) NOT NULL,
    "date_sortie" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIF',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colocataires_pkey" PRIMARY KEY ("coloc_id")
);

-- CreateTable
CREATE TABLE "coloc_payments" (
    "id" TEXT NOT NULL,
    "bail_id" TEXT NOT NULL,
    "coloc_id" TEXT NOT NULL,
    "mois_concerne" TEXT NOT NULL,
    "montant_paye" INTEGER NOT NULL,
    "canal_paiement" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "reference_mobile" TEXT,
    "quittance_ind_id" TEXT,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coloc_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_rent_synthesis" (
    "synthese_id" TEXT NOT NULL,
    "bail_id" TEXT NOT NULL,
    "mois_concerne" TEXT NOT NULL,
    "loyer_total_du" INTEGER NOT NULL,
    "montant_collecte" INTEGER NOT NULL DEFAULT 0,
    "statut_mois" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "quittance_glob_id" TEXT,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "monthly_rent_synthesis_pkey" PRIMARY KEY ("synthese_id")
);

-- CreateTable
CREATE TABLE "land_lease_info" (
    "id" TEXT NOT NULL,
    "bail_id" TEXT NOT NULL,
    "superficie_louee_m2" DOUBLE PRECISION NOT NULL,
    "usage_declare" TEXT NOT NULL,
    "periodicite_loyer" TEXT NOT NULL DEFAULT 'MENSUEL',
    "date_evenement_fin" TIMESTAMP(3),
    "indexation_annuelle" DOUBLE PRECISION DEFAULT 0,
    "conditions_usage" TEXT,
    "etat_des_lieux_entree" BOOLEAN NOT NULL DEFAULT false,
    "etat_des_lieux_sortie" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "land_lease_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reliability_scores" (
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "breakdown" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reliability_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icl_events" (
    "updated_at" TIMESTAMP(3) NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "icl_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "agence_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nom_agence" TEXT NOT NULL,
    "rccm" TEXT NOT NULL,
    "dfe" TEXT NOT NULL,
    "num_enregistrement" TEXT,
    "adresse_local" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agence_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cert_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cert_type" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "qr_token" TEXT NOT NULL,
    "pdf_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'valid',

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("cert_id")
);

-- CreateTable
CREATE TABLE "passports" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount_in_dispute" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_messages" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_deliveries" (
    "id" TEXT NOT NULL,
    "tracking_number" TEXT NOT NULL,
    "delivery_mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "recipient_data" JSONB NOT NULL,
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digital_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'PUSH',
    "title" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observatory_snapshots" (
    "id" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "property_type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "avg_rent" INTEGER NOT NULL,
    "median_rent" INTEGER NOT NULL,
    "min_rent" INTEGER NOT NULL,
    "max_rent" INTEGER NOT NULL,
    "sample_count" INTEGER NOT NULL,
    "trend_pct" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "observatory_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_data" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "property_type" TEXT NOT NULL,
    "average_rent" DOUBLE PRECISION NOT NULL,
    "sample_size" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "successions_proprio" (
    "succession_id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "declarant_nom" TEXT NOT NULL,
    "declarant_lien" TEXT NOT NULL,
    "declarant_phone" TEXT NOT NULL,
    "date_declaration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "date_deces" TIMESTAMP(3) NOT NULL,
    "acte_deces_url" TEXT,
    "heritier_id" TEXT,
    "date_transfert" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "successions_proprio_pkey" PRIMARY KEY ("succession_id")
);

-- CreateTable
CREATE TABLE "successions_locataire" (
    "succession_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "date_deces" TIMESTAMP(3) NOT NULL,
    "declarant_type" TEXT,
    "declarant_phone" TEXT,
    "beneficiaire_id" TEXT,
    "beneficiaire_ext_nom" TEXT,
    "beneficiaire_ext_phone" TEXT,
    "loyer_prorata" DOUBLE PRECISION,
    "caution_montant" DOUBLE PRECISION,
    "caution_restituee" BOOLEAN NOT NULL DEFAULT false,
    "date_restitution" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'TRANSITION',
    "date_fin_transition" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "successions_locataire_pkey" PRIMARY KEY ("succession_id")
);

-- CreateTable
CREATE TABLE "reclamations_locataire" (
    "reclamation_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type_reclamation" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "preuve_url" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'OUVERT',
    "date_echeance" TIMESTAMP(3) NOT NULL,
    "dossier_litige_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reclamations_locataire_pkey" PRIMARY KEY ("reclamation_id")
);

-- CreateTable
CREATE TABLE "dossiers_litige_certifies" (
    "dlc_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "dlc_uuid" TEXT NOT NULL,
    "dlc_hash_sha256" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'GENERE',
    "ref_caci" TEXT,
    "issue" TEXT,
    "date_cloture" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dossiers_litige_certifies_pkey" PRIMARY KEY ("dlc_id")
);

-- CreateTable
CREATE TABLE "propositions_loyer" (
    "prop_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "montant_actuel" INTEGER NOT NULL,
    "nouveau_montant" INTEGER NOT NULL,
    "date_effet" TIMESTAMP(3) NOT NULL,
    "raison" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propositions_loyer_pkey" PRIMARY KEY ("prop_id")
);

-- CreateTable
CREATE TABLE "consentements_loyer" (
    "consent_id" TEXT NOT NULL,
    "prop_id" TEXT NOT NULL,
    "reponse" BOOLEAN NOT NULL,
    "commentaire" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consentements_loyer_pkey" PRIMARY KEY ("consent_id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "proof_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signature_valid" BOOLEAN NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurances" (
    "id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "policy_no" TEXT NOT NULL,
    "status" "InsuranceStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_claims" (
    "id" TEXT NOT NULL,
    "insurance_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repayment_plans" (
    "id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "tenant_signature" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repayment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mediations" (
    "id" TEXT NOT NULL,
    "lease_id" TEXT,
    "bdq_id" TEXT,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mediations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mediation_messages" (
    "id" TEXT NOT NULL,
    "mediation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mediation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_tickers" (
    "news_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_tickers_pkey" PRIMARY KEY ("news_id")
);

-- CreateTable
CREATE TABLE "fiscal_dossiers" (
    "fiscal_id" TEXT NOT NULL,
    "bail_id" TEXT NOT NULL,
    "loyer_mensuel" INTEGER NOT NULL,
    "duree_bail_mois" INTEGER NOT NULL,
    "duree_retenue_mois" INTEGER NOT NULL,
    "base_calcul" INTEGER NOT NULL,
    "taux_applique" DOUBLE PRECISION NOT NULL DEFAULT 0.0250,
    "droits_enregistrement" INTEGER NOT NULL,
    "frais_timbre" INTEGER NOT NULL DEFAULT 1000,
    "frais_qapril" INTEGER NOT NULL,
    "total_dgi" INTEGER NOT NULL,
    "total_bailleur" INTEGER NOT NULL,
    "penalty_amount" INTEGER NOT NULL DEFAULT 0,
    "exonere" BOOLEAN NOT NULL DEFAULT false,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE_DECLARATION',
    "date_limite_legale" TIMESTAMP(3) NOT NULL,
    "cinetpay_transaction_id" TEXT,
    "cinetpay_payment_url" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fiscal_dossiers_pkey" PRIMARY KEY ("fiscal_id")
);

-- CreateTable
CREATE TABLE "certificats_fiscaux" (
    "certificat_id" TEXT NOT NULL,
    "fiscal_id" TEXT NOT NULL,
    "numero_certificat" TEXT NOT NULL,
    "qr_token" TEXT NOT NULL,
    "pdf_path" TEXT NOT NULL,
    "hash_sha256" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'VALIDE',

    CONSTRAINT "certificats_fiscaux_pkey" PRIMARY KEY ("certificat_id")
);

-- CreateTable
CREATE TABLE "prepayment_requests" (
    "id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "months_count" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prepayment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments_pgw" (
    "payment_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "mois_concerne" TIMESTAMP(3) NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "payeur_id" TEXT NOT NULL,
    "beneficiaire_id" TEXT NOT NULL,
    "canal" "PaymentCanal" NOT NULL,
    "msisdn_payeur" TEXT,
    "msisdn_beneficiaire" TEXT,
    "statut" "PaymentPgwStatus" NOT NULL DEFAULT 'INITIEE',
    "ref_interne" TEXT NOT NULL,
    "ref_operateur" TEXT,
    "ref_cinetpay" TEXT,
    "webhook_payload" JSONB,
    "webhook_received_at" TIMESTAMP(3),
    "quittance_id" TEXT,
    "source_migration_id" TEXT,
    "tentatives" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reversal_status" TEXT NOT NULL DEFAULT 'PENDING',
    "honoraires_agence" DOUBLE PRECISION,

    CONSTRAINT "payments_pgw_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "reversal_transactions" (
    "reversal_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "reference_pgw" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reversal_transactions_pkey" PRIMARY KEY ("reversal_id")
);

-- CreateTable
CREATE TABLE "pgw_webhooks" (
    "webhook_id" TEXT NOT NULL,
    "canal" "PaymentCanal" NOT NULL,
    "ref_operateur" TEXT,
    "payload" JSONB NOT NULL,
    "signature_valid" BOOLEAN NOT NULL,
    "traite" BOOLEAN NOT NULL DEFAULT false,
    "payment_id" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pgw_webhooks_pkey" PRIMARY KEY ("webhook_id")
);

-- CreateTable
CREATE TABLE "pgw_msisdn_lookup" (
    "prefixe" TEXT NOT NULL,
    "operateur" "PaymentCanal" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pgw_msisdn_lookup_pkey" PRIMARY KEY ("prefixe")
);

-- CreateTable
CREATE TABLE "pgw_reconciliation" (
    "recon_id" TEXT NOT NULL,
    "date_recon" TIMESTAMP(3) NOT NULL,
    "canal" "PaymentCanal" NOT NULL,
    "nb_transactions_qapril" INTEGER NOT NULL,
    "nb_transactions_operateur" INTEGER,
    "montant_total_qapril" DOUBLE PRECISION NOT NULL,
    "montant_total_operateur" DOUBLE PRECISION,
    "nb_ecarts" INTEGER NOT NULL DEFAULT 0,
    "ecarts_detail" JSONB,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pgw_reconciliation_pkey" PRIMARY KEY ("recon_id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "flag_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("flag_id")
);

-- CreateTable
CREATE TABLE "etats_des_lieux" (
    "edl_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "type_edl" TEXT NOT NULL,
    "statut" "EdlStatut" NOT NULL DEFAULT 'EN_COURS',
    "redige_par" TEXT NOT NULL,
    "agent_id" TEXT,
    "locataire_id" TEXT,
    "date_edl" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sections" JSONB,
    "index_eau" DOUBLE PRECISION,
    "index_elec" DOUBLE PRECISION,
    "cles_remises" INTEGER NOT NULL DEFAULT 0,
    "cles_detail" TEXT,
    "reserves_locataire" TEXT,
    "confirme_proprio" BOOLEAN NOT NULL DEFAULT false,
    "confirme_locataire" BOOLEAN NOT NULL DEFAULT false,
    "confirme_proprio_at" TIMESTAMP(3),
    "confirme_locataire_at" TIMESTAMP(3),
    "expire_confirmation_at" TIMESTAMP(3),
    "ref_edl" TEXT,
    "hash_sha256" TEXT,
    "pdf_url" TEXT,
    "edl_entree_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etats_des_lieux_pkey" PRIMARY KEY ("edl_id")
);

-- CreateTable
CREATE TABLE "signatures_electroniques" (
    "sig_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "signataire_id" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "methode" TEXT,
    "otp_utilise" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "hash_document" TEXT,
    "psce_certif_id" TEXT,
    "psce_certif_at" TIMESTAMP(3),
    "psce_provider" TEXT,
    "signed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signatures_electroniques_pkey" PRIMARY KEY ("sig_id")
);

-- CreateTable
CREATE TABLE "tickets_maintenance" (
    "ticket_id" TEXT NOT NULL,
    "ticket_ref" TEXT NOT NULL,
    "unite_id" TEXT,
    "lease_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "categorie_v2" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photos_urls" TEXT[],
    "urgence" TEXT NOT NULL DEFAULT 'NORMALE',
    "photo_url" TEXT,
    "photo_hash_sha256" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "date_signalement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_prise_en_charge" TIMESTAMP(3),
    "date_resolution" TIMESTAMP(3),
    "proprio_vu_at" TIMESTAMP(3),
    "nb_reouvertures" INTEGER NOT NULL DEFAULT 0,
    "commentaire_proprio" TEXT,
    "confirmation_locataire" BOOLEAN,
    "date_confirmation" TIMESTAMP(3),
    "prestataire_id" TEXT,
    "devis_montant" DOUBLE PRECISION,
    "cout_final" DOUBLE PRECISION,
    "date_intervention" TIMESTAMP(3),
    "note_locataire" INTEGER,
    "note_prestataire" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "tickets_maintenance_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "prestataires" (
    "prestataire_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "specialite" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "adresse" TEXT,
    "note_moyenne" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prestataires_pkey" PRIMARY KEY ("prestataire_id")
);

-- CreateTable
CREATE TABLE "candidatures" (
    "cand_id" TEXT NOT NULL,
    "logement_id" TEXT NOT NULL,
    "candidat_id" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "revenu_mensuel" DOUBLE PRECISION,
    "employeur" TEXT,
    "score_qapril" INTEGER,
    "taux_effort" DOUBLE PRECISION,
    "docs_jsonb" JSONB,
    "statut" TEXT NOT NULL DEFAULT 'SOUMISE',
    "note_agence" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidatures_pkey" PRIMARY KEY ("cand_id")
);

-- CreateTable
CREATE TABLE "charges_parametrage" (
    "charge_id" TEXT NOT NULL,
    "logement_id" TEXT NOT NULL,
    "type_charge" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'FORFAIT',
    "montant_mensuel" DOUBLE PRECISION NOT NULL,
    "cle_repartition" DOUBLE PRECISION,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "charges_parametrage_pkey" PRIMARY KEY ("charge_id")
);

-- CreateTable
CREATE TABLE "regularisations_charges" (
    "reg_id" TEXT NOT NULL,
    "bail_id" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "provisions_collectees" DOUBLE PRECISION NOT NULL,
    "charges_reelles" DOUBLE PRECISION NOT NULL,
    "solde" DOUBLE PRECISION NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'CALCULE',
    "notifie_at" TIMESTAMP(3),
    "regle_at" TIMESTAMP(3),

    CONSTRAINT "regularisations_charges_pkey" PRIMARY KEY ("reg_id")
);

-- CreateTable
CREATE TABLE "annonces" (
    "annonce_id" TEXT NOT NULL,
    "logement_id" TEXT NOT NULL,
    "agence_id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "loyer_demande" DOUBLE PRECISION NOT NULL,
    "charges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "photos_urls" TEXT[],
    "criteres" JSONB,
    "statut" TEXT NOT NULL DEFAULT 'ACTIVE',
    "diffusions" JSONB,
    "nb_contacts" INTEGER NOT NULL DEFAULT 0,
    "nb_visites" INTEGER NOT NULL DEFAULT 0,
    "nb_candidatures" INTEGER NOT NULL DEFAULT 0,
    "cout_vacance" DOUBLE PRECISION,
    "publiee_at" TIMESTAMP(3),
    "archivee_at" TIMESTAMP(3),

    CONSTRAINT "annonces_pkey" PRIMARY KEY ("annonce_id")
);

-- CreateTable
CREATE TABLE "crg_mensuel" (
    "crg_id" TEXT NOT NULL,
    "proprietaire_id" TEXT NOT NULL,
    "agence_id" TEXT NOT NULL,
    "mois" TIMESTAMP(3) NOT NULL,
    "loyers_encaisses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "charges_deduites" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "travaux_deduits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "honoraires_agence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reversement_net" DOUBLE PRECISION NOT NULL,
    "reversement_effectue_at" TIMESTAMP(3),
    "pdf_url" TEXT,
    "hash_sha256" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crg_mensuel_pkey" PRIMARY KEY ("crg_id")
);

-- CreateTable
CREATE TABLE "agenda_evenements" (
    "event_id" TEXT NOT NULL,
    "agence_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "type_event" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "contact_id" TEXT,
    "logement_id" TEXT,
    "lease_id" TEXT,
    "debut_at" TIMESTAMP(3) NOT NULL,
    "fin_at" TIMESTAMP(3),
    "rappel_minutes" INTEGER NOT NULL DEFAULT 30,
    "statut" TEXT NOT NULL DEFAULT 'PLANIFIE',
    "gcal_event_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agenda_evenements_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "tva_transactions" (
    "tva_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "montant_ht" DOUBLE PRECISION NOT NULL,
    "taux_tva" DOUBLE PRECISION NOT NULL DEFAULT 18.00,
    "montant_tva" DOUBLE PRECISION NOT NULL,
    "montant_ttc" DOUBLE PRECISION NOT NULL,
    "periode_fiscale" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tva_transactions_pkey" PRIMARY KEY ("tva_id")
);

-- CreateTable
CREATE TABLE "procurations_numeriques" (
    "proc_id" TEXT NOT NULL,
    "mandant_id" TEXT NOT NULL,
    "mandataire_id" TEXT NOT NULL,
    "droits" JSONB NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procurations_numeriques_pkey" PRIMARY KEY ("proc_id")
);

-- CreateTable
CREATE TABLE "fraud_blacklist" (
    "bl_id" TEXT NOT NULL,
    "user_id" TEXT,
    "document_hash" TEXT,
    "motif" TEXT NOT NULL,
    "ajoute_par" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_blacklist_pkey" PRIMARY KEY ("bl_id")
);

-- CreateTable
CREATE TABLE "subscription_audits" (
    "sub_audit_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "old_tier" TEXT NOT NULL,
    "new_tier" TEXT NOT NULL,
    "reason" TEXT,
    "executed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_audits_pkey" PRIMARY KEY ("sub_audit_id")
);

-- CreateTable
CREATE TABLE "legal_procedures" (
    "procedure_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT,
    "served_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_procedures_pkey" PRIMARY KEY ("procedure_id")
);

-- CreateTable
CREATE TABLE "coop_groups" (
    "coop_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total_target" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coop_groups_pkey" PRIMARY KEY ("coop_id")
);

-- CreateTable
CREATE TABLE "migration_sessions" (
    "session_id" TEXT NOT NULL,
    "agence_id" TEXT NOT NULL,
    "fichier_nom" TEXT NOT NULL,
    "fichier_format" TEXT NOT NULL,
    "source_logiciel" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'UPLOADE',
    "nb_logements" INTEGER NOT NULL DEFAULT 0,
    "nb_locataires" INTEGER NOT NULL DEFAULT 0,
    "nb_baux" INTEGER NOT NULL DEFAULT 0,
    "nb_paiements" INTEGER NOT NULL DEFAULT 0,
    "nb_erreurs" INTEGER NOT NULL DEFAULT 0,
    "nb_warnings" INTEGER NOT NULL DEFAULT 0,
    "rapport_pdf_url" TEXT,
    "validation_token" TEXT,
    "validated_at" TIMESTAMP(3),
    "committed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "migration_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "migration_staging" (
    "updated_at" TIMESTAMP(3) NOT NULL,
    "staging_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "agence_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "raw_data" JSONB NOT NULL,
    "mapped_data" JSONB,
    "validation_status" TEXT NOT NULL DEFAULT 'PENDING',
    "errors" JSONB,
    "warnings" JSONB,
    "committed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "migration_staging_pkey" PRIMARY KEY ("staging_id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "insp_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANIFIEE',
    "date" TIMESTAMP(3) NOT NULL,
    "general_score" INTEGER,
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("insp_id")
);

-- CreateTable
CREATE TABLE "inspection_rooms" (
    "room_id" TEXT NOT NULL,
    "inspection_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GOOD',
    "comments" TEXT,

    CONSTRAINT "inspection_rooms_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "inspection_photos" (
    "photo_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_photos_pkey" PRIMARY KEY ("photo_id")
);

-- CreateTable
CREATE TABLE "reminder_logs" (
    "log_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'SENT',

    CONSTRAINT "reminder_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "bails_declaratifs" (
    "bdq_id" TEXT NOT NULL,
    "bailleur_id" TEXT NOT NULL,
    "locataire_id" TEXT,
    "property_id" TEXT,
    "nom_locataire_declare" TEXT NOT NULL,
    "prenom_locataire_declare" TEXT,
    "telephone_locataire" TEXT NOT NULL,
    "description_logement" TEXT NOT NULL,
    "adresse_libre" TEXT,
    "loyer_declare_mensuel" DOUBLE PRECISION NOT NULL,
    "date_entree_estimee" TIMESTAMP(3),
    "precision_date_entree" TEXT NOT NULL DEFAULT 'EXACTE',
    "identite_incomplete" BOOLEAN NOT NULL DEFAULT false,
    "source_creation" TEXT NOT NULL DEFAULT 'FORM',
    "statut" "BdqStatut" NOT NULL DEFAULT 'PENDING_LOCATAIRE',
    "confirmation_locataire" BOOLEAN,
    "confirmation_at" TIMESTAMP(3),
    "contre_proposition_loyer" DOUBLE PRECISION,
    "motif_refus" TEXT,
    "agent_confirmant_id" TEXT,
    "confirmation_agent_at" TIMESTAMP(3),
    "agent_confirmation_mode" TEXT,
    "hash_declaration" TEXT NOT NULL,
    "hash_bdq_final" TEXT,
    "qr_token" TEXT,
    "bail_formel_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bails_declaratifs_pkey" PRIMARY KEY ("bdq_id")
);

-- CreateTable
CREATE TABLE "bdq_sms_log" (
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sms_id" TEXT NOT NULL,
    "bdq_id" TEXT NOT NULL,
    "type_sms" TEXT NOT NULL,
    "destinataire" TEXT NOT NULL,
    "role_dest" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "statut_envoi" TEXT NOT NULL DEFAULT 'ENVOYE',
    "reponse_recue" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bdq_sms_log_pkey" PRIMARY KEY ("sms_id")
);

-- CreateTable
CREATE TABLE "bdq_historique_loyer" (
    "hist_id" TEXT NOT NULL,
    "bdq_id" TEXT NOT NULL,
    "ancien_loyer" DOUBLE PRECISION NOT NULL,
    "nouveau_loyer" DOUBLE PRECISION NOT NULL,
    "motif" TEXT,
    "confirmation_locataire" BOOLEAN,
    "modifie_par" TEXT,
    "effective_le" TIMESTAMP(3) NOT NULL,
    "hash_modification" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bdq_historique_loyer_pkey" PRIMARY KEY ("hist_id")
);

-- CreateTable
CREATE TABLE "bdq_conversation_states" (
    "id" TEXT NOT NULL,
    "bailleur_id" TEXT NOT NULL,
    "legal_entity_id" TEXT,
    "canal" "NotifCanal" NOT NULL,
    "canal_ref" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "nom_locataire_extrait" TEXT,
    "telephone_extrait" TEXT,
    "description_logement_extrait" TEXT,
    "loyer_extrait" DOUBLE PRECISION,
    "date_entree_extraite" TIMESTAMP(3),
    "precision_date" TEXT NOT NULL DEFAULT 'APPROXIMATIVE',
    "telephone_manquant" BOOLEAN NOT NULL DEFAULT false,
    "identite_incomplete" BOOLEAN NOT NULL DEFAULT false,
    "messages_history" TEXT[],
    "nb_echanges" INTEGER NOT NULL DEFAULT 0,
    "champ_en_attente" TEXT,
    "pause_reason" TEXT,
    "bdq_cree_id" TEXT,
    "tokens_entree_total" INTEGER NOT NULL DEFAULT 0,
    "tokens_sortie_total" INTEGER NOT NULL DEFAULT 0,
    "cout_estime_fcfa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expire_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "bdq_conversation_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_maintenance" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT,
    "attachments" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_documents" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "pref_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wa_actif" BOOLEAN NOT NULL DEFAULT true,
    "wa_numero" TEXT,
    "wa_verifie" BOOLEAN NOT NULL DEFAULT false,
    "email_actif" BOOLEAN NOT NULL DEFAULT false,
    "email_adresse" TEXT,
    "email_verifie" BOOLEAN NOT NULL DEFAULT false,
    "sms_actif" BOOLEAN NOT NULL DEFAULT true,
    "push_actif" BOOLEAN NOT NULL DEFAULT true,
    "push_token" TEXT,
    "heure_debut" INTEGER NOT NULL DEFAULT 7,
    "heure_fin" INTEGER NOT NULL DEFAULT 21,
    "evenements_actifs" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("pref_id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "notif_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "canal" "NotifCanal" NOT NULL,
    "type_evenement" TEXT NOT NULL,
    "reference_id" TEXT,
    "template_id" TEXT,
    "contenu_preview" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "nb_tentatives" INTEGER NOT NULL DEFAULT 0,
    "erreur_detail" TEXT,
    "envoye_at" TIMESTAMP(3),
    "livre_at" TIMESTAMP(3),
    "lu_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("notif_id")
);

-- CreateTable
CREATE TABLE "bien_acces" (
    "acces_id" TEXT NOT NULL,
    "bien_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "profil_intermediaire" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "justificatif_type" TEXT,
    "justificatif_numero" TEXT,
    "justificatif_valide" BOOLEAN NOT NULL DEFAULT false,
    "justificatif_verifie_at" TIMESTAMP(3),
    "invite_par" TEXT,
    "invite_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "accepte_at" TIMESTAMP(3),
    "revoque_at" TIMESTAMP(3),
    "mandat_id" TEXT,
    "date_debut" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "bien_acces_pkey" PRIMARY KEY ("acces_id")
);

-- CreateTable
CREATE TABLE "mandats_gestion" (
    "mandat_id" TEXT NOT NULL,
    "proprietaire_id" TEXT NOT NULL,
    "intermediaire_id" TEXT NOT NULL,
    "profil" TEXT NOT NULL,
    "biens_concernes" TEXT[],
    "date_debut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(3),
    "remuneration" TEXT DEFAULT 'GRATUIT',
    "permissions" JSONB NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "signature_proprio" TIMESTAMP(3),
    "signature_interm" TIMESTAMP(3),
    "hash_sha256" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mandats_gestion_pkey" PRIMARY KEY ("mandat_id")
);

-- CreateTable
CREATE TABLE "agences_regularisation" (
    "reg_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "date_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_limite_initiale" TIMESTAMP(3) NOT NULL,
    "date_limite_actuelle" TIMESTAMP(3) NOT NULL,
    "nb_biens_bascule" INTEGER,
    "nb_proprietaires_bascule" INTEGER,
    "recepissse_cdaim" TEXT,
    "recepissse_date" TIMESTAMP(3),
    "rappel_j30_at" TIMESTAMP(3),
    "rappel_j90_at" TIMESTAMP(3),
    "rappel_j180_at" TIMESTAMP(3),
    "rappel_j240_at" TIMESTAMP(3),
    "rappel_j270_at" TIMESTAMP(3),
    "bascule_at" TIMESTAMP(3),
    "regularise_at" TIMESTAMP(3),
    "notes_admin" TEXT,

    CONSTRAINT "agences_regularisation_pkey" PRIMARY KEY ("reg_id")
);

-- CreateTable
CREATE TABLE "garde_fous_logs" (
    "log_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type_signal" TEXT NOT NULL,
    "detail" TEXT,
    "action_prise" TEXT,
    "traite" BOOLEAN NOT NULL DEFAULT false,
    "traite_par" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "garde_fous_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "sms_declarations" (
    "decl_id" TEXT NOT NULL,
    "bail_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "montant_declare" DOUBLE PRECISION NOT NULL,
    "canal" "PaymentCanal" NOT NULL DEFAULT 'SMS_DECLARATIF',
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "confirme_par" TEXT,
    "confirme_at" TIMESTAMP(3),
    "quittance_id" TEXT,
    "rappel_1_at" TIMESTAMP(3),
    "alerte_proprio_at" TIMESTAMP(3),
    "sms_brut" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" TIMESTAMP(3),

    CONSTRAINT "sms_declarations_pkey" PRIMARY KEY ("decl_id")
);

-- CreateTable
CREATE TABLE "config_tarifs" (
    "tarif_id" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "valeur" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "modifiable" BOOLEAN NOT NULL DEFAULT true,
    "date_effet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_par" TEXT,
    "modifie_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "valeur_precedente" DOUBLE PRECISION,
    "note_modification" TEXT,
    "metadata" TEXT,

    CONSTRAINT "config_tarifs_pkey" PRIMARY KEY ("tarif_id")
);

-- CreateTable
CREATE TABLE "offres_abonnements" (
    "offre_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom_affichage" TEXT NOT NULL,
    "description" TEXT,
    "prix_base_ttc" DOUBLE PRECISION NOT NULL,
    "quittances_inclus" INTEGER NOT NULL DEFAULT 0,
    "prix_unite_ttc" DOUBLE PRECISION DEFAULT 0,
    "modules" JSONB,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "visible_signup" BOOLEAN NOT NULL DEFAULT true,
    "ordre_affichage" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_par" TEXT,
    "modifie_at" TIMESTAMP(3),

    CONSTRAINT "offres_abonnements_pkey" PRIMARY KEY ("offre_id")
);

-- CreateTable
CREATE TABLE "codes_promo" (
    "promo_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type_remise" TEXT NOT NULL,
    "valeur_remise" DOUBLE PRECISION NOT NULL,
    "offre_cible" TEXT,
    "cible_profil" TEXT NOT NULL DEFAULT 'TOUS',
    "date_debut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(3),
    "max_utilisations" INTEGER,
    "nb_utilisations" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_par" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "codes_promo_pkey" PRIMARY KEY ("promo_id")
);

-- CreateTable
CREATE TABLE "tarifs_negocie" (
    "neg_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "offre_id" TEXT,
    "prix_negocie_ttc" DOUBLE PRECISION NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(3),
    "auto_renouveler" BOOLEAN NOT NULL DEFAULT false,
    "created_par" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT NOT NULL,

    CONSTRAINT "tarifs_negocie_pkey" PRIMARY KEY ("neg_id")
);

-- CreateTable
CREATE TABLE "config_tarifs_audit" (
    "audit_id" TEXT NOT NULL,
    "table_cible" TEXT NOT NULL,
    "enregistrement_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "avant" JSONB,
    "apres" JSONB,
    "modifie_par" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "config_tarifs_audit_pkey" PRIMARY KEY ("audit_id")
);

-- CreateTable
CREATE TABLE "locataire_profiles" (
    "profil_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score_actuel" INTEGER NOT NULL DEFAULT 0,
    "score_badge" TEXT NOT NULL DEFAULT 'D',
    "score_calcule_at" TIMESTAMP(3),
    "taux_paiement_12m" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nb_bails_actifs" INTEGER NOT NULL DEFAULT 0,
    "nb_bails_clos" INTEGER NOT NULL DEFAULT 0,
    "alerte_j3_active" BOOLEAN NOT NULL DEFAULT true,
    "alerte_j1_active" BOOLEAN NOT NULL DEFAULT true,
    "canal_alerte_pref" TEXT NOT NULL DEFAULT 'SMS',
    "passeport_genere_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locataire_profiles_pkey" PRIMARY KEY ("profil_id")
);

-- CreateTable
CREATE TABLE "signalements_locataire" (
    "signal_id" TEXT NOT NULL,
    "bail_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "urgence" TEXT NOT NULL DEFAULT 'NORMAL',
    "photos" TEXT[],
    "statut" TEXT NOT NULL DEFAULT 'ENVOYE',
    "proprio_vu_at" TIMESTAMP(3),
    "resolu_at" TIMESTAMP(3),
    "resolu_par" TEXT,
    "note_resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signalements_locataire_pkey" PRIMARY KEY ("signal_id")
);

-- CreateTable
CREATE TABLE "cautions_bail" (
    "caution_id" TEXT NOT NULL,
    "bail_id" TEXT NOT NULL,
    "montant_fcfa" DOUBLE PRECISION NOT NULL,
    "date_versement" TIMESTAMP(3) NOT NULL,
    "mode_versement" TEXT,
    "destination" TEXT NOT NULL DEFAULT 'PROPRIETAIRE',
    "recepissse_cdc_ci" TEXT,
    "conditions_restit" TEXT,
    "confirme_locataire" BOOLEAN NOT NULL DEFAULT false,
    "confirme_at" TIMESTAMP(3),
    "certificat_ref" TEXT,
    "hash_sha256" TEXT,
    "restituee" BOOLEAN NOT NULL DEFAULT false,
    "montant_restitue" DOUBLE PRECISION,
    "date_restitution" TIMESTAMP(3),
    "motif_retenue" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cautions_bail_pkey" PRIMARY KEY ("caution_id")
);

-- CreateTable
CREATE TABLE "preavis_bails" (
    "preavis_id" TEXT NOT NULL,
    "bail_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "date_declaration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_depart_prevue" TIMESTAMP(3) NOT NULL,
    "date_depart_effective" TIMESTAMP(3),
    "motif" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EMIS',
    "proprio_accuse_at" TIMESTAMP(3),
    "etat_lieux_prevu" TIMESTAMP(3),
    "ref_preavis" TEXT,
    "hash_sha256" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preavis_bails_pkey" PRIMARY KEY ("preavis_id")
);

-- CreateTable
CREATE TABLE "passeports_locatifs" (
    "passeport_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "ref_passeport" TEXT,
    "score_global" INTEGER NOT NULL,
    "taux_paiement_global" DOUBLE PRECISION NOT NULL,
    "nb_bails_inclus" INTEGER NOT NULL,
    "periode_couverte_debut" TIMESTAMP(3) NOT NULL,
    "periode_couverte_fin" TIMESTAMP(3) NOT NULL,
    "snapshot_bails" JSONB NOT NULL,
    "hash_sha256" TEXT,
    "pdf_url" TEXT,
    "nb_consultations" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" TIMESTAMP(3),

    CONSTRAINT "passeports_locatifs_pkey" PRIMARY KEY ("passeport_id")
);

-- CreateTable
CREATE TABLE "alertes_loyer" (
    "alerte_id" TEXT NOT NULL,
    "bail_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "type_alerte" TEXT NOT NULL,
    "date_prevue" TIMESTAMP(3) NOT NULL,
    "envoyee" BOOLEAN NOT NULL DEFAULT false,
    "envoyee_at" TIMESTAMP(3),
    "canal" "PaymentCanal",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertes_loyer_pkey" PRIMARY KEY ("alerte_id")
);

-- CreateTable
CREATE TABLE "locataire_profils_publics" (
    "profil_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "visibilite" TEXT NOT NULL DEFAULT 'INVISIBLE',
    "statut_recherche" TEXT NOT NULL DEFAULT 'EN_RECHERCHE',
    "statut_pro" TEXT,
    "revenu_fourchette" TEXT,
    "employeur_type" TEXT,
    "city" TEXT,
    "communes_souhaitees" TEXT[],
    "budget_max_fcfa" INTEGER,
    "type_logement" TEXT[],
    "disponible_a_partir" TIMESTAMP(3),
    "kyc_niveau" INTEGER NOT NULL DEFAULT 0,
    "nb_invitations_recues" INTEGER NOT NULL DEFAULT 0,
    "nb_invitations_refusees" INTEGER NOT NULL DEFAULT 0,
    "nb_consultations_profil" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locataire_profils_publics_pkey" PRIMARY KEY ("profil_id")
);

-- CreateTable
CREATE TABLE "invitations_bail" (
    "invitation_id" TEXT NOT NULL,
    "bien_id" TEXT,
    "invitant_id" TEXT NOT NULL,
    "invitant_type" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "methode_decouverte" TEXT,
    "loyer_propose" DOUBLE PRECISION,
    "date_debut_proposee" TIMESTAMP(3),
    "message_invitant" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ENVOYEE',
    "vue_at" TIMESTAMP(3),
    "repondu_at" TIMESTAMP(3),
    "bail_id" TEXT,
    "expire_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_bail_pkey" PRIMARY KEY ("invitation_id")
);

-- CreateTable
CREATE TABLE "consultations_profil" (
    "consult_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "consultant_id" TEXT NOT NULL,
    "consultant_type" TEXT NOT NULL,
    "consultant_nom_affiche" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultations_profil_pkey" PRIMARY KEY ("consult_id")
);

-- CreateTable
CREATE TABLE "rapports_mensuels" (
    "rapport_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "periode_mois" INTEGER NOT NULL,
    "periode_annee" INTEGER NOT NULL,
    "type_rapport" TEXT NOT NULL DEFAULT 'MENSUEL',
    "data_rapport" JSONB NOT NULL,
    "pdf_url" TEXT,
    "envoye_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "envoye_email" BOOLEAN NOT NULL DEFAULT false,
    "envoye_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rapports_mensuels_pkey" PRIMARY KEY ("rapport_id")
);

-- CreateTable
CREATE TABLE "champions_profiles" (
    "champion_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "zone_principale" TEXT NOT NULL,
    "zones_secondaires" TEXT[],
    "superviseur_id" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "date_debut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "objectif_mensuel" INTEGER NOT NULL DEFAULT 30,
    "total_inscriptions" INTEGER NOT NULL DEFAULT 0,
    "total_commissions_fcfa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "champions_profiles_pkey" PRIMARY KEY ("champion_id")
);

-- CreateTable
CREATE TABLE "champions_prospects" (
    "prospect_id" TEXT NOT NULL,
    "champion_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "quartier" TEXT,
    "nb_logements_estime" TEXT,
    "argument_cle" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'A_RAPPELER',
    "date_dernier_contact" TIMESTAMP(3),
    "date_rappel_prevu" TIMESTAMP(3),
    "note" TEXT,
    "user_id_inscrit" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "champions_prospects_pkey" PRIMARY KEY ("prospect_id")
);

-- CreateTable
CREATE TABLE "champions_commissions" (
    "commission_id" TEXT NOT NULL,
    "champion_id" TEXT NOT NULL,
    "type_action" TEXT NOT NULL,
    "reference_id" TEXT,
    "montant_fcfa" DOUBLE PRECISION NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "valide_at" TIMESTAMP(3),
    "paye_at" TIMESTAMP(3),
    "mode_paiement" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "champions_commissions_pkey" PRIMARY KEY ("commission_id")
);

-- CreateTable
CREATE TABLE "wallet_recharge_links" (
    "link_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "declencheur" TEXT NOT NULL,
    "operateur" "PaymentCanal" NOT NULL,
    "montant_suggere" DOUBLE PRECISION NOT NULL,
    "solde_au_moment" DOUBLE PRECISION NOT NULL,
    "nb_bails_actifs" INTEGER NOT NULL,
    "url_generee" TEXT NOT NULL,
    "canal_envoi" TEXT NOT NULL,
    "message_envoye" TEXT,
    "clique" BOOLEAN NOT NULL DEFAULT false,
    "clique_at" TIMESTAMP(3),
    "clics_compteur" INTEGER NOT NULL DEFAULT 0,
    "recharge_effectuee" BOOLEAN NOT NULL DEFAULT false,
    "recharge_at" TIMESTAMP(3),
    "montant_recharge" DOUBLE PRECISION,
    "webhook_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_recharge_links_pkey" PRIMARY KEY ("link_id")
);

-- CreateTable
CREATE TABLE "wallet_recharge_configs" (
    "config_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rappel_actif" BOOLEAN NOT NULL DEFAULT false,
    "jour_du_mois" INTEGER NOT NULL DEFAULT 1,
    "montant_fixe" DOUBLE PRECISION,
    "operateur_prefere" TEXT NOT NULL DEFAULT 'WAVE',
    "canal_prefere" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "dernier_rappel_at" TIMESTAMP(3),
    "nb_rappels_envoyes" INTEGER NOT NULL DEFAULT 0,
    "nb_rechargements" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_recharge_configs_pkey" PRIMARY KEY ("config_id")
);

-- CreateTable
CREATE TABLE "messagerie_bail" (
    "msg_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "expediteur_id" TEXT NOT NULL,
    "role_expediteur" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "pj_url" TEXT,
    "pj_hash_sha256" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ENVOYÉ',
    "date_envoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_reception" TIMESTAMP(3),
    "date_lecture" TIMESTAMP(3),

    CONSTRAINT "messagerie_bail_pkey" PRIMARY KEY ("msg_id")
);

-- CreateTable
CREATE TABLE "annonces_voisinage" (
    "annonce_id" TEXT NOT NULL,
    "proprio_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "type_annonce" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_publication" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_expiration" TIMESTAMP(3),
    "epingle" BOOLEAN NOT NULL DEFAULT false,
    "destinataires" TEXT NOT NULL DEFAULT 'TOUS',
    "photo_url" TEXT,
    "photo_hash_sha256" TEXT,

    CONSTRAINT "annonces_voisinage_pkey" PRIMARY KEY ("annonce_id")
);

-- CreateTable
CREATE TABLE "factures_utilities" (
    "facture_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "acteur_id" TEXT NOT NULL,
    "role_acteur" TEXT NOT NULL,
    "type_utility" TEXT NOT NULL,
    "identifiant_compteur" TEXT NOT NULL,
    "mois_facture" TIMESTAMP(3) NOT NULL,
    "montant_total" DOUBLE PRECISION NOT NULL,
    "date_limite_paiement" TIMESTAMP(3),
    "statut" "UtilityStatus" NOT NULL DEFAULT 'EN_COURS',
    "source" TEXT NOT NULL DEFAULT 'SAISIE_MANUELLE',
    "invoice_url" TEXT,
    "mode_utilities" TEXT NOT NULL,
    "date_paiement" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "factures_utilities_pkey" PRIMARY KEY ("facture_id")
);

-- CreateTable
CREATE TABLE "repartitions_utilities" (
    "repart_id" TEXT NOT NULL,
    "facture_id" TEXT NOT NULL,
    "lease_locataire_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "montant_quote_part" DOUBLE PRECISION NOT NULL,
    "modele_applique" TEXT NOT NULL,
    "statut_paiement" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "date_notification" TIMESTAMP(3),
    "date_paiement" TIMESTAMP(3),
    "mode_paiement" TEXT,
    "nb_relances" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repartitions_utilities_pkey" PRIMARY KEY ("repart_id")
);

-- CreateTable
CREATE TABLE "leads" (
    "lead_id" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "profil_declare" TEXT NOT NULL,
    "source_document" TEXT,
    "source_token" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'NOUVEAU',
    "note_commerciale" TEXT,
    "converted_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("lead_id")
);

-- CreateTable
CREATE TABLE "user_capacites" (
    "cap_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "capacite" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "activee_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "desactivee_at" TIMESTAMP(3),

    CONSTRAINT "user_capacites_pkey" PRIMARY KEY ("cap_id")
);

-- CreateTable
CREATE TABLE "user_wallet_configs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_balance" INTEGER NOT NULL DEFAULT 0,
    "landlord_code" TEXT,
    "is_confidential" BOOLEAN NOT NULL DEFAULT false,
    "wallet_seuil_alerte" DOUBLE PRECISION DEFAULT 500,
    "wallet_rappel_actif" BOOLEAN NOT NULL DEFAULT false,
    "wallet_rappel_jour" INTEGER NOT NULL DEFAULT 1,
    "wallet_rappel_montant" DOUBLE PRECISION,
    "wallet_operateur_prefere" TEXT NOT NULL DEFAULT 'WAVE',
    "wallet_canal_alerte_pref" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_wallet_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_diaspora_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "diaspora_abonnement" BOOLEAN NOT NULL DEFAULT false,
    "diaspora_abonnement_since" TIMESTAMP(3),
    "diaspora_devise" TEXT NOT NULL DEFAULT 'FCFA',
    "diaspora_stripe_id" TEXT,
    "diaspora_whatsapp" TEXT,
    "pays_residence" TEXT,
    "fuseau_horaire" TEXT NOT NULL DEFAULT 'Africa/Abidjan',
    "email_rapport_mensuel" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_diaspora_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_fraud_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_fingerprint" TEXT,
    "fraud_score" INTEGER NOT NULL DEFAULT 0,
    "fraud_flags" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_fraud_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CoopMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoopMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "identity_documents_doc_number_hash_key" ON "identity_documents"("doc_number_hash");

-- CreateIndex
CREATE UNIQUE INDEX "properties_property_code_key" ON "properties"("property_code");

-- CreateIndex
CREATE INDEX "properties_owner_id_idx" ON "properties"("owner_id");

-- CreateIndex
CREATE INDEX "properties_commune_idx" ON "properties"("commune");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "properties_parent_property_id_idx" ON "properties"("parent_property_id");

-- CreateIndex
CREATE UNIQUE INDEX "leases_lease_reference_key" ON "leases"("lease_reference");

-- CreateIndex
CREATE INDEX "leases_status_created_at_idx" ON "leases"("status", "created_at");

-- CreateIndex
CREATE INDEX "leases_property_id_idx" ON "leases"("property_id");

-- CreateIndex
CREATE INDEX "leases_tenant_id_idx" ON "leases"("tenant_id");

-- CreateIndex
CREATE INDEX "leases_status_idx" ON "leases"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_intents_idempotency_key_key" ON "payment_intents"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_receipt_ref_key" ON "receipts"("receipt_ref");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_qr_token_key" ON "receipts"("qr_token");

-- CreateIndex
CREATE INDEX "receipts_lease_id_idx" ON "receipts"("lease_id");

-- CreateIndex
CREATE INDEX "receipts_period_month_idx" ON "receipts"("period_month");

-- CreateIndex
CREATE INDEX "lease_arrears_due_date_status_idx" ON "lease_arrears"("due_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "cdc_deposits_lease_id_key" ON "cdc_deposits"("lease_id");

-- CreateIndex
CREATE UNIQUE INDEX "mandates_mandate_ref_key" ON "mandates"("mandate_ref");

-- CreateIndex
CREATE INDEX "colocataires_bail_id_idx" ON "colocataires"("bail_id");

-- CreateIndex
CREATE INDEX "colocataires_user_id_idx" ON "colocataires"("user_id");

-- CreateIndex
CREATE INDEX "coloc_payments_bail_id_mois_concerne_idx" ON "coloc_payments"("bail_id", "mois_concerne");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_rent_synthesis_bail_id_mois_concerne_key" ON "monthly_rent_synthesis"("bail_id", "mois_concerne");

-- CreateIndex
CREATE UNIQUE INDEX "land_lease_info_bail_id_key" ON "land_lease_info"("bail_id");

-- CreateIndex
CREATE UNIQUE INDEX "agence_profiles_user_id_key" ON "agence_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_qr_token_key" ON "certificates"("qr_token");

-- CreateIndex
CREATE UNIQUE INDEX "digital_deliveries_tracking_number_key" ON "digital_deliveries"("tracking_number");

-- CreateIndex
CREATE INDEX "observatory_snapshots_commune_period_idx" ON "observatory_snapshots"("commune", "period");

-- CreateIndex
CREATE UNIQUE INDEX "market_data_city_commune_property_type_key" ON "market_data"("city", "commune", "property_type");

-- CreateIndex
CREATE UNIQUE INDEX "dossiers_litige_certifies_dlc_uuid_key" ON "dossiers_litige_certifies"("dlc_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "consentements_loyer_prop_id_key" ON "consentements_loyer"("prop_id");

-- CreateIndex
CREATE UNIQUE INDEX "insurances_lease_id_key" ON "insurances"("lease_id");

-- CreateIndex
CREATE UNIQUE INDEX "insurances_policy_no_key" ON "insurances"("policy_no");

-- CreateIndex
CREATE UNIQUE INDEX "mediations_lease_id_key" ON "mediations"("lease_id");

-- CreateIndex
CREATE UNIQUE INDEX "mediations_bdq_id_key" ON "mediations"("bdq_id");

-- CreateIndex
CREATE INDEX "fiscal_dossiers_bail_id_idx" ON "fiscal_dossiers"("bail_id");

-- CreateIndex
CREATE INDEX "fiscal_dossiers_statut_idx" ON "fiscal_dossiers"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "certificats_fiscaux_fiscal_id_key" ON "certificats_fiscaux"("fiscal_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificats_fiscaux_numero_certificat_key" ON "certificats_fiscaux"("numero_certificat");

-- CreateIndex
CREATE UNIQUE INDEX "certificats_fiscaux_qr_token_key" ON "certificats_fiscaux"("qr_token");

-- CreateIndex
CREATE INDEX "prepayment_requests_lease_id_idx" ON "prepayment_requests"("lease_id");

-- CreateIndex
CREATE INDEX "prepayment_requests_tenant_id_idx" ON "prepayment_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "prepayment_requests_landlord_id_idx" ON "prepayment_requests"("landlord_id");

-- CreateIndex
CREATE INDEX "prepayment_requests_status_idx" ON "prepayment_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_pgw_ref_interne_key" ON "payments_pgw"("ref_interne");

-- CreateIndex
CREATE INDEX "payments_pgw_beneficiaire_id_idx" ON "payments_pgw"("beneficiaire_id");

-- CreateIndex
CREATE INDEX "payments_pgw_lease_id_mois_concerne_idx" ON "payments_pgw"("lease_id", "mois_concerne");

-- CreateIndex
CREATE INDEX "payments_pgw_statut_expires_at_idx" ON "payments_pgw"("statut", "expires_at");

-- CreateIndex
CREATE INDEX "payments_pgw_ref_interne_idx" ON "payments_pgw"("ref_interne");

-- CreateIndex
CREATE INDEX "pgw_webhooks_ref_operateur_canal_idx" ON "pgw_webhooks"("ref_operateur", "canal");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_name_key" ON "feature_flags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "etats_des_lieux_ref_edl_key" ON "etats_des_lieux"("ref_edl");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_maintenance_ticket_ref_key" ON "tickets_maintenance"("ticket_ref");

-- CreateIndex
CREATE INDEX "tickets_maintenance_lease_id_idx" ON "tickets_maintenance"("lease_id");

-- CreateIndex
CREATE INDEX "tickets_maintenance_statut_idx" ON "tickets_maintenance"("statut");

-- CreateIndex
CREATE INDEX "annonces_logement_id_idx" ON "annonces"("logement_id");

-- CreateIndex
CREATE UNIQUE INDEX "crg_mensuel_proprietaire_id_agence_id_mois_key" ON "crg_mensuel"("proprietaire_id", "agence_id", "mois");

-- CreateIndex
CREATE UNIQUE INDEX "coop_groups_lease_id_key" ON "coop_groups"("lease_id");

-- CreateIndex
CREATE UNIQUE INDEX "migration_sessions_validation_token_key" ON "migration_sessions"("validation_token");

-- CreateIndex
CREATE UNIQUE INDEX "bails_declaratifs_qr_token_key" ON "bails_declaratifs"("qr_token");

-- CreateIndex
CREATE UNIQUE INDEX "bails_declaratifs_bail_formel_id_key" ON "bails_declaratifs"("bail_formel_id");

-- CreateIndex
CREATE INDEX "bails_declaratifs_locataire_id_idx" ON "bails_declaratifs"("locataire_id");

-- CreateIndex
CREATE INDEX "bails_declaratifs_property_id_idx" ON "bails_declaratifs"("property_id");

-- CreateIndex
CREATE INDEX "bails_declaratifs_bailleur_id_idx" ON "bails_declaratifs"("bailleur_id");

-- CreateIndex
CREATE INDEX "bails_declaratifs_telephone_locataire_idx" ON "bails_declaratifs"("telephone_locataire");

-- CreateIndex
CREATE UNIQUE INDEX "bdq_conversation_states_canal_ref_key" ON "bdq_conversation_states"("canal_ref");

-- CreateIndex
CREATE UNIQUE INDEX "bdq_conversation_states_bdq_cree_id_key" ON "bdq_conversation_states"("bdq_cree_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "notification_logs_user_id_created_at_idx" ON "notification_logs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notification_logs_statut_created_at_idx" ON "notification_logs"("statut", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "bien_acces_bien_id_user_id_key" ON "bien_acces"("bien_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "agences_regularisation_user_id_key" ON "agences_regularisation"("user_id");

-- CreateIndex
CREATE INDEX "sms_declarations_statut_created_at_idx" ON "sms_declarations"("statut", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "config_tarifs_cle_key" ON "config_tarifs"("cle");

-- CreateIndex
CREATE UNIQUE INDEX "offres_abonnements_code_key" ON "offres_abonnements"("code");

-- CreateIndex
CREATE UNIQUE INDEX "codes_promo_code_key" ON "codes_promo"("code");

-- CreateIndex
CREATE UNIQUE INDEX "locataire_profiles_user_id_key" ON "locataire_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cautions_bail_bail_id_key" ON "cautions_bail"("bail_id");

-- CreateIndex
CREATE UNIQUE INDEX "cautions_bail_certificat_ref_key" ON "cautions_bail"("certificat_ref");

-- CreateIndex
CREATE UNIQUE INDEX "preavis_bails_ref_preavis_key" ON "preavis_bails"("ref_preavis");

-- CreateIndex
CREATE UNIQUE INDEX "passeports_locatifs_ref_passeport_key" ON "passeports_locatifs"("ref_passeport");

-- CreateIndex
CREATE UNIQUE INDEX "locataire_profils_publics_user_id_key" ON "locataire_profils_publics"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rapports_mensuels_user_id_periode_mois_periode_annee_type_r_key" ON "rapports_mensuels"("user_id", "periode_mois", "periode_annee", "type_rapport");

-- CreateIndex
CREATE UNIQUE INDEX "champions_profiles_user_id_key" ON "champions_profiles"("user_id");

-- CreateIndex
CREATE INDEX "wallet_recharge_links_user_id_created_at_idx" ON "wallet_recharge_links"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_recharge_configs_user_id_key" ON "wallet_recharge_configs"("user_id");

-- CreateIndex
CREATE INDEX "messagerie_bail_lease_id_idx" ON "messagerie_bail"("lease_id");

-- CreateIndex
CREATE INDEX "annonces_voisinage_property_id_idx" ON "annonces_voisinage"("property_id");

-- CreateIndex
CREATE INDEX "factures_utilities_lease_id_idx" ON "factures_utilities"("lease_id");

-- CreateIndex
CREATE INDEX "factures_utilities_acteur_id_idx" ON "factures_utilities"("acteur_id");

-- CreateIndex
CREATE INDEX "factures_utilities_statut_idx" ON "factures_utilities"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "factures_utilities_lease_id_mois_facture_type_utility_key" ON "factures_utilities"("lease_id", "mois_facture", "type_utility");

-- CreateIndex
CREATE INDEX "repartitions_utilities_facture_id_idx" ON "repartitions_utilities"("facture_id");

-- CreateIndex
CREATE INDEX "repartitions_utilities_locataire_id_idx" ON "repartitions_utilities"("locataire_id");

-- CreateIndex
CREATE INDEX "leads_statut_created_at_idx" ON "leads"("statut", "created_at");

-- CreateIndex
CREATE INDEX "leads_profil_declare_idx" ON "leads"("profil_declare");

-- CreateIndex
CREATE INDEX "user_capacites_user_id_actif_idx" ON "user_capacites"("user_id", "actif");

-- CreateIndex
CREATE UNIQUE INDEX "user_capacites_user_id_capacite_key" ON "user_capacites"("user_id", "capacite");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallet_configs_user_id_key" ON "user_wallet_configs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallet_configs_landlord_code_key" ON "user_wallet_configs"("landlord_code");

-- CreateIndex
CREATE UNIQUE INDEX "user_diaspora_profiles_user_id_key" ON "user_diaspora_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_fraud_profiles_user_id_key" ON "user_fraud_profiles"("user_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_user_id_idx" ON "wallet_transactions"("user_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_created_at_idx" ON "wallet_transactions"("created_at");

-- CreateIndex
CREATE INDEX "_CoopMembers_B_index" ON "_CoopMembers"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "legal_entities"("entity_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_entities" ADD CONSTRAINT "legal_entities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_documents" ADD CONSTRAINT "identity_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_documents" ADD CONSTRAINT "identity_documents_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "legal_entities"("entity_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_documents" ADD CONSTRAINT "identity_documents_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_parent_property_id_fkey" FOREIGN KEY ("parent_property_id") REFERENCES "properties"("property_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_managed_by_fkey" FOREIGN KEY ("managed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_source_migration_id_fkey" FOREIGN KEY ("source_migration_id") REFERENCES "migration_sessions"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_landlord_entity_id_fkey" FOREIGN KEY ("landlord_entity_id") REFERENCES "legal_entities"("entity_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_entity_id_fkey" FOREIGN KEY ("tenant_entity_id") REFERENCES "legal_entities"("entity_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_mandate_id_fkey" FOREIGN KEY ("mandate_id") REFERENCES "mandates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_source_migration_id_fkey" FOREIGN KEY ("source_migration_id") REFERENCES "migration_sessions"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_digital_delivery_id_fkey" FOREIGN KEY ("digital_delivery_id") REFERENCES "digital_deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_arrears" ADD CONSTRAINT "lease_arrears_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_phases" ADD CONSTRAINT "procedure_phases_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cdc_deposits" ADD CONSTRAINT "cdc_deposits_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandates" ADD CONSTRAINT "mandates_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandates" ADD CONSTRAINT "mandates_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandate_history" ADD CONSTRAINT "mandate_history_mandate_id_fkey" FOREIGN KEY ("mandate_id") REFERENCES "mandates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandate_history" ADD CONSTRAINT "mandate_history_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colocataires" ADD CONSTRAINT "colocataires_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colocataires" ADD CONSTRAINT "colocataires_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coloc_payments" ADD CONSTRAINT "coloc_payments_coloc_id_fkey" FOREIGN KEY ("coloc_id") REFERENCES "colocataires"("coloc_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coloc_payments" ADD CONSTRAINT "coloc_payments_quittance_ind_id_fkey" FOREIGN KEY ("quittance_ind_id") REFERENCES "receipts"("receipt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_rent_synthesis" ADD CONSTRAINT "monthly_rent_synthesis_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "land_lease_info" ADD CONSTRAINT "land_lease_info_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reliability_scores" ADD CONSTRAINT "reliability_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icl_events" ADD CONSTRAINT "icl_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agence_profiles" ADD CONSTRAINT "agence_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passports" ADD CONSTRAINT "passports_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_messages" ADD CONSTRAINT "dispute_messages_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_messages" ADD CONSTRAINT "dispute_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "successions_proprio" ADD CONSTRAINT "successions_proprio_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "successions_locataire" ADD CONSTRAINT "successions_locataire_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "successions_locataire" ADD CONSTRAINT "successions_locataire_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reclamations_locataire" ADD CONSTRAINT "reclamations_locataire_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reclamations_locataire" ADD CONSTRAINT "reclamations_locataire_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reclamations_locataire" ADD CONSTRAINT "reclamations_locataire_dossier_litige_id_fkey" FOREIGN KEY ("dossier_litige_id") REFERENCES "dossiers_litige_certifies"("dlc_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossiers_litige_certifies" ADD CONSTRAINT "dossiers_litige_certifies_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propositions_loyer" ADD CONSTRAINT "propositions_loyer_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentements_loyer" ADD CONSTRAINT "consentements_loyer_prop_id_fkey" FOREIGN KEY ("prop_id") REFERENCES "propositions_loyer"("prop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurances" ADD CONSTRAINT "insurances_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_insurance_id_fkey" FOREIGN KEY ("insurance_id") REFERENCES "insurances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repayment_plans" ADD CONSTRAINT "repayment_plans_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediations" ADD CONSTRAINT "mediations_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediations" ADD CONSTRAINT "mediations_bdq_id_fkey" FOREIGN KEY ("bdq_id") REFERENCES "bails_declaratifs"("bdq_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediation_messages" ADD CONSTRAINT "mediation_messages_mediation_id_fkey" FOREIGN KEY ("mediation_id") REFERENCES "mediations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediation_messages" ADD CONSTRAINT "mediation_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_dossiers" ADD CONSTRAINT "fiscal_dossiers_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificats_fiscaux" ADD CONSTRAINT "certificats_fiscaux_fiscal_id_fkey" FOREIGN KEY ("fiscal_id") REFERENCES "fiscal_dossiers"("fiscal_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prepayment_requests" ADD CONSTRAINT "prepayment_requests_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prepayment_requests" ADD CONSTRAINT "prepayment_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prepayment_requests" ADD CONSTRAINT "prepayment_requests_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_pgw" ADD CONSTRAINT "payments_pgw_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_pgw" ADD CONSTRAINT "payments_pgw_payeur_id_fkey" FOREIGN KEY ("payeur_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_pgw" ADD CONSTRAINT "payments_pgw_beneficiaire_id_fkey" FOREIGN KEY ("beneficiaire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_pgw" ADD CONSTRAINT "payments_pgw_quittance_id_fkey" FOREIGN KEY ("quittance_id") REFERENCES "receipts"("receipt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_pgw" ADD CONSTRAINT "payments_pgw_source_migration_id_fkey" FOREIGN KEY ("source_migration_id") REFERENCES "migration_sessions"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reversal_transactions" ADD CONSTRAINT "reversal_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments_pgw"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reversal_transactions" ADD CONSTRAINT "reversal_transactions_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pgw_webhooks" ADD CONSTRAINT "pgw_webhooks_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments_pgw"("payment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etats_des_lieux" ADD CONSTRAINT "etats_des_lieux_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etats_des_lieux" ADD CONSTRAINT "etats_des_lieux_redige_par_fkey" FOREIGN KEY ("redige_par") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etats_des_lieux" ADD CONSTRAINT "etats_des_lieux_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etats_des_lieux" ADD CONSTRAINT "etats_des_lieux_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etats_des_lieux" ADD CONSTRAINT "etats_des_lieux_edl_entree_id_fkey" FOREIGN KEY ("edl_entree_id") REFERENCES "etats_des_lieux"("edl_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signatures_electroniques" ADD CONSTRAINT "signatures_electroniques_signataire_id_fkey" FOREIGN KEY ("signataire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_maintenance" ADD CONSTRAINT "tickets_maintenance_unite_id_fkey" FOREIGN KEY ("unite_id") REFERENCES "properties"("property_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_maintenance" ADD CONSTRAINT "tickets_maintenance_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_maintenance" ADD CONSTRAINT "tickets_maintenance_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_maintenance" ADD CONSTRAINT "tickets_maintenance_prestataire_id_fkey" FOREIGN KEY ("prestataire_id") REFERENCES "prestataires"("prestataire_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_logement_id_fkey" FOREIGN KEY ("logement_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_candidat_id_fkey" FOREIGN KEY ("candidat_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charges_parametrage" ADD CONSTRAINT "charges_parametrage_logement_id_fkey" FOREIGN KEY ("logement_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regularisations_charges" ADD CONSTRAINT "regularisations_charges_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_logement_id_fkey" FOREIGN KEY ("logement_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_agence_id_fkey" FOREIGN KEY ("agence_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crg_mensuel" ADD CONSTRAINT "crg_mensuel_proprietaire_id_fkey" FOREIGN KEY ("proprietaire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crg_mensuel" ADD CONSTRAINT "crg_mensuel_agence_id_fkey" FOREIGN KEY ("agence_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_evenements" ADD CONSTRAINT "agenda_evenements_agence_id_fkey" FOREIGN KEY ("agence_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_evenements" ADD CONSTRAINT "agenda_evenements_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_evenements" ADD CONSTRAINT "agenda_evenements_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_evenements" ADD CONSTRAINT "agenda_evenements_logement_id_fkey" FOREIGN KEY ("logement_id") REFERENCES "properties"("property_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_evenements" ADD CONSTRAINT "agenda_evenements_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tva_transactions" ADD CONSTRAINT "tva_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments_pgw"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurations_numeriques" ADD CONSTRAINT "procurations_numeriques_mandant_id_fkey" FOREIGN KEY ("mandant_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurations_numeriques" ADD CONSTRAINT "procurations_numeriques_mandataire_id_fkey" FOREIGN KEY ("mandataire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_blacklist" ADD CONSTRAINT "fraud_blacklist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_blacklist" ADD CONSTRAINT "fraud_blacklist_ajoute_par_fkey" FOREIGN KEY ("ajoute_par") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_audits" ADD CONSTRAINT "subscription_audits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_procedures" ADD CONSTRAINT "legal_procedures_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coop_groups" ADD CONSTRAINT "coop_groups_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "migration_sessions" ADD CONSTRAINT "migration_sessions_agence_id_fkey" FOREIGN KEY ("agence_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "migration_staging" ADD CONSTRAINT "migration_staging_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "migration_sessions"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_rooms" ADD CONSTRAINT "inspection_rooms_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "inspections"("insp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_photos" ADD CONSTRAINT "inspection_photos_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "inspection_rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_logs" ADD CONSTRAINT "reminder_logs_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bails_declaratifs" ADD CONSTRAINT "bails_declaratifs_bailleur_id_fkey" FOREIGN KEY ("bailleur_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bails_declaratifs" ADD CONSTRAINT "bails_declaratifs_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bails_declaratifs" ADD CONSTRAINT "bails_declaratifs_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bails_declaratifs" ADD CONSTRAINT "bails_declaratifs_agent_confirmant_id_fkey" FOREIGN KEY ("agent_confirmant_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bails_declaratifs" ADD CONSTRAINT "bails_declaratifs_bail_formel_id_fkey" FOREIGN KEY ("bail_formel_id") REFERENCES "leases"("lease_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bdq_sms_log" ADD CONSTRAINT "bdq_sms_log_bdq_id_fkey" FOREIGN KEY ("bdq_id") REFERENCES "bails_declaratifs"("bdq_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bdq_historique_loyer" ADD CONSTRAINT "bdq_historique_loyer_bdq_id_fkey" FOREIGN KEY ("bdq_id") REFERENCES "bails_declaratifs"("bdq_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bdq_conversation_states" ADD CONSTRAINT "bdq_conversation_states_bailleur_id_fkey" FOREIGN KEY ("bailleur_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bdq_conversation_states" ADD CONSTRAINT "bdq_conversation_states_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "legal_entities"("entity_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bdq_conversation_states" ADD CONSTRAINT "bdq_conversation_states_bdq_cree_id_fkey" FOREIGN KEY ("bdq_cree_id") REFERENCES "bails_declaratifs"("bdq_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_maintenance" ADD CONSTRAINT "property_maintenance_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_documents" ADD CONSTRAINT "property_documents_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bien_acces" ADD CONSTRAINT "bien_acces_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bien_acces" ADD CONSTRAINT "bien_acces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bien_acces" ADD CONSTRAINT "bien_acces_invite_par_fkey" FOREIGN KEY ("invite_par") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bien_acces" ADD CONSTRAINT "bien_acces_mandat_id_fkey" FOREIGN KEY ("mandat_id") REFERENCES "mandats_gestion"("mandat_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandats_gestion" ADD CONSTRAINT "mandats_gestion_proprietaire_id_fkey" FOREIGN KEY ("proprietaire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandats_gestion" ADD CONSTRAINT "mandats_gestion_intermediaire_id_fkey" FOREIGN KEY ("intermediaire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agences_regularisation" ADD CONSTRAINT "agences_regularisation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garde_fous_logs" ADD CONSTRAINT "garde_fous_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garde_fous_logs" ADD CONSTRAINT "garde_fous_logs_traite_par_fkey" FOREIGN KEY ("traite_par") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_declarations" ADD CONSTRAINT "sms_declarations_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_declarations" ADD CONSTRAINT "sms_declarations_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_declarations" ADD CONSTRAINT "sms_declarations_confirme_par_fkey" FOREIGN KEY ("confirme_par") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_tarifs" ADD CONSTRAINT "config_tarifs_modifie_par_fkey" FOREIGN KEY ("modifie_par") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offres_abonnements" ADD CONSTRAINT "offres_abonnements_modifie_par_fkey" FOREIGN KEY ("modifie_par") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codes_promo" ADD CONSTRAINT "codes_promo_offre_cible_fkey" FOREIGN KEY ("offre_cible") REFERENCES "offres_abonnements"("offre_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codes_promo" ADD CONSTRAINT "codes_promo_created_par_fkey" FOREIGN KEY ("created_par") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarifs_negocie" ADD CONSTRAINT "tarifs_negocie_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarifs_negocie" ADD CONSTRAINT "tarifs_negocie_offre_id_fkey" FOREIGN KEY ("offre_id") REFERENCES "offres_abonnements"("offre_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarifs_negocie" ADD CONSTRAINT "tarifs_negocie_created_par_fkey" FOREIGN KEY ("created_par") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_tarifs_audit" ADD CONSTRAINT "config_tarifs_audit_modifie_par_fkey" FOREIGN KEY ("modifie_par") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locataire_profiles" ADD CONSTRAINT "locataire_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements_locataire" ADD CONSTRAINT "signalements_locataire_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements_locataire" ADD CONSTRAINT "signalements_locataire_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cautions_bail" ADD CONSTRAINT "cautions_bail_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preavis_bails" ADD CONSTRAINT "preavis_bails_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preavis_bails" ADD CONSTRAINT "preavis_bails_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passeports_locatifs" ADD CONSTRAINT "passeports_locatifs_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes_loyer" ADD CONSTRAINT "alertes_loyer_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes_loyer" ADD CONSTRAINT "alertes_loyer_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locataire_profils_publics" ADD CONSTRAINT "locataire_profils_publics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations_bail" ADD CONSTRAINT "invitations_bail_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "properties"("property_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations_bail" ADD CONSTRAINT "invitations_bail_invitant_id_fkey" FOREIGN KEY ("invitant_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations_bail" ADD CONSTRAINT "invitations_bail_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations_profil" ADD CONSTRAINT "consultations_profil_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "locataire_profils_publics"("profil_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations_profil" ADD CONSTRAINT "consultations_profil_consultant_id_fkey" FOREIGN KEY ("consultant_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapports_mensuels" ADD CONSTRAINT "rapports_mensuels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "champions_profiles" ADD CONSTRAINT "champions_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "champions_profiles" ADD CONSTRAINT "champions_profiles_superviseur_id_fkey" FOREIGN KEY ("superviseur_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "champions_prospects" ADD CONSTRAINT "champions_prospects_champion_id_fkey" FOREIGN KEY ("champion_id") REFERENCES "champions_profiles"("champion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "champions_prospects" ADD CONSTRAINT "champions_prospects_user_id_inscrit_fkey" FOREIGN KEY ("user_id_inscrit") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "champions_commissions" ADD CONSTRAINT "champions_commissions_champion_id_fkey" FOREIGN KEY ("champion_id") REFERENCES "champions_profiles"("champion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_recharge_links" ADD CONSTRAINT "wallet_recharge_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_recharge_configs" ADD CONSTRAINT "wallet_recharge_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messagerie_bail" ADD CONSTRAINT "messagerie_bail_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messagerie_bail" ADD CONSTRAINT "messagerie_bail_expediteur_id_fkey" FOREIGN KEY ("expediteur_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annonces_voisinage" ADD CONSTRAINT "annonces_voisinage_proprio_id_fkey" FOREIGN KEY ("proprio_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annonces_voisinage" ADD CONSTRAINT "annonces_voisinage_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures_utilities" ADD CONSTRAINT "factures_utilities_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures_utilities" ADD CONSTRAINT "factures_utilities_acteur_id_fkey" FOREIGN KEY ("acteur_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repartitions_utilities" ADD CONSTRAINT "repartitions_utilities_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures_utilities"("facture_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repartitions_utilities" ADD CONSTRAINT "repartitions_utilities_lease_locataire_id_fkey" FOREIGN KEY ("lease_locataire_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repartitions_utilities" ADD CONSTRAINT "repartitions_utilities_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_capacites" ADD CONSTRAINT "user_capacites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_wallet_configs" ADD CONSTRAINT "user_wallet_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_diaspora_profiles" ADD CONSTRAINT "user_diaspora_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_fraud_profiles" ADD CONSTRAINT "user_fraud_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoopMembers" ADD CONSTRAINT "_CoopMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "coop_groups"("coop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoopMembers" ADD CONSTRAINT "_CoopMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
