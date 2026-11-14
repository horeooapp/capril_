#!/usr/bin/env python3
"""
Applies AUD-01 schema corrections to prisma/schema.prisma:
1. Adds 18 enums
2. Updates models User, Candidature, Annonce, Property, Lease, Receipt,
   MandatGestion, Occupant, AttestationResidence, DeclarationPaiement,
   TransmissionAdressage, AutomationSettings.
"""
import re

SCHEMA_PATH = r'e:\Projets_Cornerstone\site_crnstneros\capril_\prisma\schema.prisma'
ENUMS_PATH = r'e:\Projets_Cornerstone\site_crnstneros\capril_\docs\aud01\aud01\prisma\corrections\00_enums_IC-01-R1.prisma'

with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

with open(ENUMS_PATH, 'r', encoding='utf-8') as f:
    new_enums = f.read()

# 1. Append enums if not already present
if 'enum CandidatureStatut' not in content:
    content += '\n\n// ============================================================================\n'
    content += '// ÉNUMÉRATIONS AUD-01 / IC-01-R1 (18 ÉNUMÉRATIONS NORMALISÉES)\n'
    content += '// ============================================================================\n\n'
    content += new_enums.strip() + '\n'
    print('Added 18 new enums.')
else:
    print('Enums already present.')

# 2. Update User model
# Replace phone, email, kycStatus, capaciteActive
# Add emailVerifieAt, @@unique([email, emailVerifieAt]), annoncesPubliees
old_user_snip = """  phone                       String?                  @unique
  firstName                   String?                  @map("first_name")
  lastName                    String?                  @map("last_name")
  birthDate                   DateTime?                @map("birth_date")
  birthPlace                  String?                  @map("birth_place")
  neighborhood                String?                  @map("neighborhood")
  avatarUrl                   String?                  @map("avatar_url")
  email                       String?                  @unique
  role                        Role                     @default(TENANT)
  profileType                 ProfileType?             @map("profile_type")
  kycLevel                    Int                      @default(0) @map("kyc_level")
  kycStatus                   String                   @default("pending") @map("kyc_status")"""

new_user_snip = """  phone                       String                   @unique
  firstName                   String?                  @map("first_name")
  lastName                    String?                  @map("last_name")
  birthDate                   DateTime?                @map("birth_date")
  birthPlace                  String?                  @map("birth_place")
  neighborhood                String?                  @map("neighborhood")
  avatarUrl                   String?                  @map("avatar_url")
  email                       String?
  emailVerifieAt              DateTime?                @map("email_verifie_at")
  role                        Role                     @default(TENANT)
  profileType                 ProfileType?             @map("profile_type")
  kycLevel                    Int                      @default(0) @map("kyc_level")
  kycStatus                   KycStatus                @default(PENDING) @map("kyc_status")"""

if old_user_snip in content:
    content = content.replace(old_user_snip, new_user_snip)
    print('Updated User basic fields (phone, email, kycStatus).')
else:
    print('User snippet not matched exactly, checking individual fields...')

# capaciteActive in User:
content = re.sub(
    r'capaciteActive\s+String\?\s+@default\("PROPRIETAIRE"\)\s+@map\("capacite_active"\)',
    'capaciteActive              RoleContexte?            @map("capacite_active")',
    content
)

# annoncesPubliees in User:
content = content.replace(
    'agenceAnnonces              Annonce[]                @relation("AgenceAnnonces")',
    'annoncesPubliees            Annonce[]                @relation("AnnoncesPubliees")'
)

# unique email constraint in User:
if '@@unique([email, emailVerifieAt])' not in content:
    content = content.replace(
        '  @@map("users")',
        '  @@unique([email, emailVerifieAt])\n  @@map("users")'
    )
    print('Added @@unique([email, emailVerifieAt]) to User.')

# 3. Update Property model
content = re.sub(
    r'status\s+String\s+@default\("draft"\)',
    'status                     PropertyStatus        @default(BROUILLON)',
    content
)
content = re.sub(
    r'statutPosition\s+String\s+@default\("MANQUANTE"\)\s+@map\("statut_position"\)',
    'statutPosition             StatutPosition        @default(MANQUANTE) @map("statut_position")\n  niveauVerification         NiveauVerificationBien @default(N1_DECLARE) @map("niveau_verification")',
    content
)
print('Updated Property model.')

# 4. Update Lease model
content = re.sub(
    r'durationMonths\s+Int\s+@map\("duration_months"\)',
    'durationMonths            Int?                    @map("duration_months")',
    content
)
content = re.sub(
    r'\s+signingOtp\s+String\?\s+@map\("signing_otp"\)',
    '',
    content
)
content = re.sub(
    r'niveauCertification\s+String\s+@default\("CERTIFIE_QAPRIL"\)\s+@map\("niveau_certification"\)',
    'niveauCertification       NiveauCertification     @default(NON_CERTIFIE) @map("niveau_certification")\n  certifieAt                 DateTime?               @map("certifie_at")\n  statutRecouvrement         RecouvrementStatut      @default(A_JOUR) @map("statut_recouvrement")',
    content
)
print('Updated Lease model.')

# 5. Update Receipt model
content = re.sub(
    r'status\s+String\s+@default\("pending"\)',
    'status             ReceiptStatus    @default(EMISE)',
    content
)
# Receipt niveauCertification
# Notice: Receipt had `niveauCertification String @default("CERTIFIE_QAPRIL")`
content = re.sub(
    r'niveauCertification\s+String\s+@default\("CERTIFIE_QAPRIL"\)\s+@map\("niveau_certification"\)',
    'niveauCertification NiveauCertification  @default(NON_CERTIFIE) @map("niveau_certification")',
    content
)
print('Updated Receipt model.')

# 6. Update Candidature model
old_cand = """model Candidature {
  id               String    @id @default(uuid()) @map("cand_id")
  logementId       String    @map("logement_id")
  annonceId        String?   @map("annonce_id")
  candidatId       String?   @map("candidat_id")
  nom              String
  prenom           String
  telephone        String
  revenuMensuel    Float?    @map("revenu_mensuel")
  employeur        String?
  scoreQapril      Int?      @map("score_qapril")
  tauxEffort       Float?    @map("taux_effort")
  docsJsonb        Json?     @map("docs_jsonb")
  statut           String    @default("ENVOYEE")
  noteAgence       String?   @map("note_agence")
  envoyeeAt        DateTime? @default(now()) @map("envoyee_at")
  vueAt            DateTime? @map("vue_at")
  visiteProposeeAt DateTime? @map("visite_proposee_at")
  statueeAt        DateTime? @map("statuee_at")
  retireeAt        DateTime? @map("retiree_at")
  expireeAt        DateTime? @map("expiree_at")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime? @updatedAt @map("updated_at")

  candidat         User?     @relation("UserCandidatures", fields: [candidatId], references: [id])
  logement         Property  @relation(fields: [logementId], references: [id])
  annonce          Annonce?  @relation(fields: [annonceId], references: [id])

  @@index([logementId])
  @@index([candidatId])
  @@index([annonceId])
  @@map("candidatures")
}"""

new_cand = """model Candidature {
  id               String            @id @default(uuid()) @map("cand_id")
  logementId       String            @map("logement_id")
  annonceId        String            @map("annonce_id")
  candidatId       String            @map("candidat_id")
  nom              String
  prenom           String
  telephone        String
  revenuMensuel    Float?            @map("revenu_mensuel")
  employeur        String?
  scoreQapril      Int?              @map("score_qapril")
  tauxEffort       Float?            @map("taux_effort")
  docsJsonb        Json?             @map("docs_jsonb")
  statut           CandidatureStatut @default(ENVOYEE)
  trancheConfiance String?           @map("tranche_confiance")
  noteAgence       String?           @map("note_agence")
  envoyeeAt        DateTime?         @default(now()) @map("envoyee_at")
  vueAt            DateTime?         @map("vue_at")
  visiteProposeeAt DateTime?         @map("visite_proposee_at")
  statueeAt        DateTime?         @map("statuee_at")
  retireeAt        DateTime?         @map("retiree_at")
  expireeAt        DateTime?         @map("expiree_at")
  createdAt        DateTime          @default(now()) @map("created_at")
  updatedAt        DateTime?         @updatedAt @map("updated_at")

  candidat         User              @relation("UserCandidatures", fields: [candidatId], references: [id])
  logement         Property          @relation(fields: [logementId], references: [id])
  annonce          Annonce           @relation(fields: [annonceId], references: [id])

  @@index([logementId])
  @@index([candidatId])
  @@index([annonceId])
  @@index([annonceId, statut])
  @@map("candidatures")
}"""

if old_cand in content:
    content = content.replace(old_cand, new_cand)
    print('Updated Candidature model.')
else:
    print('Candidature model not matched exactly, applying targeted replacements...')
    content = content.replace('annonceId        String?   @map("annonce_id")', 'annonceId        String    @map("annonce_id")')
    content = content.replace('candidatId       String?   @map("candidat_id")', 'candidatId       String    @map("candidat_id")')
    content = re.sub(r'statut\s+String\s+@default\("ENVOYEE"\)', 'statut           CandidatureStatut @default(ENVOYEE)\n  trancheConfiance String?           @map("tranche_confiance")', content)
    content = content.replace('candidat         User?     @relation("UserCandidatures"', 'candidat         User      @relation("UserCandidatures"')
    content = content.replace('annonce          Annonce?  @relation(fields: [annonceId]', 'annonce          Annonce   @relation(fields: [annonceId]')

# 7. Update Annonce model
old_annonce = """model Annonce {
  id             String    @id @default(uuid()) @map("annonce_id")
  logementId     String    @map("logement_id")
  agenceId       String    @map("agence_id")
  titre          String
  description    String
  loyerDemande   Float     @map("loyer_demande")
  charges        Float     @default(0)
  photosUrls     String[]  @map("photos_urls")
  criteres       Json?
  statut         String    @default("ACTIVE")
  diffusions     Json?
  nbContacts     Int       @default(0) @map("nb_contacts")
  nbVisites      Int       @default(0) @map("nb_visites")
  nbCandidatures Int       @default(0) @map("nb_candidatures")
  coutVacance    Float?    @map("cout_vacance")
  publieeAt      DateTime? @map("publiee_at")
  archiveeAt     DateTime? @map("archivee_at")
  agence         User      @relation("AgenceAnnonces", fields: [agenceId], references: [id])
  logement       Property  @relation(fields: [logementId], references: [id])
  candidatures   Candidature[]

  @@index([logementId])
  @@index([agenceId])
  @@map("annonces")
}"""

new_annonce = """model Annonce {
  id                String        @id @default(uuid()) @map("annonce_id")
  logementId        String        @map("logement_id")
  publieParId       String        @map("publie_par_id")
  publieParRole     RoleContexte  @default(AGENCE) @map("publie_par_role")
  mandatGestionId   String?       @map("mandat_gestion_id")
  titre             String
  description       String
  loyerDemande      Float         @map("loyer_demande")
  charges           Float         @default(0)
  loyerMensuel      Int?          @map("loyer_mensuel")
  chargesMensuelles Int           @default(0) @map("charges_mensuelles")
  depotGarantieMois Int           @default(0) @map("depot_garantie_mois")
  avanceLoyerMois   Int           @default(0) @map("avance_loyer_mois")
  negociable        Boolean       @default(false)
  disponibleLe      DateTime?     @map("disponible_le")
  descriptionLongue String?       @map("description_longue") @db.Text
  photosUrls        String[]      @map("photos_urls")
  criteres          Json?
  statut            AnnonceStatut @default(BROUILLON)
  diffusions        Json?
  nbContacts        Int           @default(0) @map("nb_contacts")
  nbVisites         Int           @default(0) @map("nb_visites")
  nbCandidatures    Int           @default(0) @map("nb_candidatures")
  coutVacance       Float?        @map("cout_vacance")
  publieeAt         DateTime?     @map("publiee_at")
  expireAt          DateTime?     @map("expire_at")
  archiveeAt        DateTime?     @map("archivee_at")

  publiePar         User          @relation("AnnoncesPubliees", fields: [publieParId], references: [id])
  mandatGestion     MandatGestion? @relation(fields: [mandatGestionId], references: [id])
  logement          Property      @relation(fields: [logementId], references: [id])
  candidatures      Candidature[]

  @@index([logementId])
  @@index([publieParId])
  @@index([statut, publieeAt])
  @@map("annonces")
}"""

if old_annonce in content:
    content = content.replace(old_annonce, new_annonce)
    print('Updated Annonce model.')
else:
    print('Annonce model not matched exactly, please check.')

# 8. Update MandatGestion model
content = re.sub(
    r'statut\s+String\s+@default\("EN_ATTENTE"\)',
    'statut           MandatStatut        @default(PROPOSE)',
    content
)
# add annonces relation in MandatGestion if not present
if 'annonces         Annonce[]' not in content:
    content = content.replace(
        '  leases           Lease[]',
        '  leases           Lease[]\n  annonces         Annonce[]'
    )
print('Updated MandatGestion model.')

# 9. Update Occupant model
content = re.sub(
    r'lien\s+String\s+@map\("lien"\)\s+//[^\n]*',
    'lien              LienOccupant           @map("lien")',
    content
)
content = re.sub(
    r'statut\s+String\s+@default\("DECLARE"\)\s+@map\("statut"\)\s+//[^\n]*',
    'statut            OccupantStatut         @default(DECLARE) @map("statut")',
    content
)
content = re.sub(
    r'niveau\s+String\s+@default\("C"\)\s+@map\("niveau"\)\s+//[^\n]*',
    'niveau            NiveauAttestation      @default(C) @map("niveau")',
    content
)
content = content.replace(
    'lease             Lease                  @relation(fields: [leaseId], references: [id], onDelete: Cascade)',
    'lease             Lease                  @relation(fields: [leaseId], references: [id], onDelete: Restrict)'
)
print('Updated Occupant model.')

# 10. Update AttestationResidence model
content = re.sub(
    r'niveau\s+String\s+@map\("niveau"\)\s+//[^\n]*',
    'niveau          NiveauAttestation         @map("niveau")',
    content
)
content = re.sub(
    r'statut\s+String\s+@default\("VALIDE"\)\s+@map\("statut"\)\s+//[^\n]*',
    'statut          AttestationStatut         @default(VALIDE) @map("statut")',
    content
)
# lease relation onDelete: Cascade -> Restrict
content = re.sub(
    r'lease\s+Lease\s+@relation\(fields:\s*\[leaseId\],\s*references:\s*\[id\],\s*onDelete:\s*Cascade\)',
    'lease           Lease                     @relation(fields: [leaseId], references: [id], onDelete: Restrict)',
    content
)
print('Updated AttestationResidence model.')

# 11. Update DeclarationPaiement model
content = re.sub(
    r'montant\s+Float\s+@map\("montant"\)',
    'montant               Int                       @map("montant")',
    content
)
content = re.sub(
    r'bail\s+Lease\s+@relation\(fields:\s*\[bailId\],\s*references:\s*\[id\],\s*onDelete:\s*Cascade\)',
    'bail                  Lease                     @relation(fields: [bailId], references: [id], onDelete: Restrict)',
    content
)
print('Updated DeclarationPaiement model.')

# 12. Update TransmissionAdressage model
content = re.sub(
    r'lease\s+Lease\s+@relation\(fields:\s*\[leaseId\],\s*references:\s*\[id\],\s*onDelete:\s*Cascade\)',
    'lease         Lease          @relation(fields: [leaseId], references: [id], onDelete: Restrict)',
    content
)
print('Updated TransmissionAdressage model.')

# 13. Update AutomationSettings model (delete customScripts)
content = re.sub(
    r'\s+/// DANGER: ne JAMAIS eval\(\)/exécuter ce contenu[^\n]*\n\s+customScripts\s+Json\?\s+@map\("custom_scripts"\)',
    '',
    content
)
print('Updated AutomationSettings model (removed customScripts).')

with open(SCHEMA_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print('Finished writing modified schema.prisma.')

