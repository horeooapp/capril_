const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function promoteToAdmin(email) {
  try {
    const user = await prisma.user.upsert({
      where: { email: email },
      update: { role: 'ADMIN' },
      create: {
        email: email,
        name: 'Achille Mbesso',
        role: 'ADMIN'
      }
    })
    console.log(`Utilisateur ${email} promu au rôle ADMIN avec succès !`)
  } catch (error) {
    console.error(`Erreur lors de la promotion de ${email}:`, error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Récupérer l'email depuis les arguments de la ligne de commande
const email = process.argv[2]
if (!email) {
  console.log("Usage: node promote-admin.js <email>")
  process.exit(1)
}

promoteToAdmin(email)
