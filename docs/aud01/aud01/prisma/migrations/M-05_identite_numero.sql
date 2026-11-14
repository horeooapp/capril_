-- M-05 — Numéro d'abord   [P1 — 28/11]
BEGIN;
-- Comptes sans téléphone : à régulariser (export + relance) avant NOT NULL.
--   SELECT user_id, email FROM users WHERE phone IS NULL;
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verifie_at timestamptz;
-- Email : plus d'unicité absolue, unicité seulement pour un email vérifié.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
DROP INDEX IF EXISTS users_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email_verifie ON users (lower(email)) WHERE email_verifie_at IS NOT NULL;
COMMIT;
