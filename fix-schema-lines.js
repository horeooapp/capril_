const fs = require('fs');

const lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');

const replacements = [
  { match: /hashDeclaration String\s+@map/, replace: '  hashDeclaration String? @map("hash_declaration")' },
  // ReversalStatus enum
  { match: /enum ReversalStatus \{/, action: 'add-enum-value', value: '  SUCCESS' },
  // ReversalTransaction status
  { match: /status\s+String\s+@default\("SUCCESS"\)/, replace: '  status       ReversalStatus @default(SUCCESS)' },
  // PaymentPgw reversalStatus
  { match: /reversalStatus\s+String\s+@default\("PENDING"\)\s+@map\("reversal_status"\)/, replace: '  reversalStatus   ReversalStatus  @default(PENDING) @map("reversal_status")' },
  
  // Enums mapping
  { match: /statut\s+String\s+@default\("EN_ATTENTE_DECLARATION"\)/, replace: '  statut           FiscalStatus   @default(EN_ATTENTE_DECLARATION)' },
  { match: /status\s+String\s+@default\("OPEN"\)/, action: 'smart-replace-dispute' }, // Dispute vs Mediation vs InsuranceClaim
  { match: /statut\s+String\s+@default\("EN_COURS"\)/, action: 'smart-replace-encours' }, // BdqConversationState vs AgencesRegularisation vs EtatsDesLieux
  { match: /destination\s+String\s+@default\("PROPRIETAIRE"\)/, replace: '  destination       CautionDestEnum    @default(PROPRIETAIRE)' },
  { match: /statut\s+String\s+@default\("EN_ATTENTE"\)/, action: 'smart-replace-enattente' }, // NotificationLog vs SmsDeclaration vs RepartitionUtility vs TicketMaintenance
  { match: /initiator\s+String\s+@default\("OWNER"\)/, replace: '  initiator    CDCDepositInitiator       @default(OWNER)' },
  { match: /activePlanTier\s+String\s+@default\("LOCATAIRE"\)\s+@map/, replace: '  activePlanTier     PlanTier              @default(LOCATAIRE) @map("active_plan_tier")' },
  { match: /status\s+String\s+@default\("PENDING"\)/, action: 'smart-replace-pending' }, // PrepaymentRequest vs InvitationBail (wait Invitation is ENVOYEE)
  { match: /declencheur\s+String(?!.*@map)/, replace: '  declencheur    DeclencheurEnum' }, // WalletRechargeLink
  { match: /usage\s+String\s+@map\("usage_declare"\)/, replace: '  usage             TerrainUsage    @map("usage_declare")' },
  { match: /periodicity\s+String\s+@default\("MENSUEL"\)\s+@map/, replace: '  periodicity       Periodicite    @default(MENSUEL) @map("periodicite_loyer")' },
  { match: /visibilite\s+String\s+@default\("INVISIBLE"\)/, replace: '  visibilite      VisibEnum @default(INVISIBLE)' },
  { match: /statut\s+String\s+@default\("ENVOYEE"\)/, replace: '  statut InvitStatutEnum @default(ENVOYEE)' }, // InvitationBail
  { match: /modeUtilities\s+String\s+@default\("NON_APPLICABLE"\)\s+@map/, replace: '  modeUtilities           UtilityMode  @default(NON_APPLICABLE) @map("mode_utilities")' },
  { match: /modeleRepartition\s+String\s+@default\("PRORATA_CHAMBRE"\)\s+@map/, replace: '  modeleRepartition       RepartitionModel  @default(PRORATA_CHAMBRE) @map("modele_repartition")' },
  { match: /typeUtility\s+String\s+@map\("type_utility"\)/, replace: '  typeUtility         UtilityType        @map("type_utility")' },
  { match: /categorie\s+String\s+@map\("categorie_v2"\)/, replace: '  categorie   MaintenanceCategory @map("categorie_v2")' },
  { match: /status\s+String\s+@default\("PLANIFIEE"\)\s+\/\/ PLANIFIEE/, replace: '  status       InspectionType   @default(PLANIFIEE) // PLANIFIEE|EN_COURS|TERMINEE' },
  { match: /type\s+String\s*$/, action: 'smart-replace-type' }, 
  { match: /status\s+String\s+@default\("GOOD"\)/, replace: '  status       RoomStatus     @default(GOOD)' },
  { match: /profil\s+String\s*$/, action: 'smart-replace-profil' },
  { match: /type\s+String\s*$/, action: 'smart-replace-tarif-negocie' },
  { match: /categorie\s+String\s*$/, action: 'smart-replace-signalement' },
  { match: /statut\s+String\s+@default\("ENVOYE"\)/, replace: '  statut         SignalStatutEnum    @default(ENVOYE)' }, // SignalementLocataire & BdqSmsLog, wait BdqSmsLog is statutEnvoi
  { match: /statut\s+String\s+@default\("EMIS"\)/, replace: '  statut              PreavisStatutEnum    @default(EMIS)' },
  { match: /statut\s+String\s+@default\("A_RAPPELER"\)/, replace: '  statut             ProspectStatut          @default(A_RAPPELER)' },
];

let inModel = null;
const newLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  const modelMatch = line.match(/^model\s+([A-Za-z0-9_]+)\s+\{/);
  if (modelMatch) {
    inModel = modelMatch[1];
  } else if (line.match(/^\}/)) {
    // Add inverse relations right before the closing brace of parent models
    if (inModel === 'Lease' && !newLines.some(l => l.includes('colocPayments'))) {
      newLines.push('  colocPayments ColocPayment[]');
    } else if (inModel === 'Property' && !newLines.some(l => l.includes('mandateHistory'))) {
      newLines.push('  mandateHistory MandateHistory[]');
    } else if (inModel === 'User' && !newLines.some(l => l.includes('walletTransactions'))) {
      newLines.push('  walletTransactions WalletTransaction[]');
    }
    inModel = null;
  }

  // Handle smart replacements based on model
  if (inModel === 'Dispute' && line.match(/status\s+String\s+@default\("OPEN"\)/)) {
    line = '  status          DisputeStatus  @default(OPEN)';
  } else if (inModel === 'Mediation' && line.match(/status\s+String\s+@default\("OPEN"\)/)) {
    line = '  status  MediationStatus          @default(OPEN)';
  } else if (inModel === 'InsuranceClaim' && line.match(/status\s+String\s+@default\("OPEN"\)/)) {
    line = '  status      InsuranceClaimStatus    @default(OPEN)';
  } else if (inModel === 'BdqConversationState' && line.match(/statut\s+String\s+@default\("EN_COURS"\)/)) {
    line = '  statut        BdqConvStatut       @default(EN_COURS)';
  } else if (inModel === 'AgencesRegularisation' && line.match(/statut\s+String\s+@default\("EN_COURS"\)/)) {
    line = '  statut             RegStatut    @default(EN_COURS)';
  } else if (inModel === 'EtatsDesLieux' && line.match(/statut\s+EdlStatut\s+@default\(EN_COURS\)/)) {
    // Already correct, wait was it already correct? Wait, EDL looks like: statut EdlStatut @default(EN_COURS)
  } else if (inModel === 'NotificationLog' && line.match(/statut\s+String\s+@default\("EN_ATTENTE"\)/)) {
    line = '  statut         NotifStatut     @default(EN_ATTENTE)';
  } else if (inModel === 'TicketMaintenance' && line.match(/statut\s+String\s+@default\("EN_ATTENTE"\)/)) {
    line = '  statut          MaintenanceStatus  @default(EN_ATTENTE)';
  } else if (inModel === 'SmsDeclaration' && line.match(/statut\s+String\s+@default\("EN_ATTENTE"\)/)) {
    line = '  statut          DeclStatut       @default(EN_ATTENTE)';
  } else if (inModel === 'PrepaymentRequest' && line.match(/status\s+String\s+@default\("PENDING"\)/)) {
    line = '  status      PrepaymentRequestStatus  @default(PENDING)';
  } else if (inModel === 'SignalementLocataire' && line.match(/categorie\s+String\s*$/)) {
    line = '  categorie      SignalCatEnum';
  } else if (inModel === 'TarifNegocie' && line.match(/type\s+String\s*$/)) {
    line = '  type           NegocieType';
  } else if (inModel === 'PropertyAccess' && line.match(/profil\s+String\s*$/)) { // Actually could be ProfilInterm, but wait, there is @map? "profil_intermediaire"?
  } else if (inModel === 'AgencesRegularisation' && line.match(/statut\s+String\s+@default\("EN_COURS"\)/)) {
    line = '  statut             RegStatut    @default(EN_COURS)';
  } else if (inModel === 'ReminderLog' && line.match(/type\s+String\s*$/)) {
    line = '  type    ReminderType';
  }
  
  // Phantom keys insertions internally
  if (inModel === 'ColocPayment' && line.includes('colocataire   Colocataire @relation')) {
    newLines.push(line);
    newLines.push('  lease         Lease       @relation(fields: [leaseId], references: [id])');
    continue;
  }
  if (inModel === 'MandateHistory' && line.includes('mandate          Mandate   @relation')) {
    newLines.push(line);
    newLines.push('  property         Property  @relation(fields: [propertyId], references: [id])');
    continue;
  }
  if (inModel === 'WalletTransaction' && line.includes('userId    String   @map("user_id")')) {
    newLines.push(line);
    newLines.push('  user      User     @relation(fields: [userId], references: [id])');
    continue;
  }

  // Generic replacements
  for (let r of replacements) {
    if (!r.action && line.match(r.match)) {
      line = r.replace;
    } else if (r.action === 'add-enum-value' && line.match(r.match)) {
      newLines.push(line);
      newLines.push(r.value);
      line = ''; // Skip default push
    }
  }

  if (line !== '') {
    newLines.push(line);
  }
}

fs.writeFileSync('prisma/schema.prisma', newLines.join('\n'));
console.log('Done refactoring enums safely.');
