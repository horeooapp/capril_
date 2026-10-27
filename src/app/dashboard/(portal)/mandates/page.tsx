import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import MandatesDashboardClient from "./mandates-client";

export default async function MandatesDashboardPage() {
    const session = await auth();
    let mandates: Record<string, any>[] = [];
    let properties: any[] = [];
    const managedLandlords: any[] = [];

    if (session?.user?.id) {
        // Mandats de l'agence ou du propriétaire avec propriété + propriétaire + agent
        mandates = await prisma.mandate.findMany({
            where: {
                OR: [
                    { agentUserId: session.user.id },
                    { property: { ownerUserId: session.user.id } }
                ]
            },
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
                },
                agent: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        avatarUrl: true
                    }
                }
            },
            take: 100,
            orderBy: { createdAt: "desc" }
        });

        // Biens disponibles pour créer de nouveaux mandats (avec loyer indicatif et propriétaire)
        properties = await prisma.property.findMany({
            where: {
                deletedAt: null
            },
            take: 100,
            select: { 
                id: true, 
                name: true, 
                address: true, 
                commune: true,
                propertyCode: true,
                propertyType: true,
                declaredRentFcfa: true,
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        // Liste dédupliquée des propriétaires ayant confié des biens
        const seenIds = new Set<string>();
        for (const m of mandates) {
            const owner = (m as any).property?.owner;
            if (owner && !seenIds.has(owner.id)) {
                seenIds.add(owner.id);
                managedLandlords.push({
                    ...owner,
                    managedProperties: mandates
                        .filter((mm: any) => mm.property?.owner?.id === owner.id)
                        .map((mm: any) => ({
                            id: mm.property?.id,
                            address: mm.property?.address,
                            propertyCode: mm.property?.propertyCode,
                            mandateStatus: mm.status,
                            mandateRef: mm.mandateRef,
                            mandateType: mm.mandateType,
                            commissionPct: mm.commissionPct,
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
