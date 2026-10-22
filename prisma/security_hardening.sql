-- =============================================================================
-- security_hardening.sql — à passer APRÈS la migration Prisma du schéma durci
-- (ex: prisma migrate dev --create-only, puis coller ce fichier dans la migration)
-- =============================================================================

-- 1) Contraintes CHECK (Prisma ne sait pas les exprimer) ----------------------
ALTER TABLE users                ADD CONSTRAINT chk_users_failed_logins   CHECK (failed_login_attempts >= 0);
ALTER TABLE user_wallet_configs  ADD CONSTRAINT chk_wallet_balance_pos    CHECK (wallet_balance >= 0);
ALTER TABLE wallet_transactions  ADD CONSTRAINT chk_wallet_tx_amount      CHECK (amount <> 0);
ALTER TABLE payments_pgw         ADD CONSTRAINT chk_pgw_montant_pos       CHECK (montant > 0);
ALTER TABLE payment_intents      ADD CONSTRAINT chk_intent_amount_pos     CHECK (amount > 0);
ALTER TABLE reversal_transactions ADD CONSTRAINT chk_reversal_amount_pos  CHECK (amount > 0);
ALTER TABLE leases               ADD CONSTRAINT chk_lease_rent_pos        CHECK (rent_amount >= 0 AND charges_amount >= 0 AND deposit_amount >= 0);
ALTER TABLE leases               ADD CONSTRAINT chk_lease_payment_day     CHECK (payment_day BETWEEN 1 AND 31);
ALTER TABLE commission_configs   ADD CONSTRAINT chk_comm_rate            CHECK ("tauxPourcent" >= 0 AND "tauxPourcent" <= 100);
ALTER TABLE float_pools          ADD CONSTRAINT chk_float_solde           CHECK (solde_disponible >= 0 AND solde_disponible <= solde_total);

-- 2) Journaux append-only (audit, vie privée, tarifs) -------------------------
-- UPDATE autorisé uniquement sur user_id (ex: FK SET NULL à l'anonymisation RGPD).
CREATE OR REPLACE FUNCTION forbid_log_mutation() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (to_jsonb(NEW) - 'user_id') = (to_jsonb(OLD) - 'user_id') THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Table % is append-only (% refusé)', TG_TABLE_NAME, TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_log_immutable ON audit_log;
CREATE TRIGGER audit_log_immutable          BEFORE UPDATE OR DELETE ON audit_log          FOR EACH ROW EXECUTE FUNCTION forbid_log_mutation();

DROP TRIGGER IF EXISTS privacy_event_logs_immutable ON privacy_event_logs;
CREATE TRIGGER privacy_event_logs_immutable BEFORE UPDATE OR DELETE ON privacy_event_logs FOR EACH ROW EXECUTE FUNCTION forbid_log_mutation();

DROP TRIGGER IF EXISTS config_tarifs_audit_immutable ON config_tarifs_audit;
CREATE TRIGGER config_tarifs_audit_immutable BEFORE UPDATE OR DELETE ON config_tarifs_audit FOR EACH ROW EXECUTE FUNCTION forbid_log_mutation();

-- 3) Migration des secrets existants (À FAIRE côté application, pas en SQL) ----
--  * agence_api_accesses.api_key_hash / api_secret_hash, data_license_contracts.api_key_client_hash :
--    les anciennes valeurs en clair doivent être hachées (SHA-256) puis les clés RÉGÉNÉRÉES et
--    communiquées aux clients, car les clés d'origine sont à considérer comme compromises.
--  * leases.signing_otp_hash, signatures_electroniques.otp_hash, email_verification_tokens.token_hash,
--    migration_sessions.validation_token_hash : invalider les valeurs existantes (OTP/tokens à courte durée).
--  * *_enc (doc_number, mrz_raw_data, bank_account, iban, justificatif_numero, tax_id) :
--    chiffrer les données existantes (AES-256-GCM, clé dans un KMS) via un script de backfill.
--  * bien_acces.role : convertir les valeurs Role -> BienRole avant le changement de type, par ex.
--      LANDLORD/LANDLORD_PRO -> OWNER, AGENCY -> AGENCE, NON_CERTIFIED_AGENT -> INTERMEDIAIRE, etc.
--    et supprimer/réviser toute ligne SUPER_ADMIN/ADMIN.
--  * Rotation : après backfill, faire tourner les clés/secrets d'API et le JWT secret.
