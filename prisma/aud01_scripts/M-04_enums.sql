-- M-04 — Statuts en texte libre → types énumérés   [P0 partiel 17/11 ; complet 28/11]
-- Ordre P0 : candidatures.statut, annonces.statut, properties.statut_position.
-- Ordre P1 : le reste. Même recette pour chaque colonne :
--   a) créer le type ; b) normaliser les valeurs ; c) convertir ; d) poser le défaut.
BEGIN;

CREATE TYPE "CandidatureStatut" AS ENUM ('ENVOYEE','VUE','VISITE_PROPOSEE','RETENUE','NON_RETENUE','RETIREE','EXPIREE');
UPDATE candidatures SET statut = upper(trim(statut));
-- Toute valeur hors domaine est listée AVANT conversion :
--   SELECT DISTINCT statut FROM candidatures WHERE statut NOT IN ('ENVOYEE','VUE','VISITE_PROPOSEE','RETENUE','NON_RETENUE','RETIREE','EXPIREE');
ALTER TABLE candidatures ALTER COLUMN statut DROP DEFAULT;
ALTER TABLE candidatures ALTER COLUMN statut TYPE "CandidatureStatut" USING statut::"CandidatureStatut";
ALTER TABLE candidatures ALTER COLUMN statut SET DEFAULT 'ENVOYEE';

CREATE TYPE "AnnonceStatut" AS ENUM ('BROUILLON','PUBLIEE','SUSPENDUE','LOUEE','EXPIREE','RETIREE');
UPDATE annonces SET statut = CASE upper(trim(statut))
  WHEN 'ACTIVE' THEN 'PUBLIEE' WHEN 'PUBLISHED' THEN 'PUBLIEE' WHEN 'DRAFT' THEN 'BROUILLON'
  WHEN 'CLOSED' THEN 'LOUEE'   WHEN 'ARCHIVED' THEN 'RETIREE'  ELSE upper(trim(statut)) END;
ALTER TABLE annonces ALTER COLUMN statut DROP DEFAULT;
ALTER TABLE annonces ALTER COLUMN statut TYPE "AnnonceStatut" USING statut::"AnnonceStatut";
ALTER TABLE annonces ALTER COLUMN statut SET DEFAULT 'BROUILLON';

CREATE TYPE "StatutPosition" AS ENUM ('MANQUANTE','PROVISOIRE','CONFIRMEE','GELEE');
UPDATE properties SET statut_position = upper(trim(statut_position));
ALTER TABLE properties ALTER COLUMN statut_position DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN statut_position TYPE "StatutPosition" USING statut_position::"StatutPosition";
ALTER TABLE properties ALTER COLUMN statut_position SET DEFAULT 'MANQUANTE';

COMMIT;

-- P1 (28/11), même recette : properties.status → PropertyStatus ; receipts.status → ReceiptStatus ;
-- users.kyc_status → KycStatus ; mandats_gestion.statut → MandatStatut ; occupants.lien/statut/niveau ;
-- attestations_residence.statut/niveau ; adresses_maposte.statut → MaPosteStatut ;
-- captures_position.resultat/motif_refus ; leases.niveau_certification → NiveauCertification ;
-- legal_entities.status ; identity_documents.status ; cnv_conversations.etat.
