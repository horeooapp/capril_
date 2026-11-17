-- Migration : Champs de localisation étendue et cache de géocodage inverse (S-08 / ADD-28)

-- 1. Ajout des colonnes sur properties
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "ville" TEXT;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "quartier_source" TEXT;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "quartier_manuel" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "localisation_mise_a_jour_le" TIMESTAMP(3);

-- Synchronisation initiale : copier gps_latitude / gps_longitude et city vers latitude / longitude et ville si vides
UPDATE "properties" SET 
    "latitude" = COALESCE("latitude", "gps_latitude"),
    "longitude" = COALESCE("longitude", "gps_longitude"),
    "ville" = COALESCE("ville", "city", 'Abidjan')
WHERE "latitude" IS NULL OR "longitude" IS NULL OR "ville" IS NULL;

-- 2. Index composite sur (ville, commune, quartier)
CREATE INDEX IF NOT EXISTS "properties_ville_commune_quartier_idx" ON "properties"("ville", "commune", "quartier");

-- 3. Table de cache de géocodage inverse
CREATE TABLE IF NOT EXISTS "reverse_geocode_cache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coord_key" TEXT NOT NULL,
    "lat_rounded" DOUBLE PRECISION NOT NULL,
    "lng_rounded" DOUBLE PRECISION NOT NULL,
    "quartier" TEXT,
    "commune" TEXT,
    "ville" TEXT,
    "source" TEXT NOT NULL,
    "precision" TEXT NOT NULL,
    "raw" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "reverse_geocode_cache_coord_key_key" ON "reverse_geocode_cache"("coord_key");
CREATE INDEX IF NOT EXISTS "reverse_geocode_cache_expires_at_idx" ON "reverse_geocode_cache"("expires_at");
