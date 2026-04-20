const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
    await prisma.featureFlag.upsert({ 
        where: { id: 'LANDING_PAGE' }, 
        update: { enabled: true }, 
        create: { id: 'LANDING_PAGE', name: 'LANDING_PAGE', enabled: true, description: 'Active ou desactive la Landing Page marketing pour les utilisateurs connectes.' } 
    }); 
    console.log('Landing page enabled'); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
