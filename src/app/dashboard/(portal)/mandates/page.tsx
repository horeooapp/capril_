import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import MandatesDashboardClient from "./mandates-client";

export const metadata = {
    title: "Mes Mandats de Gestion | QAPRIL Propriétaire",
    description: "Gérez vos mandats de gestion locative confiés aux agences immobilières agréées."
};

export default async function MandatesDashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/dashboard/login");
    }

    const userId = session.user.id;
    const userRole = (session.user as any).role as string || "LANDLORD";
    const capaciteActive = ((session.user as any).capaciteActive as string) || "";

    // Si l'utilisateur est une agence ou un démarcheur, le rediriger vers sa vue dédiée "Biens sous mandat"
    const isAgency = ['AGENCY', 'AGENCE_AGREE', 'AGENCY_AGREE', 'INTERMEDIARY', 'NON_CERTIFIED_AGENT', 'AGENCE_NON_AGREE', 'AGENCY_NON_AGREE'].includes(userRole) ||
                     capaciteActive.includes('AGENCE') ||
                     capaciteActive.includes('AGENCY');

    if (isAgency) {
        redirect("/dashboard/biens-sous-mandat");
    }

    let mandates: any[] = [];
    let properties: any[] = [];
    let agencies: any[] = [];

    try {
        // Vue Propriétaire : Mandats donnés par le propriétaire pour ses biens
        mandates = await prisma.mandate.findMany({
            where: {
                property: {
                    ownerUserId: userId
                }
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
                                leaseReference: true,
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
                        legalEntity: {
                            select: {
                                companyName: true
                            }
                        }
                    }
                }
            },
            take: 100,
            orderBy: { createdAt: "desc" }
        });

        // Biens appartenant au propriétaire connecté et éligibles à la gérance
        properties = await prisma.property.findMany({
            where: {
                ownerUserId: userId,
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

        // Agences immobilières et mandataires certifiés disponibles sur QAPRIL
        agencies = await prisma.user.findMany({
            where: {
                OR: [
                    { role: Role.AGENCY },
                    { role: Role.NON_CERTIFIED_AGENT }
                ]
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true,
                companyRegNumber: true,
                isCertified: true,
                legalEntity: {
                    select: {
                        companyName: true
                    }
                }
            },
            take: 50,
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("[MandatesDashboardPage] Erreur:", error);
    }

    return (
        <MandatesDashboardClient
            initialMandates={mandates}
            properties={properties}
            agencies={agencies}
        />
    );
}
