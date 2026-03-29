const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING QAPRIL ECOSYSTEM (GLOBAL) ---');

  // 1. LANDLORD: M. Kouassi
  const landlord = await prisma.user.upsert({
    where: { email: 'kouassi@qapril.ci' },
    update: {
      role: 'LANDLORD',
      landlordCode: 'BAI-042',
      walletBalance: 125000,
      activePlanTier: 'PREMIUM'
    },
    create: {
      email: 'kouassi@qapril.ci',
      fullName: 'M. Kouassi Adama',
      role: 'LANDLORD',
      phone: '+225 01 42 42 42 42',
      landlordCode: 'BAI-042',
      walletBalance: 125000,
      onboardingComplete: true,
      activePlanTier: 'PREMIUM'
    }
  });

  // 2. AGENCY: Ivoire Accueil
  const agency = await prisma.user.upsert({
    where: { email: 'agence@ivoire-accueil.ci' },
    update: {
      role: 'AGENCY',
      isCertified: true,
      landlordCode: 'AGE-001'
    },
    create: {
      email: 'agence@ivoire-accueil.ci',
      fullName: 'Ivoire Accueil & Gestion',
      role: 'AGENCY',
      phone: '+225 27 22 44 55 66',
      isCertified: true,
      landlordCode: 'AGE-001',
      onboardingComplete: true
    }
  });

  // 3. DIASPORA: Moussa (Expatrié)
  const diaspora = await prisma.user.upsert({
    where: { email: 'moussa.exp@qapril.ci' },
    update: {
      role: 'LANDLORD',
      diasporaAbonnement: true,
      diasporaDevise: 'EUR',
      paysResidence: 'France',
      walletBalance: 450
    },
    create: {
      email: 'moussa.exp@qapril.ci',
      fullName: 'Moussa Diakité',
      role: 'LANDLORD',
      phone: '+33 6 12 34 56 78',
      diasporaAbonnement: true,
      diasporaDevise: 'EUR',
      paysResidence: 'France',
      diasporaWhatsapp: '+33612345678',
      walletBalance: 450,
      onboardingComplete: true
    }
  });

  // 4. PROPERTIES & LEASES
  
  // Prop 1: Managed by Agency (Landlord: Kouassi)
  const propAgency = await prisma.property.upsert({
    where: { propertyCode: 'LOG-PLATEAU-001' },
    update: { managedByUserId: agency.id },
    create: {
      propertyCode: 'LOG-PLATEAU-001',
      name: 'Villa Emeraude — Managed',
      address: 'Rue des Jardins, Plateau',
      commune: 'Plateau',
      propertyType: 'villa',
      ownerUserId: landlord.id,
      managedByUserId: agency.id,
      status: 'active'
    }
  });

  // Prop 2: Direct Management (Landlord: Kouassi)
  const propDirect = await prisma.property.upsert({
    where: { propertyCode: 'LOG-COCODY-001' },
    update: {},
    create: {
      propertyCode: 'LOG-COCODY-001',
      name: 'Studio Chic Cocody — Direct',
      address: 'Cité des Arts, Cocody',
      commune: 'Cocody',
      propertyType: 'studio',
      ownerUserId: landlord.id,
      status: 'active'
    }
  });

  // Prop 3: Diaspora Asset
  const propDiaspora = await prisma.property.upsert({
    where: { propertyCode: 'LOG-YOP-001' },
    update: {},
    create: {
      propertyCode: 'LOG-YOP-001',
      name: 'Appt Diaspora — Yopougon',
      address: 'Quartier Maroc, Yopougon',
      commune: 'Yopougon',
      propertyType: 'apartment',
      ownerUserId: diaspora.id,
      status: 'active'
    }
  });

  // 5. TENANT: Traoré (for Prop 1)
  const tenant = await prisma.user.upsert({
    where: { email: 'souleymane@qapril.ci' },
    update: { role: 'TENANT' },
    create: {
      email: 'souleymane@qapril.ci',
      fullName: 'Traoré Souleymane',
      role: 'TENANT',
      phone: '+225 05 44 55 66',
      onboardingComplete: true
    }
  });

  const lease = await prisma.lease.upsert({
    where: { leaseReference: 'BAIL-TEN-001' },
    update: { tenantId: tenant.id },
    create: {
      leaseReference: 'BAIL-TEN-001',
      propertyId: propAgency.id,
      landlordId: landlord.id,
      tenantId: tenant.id,
      startDate: new Date('2026-01-01'),
      durationMonths: 12,
      rentAmount: 450000,
      status: 'ACTIVE',
      typeGestion: 'agreee',
      bailleurMasque: true
    }
  });

  // 6. WALLET CONFIGS & HISTORY
  await prisma.configTarif.upsert({
    where: { cle: 'quittance_ttc' },
    update: { valeur: 75 },
    create: { 
      cle: 'quittance_ttc', 
      valeur: 75, 
      description: 'Coût unitaire TTC par quittance émise (ADD-07 v3)'
    }
  });

  // Audit Logs for Landlord
  await prisma.auditLog.createMany({
    data: [
      {
        userId: landlord.id,
        action: 'WALLET_CREDIT',
        module: 'WALLET',
        entityId: 'WAL-SEED-001',
        newValues: { amount: 150000, provider: 'WAVE', newBalance: 150000 }
      },
      {
        userId: landlord.id,
        action: 'WALLET_DEBIT',
        module: 'WALLET',
        entityId: lease.id,
        newValues: { amount: 75, action: 'Émission Quittance JAN-2026', newBalance: 149925 }
      }
    ]
  });

  // 7. CHAMPION: Alpha
  const champion = await prisma.user.upsert({
    where: { email: 'alpha.champion@qapril.ci' },
    update: { role: 'CHAMPION' },
    create: {
      email: 'alpha.champion@qapril.ci',
      fullName: 'Alpha le Champion',
      role: 'CHAMPION',
      phone: '+225 07 00 11 22 33',
      onboardingComplete: true
    }
  });

  await prisma.championProfile.upsert({
    where: { userId: champion.id },
    update: {},
    create: {
      userId: champion.id,
      zonePrincipale: 'Cocody',
      objectifMensuel: 50
    }
  });

  // 8. UNPAID LEASE (Direct Management for Kouassi)
  const tenant2 = await prisma.user.upsert({
    where: { email: 'mira@qapril.ci' },
    update: { role: 'TENANT' },
    create: {
      email: 'mira@qapril.ci',
      fullName: 'Mira Yao',
      role: 'TENANT',
      phone: '+225 01 99 88 77 66',
      onboardingComplete: true
    }
  });

  const leaseDirect = await prisma.lease.upsert({
    where: { leaseReference: 'BAIL-DIR-402' },
    update: {},
    create: {
      leaseReference: 'BAIL-DIR-402',
      propertyId: propDirect.id,
      landlordId: landlord.id,
      tenantId: tenant2.id,
      startDate: new Date('2025-12-01'),
      durationMonths: 12,
      rentAmount: 250000,
      status: 'ACTIVE',
      typeGestion: 'directe'
    }
  });

  // Create arrears for this lease
  await prisma.leaseArrear.createMany({
    data: [
      {
        leaseId: leaseDirect.id,
        amount: 250000,
        dueDate: new Date('2026-02-05'),
        status: 'unpaid'
      },
      {
        leaseId: leaseDirect.id,
        amount: 250000,
        dueDate: new Date('2026-03-05'),
        status: 'unpaid'
      }
    ]
  });

  console.log('--- SEEDING COMPLETED ---');
  console.log('Landlord: kouassi@qapril.ci (Balance: 125,000 FCFA)');
  console.log('Champion: alpha.champion@qapril.ci');
  console.log('Arrears created for: mira@qapril.ci (250,000 FCFA x 2)');
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
