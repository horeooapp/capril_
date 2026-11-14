import paramiko
import os

HOST = '187.77.182.168'
USER = 'root'
PWD = 'Qap@vpserv2026'

MIGRATIONS_P0 = [
    ('M-01', """-- M-01 — Une seule candidature vivante par (candidat, annonce) [P0 — 17/11]
BEGIN;

-- 1. Purger les doublons existants : on garde la plus récente par couple.
WITH classees AS (
  SELECT cand_id,
         ROW_NUMBER() OVER (PARTITION BY candidat_id, annonce_id ORDER BY created_at DESC) AS rn
  FROM candidatures
  WHERE candidat_id IS NOT NULL AND annonce_id IS NOT NULL
    AND statut NOT IN ('RETIREE','EXPIREE')
)
UPDATE candidatures c SET statut = 'RETIREE', retiree_at = now()
FROM classees x WHERE c.cand_id = x.cand_id AND x.rn > 1;

-- 2. Candidat et annonce deviennent obligatoires (les lignes orphelines sont archivées avant).
UPDATE candidatures SET statut = 'EXPIREE', expiree_at = now()
 WHERE candidat_id IS NULL OR annonce_id IS NULL;

ALTER TABLE candidatures ALTER COLUMN candidat_id SET NOT NULL;
ALTER TABLE candidatures ALTER COLUMN annonce_id  SET NOT NULL;

-- 3. Index unique partiel.
CREATE UNIQUE INDEX IF NOT EXISTS ux_candidature_vivante
  ON candidatures (candidat_id, annonce_id)
  WHERE statut NOT IN ('RETIREE','EXPIREE');

COMMIT;
"""),

    ('M-02', """-- M-02 — Suppression de l'OTP de signature en clair [P0 — 17/11]
BEGIN;
ALTER TABLE leases DROP COLUMN IF EXISTS signing_otp;
COMMIT;
"""),

    ('M-03', """-- M-03 — Plus de « certifié » par défaut [P0 — 17/11]
BEGIN;
ALTER TABLE leases ADD COLUMN IF NOT EXISTS certifie_at timestamptz;
-- Tout bail non actif ou sans signature des deux parties redevient NON_CERTIFIE.
UPDATE leases SET niveau_certification = 'NON_CERTIFIE'
 WHERE status IN ('DRAFT','PENDING_SIGNATURE','PENDING_CONFIRMATION','CANCELLED')
    OR sha256_hash IS NULL;
UPDATE leases SET certifie_at = COALESCE(certifie_at, updated_at) WHERE niveau_certification <> 'NON_CERTIFIE';
ALTER TABLE leases ALTER COLUMN niveau_certification SET DEFAULT 'NON_CERTIFIE';
UPDATE receipts SET niveau_certification = 'NON_CERTIFIE' WHERE receipt_hash IS NULL;
ALTER TABLE receipts ALTER COLUMN niveau_certification SET DEFAULT 'NON_CERTIFIE';
COMMIT;
"""),

    ('M-04-P0', """-- M-04 — Statuts en texte libre -> types énumérés [P0 partiel]
BEGIN;

DO $$ BEGIN
  CREATE TYPE "CandidatureStatut" AS ENUM ('ENVOYEE','VUE','VISITE_PROPOSEE','RETENUE','NON_RETENUE','RETIREE','EXPIREE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

UPDATE candidatures SET statut = CASE upper(trim(statut))
  WHEN 'ACCEPTE' THEN 'RETENUE'
  WHEN 'ACCEPTEE' THEN 'RETENUE'
  WHEN 'REJETE' THEN 'NON_RETENUE'
  WHEN 'REJETEE' THEN 'NON_RETENUE'
  WHEN 'EN_ATTENTE' THEN 'ENVOYEE'
  ELSE upper(trim(statut))
END;

ALTER TABLE candidatures ALTER COLUMN statut DROP DEFAULT;
ALTER TABLE candidatures ALTER COLUMN statut TYPE "CandidatureStatut" USING statut::"CandidatureStatut";
ALTER TABLE candidatures ALTER COLUMN statut SET DEFAULT 'ENVOYEE';

DO $$ BEGIN
  CREATE TYPE "AnnonceStatut" AS ENUM ('BROUILLON','PUBLIEE','SUSPENDUE','LOUEE','EXPIREE','RETIREE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

UPDATE annonces SET statut = CASE upper(trim(statut))
  WHEN 'ACTIVE' THEN 'PUBLIEE'
  WHEN 'PUBLISHED' THEN 'PUBLIEE'
  WHEN 'DRAFT' THEN 'BROUILLON'
  WHEN 'LOUE' THEN 'LOUEE'
  WHEN 'CLOSED' THEN 'LOUEE'
  WHEN 'ARCHIVEE' THEN 'RETIREE'
  WHEN 'ARCHIVED' THEN 'RETIREE'
  ELSE upper(trim(statut))
END;

ALTER TABLE annonces ALTER COLUMN statut DROP DEFAULT;
ALTER TABLE annonces ALTER COLUMN statut TYPE "AnnonceStatut" USING statut::"AnnonceStatut";
ALTER TABLE annonces ALTER COLUMN statut SET DEFAULT 'BROUILLON';

DO $$ BEGIN
  CREATE TYPE "StatutPosition" AS ENUM ('MANQUANTE','PROVISOIRE','CONFIRMEE','GELEE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

UPDATE properties SET statut_position = upper(trim(statut_position));
ALTER TABLE properties ALTER COLUMN statut_position DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN statut_position TYPE "StatutPosition" USING statut_position::"StatutPosition";
ALTER TABLE properties ALTER COLUMN statut_position SET DEFAULT 'MANQUANTE';

COMMIT;
"""),

    ('M-06', """-- M-06 — Annonce publiable par un bailleur ou une agence [P0 — 17/11]
BEGIN;

-- 1. Renommer agence_id en publie_par_id si pas déjà fait
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='annonces' AND column_name='agence_id') THEN
    ALTER TABLE annonces RENAME COLUMN agence_id TO publie_par_id;
  END IF;
END $$;

DO $$ BEGIN
  CREATE TYPE "RoleContexte" AS ENUM ('LOCATAIRE','BAILLEUR','AGENCE','INTERMEDIAIRE','ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE annonces ADD COLUMN IF NOT EXISTS publie_par_role "RoleContexte" NOT NULL DEFAULT 'AGENCE';
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS mandat_gestion_id text REFERENCES mandats_gestion(mandat_id);
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS loyer_mensuel integer;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS charges_mensuelles integer NOT NULL DEFAULT 0;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS depot_garantie_mois integer NOT NULL DEFAULT 0;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS avance_loyer_mois integer NOT NULL DEFAULT 0;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS negociable boolean NOT NULL DEFAULT false;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS disponible_le date;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS description_longue text;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS expire_at timestamptz;

-- Reprise : le loyer_mensuel est copié depuis declared_rent_fcfa ou loyer_demande
UPDATE annonces a SET loyer_mensuel = COALESCE(p.declared_rent_fcfa, a.loyer_demande::integer, 0)
FROM properties p
WHERE p.property_id = a.logement_id AND a.loyer_mensuel IS NULL;

-- S'assurer qu'aucune valeur n'est nulle avant de poser NOT NULL
UPDATE annonces SET loyer_mensuel = COALESCE(loyer_demande::integer, 0) WHERE loyer_mensuel IS NULL;
ALTER TABLE annonces ALTER COLUMN loyer_mensuel SET NOT NULL;

-- Plafonds légaux CCH (art. 415-416-420)
DO $$ BEGIN
  ALTER TABLE annonces ADD CONSTRAINT ck_annonce_depot_max CHECK (depot_garantie_mois BETWEEN 0 AND 2);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE annonces ADD CONSTRAINT ck_annonce_avance_max CHECK (avance_loyer_mois BETWEEN 0 AND 2);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

COMMIT;
"""),

    ('M-13', """-- M-13 — Retrait de l'exécution de scripts stockés en base [P0 — 17/11]
BEGIN;
ALTER TABLE automation_settings DROP COLUMN IF EXISTS custom_scripts;
COMMIT;
""")
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PWD, timeout=30)

log_lines = []

for name, sql in MIGRATIONS_P0:
    print(f'>>> Executing migration {name}...')
    # Escape SQL for bash
    # Write SQL to a remote temp file on VPS
    sftp = client.open_sftp()
    remote_path = f'/tmp/{name}.sql'
    with sftp.file(remote_path, 'w') as f:
        f.write(sql)
    sftp.close()

    cmd = f'docker exec -i qapril_postgres psql -U postgres -d qapril < {remote_path}'
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    
    print(f'=== RESULT {name} ===')
    if out:
        print(out)
    if err:
        print('STDERR:', err)
    
    log_lines.append(f'=== MIGRATION {name} ===\n{out}\n{err}\n')

client.close()

os.makedirs(r'e:\Projets_Cornerstone\site_crnstneros\capril_\docs\audit\03_migrations', exist_ok=True)
with open(r'e:\Projets_Cornerstone\site_crnstneros\capril_\docs\audit\03_migrations\p0_execution.log', 'w', encoding='utf-8') as f:
    f.writelines(log_lines)

print('All P0 migrations completed. Log saved.')

