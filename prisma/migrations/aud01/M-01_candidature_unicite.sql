-- M-01 — Une seule candidature vivante par (candidat, annonce)   [P0 — 17/11]
-- Corrige REV-V2 « candidature répétable ». Erreur API attendue : 409 CANDIDATURE_EXISTANTE.
BEGIN;

-- 1. Purger les doublons existants : on garde la plus récente par couple.
WITH classees AS (
  SELECT cand_id,
         ROW_NUMBER() OVER (PARTITION BY candidat_id, annonce_id ORDER BY created_at DESC) AS rn
  FROM candidatures
  WHERE candidat_id IS NOT NULL AND annonce_id IS NOT NULL
    AND statut NOT IN ('RETIREE','EXPIREE')
)
UPDATE candidatures c SET statut = 'RETIREE', retiree_at = now()
FROM classees x WHERE c.cand_id = x.cand_id AND x.rn > 1;

-- 2. Candidat et annonce deviennent obligatoires (les lignes orphelines sont archivées avant).
UPDATE candidatures SET statut = 'EXPIREE', expiree_at = now()
 WHERE candidat_id IS NULL OR annonce_id IS NULL;
-- NB : si des lignes NULL subsistent, les rattacher manuellement avant d'exécuter la suite.
ALTER TABLE candidatures ALTER COLUMN candidat_id SET NOT NULL;
ALTER TABLE candidatures ALTER COLUMN annonce_id  SET NOT NULL;

-- 3. Index unique partiel.
CREATE UNIQUE INDEX IF NOT EXISTS ux_candidature_vivante
  ON candidatures (candidat_id, annonce_id)
  WHERE statut NOT IN ('RETIREE','EXPIREE');

COMMIT;

-- Test de recette : INSERT d'une 2e candidature ENVOYEE sur le même couple → erreur 23505.
