-- S-14 : Confirmation idempotente des paiements déclarés
-- Ajoute une clé d'idempotence unique sur declarations_paiement
-- Format : {bail_id}-{mois}-{locataire_id} pour garantir 1 seule déclaration par mois par bail

ALTER TABLE "declarations_paiement"
  ADD COLUMN IF NOT EXISTS "idempotency_key" TEXT;

-- Index unique partiel : une seule déclaration non-contestée par (bail, mois)
-- Permet plusieurs CONTESTE mais un seul DECLARE ou CONFIRME
CREATE UNIQUE INDEX IF NOT EXISTS "declarations_paiement_idempotency_key_key"
  ON "declarations_paiement"("idempotency_key")
  WHERE "idempotency_key" IS NOT NULL;

