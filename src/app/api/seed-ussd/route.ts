import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const tenant = await prisma.user.create({
            data: {
                email: "locataire.ussd@qapril.net",
                fullName: "Locataire USSD",
                phone: "+2250707070707",
                role: "TENANT"
            }
        });

        const landlord = await prisma.user.create({
            data: {
                email: "bailleur.ussd@qapril.net",
                fullName: "Bailleur USSD",
                phone: "+2250808080808",
                role: "LANDLORD"
            }
        });

        const property = await prisma.property.create({
            data: {
                propertyCode: "PROP-SEED-USSD",
                address: "Rue des Jardins",
                commune: "Cocody",
                ownerUserId: landlord.id,
                propertyType: "APARTMENT"
            }
        });

        const lease = await prisma.lease.create({
            data: {
                leaseReference: "BAIL-SEED-USSD",
                propertyId: property.id,
                landlordId: landlord.id,
                tenantId: tenant.id,
                startDate: new Date(),
                durationMonths: 12,
                rentAmount: 150000,
                status: "ACTIVE"
            }
        });

        await prisma.receipt.create({
            data: {
                leaseId: lease.id,
                receiptRef: "REC-SEED-USSD",
                rentAmount: 150000,
                totalAmount: 150000,
                periodMonth: "2024-03",
                paymentMethod: "MOBILE_MONEY",
                paidAt: new Date(),
            }
        });

        return NextResponse.json({ success: true, user: tenant })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message })
    }
}
