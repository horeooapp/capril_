import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const tenant = await prisma.user.create({
            data: {
                email: "locataire.ussd@qapril.ci",
                name: "Locataire USSD",
                phone: "+2250707070707",
                role: "TENANT"
            }
        });

        const landlord = await prisma.user.create({
            data: {
                email: "bailleur.ussd@qapril.ci",
                name: "Bailleur USSD",
                role: "LANDLORD"
            }
        });

        const property = await prisma.property.create({
            data: {
                address: "Rue des Jardins",
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

        return NextResponse.json({ success: true, user: tenant })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message })
    }
}
