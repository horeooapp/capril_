import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt-ts'

const prisma = new PrismaClient()

async function testAuth() {
    const email = "admin@qapril.net"
    const password = "adminPassword123!"

    console.log("Testing auth for:", email)

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            console.log("❌ User not found in DB")
            return
        }

        console.log("✅ User found in DB")
        console.log("Stored password hash:", user.password)

        if (!user.password) {
            console.log("❌ User has no password set")
            return
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            console.log("❌ Password comparison failed!")

            // Let's create a new hash of the password to see what it looks like
            const newHash = await bcrypt.hash(password, 10)
            console.log("New hash for same password:", newHash)
            return
        }

        console.log("✅ Password comparison succeeded!")

    } catch (error) {
        console.error("Error during test:", error)
    } finally {
        await prisma.$disconnect()
    }
}

testAuth()
