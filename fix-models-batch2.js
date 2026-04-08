const fs = require('fs');

let lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');

const applyBlockReplace = (modelName, replacer) => {
  let startIndex = -1;
  let endIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(new RegExp(`^model\\s+${modelName}\\s+\\{`))) startIndex = i;
    else if (startIndex !== -1 && lines[i].match(/^\}/)) {
      endIndex = i;
      break;
    }
  }
  if (startIndex !== -1 && endIndex !== -1) {
    let block = lines.slice(startIndex, endIndex + 1).join('\n');
    block = replacer(block);
    lines.splice(startIndex, endIndex - startIndex + 1, ...block.split('\n'));
  }
};

// C-01 Notification
applyBlockReplace('Notification', block => {
  if (!block.includes('updatedAt DateTime')) {
    block = block.replace(/createdAt\s+DateTime\s+@default\(now\(\)\)\s+@map\("created_at"\)/, 'createdAt DateTime @default(now()) @map("created_at")\n  updatedAt DateTime @updatedAt @map("updated_at")');
  }
  if (!block.includes('@@index([userId, createdAt(sort: Desc)])')) {
    block = block.replace(/@@map\("notifications"\)/, '@@index([userId, createdAt(sort: Desc)])\n  @@index([status])\n  @@map("notifications")');
  }
  return block;
});

// C-03 Inspection
applyBlockReplace('Inspection', block => {
  return block.replace(/status\s+String\s+@default\("PLANIFIEE"\)\s+\/\/\s*PLANIFIEE\|EN_COURS\|TERMINEE/, 'status       InspectionStatus @default(PLANIFIEE)');
});

// C-04 PaymentPgw
applyBlockReplace('PaymentPgw', block => {
  return block.replace(/reversalStatus\s+ReversalStatus\s+@default\(PENDING\)/, 'reversalStatus   ReversalStatus  @default(NONE)');
});

// C-05 FactureUtility
applyBlockReplace('FactureUtility', block => {
  return block.replace(/moisFacture\s+DateTime\s+@map\("mois_facture"\)/, 'moisFacture         String        @map("mois_facture")');
});

// S-01 Property
applyBlockReplace('Property', block => {
  return block.replace(/.*areaSqm\s+Float\?.*\n/g, '');
});

// S-02 Lease
applyBlockReplace('Lease', block => {
  return block.replace(/\s*@@index\(\[status\]\)\s*\n/g, '\n');
});

// S-03 AuditLog
applyBlockReplace('AuditLog', block => {
  if (!block.includes('@@index([userId, createdAt(sort: Desc)])')) {
    block = block.replace(/@@index\(\[userId\]\)/, '@@index([userId, createdAt(sort: Desc)])\n  @@index([module, createdAt(sort: Desc)])\n  @@index([entityId])');
  }
  return block;
});

// S-04 ProcedurePhase
applyBlockReplace('ProcedurePhase', block => {
  if (!block.includes('@@index([leaseId])')) {
    block = block.replace(/@@map\("procedure_phases"\)/, '@@index([leaseId])\n  @@map("procedure_phases")');
  }
  return block;
});

// S-05 & M-01 ChampionCommission
applyBlockReplace('ChampionCommission', block => {
  block = block.replace(/statut\s+String\s+@default\("EN_ATTENTE"\)/, 'statut       CommissionStatut @default(EN_ATTENTE)');
  if (!block.includes('updatedAt')) {
    block = block.replace(/createdAt\s+DateTime\s+@default\(now\(\)\)\s+@map\("created_at"\)/, 'createdAt    DateTime @default(now()) @map("created_at")\n  updatedAt    DateTime @updatedAt @map("updated_at")');
  }
  return block;
});

// M-02 Prestataire
applyBlockReplace('Prestataire', block => {
  if (!block.includes('updatedAt')) {
    block = block.replace(/createdAt\s+DateTime\s+@default\(now\(\)\)\s+@map\("created_at"\)/, 'createdAt DateTime @default(now()) @map("created_at")\n  updatedAt DateTime @updatedAt @map("updated_at")');
  }
  return block;
});

// M-03 InvitationBail
applyBlockReplace('InvitationBail', block => {
  return block.replace(/expireAt\s+DateTime\s+@default\(now\(\)\)\s+@map\("expire_at"\)/, 'expireAt DateTime @map("expire_at")');
});

// M-06 MessagerieBail
applyBlockReplace('MessagerieBail', block => {
  return block.replace(/statut\s+String\s+@default\("ENVOYÉ"\)/, 'statut String @default("ENVOYE")');
});

// S-08 Lease camelCase @map to snake_case
applyBlockReplace('Lease', block => {
  block = block.replace(/@map\("sha256Hash"\)/, '@map("sha256_hash")');
  block = block.replace(/@map\("sha256CalculeLe"\)/, '@map("sha256_calcule_le")');
  block = block.replace(/@map\("qrCodeUrl"\)/, '@map("qr_code_url")');
  block = block.replace(/@map\("statutDraft"\)/, '@map("statut_draft")');
  block = block.replace(/@map\("versionDraft"\)/, '@map("version_draft")');
  block = block.replace(/@map\("draftData"\)/, '@map("draft_data")');
  block = block.replace(/@map\("loiApplicable"\)/, '@map("loi_applicable")');
  block = block.replace(/@map\("droitsDgiCalcules"\)/, '@map("droits_dgi_calcules")');
  block = block.replace(/@map\("fraisQapril"\)/, '@map("frais_qapril")');
  block = block.replace(/@map\("alerte90j"\)/, '@map("alerte_90j")');
  block = block.replace(/@map\("alerte60j"\)/, '@map("alerte_60j")');
  block = block.replace(/@map\("alerte30j"\)/, '@map("alerte_30j")');
  block = block.replace(/@map\("seuilJ3"\)/, '@map("seuil_j3")');
  block = block.replace(/@map\("seuilJ7"\)/, '@map("seuil_j7")');
  block = block.replace(/@map\("seuilJ15"\)/, '@map("seuil_j15")');
  return block;
});

// S-09 Receipt camelCase @map to snake_case
applyBlockReplace('Receipt', block => {
  block = block.replace(/@map\("sha256Hash"\)/, '@map("sha256_hash")');
  block = block.replace(/@map\("sha256CalculeLe"\)/, '@map("sha256_calcule_le")');
  block = block.replace(/@map\("qrCodeUrl"\)/, '@map("qr_code_url")');
  block = block.replace(/@map\("moisConcerne"\)/, '@map("mois_concerne")');
  block = block.replace(/@map\("dateEncaissement"\)/, '@map("date_encaissement")');
  block = block.replace(/@map\("flagWebhookNonRecu"\)/, '@map("flag_webhook_non_recu")');
  block = block.replace(/@map\("preuveUrl"\)/, '@map("preuve_url")');
  block = block.replace(/@map\("arcDemande"\)/, '@map("arc_demande")');
  block = block.replace(/@map\("arcCertificationId"\)/, '@map("arc_certification_id")');
  block = block.replace(/@map\("arcHorodatage"\)/, '@map("arc_horodatage")');
  block = block.replace(/@map\("commentaireInterne"\)/, '@map("commentaire_interne")');
  return block;
});

// S-06 MandatGestion.biensConcernes -> Join Table Solution A
let joinTableCode = `
model MandatGestionBien {
  id             String        @id @default(uuid())
  mandatId       String        @map("mandat_id")
  mandat         MandatGestion @relation(fields: [mandatId], references: [id], onDelete: Cascade)
  propertyId     String        @map("property_id")
  property       Property      @relation(fields: [propertyId], references: [id])

  @@unique([mandatId, propertyId])
  @@map("mandats_gestion_biens")
}
`;

applyBlockReplace('MandatGestion', block => {
  return block.replace(/biensConcernes\s+String\[\]\s+@map\("biens_concernes"\)/, 'biens MandatGestionBien[]');
});
applyBlockReplace('Property', block => {
  if (!block.includes('mandatsGestion')) {
    return block.replace(/\}\s*$/, '  mandatsGestion MandatGestionBien[]\n}');
  }
  return block;
});

let finalSchema = lines.join('\n');
if (!finalSchema.includes('model MandatGestionBien')) {
  finalSchema = finalSchema + '\n' + joinTableCode;
}

fs.writeFileSync('prisma/schema.prisma', finalSchema);
console.log('Finished updating models batch 2.');
