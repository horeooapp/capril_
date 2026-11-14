import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. User fixes
content = content.replace(
    '  email                       String?\n  emailVerifieAt              DateTime?                @map("email_verifie_at")',
    '  email                       String?                  @unique'
)
content = content.replace(
    '  kycStatus                   KycStatus                @default(PENDING) @map("kyc_status")',
    '  kycStatus                   String                   @default("pending") @map("kyc_status")'
)
content = content.replace(
    '  capaciteActive              RoleContexte?            @map("capacite_active")',
    '  capaciteActive              String?                  @default("PROPRIETAIRE") @map("capacite_active")'
)
content = content.replace(
    '  @@unique([email, emailVerifieAt])\n  @@map("users")',
    '  @@map("users")'
)

# 2. LegalEntity & IdentityDocument status
content = content.replace(
    'model LegalEntity {\n  id                String                 @id @default(uuid())\n  name              String\n  rccmNumber        String?                @map("rccm_number")\n  taxNumber         String?                @map("tax_number")\n  address           String?\n  bankAccount       String?                @map("bank_account")\n  /// Chiffré au niveau applicatif\n  bankAccountEnc    String?                @map("bank_account_enc")\n  status             ReceiptStatus    @default(EMISE)',
    'model LegalEntity {\n  id                String                 @id @default(uuid())\n  name              String\n  rccmNumber        String?                @map("rccm_number")\n  taxNumber         String?                @map("tax_number")\n  address           String?\n  bankAccount       String?                @map("bank_account")\n  /// Chiffré au niveau applicatif\n  bankAccountEnc    String?                @map("bank_account_enc")\n  status            String                 @default("pending")'
)

content = content.replace(
    'model IdentityDocument {\n  id               String       @id @default(uuid())\n  userId           String       @map("user_id")\n  documentType     DocumentType @map("document_type")\n  documentNumber   String       @map("document_number")\n  /// Chiffré au niveau applicatif\n  documentNumberEnc String?     @map("document_number_enc")\n  expiryDate       DateTime     @map("expiry_date")\n  frontUrl         String       @map("front_url")\n  backUrl          String?      @map("back_url")\n  /// Données brutes de la zone MRZ extraites par OCR\n  mrzRawData       String?      @map("mrz_raw_data")\n  /// Chiffré au niveau applicatif\n  mrzRawDataEnc    String?      @map("mrz_raw_data_enc")\n  scanS3Key        String?      @map("scan_s3_key")\n  status             ReceiptStatus    @default(EMISE)',
    'model IdentityDocument {\n  id               String       @id @default(uuid())\n  userId           String       @map("user_id")\n  documentType     DocumentType @map("document_type")\n  documentNumber   String       @map("document_number")\n  /// Chiffré au niveau applicatif\n  documentNumberEnc String?     @map("document_number_enc")\n  expiryDate       DateTime     @map("expiry_date")\n  frontUrl         String       @map("front_url")\n  backUrl          String?      @map("back_url")\n  /// Données brutes de la zone MRZ extraites par OCR\n  mrzRawData       String?      @map("mrz_raw_data")\n  /// Chiffré au niveau applicatif\n  mrzRawDataEnc    String?      @map("mrz_raw_data_enc")\n  scanS3Key        String?      @map("scan_s3_key")\n  status           String       @default("pending")'
)

# 3. Property fixes
content = content.replace(
    '  amenities                  String[]\n  status                     PropertyStatus        @default(BROUILLON)',
    '  amenities                  String[]\n  status                     String                @default("draft")'
)
content = content.replace(
    '  statutPosition             StatutPosition        @default(MANQUANTE) @map("statut_position")\n  niveauVerification         NiveauVerificationBien @default(N1_DECLARE) @map("niveau_verification")',
    '  statutPosition             StatutPosition        @default(MANQUANTE) @map("statut_position")'
)

# 4. Lease fixes
content = content.replace(
    '  niveauCertification       NiveauCertification     @default(NON_CERTIFIE) @map("niveau_certification")\n  certifieAt                 DateTime?               @map("certifie_at")\n  statutRecouvrement         RecouvrementStatut      @default(A_JOUR) @map("statut_recouvrement")',
    '  niveauCertification       String                  @default("NON_CERTIFIE") @map("niveau_certification")\n  certifieAt                 DateTime?               @map("certifie_at")'
)

# 5. PaymentIntent & Receipt fixes
content = content.replace(
    'model PaymentIntent {\n  id             String   @id @default(uuid())\n  amount         Float\n  currency       String   @default("XOF")\n  paymentMethod  String   @map("payment_method")\n  idempotencyKey String?  @unique @map("idempotency_key")\n  externalRef    String?  @map("external_ref")\n  metadata       Json?\n  status             ReceiptStatus    @default(EMISE)',
    'model PaymentIntent {\n  id             String   @id @default(uuid())\n  amount         Float\n  currency       String   @default("XOF")\n  paymentMethod  String   @map("payment_method")\n  idempotencyKey String?  @unique @map("idempotency_key")\n  externalRef    String?  @map("external_ref")\n  metadata       Json?\n  status         String   @default("pending")'
)

content = content.replace(
    'model Receipt {\n  id                 String           @id @default(uuid())\n  receiptNumber      String           @unique @map("receipt_number")\n  leaseId            String           @map("lease_id")\n  amount             Float\n  periodMonth        Int              @map("period_month")\n  periodYear         Int              @map("period_year")\n  issuedDate         DateTime         @default(now()) @map("issued_date")\n  pdfUrl             String?          @map("pdf_url")\n  status             ReceiptStatus    @default(EMISE)',
    'model Receipt {\n  id                 String           @id @default(uuid())\n  receiptNumber      String           @unique @map("receipt_number")\n  leaseId            String           @map("lease_id")\n  amount             Float\n  periodMonth        Int              @map("period_month")\n  periodYear         Int              @map("period_year")\n  issuedDate         DateTime         @default(now()) @map("issued_date")\n  pdfUrl             String?          @map("pdf_url")\n  status             String           @default("pending")'
)

content = content.replace(
    '  receiptHash        String?          @map("receipt_hash")\n  niveauCertification       NiveauCertification     @default(NON_CERTIFIE) @map("niveau_certification")\n  certifieAt                 DateTime?               @map("certifie_at")\n  statutRecouvrement         RecouvrementStatut      @default(A_JOUR) @map("statut_recouvrement")',
    '  receiptHash        String?          @map("receipt_hash")\n  niveauCertification String          @default("CERTIFIE_QAPRIL") @map("niveau_certification")'
)

# 6. Notification status fix
content = content.replace(
    'model Notification {\n  id         String   @id @default(uuid())\n  userId     String   @map("user_id")\n  title      String\n  message    String\n  type       String   @default("info")\n  status             ReceiptStatus    @default(EMISE)',
    'model Notification {\n  id         String   @id @default(uuid())\n  userId     String   @map("user_id")\n  title      String\n  message    String\n  type       String   @default("info")\n  status     String   @default("pending")'
)

# 7. MandatGestion statut fixes
content = content.replace('statut           MandatStatut        @default(PROPOSE)', 'statut           String              @default("EN_ATTENTE")')

# 8. Occupant & AttestationResidence fixes
content = content.replace('lien              LienOccupant           @map("lien")', 'lien              String                 @map("lien")')
content = content.replace('statut            OccupantStatut         @default(DECLARE) @map("statut")', 'statut            String                 @default("DECLARE") @map("statut")')
content = content.replace('niveau            NiveauAttestation      @default(C) @map("niveau")', 'niveau            String                 @default("C") @map("niveau")')
content = content.replace('niveau          NiveauAttestation         @map("niveau")', 'niveau          String                    @map("niveau")')
content = content.replace('statut          AttestationStatut         @default(VALIDE) @map("statut")', 'statut          String                    @default("VALIDE") @map("statut")')

# 9. Clean up unused enums block at the bottom
# Keep only CandidatureStatut, AnnonceStatut, StatutPosition, RoleContexte
enums_block = """enum CandidatureStatut {
  ENVOYEE
  VUE
  VISITE_PROPOSEE
  RETENUE
  NON_RETENUE
  RETIREE
  EXPIREE
}

enum AnnonceStatut {
  BROUILLON
  PUBLIEE
  SUSPENDUE
  LOUEE
  EXPIREE
  RETIREE
}

enum StatutPosition {
  MANQUANTE
  PROVISOIRE
  CONFIRMEE
  GELEE
}

enum RoleContexte {
  LOCATAIRE
  BAILLEUR
  AGENCE
  INTERMEDIAIRE
  ADMIN
}"""

idx = content.find('enum CandidatureStatut {')
if idx != -1:
    content = content[:idx] + enums_block + '\n'

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print('prisma/schema.prisma aligned with live PostgreSQL database successfully!')
