const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function check() {
  try {
    const user = await prisma.user.findFirst({
      where: { 
        email: "admin@qapril.ci",
        role: { in: ['ADMIN', 'SUPER_ADMIN'] }
      }
    });
    console.log("Success:", user);
  } catch (e) {
    console.error("Name:", e.name);
    console.error("Message:", e.message);
  }
}

check().finally(() => prisma.$disconnect());
