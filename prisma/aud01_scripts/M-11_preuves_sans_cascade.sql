-- M-11 — Les preuves survivent au bail (attestations, occupants, déclarations, transmissions)   [P1 — 28/11]
-- Les noms de contraintes sont ceux générés par Prisma : vérifier avec \d <table> avant exécution.
BEGIN;
ALTER TABLE occupants               DROP CONSTRAINT IF EXISTS occupants_bail_id_fkey,
  ADD CONSTRAINT occupants_bail_id_fkey FOREIGN KEY (bail_id) REFERENCES leases(lease_id) ON DELETE RESTRICT;
ALTER TABLE attestations_residence  DROP CONSTRAINT IF EXISTS attestations_residence_bail_id_fkey,
  ADD CONSTRAINT attestations_residence_bail_id_fkey FOREIGN KEY (bail_id) REFERENCES leases(lease_id) ON DELETE RESTRICT;
ALTER TABLE declarations_paiement   DROP CONSTRAINT IF EXISTS declarations_paiement_bail_id_fkey,
  ADD CONSTRAINT declarations_paiement_bail_id_fkey FOREIGN KEY (bail_id) REFERENCES leases(lease_id) ON DELETE RESTRICT;
ALTER TABLE transmissions_adressage DROP CONSTRAINT IF EXISTS transmissions_adressage_lease_id_fkey,
  ADD CONSTRAINT transmissions_adressage_lease_id_fkey FOREIGN KEY (lease_id) REFERENCES leases(lease_id) ON DELETE RESTRICT;
COMMIT;
-- Règle d'application : un bail ne se supprime pas ; il passe à ARCHIVED (soft delete).
