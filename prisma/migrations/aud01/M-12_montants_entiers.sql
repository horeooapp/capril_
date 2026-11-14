-- M-12 — Montants FCFA en entiers   [P1 — 28/11]
BEGIN;
ALTER TABLE declarations_paiement ALTER COLUMN montant TYPE integer USING round(montant)::integer;
ALTER TABLE cnv_messages          ALTER COLUMN cout    TYPE integer USING round(cout)::integer;
-- Étendre à toute colonne monétaire en double precision : SELECT table_name, column_name FROM information_schema.columns WHERE data_type='double precision' AND column_name ~ '(montant|prix|amount|cout|solde|commission|frais)';
COMMIT;
