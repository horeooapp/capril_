-- M-06 — Annonce publiable par un bailleur ou une agence ; champs de la fiche détaillée   [P0 — 17/11]
BEGIN;
ALTER TABLE annonces RENAME COLUMN agence_id TO publie_par_id;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS publie_par_role text NOT NULL DEFAULT 'AGENCE';
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS mandat_gestion_id uuid REFERENCES mandats_gestion(mandat_id);
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS loyer_mensuel integer;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS charges_mensuelles integer NOT NULL DEFAULT 0;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS depot_garantie_mois integer NOT NULL DEFAULT 0;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS avance_loyer_mois integer NOT NULL DEFAULT 0;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS negociable boolean NOT NULL DEFAULT false;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS disponible_le date;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS description_longue text;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS publiee_at timestamptz;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS expire_at timestamptz;
-- Reprise : le loyer est copié depuis le bien pour les annonces existantes.
UPDATE annonces a SET loyer_mensuel = p.rent_amount FROM properties p WHERE p.property_id = a.property_id AND a.loyer_mensuel IS NULL;
ALTER TABLE annonces ALTER COLUMN loyer_mensuel SET NOT NULL;
-- Règles légales (art. 415-416-420) et cohérence mandat.
ALTER TABLE annonces ADD CONSTRAINT ck_annonce_depot_max  CHECK (depot_garantie_mois BETWEEN 0 AND 2);
ALTER TABLE annonces ADD CONSTRAINT ck_annonce_avance_max CHECK (avance_loyer_mois  BETWEEN 0 AND 2);
ALTER TABLE annonces ADD CONSTRAINT ck_annonce_agence_mandat
  CHECK (publie_par_role <> 'AGENCE' OR mandat_gestion_id IS NOT NULL);
ALTER TABLE annonces ALTER COLUMN publie_par_role DROP DEFAULT;
COMMIT;
-- Rappel API : la projection « annonce publique » n'inclut jamais address, gps_*, owner_id (RG-CONF).
