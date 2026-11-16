-- ==============================================================================
-- QAPRIL — Migration ADD-28 : Bail Déclaré par le Locataire & Adossement Différé
-- Règles RG-DCL-01 à RG-DCL-38
-- ==============================================================================

-- 1. Énumérations ADD-28
DO $$ BEGIN
    CREATE TYPE "DeclarationStatut" AS ENUM ('EN_ATTENTE', 'CONFIRMEE', 'REFUSEE', 'REORIENTEE', 'EXPIREE', 'ANNULEE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BailOrigine" AS ENUM ('QAPRIL', 'PAPIER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AdossementStatut" AS ENUM ('NON_ADOSSE', 'PROPOSE', 'CONFIRME', 'EN_CONFLIT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BienConfirmation" AS ENUM ('PROVISOIRE', 'CONFIRME');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Table declarations_bail
CREATE TABLE IF NOT EXISTS "declarations_bail" (
    "declaration_id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "initiateur_id" TEXT NOT NULL,
    "initiateur_role" VARCHAR(20) NOT NULL,
    "locataire_id" TEXT,
    "destinataire_tel" VARCHAR(20) NOT NULL,
    "destinataire_id" TEXT,
    "designation_declaree" JSONB NOT NULL,
    "loyer_declare" DOUBLE PRECISION NOT NULL,
    "bail_papier_existe" BOOLEAN NOT NULL DEFAULT false,
    "statut" "DeclarationStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "reponse_at" TIMESTAMPTZ,
    "reoriente_vers_tel" VARCHAR(20),
    "nb_relances" INTEGER NOT NULL DEFAULT 0,
    "canal_reponse" VARCHAR(20),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),

    CONSTRAINT "declarations_bail_pkey" PRIMARY KEY ("declaration_id"),
    CONSTRAINT "declarations_bail_initiateur_fkey" FOREIGN KEY ("initiateur_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "declarations_bail_destinataire_fkey" FOREIGN KEY ("destinataire_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "declarations_bail_locataire_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_decl_dest_tel" ON "declarations_bail"("destinataire_tel", "statut");
CREATE INDEX IF NOT EXISTS "idx_decl_initiateur" ON "declarations_bail"("initiateur_id", "statut");

-- 3. Évolution de la table leases
ALTER TABLE "leases"
  ALTER COLUMN "property_id" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "origine" "BailOrigine" NOT NULL DEFAULT 'QAPRIL',
  ADD COLUMN IF NOT EXISTS "declaration_id" TEXT,
  ADD COLUMN IF NOT EXISTS "designation_declaree" JSONB,
  ADD COLUMN IF NOT EXISTS "adossement_statut" "AdossementStatut" NOT NULL DEFAULT 'CONFIRME',
  ADD COLUMN IF NOT EXISTS "bien_provisoire_id" TEXT,
  ADD COLUMN IF NOT EXISTS "adosse_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "converti_depuis_id" TEXT;

DO $$ BEGIN
    ALTER TABLE "leases" ADD CONSTRAINT "leases_declaration_id_fkey" FOREIGN KEY ("declaration_id") REFERENCES "declarations_bail"("declaration_id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Table fiches_bail
CREATE TABLE IF NOT EXISTS "fiches_bail" (
    "fiche_id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "lease_id" TEXT NOT NULL,
    "fichier_url" TEXT NOT NULL,
    "fichier_sha256" VARCHAR(64) NOT NULL,
    "nb_pages" INTEGER,
    "date_signature_papier" TIMESTAMPTZ,
    "mentions" JSONB NOT NULL,
    "saisie_par_id" TEXT NOT NULL,
    "saisie_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmee_par_id" TEXT,
    "confirmee_at" TIMESTAMPTZ,
    "empreinte_fiche" VARCHAR(64),
    "ecarts_legaux" JSONB,

    CONSTRAINT "fiches_bail_pkey" PRIMARY KEY ("fiche_id"),
    CONSTRAINT "fiches_bail_lease_id_key" UNIQUE ("lease_id"),
    CONSTRAINT "fiches_bail_lease_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fiches_bail_saisie_par_fkey" FOREIGN KEY ("saisie_par_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fiches_bail_confirmee_par_fkey" FOREIGN KEY ("confirmee_par_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 5. Évolution de la table properties
ALTER TABLE "properties"
  ADD COLUMN IF NOT EXISTS "confirmation" "BienConfirmation" NOT NULL DEFAULT 'CONFIRME',
  ADD COLUMN IF NOT EXISTS "genere_depuis_bail_id" TEXT,
  ADD COLUMN IF NOT EXISTS "confirme_at" TIMESTAMPTZ;

-- 6. Évolution de la table receipts
ALTER TABLE "receipts"
  ADD COLUMN IF NOT EXISTS "valeur_probante_active" BOOLEAN NOT NULL DEFAULT true;

-- 7. Table relances_adossement
CREATE TABLE IF NOT EXISTS "relances_adossement" (
    "relance_id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "lease_id" TEXT NOT NULL,
    "bailleur_id" TEXT NOT NULL,
    "palier" VARCHAR(10) NOT NULL,
    "canal" VARCHAR(20) NOT NULL,
    "envoyee_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cliquee_at" TIMESTAMPTZ,
    "reponse" VARCHAR(20),

    CONSTRAINT "relances_adossement_pkey" PRIMARY KEY ("relance_id"),
    CONSTRAINT "relances_adossement_lease_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "relances_adossement_bailleur_fkey" FOREIGN KEY ("bailleur_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_relances_bailleur" ON "relances_adossement"("bailleur_id", "envoyee_at" DESC);
