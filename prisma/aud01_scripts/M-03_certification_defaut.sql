-- M-03 — Plus de « certifié » par défaut   [P0 — 17/11]
BEGIN;
ALTER TABLE leases   ADD COLUMN IF NOT EXISTS certifie_at timestamptz;
-- Tout bail non actif ou sans signature des deux parties redevient NON_CERTIFIE.
UPDATE leases SET niveau_certification = 'NON_CERTIFIE'
 WHERE status IN ('DRAFT','PENDING_SIGNATURE','PENDING_CONFIRMATION','CANCELLED')
    OR sha256_hash IS NULL;
UPDATE leases SET certifie_at = COALESCE(certifie_at, updated_at) WHERE niveau_certification <> 'NON_CERTIFIE';
ALTER TABLE leases   ALTER COLUMN niveau_certification SET DEFAULT 'NON_CERTIFIE';
UPDATE receipts SET niveau_certification = 'NON_CERTIFIE' WHERE receipt_hash IS NULL;
ALTER TABLE receipts ALTER COLUMN niveau_certification SET DEFAULT 'NON_CERTIFIE';
COMMIT;
-- Test : créer un bail DRAFT → niveau_certification = NON_CERTIFIE ; passage à CERTIFIE uniquement par le service de certification, qui renseigne certifie_at.
