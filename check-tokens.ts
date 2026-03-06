import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const tokens = await prisma.verificationToken.findMany({
    orderBy: { expires: 'desc' },
    take: 5
  })
  console.log("Recent Verification Tokens:")
  console.log(JSON.stringify(tokens, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
