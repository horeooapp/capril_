import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import LeasesDashboardClient from "./leases-client";
import { serializeLease } from "@/lib/serialize";

export default async function LeasesDashboardPage() {
    try {
        const session = await auth();
        let leases: Record<string, any>[] = [];

        if (session?.user?.id) {
            const userId = session.user.id;
            
            // 1. Get User Context
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { agencyConfig: true }
            });
            
            const config = (user?.agencyConfig as any);
            const managerId = config?.managerId;

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
                        { agent: { agencyConfig: { path: ['managerId'], equals: userId } } }
                    ],
                    status: { not: "ARCHIVED" }
                },
                include: {
                    tenant: { select: { firstName: true, lastName: true, phone: true } },
                    property: { select: { id: true, name: true, address: true, propertyCode: true, unitLabel: true, commune: true } }
                },
                take: 50,
                orderBy: { createdAt: "desc" }
            });
            
            leases = leases.map(l => serializeLease(l)) as any;

            // Récupérer les biens du bailleur pour le sélecteur d'édition
            const properties = await prisma.property.findMany({
                where: {
                    OR: [
                        { ownerUserId: userId },
                        { managedByUserId: userId }
                    ],
                    status: { not: "archived" },
                    deletedAt: null
                },
                select: { id: true, name: true, address: true, commune: true, propertyCode: true, unitLabel: true, rentAmount: true },
                orderBy: { name: "asc" }
            });

            const bdqs = await prisma.bailDeclaratif.findMany({
                where: {
                    bailleurId: userId,
                    statut: { notIn: ["ARCHIVE", "FORMALISE"] }
                },
                include: {
                    property: { select: { id: true, name: true, address: true, propertyCode: true, unitLabel: true, commune: true } }
                },
                orderBy: { createdAt: "desc" }
            });

            const mappedBdqs = bdqs.map(b => {
                const days = Math.floor((new Date().getTime() - new Date(b.createdAt).getTime()) / (1000 * 3600 * 24));
                const isExpired = b.statut === "PENDING_LOCATAIRE" && days >= 5;

                return {
                    id: b.id,
                    leaseReference: `BDQ-${b.id.substring(0,8)}`,
                    leaseType: "VERBAL (BDQ)",
                    isBdq: true,
                    nomLocataireDeclare: b.nomLocataireDeclare,
                    prenomLocataireDeclare: b.prenomLocataireDeclare || "",
                    telephoneLocataire: b.telephoneLocataire,
                    descriptionLogement: b.descriptionLogement,
                    adresseLibre: b.adresseLibre || "",
                    dateEntreeEstimee: b.dateEntreeEstimee ? b.dateEntreeEstimee.toISOString() : null,
                    propertyId: b.propertyId,
                    property: b.property || {
                        name: b.descriptionLogement,
                        address: b.adresseLibre || b.descriptionLogement,
                        commune: "Abidjan"
                    },
                    tenant: { 
                        firstName: b.prenomLocataireDeclare || "", 
                        lastName: b.nomLocataireDeclare || b.telephoneLocataire,
                        phone: b.telephoneLocataire
                    },
                    rentAmount: Number(b.loyerDeclareMensuel || 0),
                    status: isExpired ? "ANNULÉ" : (b.statut === "PENDING_LOCATAIRE" ? "PENDING_CONFIRMATION" : b.statut),
                    rawStatut: b.statut,
                    daysSinceCreation: days,
                    isExpiringSoon: !isExpired && b.statut === "PENDING_LOCATAIRE",
                    createdAt: b.createdAt.toISOString(),
                };
            });

            leases = [...mappedBdqs, ...leases];

            const safeLeases = JSON.parse(JSON.stringify(leases));
            const safeProperties = JSON.parse(JSON.stringify(properties));
            return <LeasesDashboardClient initialLeases={safeLeases} properties={safeProperties} />;
        }

        return <LeasesDashboardClient initialLeases={[]} properties={[]} />;

    } catch (e: any) {
        return (
            <div className="p-8 bg-red-50 text-red-900 border border-red-200 rounded">
                <h2 className="text-xl font-bold mb-4">Erreur Fatale Interceptée</h2>
                <p className="font-mono text-sm mb-2">{e.message}</p>
                <pre className="text-xs overflow-auto p-4 bg-white border border-red-100">{e.stack}</pre>
            </div>
        );
    }
}
