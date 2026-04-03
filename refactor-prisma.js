const fs = require('fs');
const path = require('path');

const prismaFile = path.resolve('prisma/schema.prisma');
let content = fs.readFileSync(prismaFile, 'utf8');

// Helper pour modifier l'intérieur d'un modèle spécifiquement
function editModel(modelName, callback) {
  const regex = new RegExp(`(model ${modelName} \\{[\\s\\S]*?\\n\\})`, 'g');
  content = content.replace(regex, (match) => {
    return callback(match);
  });
}

// ---------------------------------------------------------
// W1, W4, I1 : MODEL USER
// ---------------------------------------------------------
editModel('User', (m) => {
  // W4: Supression fullName, name
  m = m.replace(/.*fullName\s+String\?.*[\r\n]+/g, '');
  m = m.replace(/.*name\s+String\?[\r\n]+/g, ''); // Wait, firstName / lastName exists
  
  // W1: Suppression des champs Diaspora
  m = m.replace(/.*diasporaAbonnement.*[\r\n]+/g, '');
  m = m.replace(/.*diasporaAbonnementSince.*[\r\n]+/g, '');
  m = m.replace(/.*diasporaDevise.*[\r\n]+/g, '');
  m = m.replace(/.*diasporaStripeId.*[\r\n]+/g, '');
  m = m.replace(/.*diasporaWhatsapp.*[\r\n]+/g, '');
  m = m.replace(/.*paysResidence.*[\r\n]+/g, '');
  m = m.replace(/.*fuseauHoraire.*[\r\n]+/g, '');
  m = m.replace(/.*emailRapportMensuel.*[\r\n]+/g, '');
  m = m.replace(/.*deviceFingerprint.*[\r\n]+/g, '');
  
  // W1: Suppression champs Fraud
  m = m.replace(/.*fraudScore\s+Int.*[\r\n]+/g, '');
  m = m.replace(/.*fraudFlags\s+Json\?.*[\r\n]+/g, '');

  // W1/I5: Suppression champs Wallet
  m = m.replace(/.*walletBalance.*[\r\n]+/g, '');
  m = m.replace(/.*landlordCode.*[\r\n]+/g, '');
  m = m.replace(/.*isConfidential.*[\r\n]+/g, '');
  m = m.replace(/.*walletSeuilAlerte.*[\r\n]+/g, '');
  m = m.replace(/.*walletRappelActif.*[\r\n]+/g, '');
  m = m.replace(/.*walletRappelJour.*[\r\n]+/g, '');
  m = m.replace(/.*walletRappelMontant.*[\r\n]+/g, '');
  m = m.replace(/.*walletOperateurPrefere.*[\r\n]+/g, '');
  m = m.replace(/.*walletCanalAlertePref.*[\r\n]+/g, '');

  // Ajout des liaisons (avant createdAt)
  if (!m.includes('walletConfig')) {
    m = m.replace(/(createdAt\s+DateTime)/, `walletConfig UserWalletConfig?\n  diasporaProfile UserDiasporaProfile?\n  fraudProfile UserFraudProfile?\n  deletedAt DateTime? @map("deleted_at")\n  $1`);
  }
  return m;
});

// ---------------------------------------------------------
// C2, I1 : MODEL PROPERTY
// ---------------------------------------------------------
editModel('Property', (m) => {
  m = m.replace(/.*groupeId\s+String.*[\r\n]+/g, '');
  m = m.replace(/.*groupe\s+PropertyGroupe.*[\r\n]+/g, '');
  m = m.replace(/.*biens\s+Property\[\].*[\r\n]+/g, '');
  
  if (!m.includes('deletedAt')) {
    m = m.replace(/(createdAt\s+DateTime)/, `deletedAt DateTime? @map("deleted_at")\n  $1`);
  }
  return m;
});

// ---------------------------------------------------------
// W3, I1, I4, C3 : MODEL LEASE
// ---------------------------------------------------------
editModel('Lease', (m) => {
  m = m.replace(/.*dureeMoisBail.*[\r\n]+/g, '');
  m = m.replace(/.*loyerTotalFcfa.*[\r\n]+/g, '');
  m = m.replace(/.*dateLimitePaiement.*[\r\n]+/g, '');
  
  // C3: Enum
  m = m.replace(/status\s+String[^a-zA-Z]/g, 'status LeaseStatus @default(DRAFT) ');
  m = m.replace(/typeBail\s+String[^a-zA-Z]/g, 'typeBail TypeBail ');

  if (!m.includes('deletedAt')) {
    m = m.replace(/(createdAt\s+DateTime)/, `deletedAt DateTime? @map("deleted_at")\n  $1`);
  }
  
  if (!m.includes('@@index([status, createdAt])')) {
    m = m.replace(/(\}?\s*)$/m, `\n  @@index([status, createdAt])\n$1`);
  }
  return m;
});

// ---------------------------------------------------------
// C3 : OTHER MODELS ENUMS
// ---------------------------------------------------------
editModel('Mandate', (m) => {
  m = m.replace(/status\s+String([^]*?)/gi, 'status MandateStatus @default(DRAFT)$1');
  m = m.replace(/mandateType\s+String([^]*?)/gi, 'mandateType MandateType$1');
  return m;
});
editModel('CDCDeposit', (m) => {
  m = m.replace(/status\s+String([^]*?)/gi, 'status CDCDepositStatus @default(PENDING)$1');
  return m;
});
editModel('TicketMaintenance', (m) => {
  m = m.replace(/status\s+String([^]*?)/gi, 'status MaintenanceStatus @default(EN_ATTENTE)$1');
  return m;
});
editModel('Insurance', (m) => {
  m = m.replace(/status\s+String([^]*?)/gi, 'status InsuranceStatus @default(ACTIVE)$1');
  return m;
});

// ---------------------------------------------------------
// C4 : NOTIFCANAL
// ---------------------------------------------------------
editModel('NotificationLog', (m) => {
  m = m.replace(/canal\s+(String|PaymentCanal)[^a-zA-Z]*?/g, 'canal NotifCanal ');
  return m;
});
editModel('BdqConversationState', (m) => {
  m = m.replace(/canal\s+(String|PaymentCanal)[^a-zA-Z]*?/g, 'canal NotifCanal ');
  return m;
});

// ---------------------------------------------------------
// C5 : MISSING FKS
// ---------------------------------------------------------
editModel('ColocPayment', (m) => {
  if (!m.includes('receipt Receipt?')) {
    m = m.replace(/(receiptId\s+String\?[^\r\n]*)/, `$1\n  receipt Receipt? @relation(fields: [receiptId], references: [id])`);
  }
  return m;
});
editModel('SmsDeclaration', (m) => {
  if (!m.includes('property Property?')) {
    m = m.replace(/(propertyId\s+String\?[^\r\n]*)/, `$1\n  property Property? @relation(fields: [propertyId], references: [id])`);
  }
  // Might have leaseId, mandateId missing relations... simple fix for propertyId per user's prompt
  return m;
});
editModel('MandateHistory', (m) => {
  if (!m.includes('property Property?')) {
    m = m.replace(/(propertyId\s+String\?[^\r\n]*)/, `$1\n  property Property? @relation(fields: [propertyId], references: [id])`);
  }
  return m;
});

// ---------------------------------------------------------
// W2 : STRING @DEFAULT("[]")
// ---------------------------------------------------------
content = content.replace(/(\w+)\s+String\s+@default\("\[\]"\)/g, '$1 String[]');

// ---------------------------------------------------------
// W5, I1 : BAILDECLARATIF
// ---------------------------------------------------------
editModel('BailDeclaratif', (m) => {
  if (!m.includes('deletedAt')) {
    m = m.replace(/(createdAt\s+DateTime)/, `deletedAt DateTime? @map("deleted_at")\n  $1`);
  }
  if (!m.includes('@@index([locataireId])')) {
    m = m.replace(/(\}?\s*)$/m, `\n  @@index([locataireId])\n  @@index([propertyId])\n$1`);
  }
  return m;
});
editModel('PaymentPgw', (m) => {
  if (!m.includes('@@index([beneficiaireId])')) {
    m = m.replace(/(\}?\s*)$/m, `\n  @@index([beneficiaireId])\n$1`);
  }
  return m;
});
editModel('Annonce', (m) => {
  if (!m.includes('@@index([logementId])')) {
    m = m.replace(/(\}?\s*)$/m, `\n  @@index([logementId])\n$1`);
  }
  return m;
});

// ---------------------------------------------------------
// I2 : MARKETDATA
// ---------------------------------------------------------
editModel('MarketData', (m) => {
  if (!m.includes('createdAt')) {
    m = m.replace(/(\}?\s*)$/m, `\n  createdAt DateTime @default(now()) @map("created_at")\n$1`);
  }
  return m;
});

// ---------------------------------------------------------
// W6 : missing updatedAt
// ---------------------------------------------------------
['Receipt', 'PropertyImage', 'Certificate', 'ReliabilityScore', 'IclEvent', 'MigrationStaging', 'BdqSmsLog'].forEach(model => {
  editModel(model, (m) => {
    if (!m.includes('updatedAt')) {
      m = m.replace(/(\}?\s*)$/m, `\n  updatedAt DateTime @updatedAt @map("updated_at")\n$1`);
    }
    return m;
  });
});

// ---------------------------------------------------------
// W1, I5 : NEW MODELS
// ---------------------------------------------------------
const newModels = `
model UserWalletConfig {
  id                    String  @id @default(uuid())
  userId                String  @unique @map("user_id")
  user                  User    @relation(fields: [userId], references: [id])
  walletBalance         Int     @default(0) @map("wallet_balance")
  landlordCode          String? @unique @map("landlord_code")
  isConfidential        Boolean @default(false) @map("is_confidential")
  walletSeuilAlerte     Float?  @default(500) @map("wallet_seuil_alerte")
  walletRappelActif     Boolean @default(false) @map("wallet_rappel_actif")
  walletRappelJour      Int     @default(1) @map("wallet_rappel_jour")
  walletRappelMontant   Float?  @map("wallet_rappel_montant")
  walletOperateurPrefere String @default("WAVE") @map("wallet_operateur_prefere")
  walletCanalAlertePref String  @default("WHATSAPP") @map("wallet_canal_alerte_pref")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  @@map("user_wallet_configs")
}

model UserDiasporaProfile {
  id                      String   @id @default(uuid())
  userId                  String   @unique @map("user_id")
  user                    User     @relation(fields: [userId], references: [id])
  diasporaAbonnement      Boolean  @default(false) @map("diaspora_abonnement")
  diasporaAbonnementSince DateTime? @map("diaspora_abonnement_since")
  diasporaDevise          String   @default("FCFA") @map("diaspora_devise")
  diasporaStripeId        String?  @map("diaspora_stripe_id")
  diasporaWhatsapp        String?  @map("diaspora_whatsapp")
  paysResidence           String?  @map("pays_residence")
  fuseauHoraire           String   @default("Africa/Abidjan") @map("fuseau_horaire")
  emailRapportMensuel     String?  @map("email_rapport_mensuel")
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  @@map("user_diaspora_profiles")
}

model UserFraudProfile {
  id                String   @id @default(uuid())
  userId            String   @unique @map("user_id")
  user              User     @relation(fields: [userId], references: [id])
  deviceFingerprint String?  @map("device_fingerprint")
  fraudScore        Int      @default(0) @map("fraud_score")
  fraudFlags        Json?    @map("fraud_flags")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("user_fraud_profiles")
}

model WalletTransaction {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  type      String   @map("type") // Ex: CREDIT, DEBIT
  amount    Int      @map("amount")
  status    String   @default("COMPLETED") @map("status")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([createdAt])
  @@map("wallet_transactions")
}
`;

if (!content.includes('model UserWalletConfig')) {
  content = content + '\\n' + newModels + '\\n';
}

fs.writeFileSync(prismaFile, content, 'utf8');
console.log('Fichier schema.prisma modifié avec succès.');
