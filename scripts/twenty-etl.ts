import "dotenv/config";
import { twentyClient } from "../src/lib/twenty/client";

// Standard prisma from client
import { PrismaClient } from "@prisma/client";
const qaprilDb = new PrismaClient();

// GraphQL Mutations
const CREATE_PERSON = `
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

const CREATE_BIEN = `
  mutation CreateBienImmobilier(
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

const CREATE_BAIL = `
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

const CREATE_PAIEMENT = `
  mutation CreatePaiement(
    $externalQaprilId: String!
    $reference: String!
    $moisConcerne: String!
    $montant: Float!
    $canal: String!
    $statut: String!
    $datePaiement: DateTime
    $bail: BailRelationInput
    $payeur: PersonRelationInput
  ) {
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
    }) {
      id
    }
  }
`;

const CREATE_MANDAT = `
  mutation CreateMandat(
    $externalQaprilId: String!
    $referenceMandat: String!
    $typeMandat: String!
    $statutMandat: String!
    $tauxCommission: Float
    $dateDebut: DateTime!
    $dateFin: DateTime
    $bien: BienImmobilierRelationInput
    $agent: PersonRelationInput
  ) {
    createMandat(data: {
      externalQaprilId: $externalQaprilId
      referenceMandat: $referenceMandat
      typeMandat: $typeMandat
      statutMandat: $statutMandat
      tauxCommission: $tauxCommission
      dateDebut: $dateDebut
      dateFin: $dateFin
      bien: $bien
      agent: $agent
    }) {
      id
    }
  }
`;

const CREATE_LITIGE = `
  mutation CreateLitigeMediation(
    $externalQaprilId: String!
    $titre: String!
    $typeLitige: String
    $severite: String
    $statutLitige: String!
    $montantEnJeu: Float
    $resolution: String
    $bail: BailRelationInput
    $partieA: PersonRelationInput
    $partieB: PersonRelationInput
  ) {
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
    }) {
      id
    }
  }
`;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function graphqlWithRateLimit<T>(query: string, variables?: any, retries = 5): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await delay(800); // 800ms delay between any two GraphQL operations
      return await twentyClient.graphql<T>(query, variables);
    } catch (error: any) {
      if (error.message?.includes("Limit reached") && attempt < retries) {
        console.warn(`[Rate Limit] Limit reached. Waiting 30s before retry attempt ${attempt}/${retries}...`);
        await delay(30000);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed after maximum retries");
}

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

async function findTwentyCustomObjectId(objectNamePlural: string, externalId: string): Promise<string | null> {
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
    const res = await graphqlWithRateLimit<any>(findQuery, { externalId });
    return res?.[objectNamePlural]?.edges?.[0]?.node?.id || null;
  } catch {
    return null;
  }
}

async function main() {
  console.log("=== STARTING INITIAL ETL IMPORT TO TWENTY CRM ===");

  // InMemory maps to track relationships
  const userIdToTwentyPersonId: Record<string, string> = {};
  const propertyIdToTwentyBienId: Record<string, string> = {};
  const leaseIdToTwentyBailId: Record<string, string> = {};

  try {
    // 1. Users -> Person
    console.log("\n1. Importing Users...");
    const users = await qaprilDb.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });
    console.log(`Found ${users.length} users in QAPRIL database.`);

    for (const u of users) {
      try {
        const orConditions = [];
        if (u.email) orConditions.push({ emails: { primaryEmail: { eq: u.email } } });
        if (u.phone) orConditions.push({ phones: { primaryPhoneNumber: { eq: u.phone } } });

        let personId: string | null = null;

        if (orConditions.length > 0) {
          const findQuery = `
            query FindPerson($filter: PersonFilterInput!) {
              people(filter: $filter) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          `;
          const filter = orConditions.length === 1 ? orConditions[0] : { or: orConditions };
          const searchRes = await graphqlWithRateLimit<any>(findQuery, { filter });
          personId = searchRes?.people?.edges?.[0]?.node?.id || null;
        }

        if (personId) {
          userIdToTwentyPersonId[u.id] = personId;
        } else {
          const res = await graphqlWithRateLimit<{ createPerson: { id: string } }>(CREATE_PERSON, {
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            emails: u.email ? { primaryEmail: u.email } : undefined,
            phones: u.phone ? { primaryPhoneNumber: u.phone } : undefined,
          });
          userIdToTwentyPersonId[u.id] = res.createPerson.id;
        }
      } catch (err: any) {
        console.error(`Failed to import user ${u.id}:`, err.message);
      }
    }
    console.log(`Successfully mapped ${Object.keys(userIdToTwentyPersonId).length} users to Twenty Persons.`);

    // 2. Properties -> BienImmobilier
    console.log("\n2. Importing Properties...");
    const properties = await qaprilDb.property.findMany();
    console.log(`Found ${properties.length} properties in QAPRIL database.`);

    for (const p of properties) {
      try {
        const existingBienId = await findTwentyCustomObjectId("bienImmobiliers", p.id);
        if (existingBienId) {
          propertyIdToTwentyBienId[p.id] = existingBienId;
          continue;
        }

        const proprietaireId = userIdToTwentyPersonId[p.ownerUserId];
        const agentId = p.managedByUserId ? userIdToTwentyPersonId[p.managedByUserId] : undefined;

        if (!proprietaireId) {
          console.warn(`Skipping Property ${p.id}: Owner ${p.ownerUserId} not mapped to Twenty.`);
          continue;
        }

        const res = await graphqlWithRateLimit<{ createBienImmobilier: { id: string } }>(CREATE_BIEN, {
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
          proprietaire: { connect: { id: proprietaireId } },
          agent: agentId ? { connect: { id: agentId } } : undefined,
        });
        propertyIdToTwentyBienId[p.id] = res.createBienImmobilier.id;
      } catch (err: any) {
        console.error(`Failed to import property ${p.id}:`, err.message);
      }
    }
    console.log(`Successfully mapped ${Object.keys(propertyIdToTwentyBienId).length} properties to Twenty BienImmobiliers.`);

    // 3. Leases -> Bail
    console.log("\n3. Importing Leases...");
    const leases = await qaprilDb.lease.findMany();
    console.log(`Found ${leases.length} leases in QAPRIL database.`);

    for (const l of leases) {
      try {
        const existingBailId = await findTwentyCustomObjectId("bails", l.id);
        if (existingBailId) {
          leaseIdToTwentyBailId[l.id] = existingBailId;
          continue;
        }

        const bienId = propertyIdToTwentyBienId[l.propertyId];
        const bailleurId = userIdToTwentyPersonId[l.landlordId];
        const locataireId = l.tenantId ? userIdToTwentyPersonId[l.tenantId] : undefined;
        const agentId = l.agentId ? userIdToTwentyPersonId[l.agentId] : undefined;

        if (!bienId || !bailleurId) {
          console.warn(`Skipping Lease ${l.id}: Missing related property or landlord in Twenty mapping.`);
          continue;
        }

        const res = await graphqlWithRateLimit<{ createBail: { id: string } }>(CREATE_BAIL, {
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
        });
        leaseIdToTwentyBailId[l.id] = res.createBail.id;
      } catch (err: any) {
        console.error(`Failed to import lease ${l.id}:`, err.message);
      }
    }
    console.log(`Successfully mapped ${Object.keys(leaseIdToTwentyBailId).length} leases to Twenty Bails.`);

    // 4. Receipts & Payments -> Paiement
    console.log("\n4. Importing Payments & Receipts...");
    
    // Import from Receipts (operational transactions)
    const receipts = await qaprilDb.receipt.findMany({
      include: {
        lease: {
          select: {
            tenantId: true,
          },
        },
      },
    });
    console.log(`Found ${receipts.length} receipts in QAPRIL database.`);

    let receiptCount = 0;
    for (const r of receipts) {
      try {
        const existingPaiementId = await findTwentyCustomObjectId("paiements", r.id);
        if (existingPaiementId) {
          receiptCount++;
          continue;
        }

        const bailId = leaseIdToTwentyBailId[r.leaseId];
        const payeurId = r.lease.tenantId ? userIdToTwentyPersonId[r.lease.tenantId] : undefined;

        if (!bailId) continue;

        await graphqlWithRateLimit(CREATE_PAIEMENT, {
          externalQaprilId: r.id,
          reference: r.receiptRef,
          moisConcerne: r.periodMonth,
          montant: Number(r.totalAmount),
          canal: mapPaymentCanal(r.paymentMethod),
          statut: r.status.toUpperCase(),
          datePaiement: r.paidAt || undefined,
          bail: { connect: { id: bailId } },
          payeur: payeurId ? { connect: { id: payeurId } } : undefined,
        });
        receiptCount++;
      } catch (err: any) {
        console.error(`Failed to import receipt ${r.id}:`, err.message);
      }
    }
    console.log(`Successfully imported ${receiptCount} receipts as Payments.`);

    // Import from PaymentPgw (gateway logs for mobile money)
    const paymentsPgw = await qaprilDb.paymentPgw.findMany();
    console.log(`Found ${paymentsPgw.length} Mobile Money gateway logs (PaymentPgw) in QAPRIL database.`);

    let pgwCount = 0;
    for (const p of paymentsPgw) {
      try {
        const existingPaiementId = await findTwentyCustomObjectId("paiements", p.id);
        if (existingPaiementId) {
          pgwCount++;
          continue;
        }

        const bailId = leaseIdToTwentyBailId[p.leaseId];
        const payeurId = userIdToTwentyPersonId[p.payeurId];

        if (!bailId) continue;

        await graphqlWithRateLimit(CREATE_PAIEMENT, {
          externalQaprilId: p.id,
          reference: p.refInterne,
          moisConcerne: p.moisConcerne.toISOString().substring(0, 7), // YYYY-MM
          montant: Number(p.montant),
          canal: mapPaymentCanal(p.canal),
          statut: p.statut.toUpperCase(),
          datePaiement: p.webhookReceivedAt || p.createdAt,
          bail: { connect: { id: bailId } },
          payeur: payeurId ? { connect: { id: payeurId } } : undefined,
        });
        pgwCount++;
      } catch (err: any) {
        console.error(`Failed to import gateway payment ${p.id}:`, err.message);
      }
    }
    console.log(`Successfully imported ${pgwCount} gateway payments as Payments.`);

    // 5. Mandates -> Mandat
    console.log("\n5. Importing Mandates...");
    const mandates = await qaprilDb.mandate.findMany();
    console.log(`Found ${mandates.length} mandates in QAPRIL database.`);

    let mandateCount = 0;
    for (const m of mandates) {
      try {
        const existingMandatId = await findTwentyCustomObjectId("mandats", m.id);
        if (existingMandatId) {
          mandateCount++;
          continue;
        }

        const bienId = propertyIdToTwentyBienId[m.propertyId];
        const agentId = m.agentUserId ? userIdToTwentyPersonId[m.agentUserId] : undefined;

        if (!bienId) continue;

        await graphqlWithRateLimit(CREATE_MANDAT, {
          externalQaprilId: m.id,
          referenceMandat: m.mandateRef,
          typeMandat: m.mandateType,
          statutMandat: m.status,
          tauxCommission: m.commissionPct || undefined,
          dateDebut: m.startDate,
          dateFin: m.endDate || undefined,
          bien: { connect: { id: bienId } },
          agent: agentId ? { connect: { id: agentId } } : undefined,
        });
        mandateCount++;
      } catch (err: any) {
        console.error(`Failed to import mandate ${m.id}:`, err.message);
      }
    }
    console.log(`Successfully imported ${mandateCount} mandates.`);

    // 6. Disputes -> LitigeMediation
    console.log("\n6. Importing Disputes...");
    const disputes = await qaprilDb.dispute.findMany({
      include: {
        lease: {
          select: {
            landlordId: true,
            tenantId: true,
          },
        },
      },
    });
    console.log(`Found ${disputes.length} disputes in QAPRIL database.`);

    let disputeCount = 0;
    for (const d of disputes) {
      try {
        const existingLitigeId = await findTwentyCustomObjectId("litigeMediations", d.id);
        if (existingLitigeId) {
          disputeCount++;
          continue;
        }

        const bailId = leaseIdToTwentyBailId[d.leaseId];
        const partieAId = userIdToTwentyPersonId[d.lease.landlordId];
        const partieBId = d.lease.tenantId ? userIdToTwentyPersonId[d.lease.tenantId] : undefined;

        if (!bailId) continue;

        await graphqlWithRateLimit(CREATE_LITIGE, {
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
        });
        disputeCount++;
      } catch (err: any) {
        console.error(`Failed to import dispute ${d.id}:`, err.message);
      }
    }
    console.log(`Successfully imported ${disputeCount} disputes.`);

    console.log("\n=== INITIAL ETL IMPORT COMPLETED SUCCESSFULLY ===");
  } catch (error: any) {
    console.error("\n❌ INITIAL ETL IMPORT FAILED:", error.message || error);
  } finally {
    await qaprilDb.$disconnect();
  }
}

main();
