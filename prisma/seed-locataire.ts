import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING LOCATAIRE PORTAL DATA ---');

  // 1. Create/Update Tenant
  const tenant = await prisma.user.upsert({
    where: { email: 'souleymane@qapril.ci' },
    update: {},
    create: {
      email: 'souleymane@qapril.ci',
      fullName: 'Traoré Souleymane',
      role: 'TENANT',
      phone: '+225 05 44 55 66',
      kycStatus: 'verified',
      kycLevel: 4,
      onboardingComplete: true,
      walletBalance: 25000
    }
  });

  // 2. Tenant Profile
  await prisma.locataireProfile.upsert({
    where: { userId: tenant.id },
    update: {
      scoreActuel: 794,
      scoreBadge: 'B',
      nbBailsActifs: 1
    },
    create: {
      userId: tenant.id,
      scoreActuel: 794,
      scoreBadge: 'B',
      nbBailsActifs: 1
    }
  });

  // 3. Landlord (Masked for Rule MM-04b)
  const landlord = await prisma.user.upsert({
    where: { email: 'kouassi@qapril.ci' },
    update: {},
    create: {
      email: 'kouassi@qapril.ci',
      fullName: 'M. Kouassi Adama',
      role: 'LANDLORD',
      phone: '+225 01 02 03 04 05',
      landlordCode: 'BAI-042'
    }
  });

  // 4. Property
  const property = await prisma.property.create({
    data: {
      propertyCode: 'LOG-ABJ-0042',
      name: 'Appt 3B — Résid. Lagune',
      address: 'Résid. Lagune · Plateau, Abidjan',
      commune: 'Plateau',
      propertyType: 'apartment',
      ownerUserId: landlord.id,
      status: 'active'
    }
  });

  // 5. Active Lease
  const lease = await prisma.lease.create({
    data: {
      leaseReference: 'BAIL-CI-2026-0042',
      propertyId: property.id,
      landlordId: landlord.id,
      tenantId: tenant.id,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      durationMonths: 12,
      rentAmount: 150000,
      chargesAmount: 15000,
      status: 'LOYER_IMPAYE', // Set to unpaid to test alert logic
      paymentDay: 1,
      typeBail: 'BDQ',
      typeGestion: 'agreee',
      bailleurMasque: true,
      identifiantCie: 'CI-0231-44876',
      identifiantSodeci: 'SD-ABJ-09234',
      leaseHash: 'e9f1b3d7c2a5d2c8...fake-hash'
    }
  });

  // 6. Receipts
  const months = ['2026-01', '2026-02'];
  for (const month of months) {
    await prisma.receipt.create({
      data: {
        receiptRef: `QIT-${month}-042`,
        leaseId: lease.id,
        periodMonth: month,
        rentAmount: 150000,
        chargesAmount: 15000,
        totalAmount: 165000,
        status: 'paid',
        paidAt: new Date(`${month}-05`),
        pdfUrl: `/exports/receipts/QIT-${month}-042.pdf`
      }
    });
  }

  // 7. Utilities (Factures)
  await prisma.factureUtility.createMany({
    data: [
      {
        leaseId: lease.id,
        acteurId: tenant.id,
        roleActeur: 'LOCATAIRE',
        typeUtility: 'CIE',
        identifiantCompteur: 'CI-0231-44876',
        moisFacture: new Date('2026-02-01'),
        montantTotal: 28500,
        statut: 'PAYÉE',
        modeUtilities: 'Orange Money'
      },
      {
        leaseId: lease.id,
        acteurId: tenant.id,
        roleActeur: 'LOCATAIRE',
        typeUtility: 'SODECI',
        identifiantCompteur: 'SD-ABJ-09234',
        moisFacture: new Date('2026-02-01'),
        montantTotal: 9200,
        statut: 'PAYÉE',
        modeUtilities: 'Wave'
      }
    ]
  });

  // 8. Caution
  await prisma.cautionBail.create({
    data: {
      bailId: lease.id,
      montantFcfa: 300000,
      dateVersement: new Date('2026-01-01'),
      modeVersement: 'VIREMENT',
      destination: 'AGENCE',
      confirmeLocataire: true,
      certificatRef: 'CERT-CAU-0042'
    }
  });

  // 9. Maintenance Ticket
  await prisma.reclamationLocataire.create({
    data: {
      leaseId: lease.id,
      tenantId: tenant.id,
      typeReclamation: 'RCL-02',
      description: 'Loyer Mars 2026 payé — quittance manquante',
      statut: 'OUVERT',
      dateEcheance: new Date('2026-03-26T10:23:00Z')
    }
  });

  console.log('--- SEEDING COMPLETED ---');
  console.log('LOGIN: souleymane@qapril.ci');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
