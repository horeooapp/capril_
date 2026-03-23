const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('--- Verification Compte Admin ---');
    const email = 'admin@qapril.net';

    try {
        const users = await prisma.$queryRaw`SELECT user_id, email, role, status, (password IS NOT NULL) as has_password FROM users WHERE email = ${email} LIMIT 1`;
        
        if (users.length > 0) {
            const u = users[0];
            console.log('Utilisateur trouvé :');
            console.log(`- ID: ${u.user_id}`);
            console.log(`- Email: ${u.email}`);
            console.log(`- Rôle: ${u.role}`);
            console.log(`- Status: ${u.status}`);
            console.log(`- Mot de passe configuré: ${u.has_password}`);
            
            if (u.role !== 'SUPER_ADMIN' && u.role !== 'ADMIN') {
                console.warn('⚠️ ATTENTION : Le rôle n\'est pas un rôle administratif !');
            }
            if (u.status !== 'active') {
                console.warn('⚠️ ATTENTION : Le compte n\'est pas actif !');
            }
        } else {
            console.log('❌ Utilisateur non trouvé avec cet email.');
        }
    } catch (error) {
        console.error('❌ Erreur SQL :', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
