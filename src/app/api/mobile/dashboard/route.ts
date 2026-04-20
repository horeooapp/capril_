import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { NextResponse } from 'next/server';
import { getCommuneMarketReport } from '@/lib/observatory';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, role } = body;

        // Validation de sécurité avec JWT
        if (!token) {
            return NextResponse.json({ error: "Non autorisé. Jeton manquant." }, { status: 401 });
        }

        const payload = await verifyMobileToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const userId = payload.userId;

        // Récupération de l'utilisateur via l'ID extrait du JWT
        const user = await prisma.user.findUnique({
            where: { id: userId },
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
            const activeLease = await prisma.lease.findFirst({
                where: {
                    tenantId: userId,
                    status: { in: ["ACTIVE", "LOYER_IMPAYE", "PENDING_SIGNATURE", "ACTIVE_DECLARATIF"] }
                },
                include: {
                    property: true,
                    arrears: {
                        where: { status: { in: ["unpaid", "UNPAID"] } }
                    },
                    receipts: {
                        orderBy: { createdAt: "desc" },
                        take: 5
                    }
                }
            });

            if (!activeLease) {
                return NextResponse.json({
                    success: true,
                    data: {
                        greeting: `Bonjour, ${fallbackName}`,
                        balanceDue: "Aucun bail actif",
                        totalArrears: 0,
                        nextDueDate: "-",
                        recentReceipts: [],
                        activeRequests: 0,
                        hasLease: false
                    }
                });
            }

            const totalArrears = activeLease.arrears.reduce((sum, arr) => sum + Number(arr.amount || 0), 0);
            const nextDueDate = activeLease.paymentDay ? `Le ${activeLease.paymentDay} du mois` : "Non spécifié";

            // Vrais requêtes de maintenance
            const activeRequestsCount = await prisma.ticketMaintenance.count({
                where: { logementId: activeLease.propertyId, statut: { in: ['EN_ATTENTE', 'PRIS_EN_CHARGE'] } }
            });

            return NextResponse.json({
                success: true,
                data: {
                    greeting: `Bonjour, ${fallbackName}`,
                    balanceDue: totalArrears > 0 ? `${totalArrears.toLocaleString('fr-FR')} FCFA` : "À jour",
                    totalArrears,
                    nextDueDate,
                    recentReceipts: activeLease.receipts.map(r => ({
                        id: r.id,
                        period: r.periodMonth,
                        amount: r.totalAmount,
                        date: r.createdAt,
                        qrToken: r.qrToken
                    })),
                    activeRequests: activeRequestsCount,
                    hasLease: true,
                    userId: user.id,
                    userEmail: user.email,
                    fullName: fallbackName,
                    lease: {
                        id: activeLease.id,
                        ref: activeLease.leaseReference,
                        propertyName: activeLease.property.name || activeLease.property.propertyCode,
                        address: activeLease.property.address,
                        rent: activeLease.rentAmount,
                        charges: activeLease.chargesAmount,
                        status: activeLease.status
                    }
                }
            });
        }

        // Si Propriétaire
        if (role === 'OWNER' || role === 'LANDLORD') {
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

            const pendingRepairsCount = await prisma.ticketMaintenance.count({
                where: { logementId: { in: propertiesMobile.map(p => p.id) }, statut: 'EN_ATTENTE' }
            });

            // --- CALCUL HISTORIQUE REVENU (6 MOIS) ---
            const last6Months: any[] = [];
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = d.toLocaleString('fr-FR', { month: 'short' }).toUpperCase();
                const monthNum = d.getMonth() + 1;
                const yearNum = d.getFullYear();

                const monthlyRevenue = await prisma.receipt.aggregate({
                    where: {
                        lease: {
                            property: { ownerUserId: userId }
                        },
                        periodMonth: `${yearNum}-${String(monthNum).padStart(2, '0')}`,
                        status: { in: ["PAID", "ENCAISSE", "SUCCESS"] }
                    },
                    _sum: { totalAmount: true }
                });

                last6Months.push({
                    month: monthName,
                    amount: monthlyRevenue._sum.totalAmount || 0
                });
            }
            
            // --- RECHERCHE STATS OBSERVATOIRE (Marché local) ---
            let marketStats = null;
            if (user.propertiesOwned.length > 0) {
                const communes = user.propertiesOwned.map(p => p.commune).filter(Boolean);
                const counts = communes.reduce((acc: any, c) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {});
                const topCommune = Object.keys(counts).sort((a,b) => (counts[b] || 0) - (counts[a] || 0))[0];
                
                if (topCommune) {
                    const reports = await getCommuneMarketReport(topCommune);
                    if (reports && reports.length > 0) {
                        const avgMarketRent = reports[0].avgRent;
                        
                        // Calcul du positionnement (ADD-20)
                        const userPropertiesInCommune = user.propertiesOwned.filter(p => p.commune === topCommune);
                        let sumUserRent = 0;
                        let countUserUnits = 0;
                        
                        for (const p of userPropertiesInCommune) {
                            if (p.typeStructure === "INDEPENDANT") {
                                sumUserRent += p.leases?.[0]?.rentAmount || p.declaredRentFcfa || 0;
                                countUserUnits++;
                            } else {
                                for (const u of (p.units || [])) {
                                    sumUserRent += u.leases?.[0]?.rentAmount || u.declaredRentFcfa || 0;
                                    countUserUnits++;
                                }
                            }
                        }
                        
                        const userAvgRent = countUserUnits > 0 ? sumUserRent / countUserUnits : 0;
                        const diffPct = avgMarketRent > 0 ? Math.round(((userAvgRent - avgMarketRent) / avgMarketRent) * 100) : 0;

                        marketStats = {
                            commune: topCommune,
                            avgRent: avgMarketRent,
                            trendPct: reports[0].trendPct,
                            period: reports[0].period,
                            userAvgRent,
                            marketPositioning: diffPct, // Pourcentage (+ ou -) par rapport au marché
                        };
                    }
                }
            }

            const totalProperties = user.propertiesOwned.length;
            const onboarding = totalProperties === 0;

            // SUGGESTION RECHARGE (ADD-07)
            const { calculateSuggestedRecharge } = await import('@/lib/wallet/calculator');
            const suggestedRecharge = await calculateSuggestedRecharge(userId);

            return NextResponse.json({
                success: true,
                data: {
                    greeting: `Bonjour, ${fallbackName}`,
                    totalRevenue: `${totalRevenue.toLocaleString('fr-FR')} FCFA`,
                    occupancyRate: `${occupancyRate}%`,
                    properties: propertiesMobile,
                    totalProperties,
                    onboarding,
                    userId: user.id,
                    userEmail: user.email,
                    fullName: fallbackName,
                    role: user.role, // LANDLORD or LANDLORD_PRO
                    pendingRepairs: pendingRepairsCount,
                    revenueHistory: last6Months,
                    marketStats,
                    suggestedRecharge
                }
            });
        }

        return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });

    } catch (error: any) {
        console.error("Erreur Mobile Dashboard:", error);
        return NextResponse.json({ error: "Erreur serveur : " + error.message }, { status: 500 });
    }
}
