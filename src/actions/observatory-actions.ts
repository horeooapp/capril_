"use server"

import { prisma } from "@/lib/prisma"
import { Role, LeaseStatus } from "@prisma/client"
import { auth } from "@/auth"

/**
 * Fetch the most recent market snapshots for public display
 */
export async function getGlobalMarketStats(limit = 6) {
    try {
        return await prisma.observatorySnapshot.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    } catch (error) {
        console.error("Error fetching market stats:", error);
        return [];
    }
}

/**
 * Admin: Get global activity statistics for the dashboard
 */
export async function getGlobalActivityStats() {
    try {
        const [users, properties, leases, mandates] = await Promise.all([
            prisma.user.count(),
            prisma.property.count(),
            prisma.lease.count({ where: { status: 'ACTIVE' } }),
            prisma.mandate.count({ where: { status: 'ACTIVE' } })
        ]);

        return {
            totalUsers: users,
            totalProperties: properties,
            totalLeases: leases,
            totalMandates: mandates,
            activeColocs: 0, // Placeholder or implement if schema allows
            landLeases: 0,   // Placeholder
            marketTrend: "+4.2%" // Dynamic trend or placeholder
        };
    } catch (error) {
        return { totalUsers: 0, totalProperties: 0, totalLeases: 0, totalMandates: 0, activeColocs: 0, landLeases: 0, marketTrend: "Stable" };
    }
}

/**
 * Admin: Get market insights (top communes by rent)
 */
export async function getMarketInsights() {
    try {
        const snapshots = await prisma.observatorySnapshot.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        return snapshots.map(s => ({
            commune: s.commune,
            avgRent: s.avgRent,
            sampleCount: s.sampleCount
        }));
    } catch (error) {
        return [];
    }
}

/**
 * Admin: Get live event stream (recent audit logs or notifications)
 */
export async function getLiveEventStream() {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { user: { select: { firstName: true, lastName: true } } }
        });
        return logs.map(l => ({
            id: l.id,
            action: l.action,
            user: (l.user?.firstName ? l.user.firstName + " " : "") + (l.user?.lastName || "") || "Système",
            createdAt: l.createdAt
        }));
    } catch (error) {
        return [];
    }
}

/**
 * Admin: Get detailed communal stats
 */
export async function getCommunalStats() {
    try {
        const snapshots = await prisma.observatorySnapshot.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return snapshots.map(s => ({
            name: s.commune,
            leaseCount: s.sampleCount,
            avgRent: s.avgRent,
            trend: s.trendPct >= 0 ? "up" : "down"
        }));
    } catch (error) {
        return [];
    }
}

export async function getObservatoryTrends() {
    try {
        const snapshots = await prisma.observatorySnapshot.findMany({
            orderBy: { period: "asc" },
            take: 100
        });

        if (snapshots.length === 0) {
            return {
                success: true,
                data: { residential: [], commercial: [], land: [] }
            };
        }

        const residential = formatDataForChart(snapshots, "residential");
        const commercial = formatDataForChart(snapshots, "commercial");
        const land = formatDataForChart(snapshots, "land");

        return {
            success: true,
            data: {
                residential,
                commercial,
                land,
            }
        };
    } catch (error: any) {
        console.error("Erreur getObservatoryTrends:", error);
        return { success: false, error: "Impossible de charger les données de l'observatoire." };
    }
}

const COMMUNE_COORDINATES: Record<string, { lat: number; lng: number }> = {
    "COCODY": { lat: 5.3599, lng: -3.9870 },
    "PLATEAU": { lat: 5.3261, lng: -4.0197 },
    "MARCORY": { lat: 5.3050, lng: -3.9850 },
    "TREICHVILLE": { lat: 5.3080, lng: -4.0100 },
    "YOPOUGON": { lat: 5.3400, lng: -4.0700 },
    "KOUMASSI": { lat: 5.2950, lng: -3.9500 },
    "PORT-BOUET": { lat: 5.2570, lng: -3.9350 },
    "PORT BOUET": { lat: 5.2570, lng: -3.9350 },
    "ADJAME": { lat: 5.3600, lng: -4.0250 },
    "ABOBO": { lat: 5.4200, lng: -4.0150 },
    "ATTECOUBE": { lat: 5.3350, lng: -4.0400 },
    "BINGERVILLE": { lat: 5.3580, lng: -3.8950 },
    "SONGON": { lat: 5.3200, lng: -4.2500 },
    "GRAND-BASSAM": { lat: 5.2100, lng: -3.7400 },
    "ANYAMA": { lat: 5.4950, lng: -4.0500 },
    "YAMOUSSOUKRO": { lat: 6.8276, lng: -5.2893 },
    "BOUAKE": { lat: 7.6900, lng: -5.0300 },
    "SAN PEDRO": { lat: 4.7500, lng: -6.6400 },
    "ABIDJAN": { lat: 5.3400, lng: -4.0200 },
};

function calculateMapPercent(lat: number, lng: number, index: number) {
    const minLat = 5.22, maxLat = 5.45;
    const minLng = -4.16, maxLng = -3.85;

    let percentY = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    let percentX = ((lng - minLng) / (maxLng - minLng)) * 100;

    if (isNaN(percentX) || percentX < 8 || percentX > 92) {
        percentX = 25 + ((index * 17) % 50);
    }
    if (isNaN(percentY) || percentY < 8 || percentY > 92) {
        percentY = 25 + ((index * 23) % 50);
    }

    return {
        x: Math.round(percentX),
        y: Math.round(percentY)
    };
}

export async function downloadObservatoryReport() {
    try {
        const session = await auth();
        if (session?.user?.id) {
            await prisma.auditLog.create({
                data: {
                    action: "DOWNLOAD_OBSERVATORY_REPORT",
                    module: "OBSERVATORY",
                    userId: session.user.id
                }
            });
        }
        return { success: true, message: "Rapport d'analyse de marché préparé avec succès." };
    } catch (e) {
        return { success: false, error: "Erreur lors de la préparation du rapport." };
    }
}

function formatDataForChart(snapshots: any[], type: string) {
    return snapshots
        .filter(s => s.propertyType === type)
        .map(s => ({
            label: s.period,
            value: s.avgRent
        }));
}

export async function getObservatorySummary() {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            totalTracked: 0,
            totalSafe: 0,
            totalCritical: 0,
            occupancyRate: 0,
            totalRentRoll: 0,
            avgRent: 0,
            communesCount: 0
        };
    }

    try {
        const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
        const props = await prisma.property.findMany({
            where: isAdmin ? { deletedAt: null } : {
                deletedAt: null,
                OR: [
                    { ownerUserId: session.user.id },
                    { managedByUserId: session.user.id }
                ]
            },
            include: {
                leases: {
                    where: { status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF'] } },
                    select: { id: true, rentAmount: true, status: true }
                }
            }
        });

        const totalTracked = props.length;
        const totalSafe = props.filter(p => p.status === 'rented' || p.leases.length > 0).length;
        const totalCritical = totalTracked - totalSafe;
        const occupancyRate = totalTracked > 0 ? Math.round((totalSafe / totalTracked) * 100) : 0;

        let totalRentRoll = 0;
        props.forEach(p => {
            const activeLease = p.leases[0];
            if (activeLease) {
                totalRentRoll += Number(activeLease.rentAmount || 0);
            } else if (p.declaredRentFcfa) {
                totalRentRoll += Number(p.declaredRentFcfa || 0);
            }
        });

        const avgRent = totalTracked > 0 ? Math.round(totalRentRoll / totalTracked) : 0;
        const distinctCommunes = new Set(props.map(p => p.commune).filter(Boolean));

        return {
            totalTracked,
            totalSafe,
            totalCritical,
            occupancyRate,
            totalRentRoll,
            avgRent,
            communesCount: distinctCommunes.size
        };
    } catch {
        return {
            totalTracked: 0,
            totalSafe: 0,
            totalCritical: 0,
            occupancyRate: 0,
            totalRentRoll: 0,
            avgRent: 0,
            communesCount: 0
        };
    }
}

export async function recalculateMarketStats() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Session expirée. Veuillez vous reconnecter." };
    }

    try {
        // Group all active leases to calculate real market averages
        const activeLeases = await prisma.lease.findMany({
            where: { status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] } },
            include: {
                property: {
                    select: {
                        city: true,
                        commune: true,
                        propertyType: true
                    }
                }
            }
        });

        const marketMap = new Map<string, { totalRent: number; count: number }>();

        activeLeases.forEach((lease) => {
            const city = lease.property?.city || 'ABIDJAN';
            const commune = lease.property?.commune || 'Abidjan';
            const type = lease.property?.propertyType || 'residential';
            const key = `${city}|${commune}|${type}`;

            const current = marketMap.get(key) || { totalRent: 0, count: 0 };
            marketMap.set(key, {
                totalRent: current.totalRent + Number(lease.rentAmount || 0),
                count: current.count + 1
            });
        });

        for (const [key, data] of marketMap.entries()) {
            const [city, commune, propertyType] = key.split('|');
            const averageRent = Math.round(data.totalRent / (data.count || 1));

            await prisma.marketData.upsert({
                where: {
                    city_commune_propertyType: {
                        city,
                        commune,
                        propertyType
                    }
                },
                update: {
                    averageRent,
                    sampleSize: data.count,
                    updatedAt: new Date()
                },
                create: {
                    city,
                    commune,
                    propertyType,
                    averageRent,
                    sampleSize: data.count
                }
            });
        }

        await prisma.auditLog.create({
            data: {
                action: "RECALCULATE_MARKET_STATS",
                module: "OBSERVATORY",
                userId: session.user.id,
                details: { updatedClustersCount: marketMap.size }
            }
        });

        return {
            success: true,
            message: `Observatoire actualisé avec succès (${marketMap.size} grappes communales synchronisées).`
        };
    } catch (e: any) {
        console.error("Erreur recalculateMarketStats:", e);
        return { success: false, error: "Impossible de synchroniser l'observatoire." };
    }
}

export async function exportObservatoryDataCsv() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Session requise." };
    }

    try {
        const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
        const props = await prisma.property.findMany({
            where: isAdmin ? { deletedAt: null } : {
                deletedAt: null,
                OR: [
                    { ownerUserId: session.user.id },
                    { managedByUserId: session.user.id }
                ]
            },
            include: {
                leases: {
                    where: { status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF'] } },
                    select: { id: true, rentAmount: true, status: true, leaseNumber: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const headers = [
            "Code Bien",
            "Nom du Bien",
            "Commune",
            "Adresse",
            "Statut Locatif",
            "Loyer Mensuel (XOF)",
            "Niveau Rentabilite",
            "Latitude GPS",
            "Longitude GPS",
            "Baux Actifs",
            "Date Creation"
        ];

        const rows = props.map((p) => {
            const activeLease = p.leases?.[0];
            const isRented = p.status === 'rented' || !!activeLease;
            const rent = activeLease ? Number(activeLease.rentAmount) : (p.declaredRentFcfa || 0);
            const rentability = rent > 500000 ? "HAUTE" : rent > 250000 ? "MOYENNE" : "ACCESSIBLE";

            const lat = p.gpsLatitude ? Number(p.gpsLatitude).toFixed(6) : "";
            const lng = p.gpsLongitude ? Number(p.gpsLongitude).toFixed(6) : "";

            return [
                p.propertyCode || p.id,
                `"${(p.name || 'Bien immobilier').replace(/"/g, '""')}"`,
                `"${(p.commune || 'Abidjan').replace(/"/g, '""')}"`,
                `"${(p.address || '').replace(/"/g, '""')}"`,
                isRented ? "Loue (Securise)" : "Vacant / Non loue",
                rent,
                rentability,
                lat,
                lng,
                p.leases?.length || 0,
                new Date(p.createdAt).toLocaleDateString("fr-FR")
            ].join(";");
        });

        const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");

        await prisma.auditLog.create({
            data: {
                action: "EXPORT_OBSERVATORY_CSV",
                module: "OBSERVATORY",
                userId: session.user.id,
                details: { rowsCount: props.length }
            }
        });

        return {
            success: true,
            csvData: csvContent,
            filename: `observatoire_qapril_${new Date().getFullYear()}_${String(new Date().getMonth() + 1).padStart(2, '0')}.csv`
        };
    } catch (e: any) {
        return { success: false, error: "Erreur lors de la génération du fichier CSV." };
    }
}

export async function getMapProperties() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';

        let props = await prisma.property.findMany({
            where: isAdmin ? { deletedAt: null } : {
                deletedAt: null,
                OR: [
                    { ownerUserId: session.user.id },
                    { managedByUserId: session.user.id }
                ]
            },
            include: {
                leases: {
                    select: {
                        id: true,
                        status: true,
                        rentAmount: true,
                        leaseNumber: true
                    }
                }
            },
            take: 100,
            orderBy: { updatedAt: 'desc' }
        });

        // Fallback for tenants or users with no direct property ownership
        if (props.length === 0 && !isAdmin) {
            props = await prisma.property.findMany({
                where: {
                    deletedAt: null,
                    leases: {
                        some: { tenantUserId: session.user.id }
                    }
                },
                include: {
                    leases: {
                        select: {
                            id: true,
                            status: true,
                            rentAmount: true,
                            leaseNumber: true
                        }
                    }
                },
                take: 10
            });
        }

        const formatted = props.map((p, index) => {
            if (!p) return null;

            let lat = (p.gpsLatitude !== null && p.gpsLatitude !== undefined) ? Number(p.gpsLatitude) : null;
            let lng = (p.gpsLongitude !== null && p.gpsLongitude !== undefined) ? Number(p.gpsLongitude) : null;

            if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
                const rawCommune = (p.commune || p.city || "Abidjan").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                const matchedCoord = COMMUNE_COORDINATES[rawCommune] || { lat: 5.3400, lng: -4.0200 };

                const offsetLat = (((index % 7) - 3) * 0.0035);
                const offsetLng = ((((index * 3) % 7) - 3) * 0.0035);

                lat = Number((matchedCoord.lat + offsetLat).toFixed(6));
                lng = Number((matchedCoord.lng + offsetLng).toFixed(6));
            }

            const mapPosition = calculateMapPercent(lat, lng, index);

            const activeLease = p.leases?.find(l => l.status === 'ACTIVE' || l.status === 'ACTIVE_DECLARATIF');
            const isRented = p.status === 'rented' || !!activeLease;
            const rentVal = activeLease ? Number(activeLease.rentAmount) : (p.declaredRentFcfa || 0);

            return {
                id: p.id,
                code: p.propertyCode || p.id,
                name: p.name || `Bien ${p.commune || 'Abidjan'}`,
                district: p.commune || p.city || 'Abidjan',
                commune: p.commune || 'Abidjan',
                address: p.address || 'Adresse non renseignée',
                lat,
                lng,
                mapX: mapPosition.x,
                mapY: mapPosition.y,
                status: isRented ? ('SAFE' as const) : ('CRITICAL' as const),
                statusLabel: isRented ? 'Loué & Sécurisé' : 'Vacant / À surveiller',
                rentability: rentVal > 500000 ? ('HAUTE' as const) : rentVal > 250000 ? ('MOYENNE' as const) : ('ACCESSIBLE' as const),
                rentAmount: rentVal,
                units: 1,
                warning: isRented ? null : 'Aucun contrat de bail actif rattaché',
                leaseCount: p.leases?.length || 0,
                hasActiveLease: isRented
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        return formatted;
    } catch (e) {
        console.error("Error in getMapProperties:", e);
        return [];
    }
}
