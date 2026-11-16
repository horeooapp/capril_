-- M-02 — Suppression de l'OTP de signature en clair   [P0 — 17/11]
BEGIN;
ALTER TABLE leases DROP COLUMN IF EXISTS signing_otp;
COMMIT;
-- Vérifier côté code : aucun log, aucune réponse API ne porte l'OTP ; seul le hash est comparé.
