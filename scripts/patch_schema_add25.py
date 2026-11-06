# scripts/patch_schema_add25.py
import re

def patch_schema():
    with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Role enum to include NOTAIRE if not present
    if 'NOTAIRE' not in content:
        content = content.replace('  NON_CERTIFIED_AGENT\n}', '  NON_CERTIFIED_AGENT\n  NOTAIRE\n}')
        print('Added NOTAIRE to enum Role.')

    # 2. Add sales fields to model Property
    prop_needle = '  syndicateId                String?               @map("syndicate_id")\n'
    new_prop_fields = '''  // ADD-25: Vente de biens bâtis et terrains
  categorieVente             String?               @map("categorie_vente")
  titreType                  String?               @map("titre_type")
  titreNumero                String?               @map("titre_numero")
  titreDate                  DateTime?             @map("titre_date")
  numeroLot                  String?               @map("numero_lot")
  numeroIlot                 String?               @map("numero_ilot")
  planBornageUrl             String?               @map("plan_bornage_url")
  coordonneesGpsBornes       Json?                 @map("coordonnees_gps_bornes")
  servitudesDeclarees        String?               @map("servitudes_declarees")
  viabilisationEau           Boolean               @default(false) @map("viabilisation_eau")
  viabilisationElectricite   Boolean               @default(false) @map("viabilisation_electricite")
  viabilisationVoirie        Boolean               @default(false) @map("viabilisation_voirie")
  niveauVerifVente           Int                   @default(0) @map("niveau_verif_vente")
  isBienVerifie              Boolean               @default(false) @map("is_bien_verifie")
  titreSecuriteJuridique     String?               @map("titre_securite_juridique")
'''
    if 'categorieVente' not in content:
        if prop_needle in content:
            content = content.replace(prop_needle, prop_needle + new_prop_fields)
            print('Added sales fields to Property.')
        else:
            print('Could not find prop_needle!')

    # 3. Add relations to model Property
    rel_needle = '  vaultCautions              VaultCaution[]\n'
    new_prop_rels = '''  // ADD-25: Relations vente
  titreIndex                 TitresIndex?
  mandatsVente               MandatVente[]
  annoncesVente              AnnonceVente[]
  visitesVente               VisiteVente[]
  offresAchat                OffreAchat[]
  compromisVente             CompromisVente[]
  transactionsVente          TransactionVente[]
  signauxFraudeVente         SignalFraudeVente[]
'''
    if 'titreIndex' not in content:
        if rel_needle in content:
            content = content.replace(rel_needle, rel_needle + new_prop_rels)
            print('Added sales relations to Property.')
        else:
            print('Could not find rel_needle!')

    # 4. Append new models at the bottom
    models_block = '''
// ==============================================================================
// ADD-25: MODULE TRANSACTIONS & VENTES (Règles RG-VTE-01 à RG-VTE-26)
// ==============================================================================

model TitresIndex {
  id                      String    @id @default(uuid()) @map("titre_index_id")
  titreType               String    @map("titre_type")
  titreNumero             String    @map("titre_numero")
  commune                 String
  propertyId              String    @unique @map("property_id")
  statut                  String    @default("ACTIF")
  niveauSecuriteJuridique String    @default("ETAPE_ACD") @map("niveau_securite_juridique")
  enregistreParUserId     String?   @map("enregistre_par_user_id")
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  property                Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@unique([titreType, titreNumero, commune], name: "titre_unique_par_commune")
  @@index([titreNumero])
  @@index([commune])
  @@map("titres_index")
}

model MandatVente {
  id                    String              @id @default(uuid()) @map("mandat_vente_id")
  numeroMandat          String              @unique @map("numero_mandat")
  propertyId            String              @map("property_id")
  agencyId              String?             @map("agency_id")
  agentUserId           String              @map("agent_user_id")
  vendeurUserId         String              @map("vendeur_user_id")
  vendeurCodeMasque     String              @map("vendeur_code_masque")
  typeMandat            String              @default("EXCLUSIF") @map("type_mandat")
  prixPresentationFcfa  Float               @map("prix_presentation_fcfa")
  tauxCommissionPct     Float?              @map("taux_commission_pct")
  montantCommissionFixe Float?              @map("montant_commission_fixe")
  commissionCharge      String              @default("VENDEUR") @map("commission_charge")
  dateDebut             DateTime            @map("date_debut")
  dateFin               DateTime            @map("date_fin")
  statut                String              @default("ACTIF")
  conditionsVisite      String?             @map("conditions_visite")
  obligationsAgence     String?             @map("obligations_agence")
  sha256Contrat         String?             @map("sha256_contrat")
  signedAt              DateTime?           @map("signed_at")
  urlDocumentGed        String?             @map("url_document_ged")
  createdAt             DateTime            @default(now()) @map("created_at")
  updatedAt             DateTime            @updatedAt @map("updated_at")

  property              Property            @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  annonces              AnnonceVente[]
  offres                OffreAchat[]
  compromis             CompromisVente[]
  transactions          TransactionVente[]

  @@index([propertyId])
  @@index([agentUserId])
  @@index([vendeurUserId])
  @@index([agencyId])
  @@index([statut])
  @@map("mandats_vente")
}

model AnnonceVente {
  id                String       @id @default(uuid()) @map("annonce_vente_id")
  referenceAnnonce  String       @unique @map("reference_annonce")
  propertyId        String       @map("property_id")
  mandatId          String       @map("mandat_id")
  agencyId          String?      @map("agency_id")
  titreAnnonce      String       @map("titre_annonce")
  description       String
  prixFcfa          Float        @map("prix_fcfa")
  estNegociable     Boolean      @default(false) @map("est_negociable")
  niveauVerif       Int          @default(2) @map("niveau_verif")
  badgeVerifie      Boolean      @default(false) @map("badge_verifie")
  natureTitreClair  String       @map("nature_titre_clair")
  statut            String       @default("PUBLIE")
  photosHorodatees  Json?        @map("photos_horodatees")
  vuesCount         Int          @default(0) @map("vues_count")
  publishedAt       DateTime?    @default(now()) @map("published_at")
  createdAt         DateTime     @default(now()) @map("created_at")
  updatedAt         DateTime     @updatedAt @map("updated_at")

  property          Property     @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  mandat            MandatVente  @relation(fields: [mandatId], references: [id], onDelete: Cascade)

  @@index([propertyId])
  @@index([mandatId])
  @@index([agencyId])
  @@index([statut])
  @@map("annonces_vente")
}

model ProfilAcquereur {
  id                    String    @id @default(uuid()) @map("profil_acquereur_id")
  userId                String    @map("user_id")
  typeBienRecherche     String[]  @map("type_bien_recherche")
  communesRecherchees   String[]  @map("communes_recherchees")
  budgetMinFcfa         Float?    @map("budget_min_fcfa")
  budgetMaxFcfa         Float     @map("budget_max_fcfa")
  typeFinancement       String    @default("FONDS_PROPRES") @map("type_financement")
  horizonAchat          String?   @map("horizon_achat")
  identiteVerifiee      Boolean   @default(false) @map("identite_verifiee")
  financementDocumente  Boolean   @default(false) @map("financement_documente")
  statut                String    @default("ACTIF")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  @@index([userId])
  @@index([statut])
  @@map("profils_acquereurs")
}

model VisiteVente {
  id                String       @id @default(uuid()) @map("visite_vente_id")
  referenceVisite   String       @unique @map("reference_visite")
  propertyId        String       @map("property_id")
  acquereurUserId   String       @map("acquereur_user_id")
  agentUserId       String       @map("agent_user_id")
  datePrevue        DateTime     @map("date_prevue")
  dateRealisee      DateTime?    @map("date_realisee")
  gpsRealisation    Json?        @map("gps_realisation")
  compteRendu       String?      @map("compte_rendu")
  statut            String       @default("DEMANDEE")
  createdAt         DateTime     @default(now()) @map("created_at")
  updatedAt         DateTime     @updatedAt @map("updated_at")

  property          Property     @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
  @@index([acquereurUserId])
  @@index([agentUserId])
  @@index([statut])
  @@map("visites_vente")
}

model OffreAchat {
  id                            String           @id @default(uuid()) @map("offre_achat_id")
  referenceOffre                String           @unique @map("reference_offre")
  propertyId                    String           @map("property_id")
  mandatId                      String           @map("mandat_id")
  acquereurUserId               String           @map("acquereur_user_id")
  montantOffreFcfa              Float            @map("montant_offre_fcfa")
  conditionsFinancement         String           @map("conditions_financement")
  conditionsSuspensives         String?          @map("conditions_suspensives")
  validiteJours                 Int              @default(7) @map("validite_jours")
  dateExpiration                DateTime         @map("date_expiration")
  statut                        String           @default("EN_ATTENTE")
  montantContrePropositionFcfa  Float?           @map("montant_contre_proposition_fcfa")
  motifRefus                    String?          @map("motif_refus")
  horodatageCreation            DateTime         @default(now()) @map("horodatage_creation")
  reponseAt                     DateTime?        @map("reponse_at")
  createdAt                     DateTime         @default(now()) @map("created_at")
  updatedAt                     DateTime         @updatedAt @map("updated_at")

  property                      Property         @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  mandat                        MandatVente      @relation(fields: [mandatId], references: [id], onDelete: Cascade)
  compromis                     CompromisVente?

  @@index([propertyId])
  @@index([mandatId])
  @@index([acquereurUserId])
  @@index([statut])
  @@map("offres_achat")
}

model Notaire {
  id              String            @id @default(uuid()) @map("notaire_id")
  nomEtude        String            @map("nom_etude")
  titulaire       String
  commune         String
  adresse         String
  telephone       String
  email           String
  /// RG-VTE-16: Compte séquestre officiel de l'étude notariale. QAPRIL n'encaisse jamais ces fonds.
  ribEtude        String            @map("rib_etude")
  compteUserId    String?           @map("compte_user_id")
  estAgreeQapril  Boolean           @default(true) @map("est_agree_qapril")
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  compromis       CompromisVente[]
  transactions    TransactionVente[]

  @@index([commune])
  @@index([email])
  @@map("notaires")
}

model CompromisVente {
  id                      String            @id @default(uuid()) @map("compromis_vente_id")
  referenceCompromis      String            @unique @map("reference_compromis")
  propertyId              String            @map("property_id")
  mandatId                String            @map("mandat_id")
  offreId                 String            @unique @map("offre_id")
  notaireId               String            @map("notaire_id")
  prixVenteFcfa           Float             @map("prix_vente_fcfa")
  montantArrhesFcfa       Float?            @map("montant_arrhes_fcfa")
  conditionsSuspensives   String[]          @map("conditions_suspensives")
  delaiReiterationJours   Int               @default(90) @map("delai_reiteration_jours")
  dateLimiteReiteration   DateTime          @map("date_limite_reiteration")
  origineDocument         String            @default("QAPRIL_AUTO") @map("origine_document")
  urlDocumentGed          String?           @map("url_document_ged")
  sha256Contrat           String?           @map("sha256_contrat")
  statut                  String            @default("BROUILLON")
  signedAt                DateTime?         @map("signed_at")
  createdAt               DateTime          @default(now()) @map("created_at")
  updatedAt               DateTime          @updatedAt @map("updated_at")

  property                Property          @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  mandat                  MandatVente       @relation(fields: [mandatId], references: [id], onDelete: Cascade)
  offre                   OffreAchat        @relation(fields: [offreId], references: [id], onDelete: Cascade)
  notaire                 Notaire           @relation(fields: [notaireId], references: [id])
  transactions            TransactionVente[]

  @@index([propertyId])
  @@index([mandatId])
  @@index([notaireId])
  @@index([statut])
  @@map("compromis_vente")
}

model TransactionVente {
  id                                String          @id @default(uuid()) @map("transaction_vente_id")
  referenceTransaction              String          @unique @map("reference_transaction")
  propertyId                        String          @map("property_id")
  mandatId                          String          @map("mandat_id")
  compromisId                       String?         @map("compromis_id")
  notaireId                         String?         @map("notaire_id")
  acquereurUserId                   String          @map("acquereur_user_id")
  vendeurUserId                     String          @map("vendeur_user_id")
  agencyId                          String?         @map("agency_id")
  prixFinalFcfa                     Float           @map("prix_final_fcfa")
  droitsMutationEstimesFcfa         Float           @default(0) @map("droits_mutation_estimes_fcfa")
  fraisNotaireEstimesFcfa           Float           @default(0) @map("frais_notaire_estimes_fcfa")
  fraisConservationEstimesFcfa      Float           @default(0) @map("frais_conservation_estimes_fcfa")
  commissionAgenceFcfa              Float           @default(0) @map("commission_agence_fcfa")
  commissionStatutFacturation       String          @default("NON_FACTUREE") @map("commission_statut_facturation")
  lienDossierNotaireHmac            String?         @map("lien_dossier_notaire_hmac")
  lienDossierExpiresAt              DateTime?       @map("lien_dossier_expires_at")
  statutPipeline                    String          @default("MANDAT") @map("statut_pipeline")
  dateEtapePrevisionnelleSuivante   DateTime?       @map("date_etape_previsionnelle_suivante")
  dateSignatureActe                 DateTime?       @map("date_signature_acte")
  numeroEnregistrementDgi           String?         @map("numero_enregistrement_dgi")
  quittanceDgiUrl                   String?         @map("quittance_dgi_url")
  dateEnregistrementDgi             DateTime?       @map("date_enregistrement_dgi")
  auditLogId                        String?         @map("audit_log_id")
  createdAt                         DateTime        @default(now()) @map("created_at")
  updatedAt                         DateTime        @updatedAt @map("updated_at")

  property                          Property        @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  mandat                            MandatVente     @relation(fields: [mandatId], references: [id], onDelete: Cascade)
  compromis                         CompromisVente? @relation(fields: [compromisId], references: [id])
  notaire                           Notaire?        @relation(fields: [notaireId], references: [id])

  @@index([propertyId])
  @@index([mandatId])
  @@index([notaireId])
  @@index([acquereurUserId])
  @@index([vendeurUserId])
  @@index([statutPipeline])
  @@map("transactions_vente")
}

model SignalFraudeVente {
  id              String       @id @default(uuid()) @map("signal_fraude_id")
  referenceSignal String       @unique @map("reference_signal")
  propertyId      String?      @map("property_id")
  titreNumero     String?      @map("titre_numero")
  typeSignal      String       @map("type_signal")
  description     String
  scoreGravite    Int          @default(1) @map("score_gravite")
  actionPrise     String       @default("ALERTE_EMISE") @map("action_prise")
  dateDetection   DateTime     @default(now()) @map("date_detection")
  resolu          Boolean      @default(false)
  motifResolution String?      @map("motif_resolution")

  property        Property?    @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
  @@index([titreNumero])
  @@index([scoreGravite])
  @@map("signaux_fraude_vente")
}
'''

    if 'model TitresIndex' not in content:
        content = content + '\n' + models_block
        print('Appended ADD-25 models.')

    with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
        f.write(content)

    print('Updated prisma/schema.prisma successfully!')

if __name__ == '__main__':
    patch_schema()

