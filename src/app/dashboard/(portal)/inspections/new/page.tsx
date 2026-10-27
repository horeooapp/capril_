import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import NewInspectionClient from "./new-inspection-client";

export default async function NewInspectionPage() {
    const session = await auth();
    let leases: any[] = [];

    if (session?.user?.id) {
        try {
            leases = await prisma.lease.findMany({
                where: {
                    status: "ACTIVE",
                    OR: [
                        { landlordId: session.user.id },
                        { agentId: session.user.id },
                    ]
                },
                include: {
                    property: {
                        select: { id: true, address: true, propertyCode: true, name: true }
                    },
                    tenant: {
                        select: { id: true, firstName: true, lastName: true, phone: true }
                    }
                },
                take: 100,
                orderBy: { createdAt: "desc" }
            });
        } catch (err) {
            console.error("[inspections/new] Erreur chargement baux:", err);
            leases = [];
        }
    }

    return <NewInspectionClient leases={leases} />;
}
