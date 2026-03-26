-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT,
    "full_name" TEXT,
    "name" TEXT,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'TENANT',
    "profile_type" TEXT,
    "kyc_level" INTEGER NOT NULL DEFAULT 0,
    "kyc_status" TEXT NOT NULL DEFAULT 'pending',
    "status" TEXT NOT NULL DEFAULT 'active',
    "password" TEXT,
    "is_certified" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "legal_entity_id" TEXT,
    "preferred_lang" TEXT DEFAULT 'fr',
    "notification_prefs" JSONB,
    "maposte_id" TEXT,
    "push_token" TEXT,
    "diaspora_abonnement" BOOLEAN NOT NULL DEFAULT false,
    "diaspora_abonnement_since" DATETIME,
    "diaspora_devise" TEXT NOT NULL DEFAULT 'FCFA',
    "diaspora_stripe_id" TEXT,
    "diaspora_whatsapp" TEXT,
    "pays_residence" TEXT,
    "fuseau_horaire" TEXT NOT NULL DEFAULT 'Africa/Abidjan',
    "email_rapport_mensuel" TEXT,
    "device_fingerprint" TEXT,
    "fraud_score" INTEGER NOT NULL DEFAULT 0,
    "fraud_flags" JSONB,
    "white_label_config" JSONB,
    "company_reg_number" TEXT,
    "tax_id" TEXT,
    "active_plan_tier" TEXT NOT NULL DEFAULT 'LOCATAIRE',
    "plan_expires_at" DATETIME,
    "wallet_balance" INTEGER NOT NULL DEFAULT 0,
    "wallet_seuil_alerte" REAL DEFAULT 500,
    "wallet_rappel_actif" BOOLEAN NOT NULL DEFAULT false,
    "wallet_rappel_jour" INTEGER NOT NULL DEFAULT 1,
    "wallet_rappel_montant" REAL,
    "wallet_operateur_prefere" TEXT NOT NULL DEFAULT 'WAVE',
    "wallet_canal_alerte_pref" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "legal_entities" ("entity_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "legal_entities" (
    "entity_id" TEXT NOT NULL PRIMARY KEY,
    "created_by" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "legal_form" TEXT,
    "rccm_number" TEXT NOT NULL,
    "nif_number" TEXT,
    "registered_address" TEXT,
    "activity_sector" TEXT,
    "bank_account" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "legal_entities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "identity_documents" (
    "doc_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "legal_entity_id" TEXT,
    "doc_type" TEXT NOT NULL,
    "doc_number" TEXT NOT NULL,
    "doc_number_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "birth_date" DATETIME,
    "nationality" TEXT,
    "issuing_country" TEXT,
    "expiry_date" DATETIME,
    "mrz_raw_data" TEXT,
    "scan_s3_key" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verified_at" DATETIME,
    "verified_by" TEXT,
    "rejection_reason" TEXT,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "identity_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "identity_documents_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "legal_entities" ("entity_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "identity_documents_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "properties" (
    "property_id" TEXT NOT NULL PRIMARY KEY,
    "property_code" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "property_type" TEXT NOT NULL,
    "lease_type" TEXT NOT NULL DEFAULT 'residential',
    "commune" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "area_sqm" REAL,
    "rooms" INTEGER,
    "bedrooms" INTEGER,
    "name" TEXT,
    "city" TEXT,
    "declared_rent_fcfa" REAL,
    "digital_postal_address" TEXT,
    "gps_latitude" REAL,
    "gps_longitude" REAL,
    "amenities" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "documents" JSONB,
    "verified_at" DATETIME,
    "verified_by" TEXT,
    "managed_by" TEXT,
    "management_mode" TEXT NOT NULL DEFAULT 'DIRECT',
    "superficie_m2" REAL,
    "usage_terrain" TEXT,
    "reference_cadastre" TEXT,
    "is_horeoo" BOOLEAN NOT NULL DEFAULT false,
    "horeoo_discount" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "source_migration_id" TEXT,
    CONSTRAINT "properties_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "properties_managed_by_fkey" FOREIGN KEY ("managed_by") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "properties_source_migration_id_fkey" FOREIGN KEY ("source_migration_id") REFERENCES "migration_sessions" ("session_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "property_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "property_id" TEXT NOT NULL,
    "s3_key" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "property_images_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties" ("property_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leases" (
    "lease_id" TEXT NOT NULL PRIMARY KEY,
    "lease_reference" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "landlord_entity_id" TEXT,
    "tenant_id" TEXT,
    "tenant_entity_id" TEXT,
    "agent_id" TEXT,
    "mandate_id" TEXT,
    "lease_type" TEXT NOT NULL DEFAULT 'residential',
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "duration_months" INTEGER NOT NULL,
    "rent_amount" INTEGER NOT NULL,
    "charges_amount" INTEGER NOT NULL DEFAULT 0,
    "payment_day" INTEGER NOT NULL DEFAULT 5,
    "deposit_amount" INTEGER NOT NULL DEFAULT 0,
    "date_limite_paiement" INTEGER NOT NULL DEFAULT 5,
    "paiement_avance" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "import_mode" BOOLEAN NOT NULL DEFAULT false,
    "type_bail" TEXT NOT NULL DEFAULT 'ECRIT',
    "confirmation_locataire_sms" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_locataire_at" DATETIME,
    "preavis_requis_mois" INTEGER DEFAULT 1,
    "signed_at" DATETIME,
    "terminated_at" DATETIME,
    "termination_reason" TEXT,
    "commercial_data" JSONB,
    "is_signed_electronically" BOOLEAN NOT NULL DEFAULT false,
    "signing_otp" TEXT,
    "signature_context" JSONB,
    "mode_utilities" TEXT NOT NULL DEFAULT 'NON_APPLICABLE',
    "identifiant_cie" TEXT,
    "identifiant_sodeci" TEXT,
    "modele_repartition" TEXT NOT NULL DEFAULT 'PRORATA_CHAMBRE',
    "forfait_utilities_mensuel" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "source_migration_id" TEXT,
    "nb_pages_bail" INTEGER,
    "duree_mois_bail" INTEGER,
    "loyer_total_fcfa" REAL,
    "droits_enregistrement" REAL,
    "frais_timbre" REAL,
    "total_fiscal_bail" REAL,
    "statut_fiscal" TEXT NOT NULL DEFAULT 'NON_CALCUL├ë',
    "recu_fiscal_url" TEXT,
    "recu_fiscal_hash" TEXT,
    "deadline_enregistrement" DATETIME,
    "cert_enregistrement_dgi_url" TEXT,
    CONSTRAINT "leases_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties" ("property_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "leases_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "leases_landlord_entity_id_fkey" FOREIGN KEY ("landlord_entity_id") REFERENCES "legal_entities" ("entity_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "leases_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "leases_tenant_entity_id_fkey" FOREIGN KEY ("tenant_entity_id") REFERENCES "legal_entities" ("entity_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "leases_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "leases_mandate_id_fkey" FOREIGN KEY ("mandate_id") REFERENCES "mandates" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "leases_source_migration_id_fkey" FOREIGN KEY ("source_migration_id") REFERENCES "migration_sessions" ("session_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_intents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idempotency_key" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "operator" TEXT NOT NULL,
    "operator_ref" TEXT,
    "payer_phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "payment_intents_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "receipts" (
    "receipt_id" TEXT NOT NULL PRIMARY KEY,
    "receipt_ref" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "period_month" TEXT NOT NULL,
    "rent_amount" INTEGER NOT NULL,
    "charges_amount" INTEGER NOT NULL DEFAULT 0,
    "total_amount" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_ref" TEXT,
    "paid_at" DATETIME,
    "pdf_url" TEXT,
    "qr_token" TEXT,
    "receipt_hash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "declarative" BOOLEAN NOT NULL DEFAULT false,
    "digital_delivery_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "receipts_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "receipts_digital_delivery_id_fkey" FOREIGN KEY ("digital_delivery_id") REFERENCES "digital_deliveries" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lease_arrears" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "due_date" DATETIME NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unpaid',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lease_arrears_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "procedure_phases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "phase_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "action_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    CONSTRAINT "procedure_phases_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cdc_deposits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "initiator" TEXT NOT NULL DEFAULT 'OWNER',
    "cdc_reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "proof_hash" TEXT,
    "consigned_at" DATETIME,
    "returned_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "cdc_deposits_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mandates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mandate_ref" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "mandateType" TEXT NOT NULL,
    "commission_pct" REAL,
    "commission_fixed" INTEGER,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scope" TEXT NOT NULL DEFAULT '[]',
    "signed_at" DATETIME,
    "cancelled_at" DATETIME,
    "cancelled_by" TEXT,
    "cancel_reason" TEXT,
    "proof_hash" TEXT,
    "pdf_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "mandates_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties" ("property_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mandates_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mandate_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "property_id" TEXT NOT NULL,
    "mandate_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "type_mandat" TEXT NOT NULL,
    "periode_debut" DATETIME NOT NULL,
    "periode_fin" DATETIME,
    "baux_actifs_transferes" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mandate_history_mandate_id_fkey" FOREIGN KEY ("mandate_id") REFERENCES "mandates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mandate_history_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "colocataires" (
    "coloc_id" TEXT NOT NULL PRIMARY KEY,
    "bail_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SECONDAIRE',
    "part_loyer" INTEGER,
    "pct_loyer" REAL,
    "mode_paiement" TEXT NOT NULL DEFAULT 'INDIVIDUEL',
    "date_entree" DATETIME NOT NULL,
    "date_sortie" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIF',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "colocataires_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "colocataires_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "coloc_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bail_id" TEXT NOT NULL,
    "coloc_id" TEXT NOT NULL,
    "mois_concerne" TEXT NOT NULL,
    "montant_paye" INTEGER NOT NULL,
    "canal_paiement" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "reference_mobile" TEXT,
    "quittance_ind_id" TEXT,
    "paid_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coloc_payments_coloc_id_fkey" FOREIGN KEY ("coloc_id") REFERENCES "colocataires" ("coloc_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "monthly_rent_synthesis" (
    "synthese_id" TEXT NOT NULL PRIMARY KEY,
    "bail_id" TEXT NOT NULL,
    "mois_concerne" TEXT NOT NULL,
    "loyer_total_du" INTEGER NOT NULL,
    "montant_collecte" INTEGER NOT NULL DEFAULT 0,
    "statut_mois" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "quittance_glob_id" TEXT,
    "completed_at" DATETIME,
    CONSTRAINT "monthly_rent_synthesis_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "land_lease_info" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bail_id" TEXT NOT NULL,
    "superficie_louee_m2" REAL NOT NULL,
    "usage_declare" TEXT NOT NULL,
    "periodicite_loyer" TEXT NOT NULL DEFAULT 'MENSUEL',
    "date_evenement_fin" DATETIME,
    "indexation_annuelle" REAL DEFAULT 0,
    "conditions_usage" TEXT,
    "etat_des_lieux_entree" BOOLEAN NOT NULL DEFAULT false,
    "etat_des_lieux_sortie" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "land_lease_info_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reliability_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "breakdown" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reliability_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "certificates" (
    "cert_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "cert_type" TEXT NOT NULL,
    "issued_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME NOT NULL,
    "qr_token" TEXT NOT NULL,
    "pdf_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'valid',
    CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "passports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "property_id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "passports_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties" ("property_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount_in_dispute" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "disputes_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dispute_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dispute_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT NOT NULL DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dispute_messages_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dispute_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "digital_deliveries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tracking_number" TEXT NOT NULL,
    "delivery_mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "recipient_data" JSONB NOT NULL,
    "delivered_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'PUSH',
    "title" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "observatory_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commune" TEXT NOT NULL,
    "property_type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "avg_rent" INTEGER NOT NULL,
    "median_rent" INTEGER NOT NULL,
    "min_rent" INTEGER NOT NULL,
    "max_rent" INTEGER NOT NULL,
    "sample_count" INTEGER NOT NULL,
    "trend_pct" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "market_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "city" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "property_type" TEXT NOT NULL,
    "average_rent" REAL NOT NULL,
    "sample_size" INTEGER NOT NULL,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "successions_proprio" (
    "succession_id" TEXT NOT NULL PRIMARY KEY,
    "landlord_id" TEXT NOT NULL,
    "declarant_nom" TEXT NOT NULL,
    "declarant_lien" TEXT NOT NULL,
    "declarant_phone" TEXT NOT NULL,
    "date_declaration" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "date_deces" DATETIME NOT NULL,
    "acte_deces_url" TEXT,
    "heritier_id" TEXT,
    "date_transfert" DATETIME,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "successions_proprio_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "successions_locataire" (
    "succession_id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "date_deces" DATETIME NOT NULL,
    "declarant_type" TEXT,
    "declarant_phone" TEXT,
    "beneficiaire_id" TEXT,
    "beneficiaire_ext_nom" TEXT,
    "beneficiaire_ext_phone" TEXT,
    "loyer_prorata" REAL,
    "caution_montant" REAL,
    "caution_restituee" BOOLEAN NOT NULL DEFAULT false,
    "date_restitution" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'TRANSITION',
    "date_fin_transition" DATETIME NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "successions_locataire_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "successions_locataire_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reclamations_locataire" (
    "reclamation_id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type_reclamation" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "preuve_url" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'OUVERT',
    "date_echeance" DATETIME NOT NULL,
    "dossier_litige_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reclamations_locataire_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reclamations_locataire_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reclamations_locataire_dossier_litige_id_fkey" FOREIGN KEY ("dossier_litige_id") REFERENCES "dossiers_litige_certifies" ("dlc_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dossiers_litige_certifies" (
    "dlc_id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "dlc_uuid" TEXT NOT NULL,
    "dlc_hash_sha256" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'GENERE',
    "ref_caci" TEXT,
    "issue" TEXT,
    "date_cloture" DATETIME,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dossiers_litige_certifies_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "propositions_loyer" (
    "prop_id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "montant_actuel" INTEGER NOT NULL,
    "nouveau_montant" INTEGER NOT NULL,
    "date_effet" DATETIME NOT NULL,
    "raison" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "propositions_loyer_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "consentements_loyer" (
    "consent_id" TEXT NOT NULL PRIMARY KEY,
    "prop_id" TEXT NOT NULL,
    "reponse" BOOLEAN NOT NULL,
    "commentaire" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "consentements_loyer_prop_id_fkey" FOREIGN KEY ("prop_id") REFERENCES "propositions_loyer" ("prop_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "proof_hash" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operator" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signature_valid" BOOLEAN NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "system_config" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" JSONB NOT NULL,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "incidents_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "insurances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "policy_no" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "insurances_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "insurance_claims" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "insurance_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "insurance_claims_insurance_id_fkey" FOREIGN KEY ("insurance_id") REFERENCES "insurances" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "repayment_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "tenant_signature" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "repayment_plans_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mediations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT,
    "bdq_id" TEXT,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "mediations_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "mediations_bdq_id_fkey" FOREIGN KEY ("bdq_id") REFERENCES "bails_declaratifs" ("bdq_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mediation_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mediation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mediation_messages_mediation_id_fkey" FOREIGN KEY ("mediation_id") REFERENCES "mediations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mediation_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "news_tickers" (
    "news_id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "fiscal_dossiers" (
    "fiscal_id" TEXT NOT NULL PRIMARY KEY,
    "bail_id" TEXT NOT NULL,
    "loyer_mensuel" INTEGER NOT NULL,
    "duree_bail_mois" INTEGER NOT NULL,
    "duree_retenue_mois" INTEGER NOT NULL,
    "base_calcul" INTEGER NOT NULL,
    "taux_applique" REAL NOT NULL DEFAULT 0.0250,
    "droits_enregistrement" INTEGER NOT NULL,
    "frais_timbre" INTEGER NOT NULL DEFAULT 1000,
    "frais_qapril" INTEGER NOT NULL,
    "total_dgi" INTEGER NOT NULL,
    "total_bailleur" INTEGER NOT NULL,
    "penalty_amount" INTEGER NOT NULL DEFAULT 0,
    "exonere" BOOLEAN NOT NULL DEFAULT false,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE_DECLARATION',
    "date_limite_legale" DATETIME NOT NULL,
    "cinetpay_transaction_id" TEXT,
    "cinetpay_payment_url" TEXT,
    "paid_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "fiscal_dossiers_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "certificats_fiscaux" (
    "certificat_id" TEXT NOT NULL PRIMARY KEY,
    "fiscal_id" TEXT NOT NULL,
    "numero_certificat" TEXT NOT NULL,
    "qr_token" TEXT NOT NULL,
    "pdf_path" TEXT NOT NULL,
    "hash_sha256" TEXT NOT NULL,
    "issued_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'VALIDE',
    CONSTRAINT "certificats_fiscaux_fiscal_id_fkey" FOREIGN KEY ("fiscal_id") REFERENCES "fiscal_dossiers" ("fiscal_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prepayment_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "months_count" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "approved_at" DATETIME,
    "rejected_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "prepayment_requests_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "prepayment_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "prepayment_requests_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments_pgw" (
    "payment_id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "mois_concerne" DATETIME NOT NULL,
    "montant" REAL NOT NULL,
    "payeur_id" TEXT NOT NULL,
    "beneficiaire_id" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "msisdn_payeur" TEXT,
    "msisdn_beneficiaire" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'INITIEE',
    "ref_interne" TEXT NOT NULL,
    "ref_operateur" TEXT,
    "ref_cinetpay" TEXT,
    "webhook_payload" JSONB,
    "webhook_received_at" DATETIME,
    "quittance_id" TEXT,
    "source_migration_id" TEXT,
    "tentatives" INTEGER NOT NULL DEFAULT 0,
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "reversal_status" TEXT NOT NULL DEFAULT 'PENDING',
    "honoraires_agence" REAL,
    CONSTRAINT "payments_pgw_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_pgw_payeur_id_fkey" FOREIGN KEY ("payeur_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_pgw_beneficiaire_id_fkey" FOREIGN KEY ("beneficiaire_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_pgw_quittance_id_fkey" FOREIGN KEY ("quittance_id") REFERENCES "receipts" ("receipt_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "payments_pgw_source_migration_id_fkey" FOREIGN KEY ("source_migration_id") REFERENCES "migration_sessions" ("session_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reversal_transactions" (
    "reversal_id" TEXT NOT NULL PRIMARY KEY,
    "payment_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "reference_pgw" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reversal_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments_pgw" ("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reversal_transactions_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pgw_webhooks" (
    "webhook_id" TEXT NOT NULL PRIMARY KEY,
    "canal" TEXT NOT NULL,
    "ref_operateur" TEXT,
    "payload" JSONB NOT NULL,
    "signature_valid" BOOLEAN NOT NULL,
    "traite" BOOLEAN NOT NULL DEFAULT false,
    "payment_id" TEXT,
    "received_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pgw_webhooks_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments_pgw" ("payment_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pgw_msisdn_lookup" (
    "prefixe" TEXT NOT NULL PRIMARY KEY,
    "operateur" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pgw_reconciliation" (
    "recon_id" TEXT NOT NULL PRIMARY KEY,
    "date_recon" DATETIME NOT NULL,
    "canal" TEXT NOT NULL,
    "nb_transactions_qapril" INTEGER NOT NULL,
    "nb_transactions_operateur" INTEGER,
    "montant_total_qapril" REAL NOT NULL,
    "montant_total_operateur" REAL,
    "nb_ecarts" INTEGER NOT NULL DEFAULT 0,
    "ecarts_detail" JSONB,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "flag_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "etats_des_lieux" (
    "edl_id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "type_edl" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "redige_par" TEXT NOT NULL,
    "agent_id" TEXT,
    "locataire_id" TEXT,
    "date_edl" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sections" JSONB,
    "index_eau" REAL,
    "index_elec" REAL,
    "cles_remises" INTEGER NOT NULL DEFAULT 0,
    "cles_detail" TEXT,
    "reserves_locataire" TEXT,
    "confirme_proprio" BOOLEAN NOT NULL DEFAULT false,
    "confirme_locataire" BOOLEAN NOT NULL DEFAULT false,
    "confirme_proprio_at" DATETIME,
    "confirme_locataire_at" DATETIME,
    "expire_confirmation_at" DATETIME,
    "ref_edl" TEXT,
    "hash_sha256" TEXT,
    "pdf_url" TEXT,
    "edl_entree_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "etats_des_lieux_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "etats_des_lieux_redige_par_fkey" FOREIGN KEY ("redige_par") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "etats_des_lieux_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "etats_des_lieux_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "etats_des_lieux_edl_entree_id_fkey" FOREIGN KEY ("edl_entree_id") REFERENCES "etats_des_lieux" ("edl_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "signatures_electroniques" (
    "sig_id" TEXT NOT NULL PRIMARY KEY,
    "document_type" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "signataire_id" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "methode" TEXT,
    "otp_utilise" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "hash_document" TEXT,
    "signed_at" DATETIME,
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "signatures_electroniques_signataire_id_fkey" FOREIGN KEY ("signataire_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tickets_maintenance" (
    "ticket_id" TEXT NOT NULL PRIMARY KEY,
    "ticket_ref" TEXT NOT NULL,
    "unite_id" TEXT,
    "lease_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "categorie_v2" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photos_urls" TEXT NOT NULL DEFAULT '[]',
    "urgence" TEXT NOT NULL DEFAULT 'NORMALE',
    "photo_url" TEXT,
    "photo_hash_sha256" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "date_signalement" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_prise_en_charge" DATETIME,
    "date_resolution" DATETIME,
    "nb_reouvertures" INTEGER NOT NULL DEFAULT 0,
    "commentaire_proprio" TEXT,
    "confirmation_locataire" BOOLEAN,
    "date_confirmation" DATETIME,
    "prestataire_id" TEXT,
    "devis_montant" REAL,
    "cout_final" REAL,
    "date_intervention" DATETIME,
    "note_locataire" INTEGER,
    "note_prestataire" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "closed_at" DATETIME,
    CONSTRAINT "tickets_maintenance_unite_id_fkey" FOREIGN KEY ("unite_id") REFERENCES "properties" ("property_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tickets_maintenance_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tickets_maintenance_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tickets_maintenance_prestataire_id_fkey" FOREIGN KEY ("prestataire_id") REFERENCES "prestataires" ("prestataire_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prestataires" (
    "prestataire_id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "specialite" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "adresse" TEXT,
    "note_moyenne" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "candidatures" (
    "cand_id" TEXT NOT NULL PRIMARY KEY,
    "logement_id" TEXT NOT NULL,
    "candidat_id" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "revenu_mensuel" REAL,
    "employeur" TEXT,
    "score_qapril" INTEGER,
    "taux_effort" REAL,
    "docs_jsonb" JSONB,
    "statut" TEXT NOT NULL DEFAULT 'SOUMISE',
    "note_agence" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "candidatures_logement_id_fkey" FOREIGN KEY ("logement_id") REFERENCES "properties" ("property_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "candidatures_candidat_id_fkey" FOREIGN KEY ("candidat_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "charges_parametrage" (
    "charge_id" TEXT NOT NULL PRIMARY KEY,
    "logement_id" TEXT NOT NULL,
    "type_charge" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'FORFAIT',
    "montant_mensuel" REAL NOT NULL,
    "cle_repartition" REAL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "charges_parametrage_logement_id_fkey" FOREIGN KEY ("logement_id") REFERENCES "properties" ("property_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "regularisations_charges" (
    "reg_id" TEXT NOT NULL PRIMARY KEY,
    "bail_id" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "provisions_collectees" REAL NOT NULL,
    "charges_reelles" REAL NOT NULL,
    "solde" REAL NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'CALCULE',
    "notifie_at" DATETIME,
    "regle_at" DATETIME,
    CONSTRAINT "regularisations_charges_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "annonces" (
    "annonce_id" TEXT NOT NULL PRIMARY KEY,
    "logement_id" TEXT NOT NULL,
    "agence_id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "loyer_demande" REAL NOT NULL,
    "charges" REAL NOT NULL DEFAULT 0,
    "photos_urls" TEXT NOT NULL DEFAULT '[]',
    "criteres" JSONB,
    "statut" TEXT NOT NULL DEFAULT 'ACTIVE',
    "diffusions" JSONB,
    "nb_contacts" INTEGER NOT NULL DEFAULT 0,
    "nb_visites" INTEGER NOT NULL DEFAULT 0,
    "nb_candidatures" INTEGER NOT NULL DEFAULT 0,
    "cout_vacance" REAL,
    "publiee_at" DATETIME,
    "archivee_at" DATETIME,
    CONSTRAINT "annonces_logement_id_fkey" FOREIGN KEY ("logement_id") REFERENCES "properties" ("property_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "annonces_agence_id_fkey" FOREIGN KEY ("agence_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "crg_mensuel" (
    "crg_id" TEXT NOT NULL PRIMARY KEY,
    "proprietaire_id" TEXT NOT NULL,
    "agence_id" TEXT NOT NULL,
    "mois" DATETIME NOT NULL,
    "loyers_encaisses" REAL NOT NULL DEFAULT 0,
    "charges_deduites" REAL NOT NULL DEFAULT 0,
    "travaux_deduits" REAL NOT NULL DEFAULT 0,
    "honoraires_agence" REAL NOT NULL DEFAULT 0,
    "reversement_net" REAL NOT NULL,
    "reversement_effectue_at" DATETIME,
    "pdf_url" TEXT,
    "hash_sha256" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crg_mensuel_proprietaire_id_fkey" FOREIGN KEY ("proprietaire_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "crg_mensuel_agence_id_fkey" FOREIGN KEY ("agence_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agenda_evenements" (
    "event_id" TEXT NOT NULL PRIMARY KEY,
    "agence_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "type_event" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "contact_id" TEXT,
    "logement_id" TEXT,
    "lease_id" TEXT,
    "debut_at" DATETIME NOT NULL,
    "fin_at" DATETIME,
    "rappel_minutes" INTEGER NOT NULL DEFAULT 30,
    "statut" TEXT NOT NULL DEFAULT 'PLANIFIE',
    "gcal_event_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agenda_evenements_agence_id_fkey" FOREIGN KEY ("agence_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "agenda_evenements_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "agenda_evenements_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "agenda_evenements_logement_id_fkey" FOREIGN KEY ("logement_id") REFERENCES "properties" ("property_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "agenda_evenements_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tva_transactions" (
    "tva_id" TEXT NOT NULL PRIMARY KEY,
    "payment_id" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "montant_ht" REAL NOT NULL,
    "taux_tva" REAL NOT NULL DEFAULT 18.00,
    "montant_tva" REAL NOT NULL,
    "montant_ttc" REAL NOT NULL,
    "periode_fiscale" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tva_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments_pgw" ("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "procurations_numeriques" (
    "proc_id" TEXT NOT NULL PRIMARY KEY,
    "mandant_id" TEXT NOT NULL,
    "mandataire_id" TEXT NOT NULL,
    "droits" JSONB NOT NULL,
    "date_debut" DATETIME NOT NULL,
    "date_fin" DATETIME,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "procurations_numeriques_mandant_id_fkey" FOREIGN KEY ("mandant_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "procurations_numeriques_mandataire_id_fkey" FOREIGN KEY ("mandataire_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fraud_blacklist" (
    "bl_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "document_hash" TEXT,
    "motif" TEXT NOT NULL,
    "ajoute_par" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fraud_blacklist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fraud_blacklist_ajoute_par_fkey" FOREIGN KEY ("ajoute_par") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscription_audits" (
    "sub_audit_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "old_tier" TEXT NOT NULL,
    "new_tier" TEXT NOT NULL,
    "reason" TEXT,
    "executed_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscription_audits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "legal_procedures" (
    "procedure_id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT,
    "served_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "legal_procedures_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "coop_groups" (
    "coop_id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total_target" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coop_groups_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "migration_sessions" (
    "session_id" TEXT NOT NULL PRIMARY KEY,
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
    "validated_at" DATETIME,
    "committed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "migration_sessions_agence_id_fkey" FOREIGN KEY ("agence_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "migration_staging" (
    "staging_id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "agence_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "raw_data" JSONB NOT NULL,
    "mapped_data" JSONB,
    "validation_status" TEXT NOT NULL DEFAULT 'PENDING',
    "errors" JSONB,
    "warnings" JSONB,
    "committed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "migration_staging_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "migration_sessions" ("session_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inspections" (
    "insp_id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANIFIEE',
    "date" DATETIME NOT NULL,
    "general_score" INTEGER,
    "comments" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "inspections_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inspection_rooms" (
    "room_id" TEXT NOT NULL PRIMARY KEY,
    "inspection_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GOOD',
    "comments" TEXT,
    CONSTRAINT "inspection_rooms_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "inspections" ("insp_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inspection_photos" (
    "photo_id" TEXT NOT NULL PRIMARY KEY,
    "room_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inspection_photos_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "inspection_rooms" ("room_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reminder_logs" (
    "log_id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    CONSTRAINT "reminder_logs_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bails_declaratifs" (
    "bdq_id" TEXT NOT NULL PRIMARY KEY,
    "bailleur_id" TEXT NOT NULL,
    "locataire_id" TEXT,
    "property_id" TEXT,
    "nom_locataire_declare" TEXT NOT NULL,
    "prenom_locataire_declare" TEXT,
    "telephone_locataire" TEXT NOT NULL,
    "description_logement" TEXT NOT NULL,
    "adresse_libre" TEXT,
    "loyer_declare_mensuel" REAL NOT NULL,
    "date_entree_estimee" DATETIME,
    "precision_date_entree" TEXT NOT NULL DEFAULT 'EXACTE',
    "identite_incomplete" BOOLEAN NOT NULL DEFAULT false,
    "source_creation" TEXT NOT NULL DEFAULT 'FORM',
    "statut" TEXT NOT NULL DEFAULT 'PENDING_LOCATAIRE',
    "confirmation_locataire" BOOLEAN,
    "confirmation_at" DATETIME,
    "contre_proposition_loyer" REAL,
    "motif_refus" TEXT,
    "agent_confirmant_id" TEXT,
    "confirmation_agent_at" DATETIME,
    "agent_confirmation_mode" TEXT,
    "hash_declaration" TEXT NOT NULL,
    "hash_bdq_final" TEXT,
    "qr_token" TEXT,
    "bail_formel_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "bails_declaratifs_bailleur_id_fkey" FOREIGN KEY ("bailleur_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bails_declaratifs_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bails_declaratifs_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties" ("property_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bails_declaratifs_agent_confirmant_id_fkey" FOREIGN KEY ("agent_confirmant_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bails_declaratifs_bail_formel_id_fkey" FOREIGN KEY ("bail_formel_id") REFERENCES "leases" ("lease_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bdq_sms_log" (
    "sms_id" TEXT NOT NULL PRIMARY KEY,
    "bdq_id" TEXT NOT NULL,
    "type_sms" TEXT NOT NULL,
    "destinataire" TEXT NOT NULL,
    "role_dest" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "statut_envoi" TEXT NOT NULL DEFAULT 'ENVOYE',
    "reponse_recue" TEXT,
    "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bdq_sms_log_bdq_id_fkey" FOREIGN KEY ("bdq_id") REFERENCES "bails_declaratifs" ("bdq_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bdq_historique_loyer" (
    "hist_id" TEXT NOT NULL PRIMARY KEY,
    "bdq_id" TEXT NOT NULL,
    "ancien_loyer" REAL NOT NULL,
    "nouveau_loyer" REAL NOT NULL,
    "motif" TEXT,
    "confirmation_locataire" BOOLEAN,
    "modifie_par" TEXT,
    "effective_le" DATETIME NOT NULL,
    "hash_modification" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bdq_historique_loyer_bdq_id_fkey" FOREIGN KEY ("bdq_id") REFERENCES "bails_declaratifs" ("bdq_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bdq_conversation_states" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bailleur_id" TEXT NOT NULL,
    "legal_entity_id" TEXT,
    "canal" TEXT NOT NULL,
    "canal_ref" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "nom_locataire_extrait" TEXT,
    "telephone_extrait" TEXT,
    "description_logement_extrait" TEXT,
    "loyer_extrait" REAL,
    "date_entree_extraite" DATETIME,
    "precision_date" TEXT NOT NULL DEFAULT 'APPROXIMATIVE',
    "telephone_manquant" BOOLEAN NOT NULL DEFAULT false,
    "identite_incomplete" BOOLEAN NOT NULL DEFAULT false,
    "messages_history" TEXT NOT NULL DEFAULT '[]',
    "nb_echanges" INTEGER NOT NULL DEFAULT 0,
    "champ_en_attente" TEXT,
    "pause_reason" TEXT,
    "bdq_cree_id" TEXT,
    "tokens_entree_total" INTEGER NOT NULL DEFAULT 0,
    "tokens_sortie_total" INTEGER NOT NULL DEFAULT 0,
    "cout_estime_fcfa" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "expire_at" DATETIME,
    "completed_at" DATETIME,
    CONSTRAINT "bdq_conversation_states_bailleur_id_fkey" FOREIGN KEY ("bailleur_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bdq_conversation_states_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "legal_entities" ("entity_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bdq_conversation_states_bdq_cree_id_fkey" FOREIGN KEY ("bdq_cree_id") REFERENCES "bails_declaratifs" ("bdq_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "property_maintenance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "property_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" REAL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT,
    "attachments" TEXT NOT NULL DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "property_maintenance_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties" ("property_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "property_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "property_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "expiry_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "property_documents_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties" ("property_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "pref_id" TEXT NOT NULL PRIMARY KEY,
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
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "notif_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "type_evenement" TEXT NOT NULL,
    "reference_id" TEXT,
    "template_id" TEXT,
    "contenu_preview" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "nb_tentatives" INTEGER NOT NULL DEFAULT 0,
    "erreur_detail" TEXT,
    "envoye_at" DATETIME,
    "livre_at" DATETIME,
    "lu_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bien_acces" (
    "acces_id" TEXT NOT NULL PRIMARY KEY,
    "bien_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "profil_intermediaire" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "justificatif_type" TEXT,
    "justificatif_numero" TEXT,
    "justificatif_valide" BOOLEAN NOT NULL DEFAULT false,
    "justificatif_verifie_at" DATETIME,
    "invite_par" TEXT,
    "invite_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "accepte_at" DATETIME,
    "revoque_at" DATETIME,
    "mandat_id" TEXT,
    "date_debut" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "date_fin" DATETIME,
    "note" TEXT,
    CONSTRAINT "bien_acces_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "properties" ("property_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bien_acces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bien_acces_invite_par_fkey" FOREIGN KEY ("invite_par") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bien_acces_mandat_id_fkey" FOREIGN KEY ("mandat_id") REFERENCES "mandats_gestion" ("mandat_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mandats_gestion" (
    "mandat_id" TEXT NOT NULL PRIMARY KEY,
    "proprietaire_id" TEXT NOT NULL,
    "intermediaire_id" TEXT NOT NULL,
    "profil" TEXT NOT NULL,
    "biens_concernes" TEXT NOT NULL DEFAULT '[]',
    "date_debut" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" DATETIME,
    "remuneration" TEXT DEFAULT 'GRATUIT',
    "permissions" JSONB NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "signature_proprio" DATETIME,
    "signature_interm" DATETIME,
    "hash_sha256" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mandats_gestion_proprietaire_id_fkey" FOREIGN KEY ("proprietaire_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mandats_gestion_intermediaire_id_fkey" FOREIGN KEY ("intermediaire_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agences_regularisation" (
    "reg_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "date_inscription" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_limite_initiale" DATETIME NOT NULL,
    "date_limite_actuelle" DATETIME NOT NULL,
    "nb_biens_bascule" INTEGER,
    "nb_proprietaires_bascule" INTEGER,
    "recepissse_cdaim" TEXT,
    "recepissse_date" DATETIME,
    "rappel_j30_at" DATETIME,
    "rappel_j90_at" DATETIME,
    "rappel_j180_at" DATETIME,
    "rappel_j240_at" DATETIME,
    "rappel_j270_at" DATETIME,
    "bascule_at" DATETIME,
    "regularise_at" DATETIME,
    "notes_admin" TEXT,
    CONSTRAINT "agences_regularisation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "garde_fous_logs" (
    "log_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type_signal" TEXT NOT NULL,
    "detail" TEXT,
    "action_prise" TEXT,
    "traite" BOOLEAN NOT NULL DEFAULT false,
    "traite_par" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "garde_fous_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "garde_fous_logs_traite_par_fkey" FOREIGN KEY ("traite_par") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sms_declarations" (
    "decl_id" TEXT NOT NULL PRIMARY KEY,
    "bail_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "montant_declare" REAL NOT NULL,
    "canal" TEXT NOT NULL DEFAULT 'SMS_DECLARATIF',
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "confirme_par" TEXT,
    "confirme_at" DATETIME,
    "quittance_id" TEXT,
    "rappel_1_at" DATETIME,
    "alerte_proprio_at" DATETIME,
    "sms_brut" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" DATETIME,
    CONSTRAINT "sms_declarations_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases" ("lease_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sms_declarations_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sms_declarations_confirme_par_fkey" FOREIGN KEY ("confirme_par") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "config_tarifs" (
    "tarif_id" TEXT NOT NULL PRIMARY KEY,
    "cle" TEXT NOT NULL,
    "valeur" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "modifiable" BOOLEAN NOT NULL DEFAULT true,
    "date_effet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_par" TEXT,
    "modifie_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "valeur_precedente" REAL,
    "note_modification" TEXT,
    "metadata" TEXT,
    CONSTRAINT "config_tarifs_modifie_par_fkey" FOREIGN KEY ("modifie_par") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "offres_abonnements" (
    "offre_id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "nom_affichage" TEXT NOT NULL,
    "description" TEXT,
    "prix_base_ttc" REAL NOT NULL,
    "quittances_inclus" INTEGER NOT NULL DEFAULT 0,
    "prix_unite_ttc" REAL DEFAULT 0,
    "modules" JSONB,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "visible_signup" BOOLEAN NOT NULL DEFAULT true,
    "ordre_affichage" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_par" TEXT,
    "modifie_at" DATETIME,
    CONSTRAINT "offres_abonnements_modifie_par_fkey" FOREIGN KEY ("modifie_par") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "codes_promo" (
    "promo_id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type_remise" TEXT NOT NULL,
    "valeur_remise" REAL NOT NULL,
    "offre_cible" TEXT,
    "cible_profil" TEXT NOT NULL DEFAULT 'TOUS',
    "date_debut" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" DATETIME,
    "max_utilisations" INTEGER,
    "nb_utilisations" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_par" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "codes_promo_offre_cible_fkey" FOREIGN KEY ("offre_cible") REFERENCES "offres_abonnements" ("offre_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "codes_promo_created_par_fkey" FOREIGN KEY ("created_par") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tarifs_negocie" (
    "neg_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "offre_id" TEXT,
    "prix_negocie_ttc" REAL NOT NULL,
    "date_debut" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" DATETIME,
    "auto_renouveler" BOOLEAN NOT NULL DEFAULT false,
    "created_par" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT NOT NULL,
    CONSTRAINT "tarifs_negocie_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tarifs_negocie_offre_id_fkey" FOREIGN KEY ("offre_id") REFERENCES "offres_abonnements" ("offre_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tarifs_negocie_created_par_fkey" FOREIGN KEY ("created_par") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "config_tarifs_audit" (
    "audit_id" TEXT NOT NULL PRIMARY KEY,
    "table_cible" TEXT NOT NULL,
    "enregistrement_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "avant" JSONB,
    "apres" JSONB,
    "modifie_par" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "config_tarifs_audit_modifie_par_fkey" FOREIGN KEY ("modifie_par") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "locataire_profiles" (
    "profil_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "score_actuel" INTEGER NOT NULL DEFAULT 0,
    "score_badge" TEXT NOT NULL DEFAULT 'D',
    "score_calcule_at" DATETIME,
    "taux_paiement_12m" REAL NOT NULL DEFAULT 0,
    "nb_bails_actifs" INTEGER NOT NULL DEFAULT 0,
    "nb_bails_clos" INTEGER NOT NULL DEFAULT 0,
    "alerte_j3_active" BOOLEAN NOT NULL DEFAULT true,
    "alerte_j1_active" BOOLEAN NOT NULL DEFAULT true,
    "canal_alerte_pref" TEXT NOT NULL DEFAULT 'SMS',
    "passeport_genere_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "locataire_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "signalements_locataire" (
    "signal_id" TEXT NOT NULL PRIMARY KEY,
    "bail_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "urgence" TEXT NOT NULL DEFAULT 'NORMAL',
    "photos" TEXT NOT NULL DEFAULT '[]',
    "statut" TEXT NOT NULL DEFAULT 'ENVOYE',
    "proprio_vu_at" DATETIME,
    "resolu_at" DATETIME,
    "resolu_par" TEXT,
    "note_resolution" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "signalements_locataire_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "signalements_locataire_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cautions_bail" (
    "caution_id" TEXT NOT NULL PRIMARY KEY,
    "bail_id" TEXT NOT NULL,
    "montant_fcfa" REAL NOT NULL,
    "date_versement" DATETIME NOT NULL,
    "mode_versement" TEXT,
    "destination" TEXT NOT NULL DEFAULT 'PROPRIETAIRE',
    "recepissse_cdc_ci" TEXT,
    "conditions_restit" TEXT,
    "confirme_locataire" BOOLEAN NOT NULL DEFAULT false,
    "confirme_at" DATETIME,
    "certificat_ref" TEXT,
    "hash_sha256" TEXT,
    "restituee" BOOLEAN NOT NULL DEFAULT false,
    "montant_restitue" REAL,
    "date_restitution" DATETIME,
    "motif_retenue" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cautions_bail_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "preavis_bails" (
    "preavis_id" TEXT NOT NULL PRIMARY KEY,
    "bail_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "date_declaration" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_depart_prevue" DATETIME NOT NULL,
    "date_depart_effective" DATETIME,
    "motif" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EMIS',
    "proprio_accuse_at" DATETIME,
    "etat_lieux_prevu" DATETIME,
    "ref_preavis" TEXT,
    "hash_sha256" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "preavis_bails_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "preavis_bails_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "passeports_locatifs" (
    "passeport_id" TEXT NOT NULL PRIMARY KEY,
    "locataire_id" TEXT NOT NULL,
    "ref_passeport" TEXT,
    "score_global" INTEGER NOT NULL,
    "taux_paiement_global" REAL NOT NULL,
    "nb_bails_inclus" INTEGER NOT NULL,
    "periode_couverte_debut" DATETIME NOT NULL,
    "periode_couverte_fin" DATETIME NOT NULL,
    "snapshot_bails" JSONB NOT NULL,
    "hash_sha256" TEXT,
    "pdf_url" TEXT,
    "nb_consultations" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" DATETIME,
    CONSTRAINT "passeports_locatifs_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alertes_loyer" (
    "alerte_id" TEXT NOT NULL PRIMARY KEY,
    "bail_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "type_alerte" TEXT NOT NULL,
    "date_prevue" DATETIME NOT NULL,
    "envoyee" BOOLEAN NOT NULL DEFAULT false,
    "envoyee_at" DATETIME,
    "canal" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alertes_loyer_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "alertes_loyer_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "locataire_profils_publics" (
    "profil_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "visibilite" TEXT NOT NULL DEFAULT 'INVISIBLE',
    "statut_recherche" TEXT NOT NULL DEFAULT 'EN_RECHERCHE',
    "statut_pro" TEXT,
    "revenu_fourchette" TEXT,
    "employeur_type" TEXT,
    "city" TEXT,
    "communes_souhaitees" TEXT NOT NULL DEFAULT '[]',
    "budget_max_fcfa" INTEGER,
    "type_logement" TEXT NOT NULL DEFAULT '[]',
    "disponible_a_partir" DATETIME,
    "kyc_niveau" INTEGER NOT NULL DEFAULT 0,
    "nb_invitations_recues" INTEGER NOT NULL DEFAULT 0,
    "nb_invitations_refusees" INTEGER NOT NULL DEFAULT 0,
    "nb_consultations_profil" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "locataire_profils_publics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invitations_bail" (
    "invitation_id" TEXT NOT NULL PRIMARY KEY,
    "bien_id" TEXT,
    "invitant_id" TEXT NOT NULL,
    "invitant_type" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "methode_decouverte" TEXT,
    "loyer_propose" REAL,
    "date_debut_proposee" DATETIME,
    "message_invitant" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ENVOYEE',
    "vue_at" DATETIME,
    "repondu_at" DATETIME,
    "bail_id" TEXT,
    "expire_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invitations_bail_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "properties" ("property_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "invitations_bail_invitant_id_fkey" FOREIGN KEY ("invitant_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invitations_bail_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "consultations_profil" (
    "consult_id" TEXT NOT NULL PRIMARY KEY,
    "locataire_id" TEXT NOT NULL,
    "consultant_id" TEXT NOT NULL,
    "consultant_type" TEXT NOT NULL,
    "consultant_nom_affiche" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "consultations_profil_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "locataire_profils_publics" ("profil_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "consultations_profil_consultant_id_fkey" FOREIGN KEY ("consultant_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rapports_mensuels" (
    "rapport_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "periode_mois" INTEGER NOT NULL,
    "periode_annee" INTEGER NOT NULL,
    "type_rapport" TEXT NOT NULL DEFAULT 'MENSUEL',
    "data_rapport" JSONB NOT NULL,
    "pdf_url" TEXT,
    "envoye_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "envoye_email" BOOLEAN NOT NULL DEFAULT false,
    "envoye_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rapports_mensuels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "champions_profiles" (
    "champion_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "zone_principale" TEXT NOT NULL,
    "zones_secondaires" TEXT NOT NULL DEFAULT '[]',
    "superviseur_id" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "date_debut" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "objectif_mensuel" INTEGER NOT NULL DEFAULT 30,
    "total_inscriptions" INTEGER NOT NULL DEFAULT 0,
    "total_commissions_fcfa" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "champions_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "champions_profiles_superviseur_id_fkey" FOREIGN KEY ("superviseur_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "champions_prospects" (
    "prospect_id" TEXT NOT NULL PRIMARY KEY,
    "champion_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "quartier" TEXT,
    "nb_logements_estime" TEXT,
    "argument_cle" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'A_RAPPELER',
    "date_dernier_contact" DATETIME,
    "date_rappel_prevu" DATETIME,
    "note" TEXT,
    "user_id_inscrit" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "champions_prospects_champion_id_fkey" FOREIGN KEY ("champion_id") REFERENCES "champions_profiles" ("champion_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "champions_prospects_user_id_inscrit_fkey" FOREIGN KEY ("user_id_inscrit") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "champions_commissions" (
    "commission_id" TEXT NOT NULL PRIMARY KEY,
    "champion_id" TEXT NOT NULL,
    "type_action" TEXT NOT NULL,
    "reference_id" TEXT,
    "montant_fcfa" REAL NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "valide_at" DATETIME,
    "paye_at" DATETIME,
    "mode_paiement" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "champions_commissions_champion_id_fkey" FOREIGN KEY ("champion_id") REFERENCES "champions_profiles" ("champion_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wallet_recharge_links" (
    "link_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "declencheur" TEXT NOT NULL,
    "operateur" TEXT NOT NULL,
    "montant_suggere" REAL NOT NULL,
    "solde_au_moment" REAL NOT NULL,
    "nb_bails_actifs" INTEGER NOT NULL,
    "url_generee" TEXT NOT NULL,
    "canal_envoi" TEXT NOT NULL,
    "message_envoye" TEXT,
    "clique" BOOLEAN NOT NULL DEFAULT false,
    "clique_at" DATETIME,
    "recharge_effectuee" BOOLEAN NOT NULL DEFAULT false,
    "recharge_at" DATETIME,
    "montant_recharge" REAL,
    "webhook_ref" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" DATETIME NOT NULL,
    CONSTRAINT "wallet_recharge_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wallet_recharge_configs" (
    "config_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "rappel_actif" BOOLEAN NOT NULL DEFAULT false,
    "jour_du_mois" INTEGER NOT NULL DEFAULT 1,
    "montant_fixe" REAL,
    "operateur_prefere" TEXT NOT NULL DEFAULT 'WAVE',
    "canal_prefere" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "dernier_rappel_at" DATETIME,
    "nb_rappels_envoyes" INTEGER NOT NULL DEFAULT 0,
    "nb_rechargements" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "wallet_recharge_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messagerie_bail" (
    "msg_id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "expediteur_id" TEXT NOT NULL,
    "role_expediteur" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "pj_url" TEXT,
    "pj_hash_sha256" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ENVOY├ë',
    "date_envoi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_reception" DATETIME,
    "date_lecture" DATETIME,
    CONSTRAINT "messagerie_bail_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "messagerie_bail_expediteur_id_fkey" FOREIGN KEY ("expediteur_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "annonces_voisinage" (
    "annonce_id" TEXT NOT NULL PRIMARY KEY,
    "proprio_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "type_annonce" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_publication" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_expiration" DATETIME,
    "epingle" BOOLEAN NOT NULL DEFAULT false,
    "destinataires" TEXT NOT NULL DEFAULT 'TOUS',
    "photo_url" TEXT,
    "photo_hash_sha256" TEXT,
    CONSTRAINT "annonces_voisinage_proprio_id_fkey" FOREIGN KEY ("proprio_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "annonces_voisinage_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties" ("property_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "factures_utilities" (
    "facture_id" TEXT NOT NULL PRIMARY KEY,
    "lease_id" TEXT NOT NULL,
    "acteur_id" TEXT NOT NULL,
    "role_acteur" TEXT NOT NULL,
    "type_utility" TEXT NOT NULL,
    "identifiant_compteur" TEXT NOT NULL,
    "mois_facture" DATETIME NOT NULL,
    "montant_total" REAL NOT NULL,
    "date_limite_paiement" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "source" TEXT NOT NULL DEFAULT 'SAISIE_MANUELLE',
    "mode_utilities" TEXT NOT NULL,
    "date_paiement" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "factures_utilities_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "factures_utilities_acteur_id_fkey" FOREIGN KEY ("acteur_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "repartitions_utilities" (
    "repart_id" TEXT NOT NULL PRIMARY KEY,
    "facture_id" TEXT NOT NULL,
    "lease_locataire_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "montant_quote_part" REAL NOT NULL,
    "modele_applique" TEXT NOT NULL,
    "statut_paiement" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "date_notification" DATETIME,
    "date_paiement" DATETIME,
    "mode_paiement" TEXT,
    "nb_relances" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "repartitions_utilities_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures_utilities" ("facture_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "repartitions_utilities_lease_locataire_id_fkey" FOREIGN KEY ("lease_locataire_id") REFERENCES "leases" ("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "repartitions_utilities_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CoopMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CoopMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "coop_groups" ("coop_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CoopMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
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
CREATE UNIQUE INDEX "leases_lease_reference_key" ON "leases"("lease_reference");

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
CREATE UNIQUE INDEX "rapports_mensuels_user_id_periode_mois_periode_annee_type_rapport_key" ON "rapports_mensuels"("user_id", "periode_mois", "periode_annee", "type_rapport");

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
CREATE UNIQUE INDEX "_CoopMembers_AB_unique" ON "_CoopMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_CoopMembers_B_index" ON "_CoopMembers"("B");

