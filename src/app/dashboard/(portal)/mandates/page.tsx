import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import MandatesDashboardClient from "./mandates-client";

export default async function MandatesDashboardPage() {
    const session = await auth();
    let mandates: Record<string, any>[] = [];
    let properties: any[] = [];
    const managedLandlords: any[] = [];

    if (session?.user?.id) {
        // Mandats de l'agence avec propriété + propriétaire
        mandates = await prisma.mandate.findMany({
            where: { agentUserId: session.user.id },
            include: {
                property: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                                avatarUrl: true,
                            }
                        }
                    }
                }
            },
            take: 50,
            orderBy: { createdAt: "desc" }
        });

        // Biens disponibles pour créer de nouveaux mandats
        properties = await prisma.property.findMany({
            take: 100,
            select: { id: true, name: true, address: true, propertyCode: true }
        });

        // Liste dédupliquée des propriétaires ayant confié des biens à cette agence
        const seenIds = new Set<string>();
        for (const m of mandates) {
            const owner = (m as any).property?.owner;
            if (owner && !seenIds.has(owner.id)) {
                seenIds.add(owner.id);
                managedLandlords.push({
                    ...owner,
                    // Propriétés confiées par ce propriétaire
                    managedProperties: mandates
                        .filter((mm: any) => mm.property?.owner?.id === owner.id)
                        .map((mm: any) => ({
                            id: mm.property?.id,
                            address: mm.property?.address,
                            propertyCode: mm.property?.propertyCode,
                            mandateStatus: mm.status,
                            mandateRef: mm.mandateRef,
                        }))
                });
            }
        }
    }

    return (
        <MandatesDashboardClient
            initialMandates={mandates}
            properties={properties}
            managedLandlords={managedLandlords}
        />
    );
}
