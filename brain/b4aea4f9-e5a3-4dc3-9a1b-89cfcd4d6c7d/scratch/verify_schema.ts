
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Verification of Email Verification System ---')

  // 1. Check if EmailVerificationToken model is accessible
  try {
    const tokenCount = await prisma.emailVerificationToken.count()
    console.log(`[OK] emailVerificationToken model exists. Current count: ${tokenCount}`)
  } catch (error: any) {
    console.error(`[FAIL] emailVerificationToken model NOT found: ${error.message}`)
  }

  // 2. Check if User has new fields
  try {
    const user = await prisma.user.findFirst({
        select: {
            id: true,
            email: true,
            emailVerified: true,
            emailVerifiedAt: true
        }
    })
    if (user) {
      console.log(`[OK] User model has emailVerified field: ${user.emailVerified}`)
      console.log(`[OK] User model has emailVerifiedAt field: ${user.emailVerifiedAt}`)
    } else {
      console.log('[INFO] No user found in DB to check fields, but query succeeded.')
    }
  } catch (error: any) {
    console.error(`[FAIL] User model missing new fields: ${error.message}`)
  }

  console.log('--- End of Verification ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
