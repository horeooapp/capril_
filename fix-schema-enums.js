const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// The exact model definitions to map mappings to:
const mappings = [
  { model: 'FiscalDossier', field: 'statut', enum: 'FiscalStatus', default: 'EN_ATTENTE_DECLARATION' },
  { model: 'Dispute', field: 'status', enum: 'DisputeStatus', default: 'OPEN' },
  { model: 'BdqConversationState', field: 'statut', enum: 'BdqConvStatut', default: 'EN_COURS' },
  { model: 'CautionBail', field: 'destination', enum: 'CautionDestEnum', default: 'PROPRIETAIRE' },
  { model: 'NotificationLog', field: 'statut', enum: 'NotifStatut', default: 'EN_ATTENTE' },
  { model: 'Notification', field: 'status', enum: 'NotifStatut', default: 'EN_ATTENTE' },
  { model: 'CDCDeposit', field: 'initiator', enum: 'CDCDepositInitiator', default: 'OWNER' },
  { model: 'User', field: 'activePlanTier', enum: 'PlanTier', default: 'LOCATAIRE' },
  { model: 'InsuranceClaim', field: 'status', enum: 'InsuranceClaimStatus', default: 'OPEN' },
  { model: 'Mediation', field: 'status', enum: 'MediationStatus', default: 'OPEN' },
  { model: 'PrepaymentRequest', field: 'status', enum: 'PrepaymentRequestStatus', default: 'PENDING' },
  { model: 'WalletRechargeLink', field: 'declencheur', enum: 'DeclencheurEnum', default: null }, // no default
  { model: 'LandLeaseInfo', field: 'usage', enum: 'TerrainUsage', default: null },
  { model: 'LandLeaseInfo', field: 'periodicity', enum: 'Periodicite', default: 'MENSUEL' },
  { model: 'LocataireProfilPublic', field: 'visibilite', enum: 'VisibEnum', default: 'INVISIBLE' },
  { model: 'InvitationBail', field: 'statut', enum: 'InvitStatutEnum', default: 'ENVOYEE' },
  { model: 'Lease', field: 'modeUtilities', enum: 'UtilityMode', default: 'NON_APPLICABLE' },
  { model: 'Lease', field: 'modeleRepartition', enum: 'RepartitionModel', default: 'PRORATA_CHAMBRE' },
  { model: 'FactureUtility', field: 'typeUtility', enum: 'UtilityType', default: null },
  { model: 'TicketMaintenance', field: 'statut', enum: 'MaintenanceStatus', default: 'EN_ATTENTE' },
  { model: 'TicketMaintenance', field: 'categorie', enum: 'MaintenanceCategory', default: null },
  { model: 'Inspection', field: 'type', enum: 'InspectionType', default: null },
  { model: 'InspectionRoom', field: 'status', enum: 'RoomStatus', default: 'GOOD' },
  { model: 'ReminderLog', field: 'type', enum: 'ReminderType', default: null },
  { model: 'PropertyAccess', field: 'profil', enum: 'ProfilInterm', default: null },
  { model: 'AgencesRegularisation', field: 'statut', enum: 'RegStatut', default: 'EN_COURS' },
  { model: 'SmsDeclaration', field: 'statut', enum: 'DeclStatut', default: 'EN_ATTENTE' },
  // { model: 'CodePromo', field: 'typeRemise', enum: 'PromoType' },
  { model: 'TarifNegocie', field: 'type', enum: 'NegocieType', default: null },
  { model: 'SignalementLocataire', field: 'categorie', enum: 'SignalCatEnum', default: null },
  { model: 'SignalementLocataire', field: 'statut', enum: 'SignalStatutEnum', default: 'ENVOYE' },
  { model: 'PreavisBail', field: 'statut', enum: 'PreavisStatutEnum', default: 'EMIS' },
  { model: 'EtatsDesLieux', field: 'statut', enum: 'EdlStatut', default: 'EN_COURS' },
  { model: 'ChampionProspect', field: 'statut', enum: 'ProspectStatut', default: 'A_RAPPELER' },
  // Add other known fixes
];

// Helper to replace inside a specific block
function replaceInModel(schemaContent, modelName, replacer) {
  const modelRegex = new RegExp(`(model\\s+${modelName}\\s+\\{)([\\s\\S]*?)(\\})`, 'g');
  return schemaContent.replace(modelRegex, (match, start, block, end) => {
    return start + replacer(block) + end;
  });
}

// 1. BailDeclaratif.hashDeclaration
schema = replaceInModel(schema, 'BailDeclaratif', block => {
  return block.replace(/hashDeclaration\s+String\s+@map\("hash_declaration"\)/, 'hashDeclaration String? @map("hash_declaration")');
});

// 2. ColocPayment phantom key
schema = replaceInModel(schema, 'ColocPayment', block => {
  if (!block.includes('lease         Lease')) {
    return block.replace(/leaseId\s+String\s+@map\("bail_id"\)/, 'leaseId       String      @map("bail_id")\n  lease         Lease       @relation(fields: [leaseId], references: [id])');
  }
  return block;
});

// 3. MandateHistory phantom key
schema = replaceInModel(schema, 'MandateHistory', block => {
  if (!block.includes('property         Property')) {
    return block.replace(/propertyId\s+String\s+@map\("property_id"\)/, 'propertyId       String    @map("property_id")\n  property         Property  @relation(fields: [propertyId], references: [id])');
  }
  return block;
});

// 4. WalletTransaction phantom key
schema = replaceInModel(schema, 'WalletTransaction', block => {
  if (!block.includes('user      User')) {
    return block.replace(/userId\s+String\s+@map\("user_id"\)/, 'userId    String   @map("user_id")\n  user      User     @relation(fields: [userId], references: [id])');
  }
  return block;
});

// 5. ReversalStatus SUCCESS inside schema (globally outside blocks)
schema = schema.replace(
  /enum ReversalStatus \{\n\s*PENDING\n\s*REVERSED\n\s*FAILED\n\}/g,
  'enum ReversalStatus {\n  PENDING\n  REVERSED\n  FAILED\n  SUCCESS\n}'
);

schema = replaceInModel(schema, 'ReversalTransaction', block => {
  return block.replace(/status\s+String\s+@default\("SUCCESS"\)/, 'status       ReversalStatus @default(SUCCESS)');
});

schema = replaceInModel(schema, 'PaymentPgw', block => {
  return block.replace(/reversalStatus\s+String\s+@default\("PENDING"\)/, 'reversalStatus   ReversalStatus  @default(PENDING)');
});

// 6. Apply Enum replacements
mappings.forEach(m => {
  schema = replaceInModel(schema, m.model, block => {
    const escapedField = m.field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    if (m.default !== null && m.default !== undefined) {
      // replace `field String        @default("val")`
      const regex = new RegExp(`(${escapedField}\\s+)String(\\s+)@default\\("${m.default}"\\)`, 'g');
      return block.replace(regex, `$1${m.enum}$2@default(${m.default})`);
    } else {
      // replace `field String`
      const regex = new RegExp(`(${escapedField}\\s+)String(\\s|@)`, 'g');
      return block.replace(regex, `$1${m.enum}$2`);
    }
  });
});

// Add some extra generic enum mapping logic for any missed cases by looking specifically for String @default("ENUM_VAL") exactly when the values map 1:1
// Let's do this manually instead of generically to be safe

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Done refactoring enums and bugs.');
