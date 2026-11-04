import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BiensSousMandatClient from "./biens-sous-mandat-client";

export const metadata = {
    title: "Biens Gérés sous Mandat | QAPRIL Agence",
    description: "Portefeuille des biens immobiliers gérés sous mandat confiés par les propriétaires bailleurs."
};

export default async function BiensSousMandatPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/dashboard/login");
    }

    const userId = session.user.id;
    const userRole = (session.user as any).role || "AGENCY";
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole);

    // Récupérer tous les mandats reçus par l'agence (ou tous les mandats si admin)
    const mandates = await prisma.mandate.findMany({
        where: isAdmin ? {} : {
            OR: [
                { agentUserId: userId },
                // Fallback si le mandat est lié à l'agence
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
                    },
                    leases: {
                        where: { status: "ACTIVE" },
                        select: {
                            id: true,
                            leaseRef: true,
                            rentAmount: true,
                            tenant: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    phone: true
                                }
                            }
                        },
                        take: 1
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
                    avatarUrl: true,
                    companyRegNumber: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 100
    });

    // Extraire la liste dédupliquée des propriétaires mandants
    const managedLandlordsMap = new Map<string, any>();
    for (const m of mandates) {
        const owner = m.property?.owner;
        if (owner && !managedLandlordsMap.has(owner.id)) {
            const ownerProperties = mandates
                .filter(mm => mm.property?.owner?.id === owner.id)
                .map(mm => ({
                    id: mm.property?.id,
                    address: mm.property?.address,
                    name: mm.property?.name,
                    propertyCode: mm.property?.propertyCode,
                    propertyType: mm.property?.propertyType,
                    mandateStatus: mm.status,
                    mandateRef: mm.mandateRef,
                    mandateType: mm.mandateType,
                    commissionPct: mm.commissionPct,
                    declaredRentFcfa: mm.property?.declaredRentFcfa,
                    activeLease: mm.property?.leases?.[0] || null
                }));

            managedLandlordsMap.set(owner.id, {
                ...owner,
                managedProperties: ownerProperties,
                totalBiens: ownerProperties.length
            });
        }
    }

    const managedLandlords = Array.from(managedLandlordsMap.values());

    return (
        <BiensSousMandatClient
            initialMandates={mandates}
            managedLandlords={managedLandlords}
            userAgencyName={session.user.name || "Mon Agence"}
        />
    );
}
