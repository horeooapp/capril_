// ═══════════════════════════════════════════════════════════════
// QAPRIL — Types TypeScript (Next.js / Prisma Achille)
// Noms compatibles avec le schema.prisma d'Achille :
//   Lease    = Bail
//   Receipt  = Quittance
//   Property = Bien / Propriété
// ═══════════════════════════════════════════════════════════════

// ── Enums ─────────────────────────────────────────────────────

export type TypePropriete = 'IMMEUBLE' | 'COUR' | 'RESIDENCE';

export type StatutLease =
  | 'DRAFT'
  | 'EN_ATTENTE_SIGNATURE'
  | 'ACTIF'
  | 'RESILIE'
  | 'EXPIRE';

export type StatutReceipt =
  | 'PENDING'    // EN_ATTENTE dans notre CDC
  | 'PAID'       // PAYEE
  | 'OVERDUE'    // EN_RETARD
  | 'CANCELLED'; // ANNULEE

export type ModePaiement =
  | 'WAVE'
  | 'ORANGE_MONEY'
  | 'MTN_MONEY'
  | 'ESPECES'
  | 'VIREMENT';

export type JourEcheance = 1 | 5 | 15;

export type TypePieceIdentite =
  | 'CNI_CI'
  | 'PASSEPORT'
  | 'TITRE_SEJOUR'
  | 'CARTE_CONSULAIRE'
  | 'ATTESTATION_IDENTITE'
  | 'RECEPISSE_OFPRA'
  | 'LAISSEZ_PASSER';

// ── Property (Bien immobilier) ─────────────────────────────────
export interface QProperty {
  id:             string;
  ownerId:        string;          // ID du bailleur (User)
  name:           string;          // Nom dans le système d'Achille
  address:        string;
  // Champs CDC ajoutés
  groupeId?:      string | null;   // NULL = bien isolé
  typePropriete?: TypePropriete;
  nomBien?:       string;          // "Appt 4B", "Porte 3"
  nomComplet?:    string;          // Généré : "Imm. Les Palmiers — Appt 4B"
  niveau?:        string;
  estCourEntiere: boolean;
  // Champs existants d'Achille (exemples probables)
  city?:          string;
  commune?:       string;
  surface?:       number;
  rooms?:         number;
  rent?:          number;
  status?:        string;
  // Relations
  groupe?:        QProperty;
  biens?:         QProperty[];
}

// ── Lease (Bail) ──────────────────────────────────────────────
export interface QLease {
  id:                 string;
  reference:          string;
  propertyId:         string;      // FK → Property
  tenantId:           string;      // FK → User (locataire)
  ownerId:            string;      // FK → User (bailleur)
  emetteurId:         string;
  // Conditions financières
  rent:               number;      // loyer_mensuel dans Achille
  charges:            number;
  deposit:            number;      // depot_garantie
  startDate:          string;
  endDate:            string;
  durationMonths:     number;
  dueDay:             JourEcheance;
  // Champs CDC ajoutés
  sha256Hash?:        string;
  sha256CalculeLe?:   string;
  qrCodeUrl?:         string;
  statutDraft:        StatutLease;
  versionDraft:       number;
  draftData?:         any;
  loiApplicable:      string;
  droitsDgiCalcules?: number;
  fraisQapril?:       number;
  alerte90j:          boolean;
  alerte60j:          boolean;
  alerte30j:          boolean;
  seuilJ3:            boolean;
  seuilJ7:            boolean;
  seuilJ15:           boolean;
  // Champs existants d'Achille
  status?:            string;
  createdAt?:         string;
  updatedAt?:         string;
  // Relations
  property?:          QProperty;
  tenant?:            { id: string; name?: string; phone?: string; email?: string };
}

// ── Receipt (Quittance) ───────────────────────────────────────
export interface QReceipt {
  id:                  string;
  reference:           string;     // QUI-AAAAMM-NNN
  leaseId:             string;     // FK → Lease
  tenantId:            string;
  ownerId:             string;
  emetteurId:          string;
  // Montants
  amount:              number;     // total
  rentAmount:          number;     // loyer seul
  chargesAmount:       number;
  // Paiement
  paymentMethod:       ModePaiement;
  paymentReference?:   string;     // référence transaction Mobile Money
  // Champs CDC ajoutés
  moisConcerne:        string;     // "2026-03" — OBLIGATOIRE · RG-QUI-ORDRE
  dateEncaissement:    string;     // date réelle d'encaissement
  sha256Hash?:         string;
  sha256CalculeLe?:    string;
  qrCodeUrl?:          string;
  flagWebhookNonRecu:  boolean;
  preuveUrl?:          string;
  arcDemande:          boolean;
  arcCertificationId?: string;
  arcHorodatage?:      string;
  commentaireInterne?: string;
  // Champs existants d'Achille
  status:              StatutReceipt;
  createdAt?:          string;
  // Relations
  lease?:              QLease;
}

// ── DTOs Formulaires ──────────────────────────────────────────

export interface CreateLeaseDraftDTO {
  propertyId:         string;
  tenantId:           string;
  rent:               number;
  charges:            number;
  deposit:            number;
  startDate:          string;
  durationMonths:     3 | 6 | 12 | 24 | 36;
  dueDay:             JourEcheance;
  alerte90j:          boolean;
  alerte60j:          boolean;
  alerte30j:          boolean;
  seuilJ3:            boolean;
  seuilJ7:            boolean;
  seuilJ15:           boolean;
  // Draft optionnel (si reprise d'un draft existant)
  leaseId?:           string;
  versionDraft?:      number;
}

export interface CreateReceiptDTO {
  leaseId:            string;
  moisConcerne:       string;      // "2026-03" — validé côté serveur · RG-QUI-ORDRE
  dateEncaissement:   string;
  amount:             number;
  rentAmount:         number;
  chargesAmount:      number;
  paymentMethod:      ModePaiement;
  paymentReference?:  string;
  flagWebhookNonRecu?: boolean;
  preuveUrl?:         string;      // URL GCS si upload preuve
  arcDemande?:        boolean;
  commentaireInterne?: string;
}

// ── Helpers & Calculs ─────────────────────────────────────────

export const LOI_APPLICABLE =
  "Loi n°2019-576 du 26 juin 2019 — Code de la Construction et de l'Habitat en Côte d'Ivoire";

/** Droits DGI · Art. 550 CGI CI · RG-BAIL-05 */
export function calculerDGI(loyer: number, dureeMois: number): number {
  return Math.round(loyer * 0.025 * dureeMois + 500);
}

/** Date de fin = date_debut + duree_mois - 1j */
export function calculerDateFin(dateDebut: string, dureeMois: number): string {
  if (!dateDebut) return '';
  const d = new Date(dateDebut);
  d.setMonth(d.getMonth() + dureeMois);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/** Tarif QAPRIL · RG-BAIL-01/02 */
export function tarifBail(estCourEntiere: boolean): number {
  return estCourEntiere ? 10000 : 2000;
}

/** Formater montant en XOF (anciennement formatFCFA) */
export function formatFCFA(n: number): string {
  return (n || 0).toLocaleString('fr-FR') + ' XOF';
}

/** Formater montant en XOF */
export function formatXOF(n: number): string {
  return (n || 0).toLocaleString('fr-FR') + ' XOF';
}

/** Formater date en français */
export function formatDateFR(d: string): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

/** Formater mois YYYY-MM en français */
export function formatMoisFR(mois: string): string {
  if (!mois) return '—';
  const [y, m] = mois.split('-');
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('fr-FR', {
    month: 'long', year: 'numeric',
  });
}

/** URL de vérification QR code */
export function genererQrUrl(ref: string, sha256: string): string {
  return `https://qapril.ci/verifier?ref=${ref}&sha=${sha256.slice(0, 16)}`;
}

/** 12 derniers mois disponibles pour le sélecteur quittance */
export function genererMoisDisponibles() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return { value, label: i === 0 ? `${label} (mois en cours)` : label };
  });
}
