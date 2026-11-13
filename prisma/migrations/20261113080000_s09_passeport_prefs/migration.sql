-- S-09 : Interrupteurs du Passeport Locatif persistés
-- Ajoute 4 colonnes Boolean sur locataire_profiles pour mémoriser
-- les préférences de visibilité de l'écran "Mon Passeport Locatif"

ALTER TABLE "locataire_profiles"
  ADD COLUMN IF NOT EXISTS "share_tranche"    BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "share_badges"     BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "share_foyer"      BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "share_duree_bail" BOOLEAN NOT NULL DEFAULT true;

