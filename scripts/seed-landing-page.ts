import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addLandingPageFlag() {
  const flag = { 
    id: "LANDING_PAGE", 
    name: "Page d'Accueil Marketing", 
    description: "Active ou désactive la Landing Page", 
    enabled: true 
  };
  
  await prisma.featureFlag.upsert({
    where: { id: flag.id },
    update: {},
    create: flag,
  });
  console.log("Upserted LANDING_PAGE");
}

addLandingPageFlag()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
