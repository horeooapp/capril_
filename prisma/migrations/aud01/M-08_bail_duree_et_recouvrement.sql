-- M-08 — Durée indéterminée autorisée ; recouvrement sur un axe séparé   [P1 — 28/11]
BEGIN;
ALTER TABLE leases ALTER COLUMN duration_months DROP NOT NULL;
CREATE TYPE "RecouvrementStatut" AS ENUM ('A_JOUR','RETARD','IMPAYE','MISE_EN_DEMEURE','PLAN_APUREMENT','CLEMENCE','PROCEDURE');
ALTER TABLE leases ADD COLUMN IF NOT EXISTS statut_recouvrement "RecouvrementStatut" NOT NULL DEFAULT 'A_JOUR';
-- Reprise des états mélangés.
UPDATE leases SET statut_recouvrement = 'IMPAYE',          status = 'ACTIVE' WHERE status = 'LOYER_IMPAYE';
UPDATE leases SET statut_recouvrement = 'MISE_EN_DEMEURE', status = 'ACTIVE' WHERE status = 'MISE_EN_DEMEURE';
UPDATE leases SET statut_recouvrement = 'CLEMENCE',        status = 'ACTIVE' WHERE status = 'CLEMENCE_EN_COURS';
UPDATE leases SET statut_recouvrement = 'PROCEDURE',       status = 'ACTIVE' WHERE status = 'REPRISE_PROCEDURE';
-- Retrait des valeurs de l'enum LeaseStatus : Postgres ne supprime pas une valeur d'enum ;
-- recréer le type (ALTER TYPE ... RENAME TO old ; CREATE TYPE ... ; ALTER COLUMN ... USING status::text::"LeaseStatus" ; DROP TYPE old).
COMMIT;
