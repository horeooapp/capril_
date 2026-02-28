const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

async function seedUser() {
    const libsql = createClient({ url: "file:dev.db" });
    const adapter = new PrismaLibSql(libsql);
    const prisma = new PrismaClient({ adapter });

    console.log("Seeding test user...");
    try {
        const tenant = await prisma.user.create({
            data: {
                email: "locataire.ussd@qapril.ci",
                name: "Locataire USSD Test",
                phone: "+2250707070707",
                role: "TENANT"
            }
        });

        const landlord = await prisma.user.create({
            data: {
                email: "bailleur.ussd@qapril.ci",
                name: "Bailleur USSD Test",
                role: "LANDLORD"
            }
        });

        const property = await prisma.property.create({
            data: {
                address: "Rue des Jardins, Abidjan",
                city: "Abidjan",
                country: "CI",
                ownerId: landlord.id
            }
        });

        const lease = await prisma.lease.create({
            data: {
                propertyId: property.id,
                tenantId: tenant.id,
                startDate: new Date(),
                rentAmount: 150000,
                status: "ACTIVE"
            }
        });

        await prisma.receipt.create({
            data: {
                leaseId: lease.id,
                receiptNumber: "Q-2024-009999",
                amountPaid: 150000,
                periodStart: new Date(),
                periodEnd: new Date(),
                paymentDate: new Date(),
                qrCodeHash: "ussd-test-qr-hash",
            }
        });

        console.log("Test user seeded successfully.");
    } catch (e) {
        console.error("Error seeding:", e);
    }
}

seedUser();
