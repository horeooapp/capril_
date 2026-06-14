import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import LeasesDashboardClient from "./leases-client";
import { serializeLease } from "@/lib/serialize";

export default async function LeasesDashboardPage() {
    const session = await auth();
    let leases: Record<string, any>[] = [];

    if (session?.user?.id) {
        const userId = session.user.id;
        
        // 1. Get User Context (to handle Agency Collaborators)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { agencyConfig: true }
        });
        
        const config = (user?.agencyConfig as any);
        const managerId = config?.managerId;

        // 2. Hierarchical Query
        // - Leases where user is landlord or agent
        // - Leases on properties managed by the user
        // - (If collab) Leases managed by their agency manager
        // - (If manager) Leases managed by their collaborators
        leases = await prisma.lease.findMany({
            where: {
                OR: [
                    { landlordId: userId },
                    { agentId: userId },
                    { property: { managedByUserId: userId } },
                    ...(managerId ? [
                        { agentId: managerId },
                        { property: { managedByUserId: managerId } }
                    ] : []),
                    // Logic to see work of collaborators
                    { agent: { agencyConfig: { path: ['managerId'], equals: userId } } }
                ],
                status: { not: "ARCHIVED" }
            },
            include: {
                tenant: { select: { firstName: true, lastName: true } },
                property: { select: { name: true, address: true, propertyCode: true, unitLabel: true } }
            },
            take: 50, // Increased for agencies
            orderBy: { createdAt: "desc" }
        });
        
        // 3. Serialize
        leases = leases.map(l => serializeLease(l)) as any;

        // 4. Fetch BDQ (Bail Declaratif) waiting for confirmation
        const bdqs = await prisma.bailDeclaratif.findMany({
            where: {
                bailleurId: userId,
                statut: { notIn: ["ARCHIVE", "FORMALISE", "CONTESTE"] }
            },
            include: {
                property: { select: { name: true, address: true, propertyCode: true, unitLabel: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        const mappedBdqs = bdqs.map(b => ({
            id: b.id,
            leaseReference: `BDQ-${b.id.substring(0,8)}`,
            leaseType: "VERBAL (BDQ)",
            tenant: { firstName: b.prenomLocataireDeclare || "", lastName: b.nomLocataireDeclare || b.telephoneLocataire },
            rentAmount: Number(b.loyerDeclareMensuel || 0),
            status: b.statut === "PENDING_LOCATAIRE" ? "PENDING_CONFIRMATION" : b.statut,
            daysSinceCreation: Math.floor((new Date().getTime() - new Date(b.createdAt).getTime()) / (1000 * 3600 * 24)),
            isExpiringSoon: b.statut === "PENDING_LOCATAIRE",
        }));

        leases = [...mappedBdqs, ...leases];
    }

    return <LeasesDashboardClient initialLeases={leases} />;
}
