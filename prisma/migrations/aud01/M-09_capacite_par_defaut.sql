-- M-09 — Plus de « PROPRIETAIRE » par défaut à l'inscription   [P1 — 28/11]
BEGIN;
ALTER TABLE users ALTER COLUMN capacite_active DROP DEFAULT;
UPDATE users u SET capacite_active = NULL
 WHERE capacite_active = 'PROPRIETAIRE'
   AND NOT EXISTS (SELECT 1 FROM properties p WHERE p.owner_id = u.user_id)
   AND NOT EXISTS (SELECT 1 FROM user_capacites c WHERE c.user_id = u.user_id AND c.capacite = 'PROPRIETAIRE');
COMMIT;
-- Le rôle actif est choisi à l'écran (Locataire / Bailleur / Agence) et vient de user_capacites.
