import { prisma } from "../prisma";
import { twentyClient } from "./client";

function mapPropertyType(type: string): string {
  const t = type.toUpperCase();
  if (t === "APPARTEMENT") return "APARTMENT";
  if (t === "MAISON") return "HOUSE";
  if (t === "CHAMBRE") return "ROOM";
  if (t === "IMMEUBLE") return "COMMERCIAL";
  return t; // STUDIO, VILLA, COMMERCIAL are the same
}

function mapStructureType(type?: string): string | undefined {
  if (!type) return undefined;
  const t = type.toUpperCase();
  if (t === "IMMEUBLE") return "PARENT";
  return t; // INDEPENDANT and others
}

function mapPaymentCanal(canal?: string): string | undefined {
  if (!canal) return undefined;
  const c = canal.toUpperCase();
  if (c === "MOBILE_MONEY") return "CINETPAY_M17";
  if (c === "ESPECES" || c === "ESPECE") return "CASH";
  if (c === "VIREMENT") return "BANK_TRANSFER";
  return c;
}

/**
 * TwentySyncService
 * Real-time synchronization methods for propagating database changes to Twenty CRM.
 * Run asynchronously in the background to ensure web requests are not blocked.
 */
export class TwentySyncService {
  /**
   * Helper to execute sync tasks in the background without blocking the caller.
   */
  private static runInBackground(taskName: string, task: () => Promise<any>) {
    Promise.resolve()
      .then(task)
      .then(() => {
        if (process.env.NODE_ENV === "development") {
          console.log(`[TwentySyncService] Background task '${taskName}' completed.`);
        }
      })
      .catch((error) => {
        console.error(`[TwentySyncService] Background task '${taskName}' failed:`, error);
      });
  }

  /**
   * Synchronize a QAPRIL User -> Twenty Person
   */
  static syncUser(userId: string, action: 'create' | 'update' | 'delete') {
    this.runInBackground(`User_${userId}_${action}`, async () => {
      if (action === 'delete') {
        // Find by email/phone in twenty and delete? Typically we don't delete to prevent loss of logs
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      });
      if (!user) return;

      // Find if person already exists by email or phone
      const findPersonQuery = `
        query FindPerson($email: String, $phone: String) {
          people(filter: {
            or: [
              { emails: { primaryEmail: { eq: $email } } }
              { phones: { primaryPhoneNumber: { eq: $phone } } }
            ]
          }) {
            edges {
              node {
                id
              }
            }
          }
        }
      `;

      const searchRes = await twentyClient.graphql<any>(findPersonQuery, {
        email: user.email || undefined,
        phone: user.phone || undefined,
      });

      const existingPersonId = searchRes?.people?.edges?.[0]?.node?.id;

      if (existingPersonId) {
        // Update Person
        const updateMutation = `
          mutation UpdatePerson($id: ID!, $firstName: String, $lastName: String, $emails: EmailsUpdateInput, $phones: PhonesUpdateInput) {
            updatePerson(id: $id, data: {
              name: {
                firstName: $firstName
                lastName: $lastName
              }
              emails: $emails
              phones: $phones
            }) {
              id
            }
          }
        `;
        await twentyClient.graphql(updateMutation, {
          id: existingPersonId,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          emails: user.email ? { primaryEmail: user.email } : undefined,
          phones: user.phone ? { primaryPhoneNumber: user.phone } : undefined,
        });
      } else {
        // Create Person
        const createMutation = `
          mutation CreatePerson($firstName: String, $lastName: String, $emails: EmailsCreateInput, $phones: PhonesCreateInput) {
            createPerson(data: {
              name: {
                firstName: $firstName
                lastName: $lastName
              }
              emails: $emails
              phones: $phones
            }) {
              id
            }
          }
        `;
        await twentyClient.graphql(createMutation, {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          emails: user.email ? { primaryEmail: user.email } : undefined,
          phones: user.phone ? { primaryPhoneNumber: user.phone } : undefined,
        });
      }
    });
  }

  /**
   * Helper to locate Twenty Person ID by QAPRIL User ID
   */
  private static async findTwentyPersonId(qaprilUserId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: qaprilUserId },
      select: { email: true, phone: true },
    });
    if (!user) return null;

    const findQuery = `
      query FindPerson($email: String, $phone: String) {
        people(filter: {
          or: [
            { emails: { primaryEmail: { eq: $email } } }
            { phones: { primaryPhoneNumber: { eq: $phone } } }
          ]
        }) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    const res = await twentyClient.graphql<any>(findQuery, {
      email: user.email || undefined,
      phone: user.phone || undefined,
    });

    return res?.people?.edges?.[0]?.node?.id || null;
  }

  /**
   * Helper to locate Twenty custom object ID by external QAPRIL ID
   */
  private static async findCustomObjectId(objectNamePlural: string, externalId: string): Promise<string | null> {
    const findQuery = `
      query FindCustomObject($externalId: String!) {
        ${objectNamePlural}(filter: { externalQaprilId: { eq: $externalId } }) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    try {
      const res = await twentyClient.graphql<any>(findQuery, { externalId });
      return res?.[objectNamePlural]?.edges?.[0]?.node?.id || null;
    } catch {
      return null;
    }
  }

  /**
   * Synchronize a QAPRIL Property -> Twenty BienImmobilier
   */
  static syncProperty(propertyId: string, action: 'create' | 'update' | 'delete') {
    this.runInBackground(`Property_${propertyId}_${action}`, async () => {
      const twentyId = await this.findCustomObjectId("bienImmobiliers", propertyId);
      
      if (action === 'delete') {
        if (twentyId) {
          const deleteMutation = `mutation { deleteBienImmobilier(id: "${twentyId}") { id } }`;
          await twentyClient.graphql(deleteMutation);
        }
        return;
      }

      const p = await prisma.property.findUnique({ where: { id: propertyId } });
      if (!p) return;

      const ownerPersonId = await this.findTwentyPersonId(p.ownerUserId);
      const agentPersonId = p.managedByUserId ? await this.findTwentyPersonId(p.managedByUserId) : null;

      if (!ownerPersonId) {
        console.warn(`[TwentySyncService] Cannot sync Property ${propertyId}: Owner ${p.ownerUserId} has no mapping in Twenty.`);
        return;
      }

      const variables = {
        id: twentyId || undefined,
        externalQaprilId: p.id,
        codeLogement: p.propertyCode,
        typeLogement: mapPropertyType(p.propertyType),
        commune: p.commune,
        adresse: p.address,
        nombrePieces: p.rooms || undefined,
        loyerDeclare: p.declaredRentFcfa ? Number(p.declaredRentFcfa) : undefined,
        superficieM2: p.superficieM2 || undefined,
        statutBien: p.status.toUpperCase(),
        gpsLatitude: p.gpsLatitude || undefined,
        gpsLongitude: p.gpsLongitude || undefined,
        typeStructure: mapStructureType(p.typeStructure),
        modeGestion: p.managementMode || undefined,
        proprietaire: { connect: { id: ownerPersonId } },
        agent: agentPersonId ? { connect: { id: agentPersonId } } : undefined,
      };

      if (twentyId) {
        const updateMutation = `
          mutation UpdateBien(
            $id: ID!
            $codeLogement: String!
            $typeLogement: String!
            $commune: String!
            $adresse: String!
            $nombrePieces: Int
            $loyerDeclare: Float
            $superficieM2: Float
            $statutBien: String!
            $gpsLatitude: Float
            $gpsLongitude: Float
            $typeStructure: String
            $modeGestion: String
            $proprietaire: PersonRelationInput
            $agent: PersonRelationInput
          ) {
            updateBienImmobilier(id: $id, data: {
              codeLogement: $codeLogement
              typeLogement: $typeLogement
              commune: $commune
              adresse: $adresse
              nombrePieces: $nombrePieces
              loyerDeclare: $loyerDeclare
              superficieM2: $superficieM2
              statutBien: $statutBien
              gpsLatitude: $gpsLatitude
              gpsLongitude: $gpsLongitude
              typeStructure: $typeStructure
              modeGestion: $modeGestion
              proprietaire: $proprietaire
              agent: $agent
            }) {
              id
            }
          }
        `;
        await twentyClient.graphql(updateMutation, variables);
      } else {
        const createMutation = `
          mutation CreateBien(
            $externalQaprilId: String!
            $codeLogement: String!
            $typeLogement: String!
            $commune: String!
            $adresse: String!
            $nombrePieces: Int
            $loyerDeclare: Float
            $superficieM2: Float
            $statutBien: String!
            $gpsLatitude: Float
            $gpsLongitude: Float
            $typeStructure: String
            $modeGestion: String
            $proprietaire: PersonRelationInput
            $agent: PersonRelationInput
          ) {
            createBienImmobilier(data: {
              externalQaprilId: $externalQaprilId
              codeLogement: $codeLogement
              typeLogement: $typeLogement
              commune: $commune
              adresse: $adresse
              nombrePieces: $nombrePieces
              loyerDeclare: $loyerDeclare
              superficieM2: $superficieM2
              statutBien: $statutBien
              gpsLatitude: $gpsLatitude
              gpsLongitude: $gpsLongitude
              typeStructure: $typeStructure
              modeGestion: $modeGestion
              proprietaire: $proprietaire
              agent: $agent
            }) {
              id
            }
          }
        `;
        await twentyClient.graphql(createMutation, variables);
      }
    });
  }

  /**
   * Synchronize a QAPRIL Lease -> Twenty Bail
   */
  static syncLease(leaseId: string, action: 'create' | 'update' | 'delete') {
    this.runInBackground(`Lease_${leaseId}_${action}`, async () => {
      const twentyId = await this.findCustomObjectId("bails", leaseId);

      if (action === 'delete') {
        if (twentyId) {
          const deleteMutation = `mutation { deleteBail(id: "${twentyId}") { id } }`;
          await twentyClient.graphql(deleteMutation);
        }
        return;
      }

      const l = await prisma.lease.findUnique({ where: { id: leaseId } });
      if (!l) return;

      const bienId = await this.findCustomObjectId("bienImmobiliers", l.propertyId);
      const bailleurId = await this.findTwentyPersonId(l.landlordId);
      const locataireId = l.tenantId ? await this.findTwentyPersonId(l.tenantId) : null;
      const agentId = l.agentId ? await this.findTwentyPersonId(l.agentId) : null;

      if (!bienId || !bailleurId) {
        console.warn(`[TwentySyncService] Cannot sync Lease ${leaseId}: Missing related bien or landlord in Twenty mapping.`);
        return;
      }

      const variables = {
        id: twentyId || undefined,
        externalQaprilId: l.id,
        referenceBail: l.leaseReference,
        typeBail: l.typeBail,
        statutBail: l.status,
        dateDebut: l.startDate,
        dateFin: l.endDate || undefined,
        dureeMois: l.durationMonths,
        montantLoyer: Number(l.rentAmount),
        montantCharges: Number(l.chargesAmount),
        montantCaution: Number(l.depositAmount),
        avanceLoyer: Number(l.avanceLoyer),
        jourPaiement: l.paymentDay || undefined,
        statutFiscal: l.statutFiscal ? l.statutFiscal.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : undefined,
        bien: { connect: { id: bienId } },
        bailleur: { connect: { id: bailleurId } },
        locataire: locataireId ? { connect: { id: locataireId } } : undefined,
        agent: agentId ? { connect: { id: agentId } } : undefined,
      };

      if (twentyId) {
        const updateMutation = `
          mutation UpdateBail(
            $id: ID!
            $referenceBail: String!
            $typeBail: String!
            $statutBail: String!
            $dateDebut: DateTime!
            $dateFin: DateTime
            $dureeMois: Int!
            $montantLoyer: Float!
            $montantCharges: Float
            $montantCaution: Float
            $avanceLoyer: Float
            $jourPaiement: Int
            $statutFiscal: String
            $bien: BienImmobilierRelationInput
            $bailleur: PersonRelationInput
            $locataire: PersonRelationInput
            $agent: PersonRelationInput
          ) {
            updateBail(id: $id, data: {
              referenceBail: $referenceBail
              typeBail: $typeBail
              statutBail: $statutBail
              dateDebut: $dateDebut
              dateFin: $dateFin
              dureeMois: $dureeMois
              montantLoyer: $montantLoyer
              montantCharges: $montantCharges
              montantCaution: $montantCaution
              avanceLoyer: $avanceLoyer
              jourPaiement: $jourPaiement
              statutFiscal: $statutFiscal
              bien: $bien
              bailleur: $bailleur
              locataire: $locataire
              agent: $agent
            }) {
              id
            }
          }
        `;
        await twentyClient.graphql(updateMutation, variables);
      } else {
        const createMutation = `
          mutation CreateBail(
            $externalQaprilId: String!
            $referenceBail: String!
            $typeBail: String!
            $statutBail: String!
            $dateDebut: DateTime!
            $dateFin: DateTime
            $dureeMois: Int!
            $montantLoyer: Float!
            $montantCharges: Float
            $montantCaution: Float
            $avanceLoyer: Float
            $jourPaiement: Int
            $statutFiscal: String
            $bien: BienImmobilierRelationInput
            $bailleur: PersonRelationInput
            $locataire: PersonRelationInput
            $agent: PersonRelationInput
          ) {
            createBail(data: {
              externalQaprilId: $externalQaprilId
              referenceBail: $referenceBail
              typeBail: $typeBail
              statutBail: $statutBail
              dateDebut: $dateDebut
              dateFin: $dateFin
              dureeMois: $dureeMois
              montantLoyer: $montantLoyer
              montantCharges: $montantCharges
              montantCaution: $montantCaution
              avanceLoyer: $avanceLoyer
              jourPaiement: $jourPaiement
              statutFiscal: $statutFiscal
              bien: $bien
              bailleur: $bailleur
              locataire: $locataire
              agent: $agent
            }) {
              id
            }
          }
        `;
        await twentyClient.graphql(createMutation, variables);
      }
    });
  }

  /**
   * Synchronize a QAPRIL PaymentPgw -> Twenty Paiement
   */
  static syncPaymentPgw(paymentId: string, action: 'create' | 'update' | 'delete') {
    this.runInBackground(`PaymentPgw_${paymentId}_${action}`, async () => {
      const twentyId = await this.findCustomObjectId("paiements", paymentId);

      if (action === 'delete') {
        if (twentyId) {
          const deleteMutation = `mutation { deletePaiement(id: "${twentyId}") { id } }`;
          await twentyClient.graphql(deleteMutation);
        }
        return;
      }

      const p = await prisma.paymentPgw.findUnique({ where: { id: paymentId } });
      if (!p) return;

      const bailId = await this.findCustomObjectId("bails", p.leaseId);
      const payeurId = await this.findTwentyPersonId(p.payeurId);

      if (!bailId) return;

      const variables = {
        id: twentyId || undefined,
        externalQaprilId: p.id,
        reference: p.refInterne,
        moisConcerne: p.moisConcerne.toISOString().substring(0, 7),
        montant: Number(p.montant),
        canal: mapPaymentCanal(p.canal),
        statut: p.statut.toUpperCase(),
        datePaiement: p.webhookReceivedAt || p.createdAt,
        bail: { connect: { id: bailId } },
        payeur: payeurId ? { connect: { id: payeurId } } : undefined,
      };

      const mutationString = twentyId
        ? `mutation UpdatePaiement($id: ID!, $reference: String!, $moisConcerne: String!, $montant: Float!, $canal: String!, $statut: String!, $datePaiement: DateTime, $bail: BailRelationInput, $payeur: PersonRelationInput) {
            updatePaiement(id: $id, data: {
              reference: $reference
              moisConcerne: $moisConcerne
              montant: $montant
              canal: $canal
              statut: $statut
              datePaiement: $datePaiement
              bail: $bail
              payeur: $payeur
            }) { id }
          }`
        : `mutation CreatePaiement($externalQaprilId: String!, $reference: String!, $moisConcerne: String!, $montant: Float!, $canal: String!, $statut: String!, $datePaiement: DateTime, $bail: BailRelationInput, $payeur: PersonRelationInput) {
            createPaiement(data: {
              externalQaprilId: $externalQaprilId
              reference: $reference
              moisConcerne: $moisConcerne
              montant: $montant
              canal: $canal
              statut: $statut
              datePaiement: $datePaiement
              bail: $bail
              payeur: $payeur
            }) { id }
          }`;

      await twentyClient.graphql(mutationString, variables);
    });
  }

  /**
   * Synchronize a QAPRIL Receipt -> Twenty Paiement
   */
  static syncReceipt(receiptId: string, action: 'create' | 'update' | 'delete') {
    this.runInBackground(`Receipt_${receiptId}_${action}`, async () => {
      const twentyId = await this.findCustomObjectId("paiements", receiptId);

      if (action === 'delete') {
        if (twentyId) {
          const deleteMutation = `mutation { deletePaiement(id: "${twentyId}") { id } }`;
          await twentyClient.graphql(deleteMutation);
        }
        return;
      }

      const r = await prisma.receipt.findUnique({
        where: { id: receiptId },
        include: { lease: { select: { tenantId: true } } },
      });
      if (!r) return;

      const bailId = await this.findCustomObjectId("bails", r.leaseId);
      const payeurId = r.lease.tenantId ? await this.findTwentyPersonId(r.lease.tenantId) : null;

      if (!bailId) return;

      const variables = {
        id: twentyId || undefined,
        externalQaprilId: r.id,
        reference: r.receiptRef,
        moisConcerne: r.periodMonth,
        montant: Number(r.totalAmount),
        canal: mapPaymentCanal(r.paymentMethod),
        statut: r.status.toUpperCase(),
        datePaiement: r.paidAt || undefined,
        bail: { connect: { id: bailId } },
        payeur: payeurId ? { connect: { id: payeurId } } : undefined,
      };

      const mutationString = twentyId
        ? `mutation UpdatePaiement($id: ID!, $reference: String!, $moisConcerne: String!, $montant: Float!, $canal: String!, $statut: String!, $datePaiement: DateTime, $bail: BailRelationInput, $payeur: PersonRelationInput) {
            updatePaiement(id: $id, data: {
              reference: $reference
              moisConcerne: $moisConcerne
              montant: $montant
              canal: $canal
              statut: $statut
              datePaiement: $datePaiement
              bail: $bail
              payeur: $payeur
            }) { id }
          }`
        : `mutation CreatePaiement($externalQaprilId: String!, $reference: String!, $moisConcerne: String!, $montant: Float!, $canal: String!, $statut: String!, $datePaiement: DateTime, $bail: BailRelationInput, $payeur: PersonRelationInput) {
            createPaiement(data: {
              externalQaprilId: $externalQaprilId
              reference: $reference
              moisConcerne: $moisConcerne
              montant: $montant
              canal: $canal
              statut: $statut
              datePaiement: $datePaiement
              bail: $bail
              payeur: $payeur
            }) { id }
          }`;

      await twentyClient.graphql(mutationString, variables);
    });
  }

  /**
   * Synchronize a QAPRIL Dispute -> Twenty LitigeMediation
   */
  static syncDispute(disputeId: string, action: 'create' | 'update' | 'delete') {
    this.runInBackground(`Dispute_${disputeId}_${action}`, async () => {
      const twentyId = await this.findCustomObjectId("litigeMediations", disputeId);

      if (action === 'delete') {
        if (twentyId) {
          const deleteMutation = `mutation { deleteLitigeMediation(id: "${twentyId}") { id } }`;
          await twentyClient.graphql(deleteMutation);
        }
        return;
      }

      const d = await prisma.dispute.findUnique({
        where: { id: disputeId },
        include: { lease: { select: { landlordId: true, tenantId: true } } },
      });
      if (!d) return;

      const bailId = await this.findCustomObjectId("bails", d.leaseId);
      const partieAId = await this.findTwentyPersonId(d.lease.landlordId);
      const partieBId = d.lease.tenantId ? await this.findTwentyPersonId(d.lease.tenantId) : null;

      if (!bailId) return;

      const variables = {
        id: twentyId || undefined,
        externalQaprilId: d.id,
        titre: d.title,
        typeLitige: d.type ? d.type.toUpperCase() : undefined,
        severite: d.severity ? d.severity.toUpperCase() : undefined,
        statutLitige: d.status.toUpperCase(),
        montantEnJeu: d.amountInDispute ? Number(d.amountInDispute) : undefined,
        resolution: d.resolution || undefined,
        bail: { connect: { id: bailId } },
        partieA: partieAId ? { connect: { id: partieAId } } : undefined,
        partieB: partieBId ? { connect: { id: partieBId } } : undefined,
      };

      const mutationString = twentyId
        ? `mutation UpdateLitige($id: ID!, $titre: String!, $typeLitige: String, $severite: String, $statutLitige: String!, $montantEnJeu: Float, $resolution: String, $bail: BailRelationInput, $partieA: PersonRelationInput, $partieB: PersonRelationInput) {
            updateLitigeMediation(id: $id, data: {
              titre: $titre
              typeLitige: $typeLitige
              severite: $severite
              statutLitige: $statutLitige
              montantEnJeu: $montantEnJeu
              resolution: $resolution
              bail: $bail
              partieA: $partieA
              partieB: $partieB
            }) { id }
          }`
        : `mutation CreateLitige($externalQaprilId: String!, $titre: String!, $typeLitige: String, $severite: String, $statutLitige: String!, $montantEnJeu: Float, $resolution: String, $bail: BailRelationInput, $partieA: PersonRelationInput, $partieB: PersonRelationInput) {
            createLitigeMediation(data: {
              externalQaprilId: $externalQaprilId
              titre: $titre
              typeLitige: $typeLitige
              severite: $severite
              statutLitige: $statutLitige
              montantEnJeu: $montantEnJeu
              resolution: $resolution
              bail: $bail
              partieA: $partieA
              partieB: $partieB
            }) { id }
          }`;

      await twentyClient.graphql(mutationString, variables);
    });
  }
}
