-- S-08 : Référentiel des lieux — quartier normalisé sur les biens (ajout non destructif)
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "quartier" TEXT;
CREATE INDEX IF NOT EXISTS "properties_commune_quartier_idx" ON "properties" ("commune", "quartier");

