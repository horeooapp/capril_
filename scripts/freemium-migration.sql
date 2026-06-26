-- 1. Tout le monde passe en PREMIUM sans expiration
UPDATE users 
SET active_plan_tier = 'PREMIUM', 
    plan_expires_at = NULL,
    is_freemium_override = true,
    freemium_since = NOW();

-- 2. Désactiver le paywall globalement
INSERT INTO feature_flags (id, name, enabled)
VALUES ('PAYWALL', 'paywall_actif', false)
ON CONFLICT (name) DO UPDATE SET enabled = false;

-- 3. Marquer les offres comme gratuites
UPDATE offres_abonnements SET is_freemium = true;

-- 4. Documenter la décision d'audit (optionnel mais recommandé par le plan)
INSERT INTO config_tarifs_audits (id, action, cle, ancien_prix, nouveau_prix, modifie_par, created_at)
VALUES (
    gen_random_uuid(), 
    'PASSAGE_100_GRATUIT', 
    'GLOBAL_PAYWALL', 
    0, 
    0, 
    NULL, 
    NOW()
);
