import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Endpoint REST Sécurisé pour les institutions gouvernementales
// Permet de récupérer les statistiques anonymisées du registre locatif

const EXPECTED_API_KEY = process.env.INSTITUTION_API_KEY || "test-gov-key-2024"

export async function GET(req: Request) {
    try {
        // 1. Authentification très stricte par Bearer Token
        const authHeader = req.headers.get("authorization")
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new NextResponse(JSON.stringify({ error: "Non autorisé. Jeton Bearer manquant." }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        const token = authHeader.split(" ")[1]
        if (token !== EXPECTED_API_KEY) {
            return new NextResponse(JSON.stringify({ error: "Interdit. Clé API invalide." }), { status: 403, headers: { 'Content-Type': 'application/json' } })
        }

        // 2. Récupération des statistiques globales (Anonymisées)
        const totalProperties = await prisma.property.count()
        const totalActiveLeases = await prisma.lease.count({ where: { status: "ACTIVE" } })

        // Calcul du volume financier généré ce mois-ci via les quittances
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const recentReceipts = await prisma.receipt.findMany({
            where: {
                createdAt: {
                    gte: startOfMonth
                }
            },
            select: { amountPaid: true }
        })

        const financialVolumeThisMonth = recentReceipts.reduce((acc, curr) => acc + curr.amountPaid, 0)

        // Répartition par ville (pour l'Observatoire National)
        const propertiesByCity = await prisma.property.groupBy({
            by: ['city'],
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            }
        })

        const responseData = {
            meta: {
                timestamp: new Date().toISOString(),
                source: "Registre Locatif QAPRIL CI",
                anonymized: true
            },
            data: {
                globalStats: {
                    totalRegisteredProperties: totalProperties,
                    activeLeases: totalActiveLeases,
                    receiptsGeneratedThisMonth: recentReceipts.length,
                    financialVolumeGeneratedThisMonthFCFA: financialVolumeThisMonth
                },
                geography: propertiesByCity.map(p => ({
                    city: p.city,
                    propertiesCount: p._count.id
                }))
            }
        }

        return new NextResponse(JSON.stringify(responseData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error("Erreur API Institutionnelle:", error)
        return new NextResponse(JSON.stringify({ error: "Erreur serveur interne" }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
