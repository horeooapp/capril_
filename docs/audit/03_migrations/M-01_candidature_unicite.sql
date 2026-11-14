-- M-01 — Une seule candidature vivante par (candidat, annonce) [P0 — 17/11]
BEGIN;

-- 1. Relier les candidatures orphelines à l'annonce correspondant à leur logement
UPDATE candidatures c
SET annonce_id = a.annonce_id
FROM annonces a
WHERE c.logement_id = a.logement_id AND c.annonce_id IS NULL;

-- 2. Pour tout couple (candidat_id, annonce_id) ayant plusieurs candidatures,
-- conserver uniquement la plus récente (ou RETENUE) et passer les autres en RETIREE
WITH classees AS (
  SELECT cand_id,
         ROW_NUMBER() OVER (
           PARTITION BY candidat_id, annonce_id
           ORDER BY CASE statut WHEN 'RETENUE' THEN 1 WHEN 'ENVOYEE' THEN 2 ELSE 3 END, created_at DESC
         ) AS rn
  FROM candidatures
  WHERE candidat_id IS NOT NULL AND annonce_id IS NOT NULL
    AND statut NOT IN ('RETIREE','EXPIREE')
)
UPDATE candidatures c SET statut = 'RETIREE', retiree_at = now()
FROM classees x WHERE c.cand_id = x.cand_id AND x.rn > 1;

-- 3. Rendre obligatoire candidat_id et annonce_id
ALTER TABLE candidatures ALTER COLUMN candidat_id SET NOT NULL;
ALTER TABLE candidatures ALTER COLUMN annonce_id  SET NOT NULL;

-- 4. Poser l'index unique partiel
CREATE UNIQUE INDEX IF NOT EXISTS ux_candidature_vivante
  ON candidatures (candidat_id, annonce_id)
  WHERE statut NOT IN ('RETIREE','EXPIREE');

COMMIT;
