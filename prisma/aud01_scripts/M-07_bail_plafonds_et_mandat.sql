-- M-07 — Plafonds légaux dépôt/avance ; un mandat actif par bien ; masquage forcé   [P1 — 28/11]
BEGIN;
-- Plafonds (loi 2019-576, CCH art. 415-416-420) : 2 mois maximum.
ALTER TABLE leases ADD CONSTRAINT ck_lease_depot_max  CHECK (deposit_amount <= 2 * rent_amount);
ALTER TABLE leases ADD CONSTRAINT ck_lease_avance_max CHECK (avance_loyer   <= 2 * rent_amount);

-- Un seul mandat actif par bien.
CREATE OR REPLACE VIEW v_mandats_actifs_biens AS
  SELECT mgb.property_id, mg.mandat_id
  FROM mandats_gestion_biens mgb JOIN mandats_gestion mg ON mg.mandat_id = mgb.mandat_id
  WHERE mg.statut = 'ACTIF' AND (mg.date_fin IS NULL OR mg.date_fin > now());
CREATE OR REPLACE FUNCTION f_un_mandat_actif_par_bien() RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM v_mandats_actifs_biens WHERE property_id = NEW.property_id) > 1 THEN
    RAISE EXCEPTION 'MANDAT_ACTIF_EXISTANT pour le bien %', NEW.property_id USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_un_mandat_actif ON mandats_gestion_biens;
CREATE CONSTRAINT TRIGGER trg_un_mandat_actif AFTER INSERT OR UPDATE ON mandats_gestion_biens
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION f_un_mandat_actif_par_bien();

-- RG-MAN-02 : bail sous mandat ⇒ bailleur masqué, sans exception.
CREATE OR REPLACE FUNCTION f_masquage_sous_mandat() RETURNS trigger AS $$
BEGIN
  IF NEW.mandat_gestion_id IS NOT NULL THEN NEW.bailleur_masque := true; END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_masquage_sous_mandat ON leases;
CREATE TRIGGER trg_masquage_sous_mandat BEFORE INSERT OR UPDATE OF mandat_gestion_id, bailleur_masque ON leases
  FOR EACH ROW EXECUTE FUNCTION f_masquage_sous_mandat();
UPDATE leases SET bailleur_masque = true WHERE mandat_gestion_id IS NOT NULL AND bailleur_masque = false;
COMMIT;
