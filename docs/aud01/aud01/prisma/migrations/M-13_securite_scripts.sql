-- M-13 — Retrait de l'exécution de scripts stockés en base   [P0 — 17/11]
BEGIN;
ALTER TABLE automation_settings DROP COLUMN IF EXISTS custom_scripts;
COMMIT;
-- Côté code : supprimer tout eval / new Function / vm.runInContext alimenté par la base.
