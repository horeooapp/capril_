import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt-ts';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@qapril.ci';
  const password = 'admin1234';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`[ADMIN-ACTIVATE] Upserting ${email}...`);

  const user = await prisma.user.upsert({
    where: { phone: '+225000000000' }, // Use a unique identifier known for rescue
    update: {
      email,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'active'
    },
    create: {
      email,
      phone: '+225000000000',
      fullName: 'Administrateur Principal',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'active'
    }
  });

  console.log(`[ADMIN-ACTIVATE] SUCCESS: ${user.email} is now activated with SUPER_ADMIN role.`);
}

main()
  .catch((e) => {
    console.error('[ADMIN-ACTIVATE] ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
