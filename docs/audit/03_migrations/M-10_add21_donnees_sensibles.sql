-- M-10 — ADD-21 : le bailleur voit une tranche, jamais le score, le revenu ni les pièces   [P1 — 28/11]
BEGIN;
ALTER TABLE candidatures ADD COLUMN IF NOT EXISTS tranche_confiance char(1) CHECK (tranche_confiance IN ('A','B','C','D'));
-- Les données de scoring restent dans locataire_profiles (chiffrées côté application), jamais dans l'objet lu par le bailleur.
ALTER TABLE candidatures DROP COLUMN IF EXISTS revenu_mensuel;
ALTER TABLE candidatures DROP COLUMN IF EXISTS score_qapril;
ALTER TABLE candidatures DROP COLUMN IF EXISTS taux_effort;
ALTER TABLE candidatures DROP COLUMN IF EXISTS docs_jsonb;
ALTER TABLE users DROP COLUMN IF EXISTS salary;
COMMIT;
