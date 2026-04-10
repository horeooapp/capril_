import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, role } = body;

        // Validation très basique de sécurité pour MVP
        if (!token || token === 'DUMMY_TOKEN') {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou manquant." }, { status: 401 });
        }

        // Pour ce MVP, on suppose que le token passé par l'app React Native correspond à l'ID utilisateur
        const user = await prisma.user.findUnique({
            where: { id: token },
            include: {
                propertiesOwned: {
                    where: { status: { not: "archived" } },
                    include: {
                        units: { include: { leases: { where: { status: "ACTIVE" } } } },
                        leases: { where: { status: "ACTIVE" } }
                    }
                },
                leasesAsTenant: {
                    where: { status: "ACTIVE" }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        const fallbackName = user.firstName || user.lastName || "Utilisateur";

        // Si Locataire
        if (role === 'TENANT') {
            const hasActiveLease = user.leasesAsTenant && user.leasesAsTenant.length > 0;
            return NextResponse.json({
                success: true,
                data: {
                    greeting: `Bonjour, ${fallbackName}`,
                    balanceDue: hasActiveLease ? "Consultez vos quittances" : "Aucun bail actif",
                    nextDueDate: "-",
                    recentReceipts: [],
                    activeRequests: 0
                }
            });
        }

        // Si Propriétaire
        if (role === 'OWNER') {
            let totalRevenue = 0;
            let totalUnits = 0;
            let occupiedUnits = 0;
            const propertiesMobile: any[] = [];

            for (const prop of user.propertiesOwned) {
                if (prop.typeStructure === "INDEPENDANT") {
                    totalUnits++;
                    const hasLease = prop.leases && prop.leases.length > 0;
                    if (hasLease) {
                        occupiedUnits++;
                        totalRevenue += prop.leases[0].rentAmount || prop.declaredRentFcfa || 0;
                    }
                    propertiesMobile.push({
                        id: prop.id,
                        name: prop.name || prop.propertyCode,
                        status: hasLease ? "Loué" : "Vacant",
                        rent: hasLease ? `${prop.leases[0].rentAmount || 0} FCFA` : `${prop.declaredRentFcfa || 0} FCFA`
                    });
                } else {
                    // Structure parente (Type Immeuble / Cour) - On s'intéresse aux sous-unités
                    if (prop.units && prop.units.length > 0) {
                        for (const unit of prop.units) {
                            totalUnits++;
                            const unitHasLease = unit.leases && unit.leases.length > 0;
                            if (unitHasLease) {
                                occupiedUnits++;
                                totalRevenue += unit.leases[0].rentAmount || unit.declaredRentFcfa || 0;
                            }
                            propertiesMobile.push({
                                id: unit.id,
                                name: `${prop.name || prop.propertyCode} - ${unit.unitLabel || "Unité"}`,
                                status: unitHasLease ? "Loué" : "Vacant",
                                rent: unitHasLease ? `${unit.leases[0].rentAmount || 0} FCFA` : `${unit.declaredRentFcfa || 0} FCFA`
                            });
                        }
                    } else {
                        // Cas rare : Immeuble principal créé mais aucune unité dedans
                        propertiesMobile.push({
                            id: prop.id,
                            name: prop.name || prop.propertyCode,
                            status: "Vide/Config",
                            rent: "0 FCFA"
                        });
                    }
                }
            }

            const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

            return NextResponse.json({
                success: true,
                data: {
                    greeting: `Bonjour, ${fallbackName}`,
                    totalRevenue: `${totalRevenue.toLocaleString('fr-FR')} FCFA`,
                    occupancyRate: `${occupancyRate}%`,
                    properties: propertiesMobile,
                    pendingRepairs: 0
                }
            });
        }

        return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });

    } catch (error: any) {
        console.error("Erreur Mobile Dashboard:", error);
        return NextResponse.json({ error: "Erreur serveur : " + error.message }, { status: 500 });
    }
}
