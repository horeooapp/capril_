import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, role } = body;

        // Validation très basique de sécurité pour MVP
        if (!token) {
            return NextResponse.json({ error: "Non autorisé. Jeton manquant." }, { status: 401 });
        }

        // Si Locataire
        if (role === 'TENANT') {
            return NextResponse.json({
                success: true,
                data: {
                    greeting: "Bonjour, Locataire",
                    balanceDue: "150,000 FCFA",
                    nextDueDate: "05/05/2026",
                    recentReceipts: [
                        { id: 1, month: "Avril 2026", amount: "150,000 FCFA", status: "Payé" },
                        { id: 2, month: "Mars 2026", amount: "150,000 FCFA", status: "Payé" }
                    ],
                    activeRequests: 1
                }
            });
        }

        // Si Propriétaire
        if (role === 'OWNER') {
            return NextResponse.json({
                success: true,
                data: {
                    greeting: "Bonjour, Propriétaire",
                    totalRevenue: "1,250,000 FCFA",
                    occupancyRate: "92%",
                    properties: [
                        { id: 1, name: "Villa Émeraude", status: "Loué", rent: "500,000 FCFA" },
                        { id: 2, name: "Appartement Riviera", status: "Vacant", rent: "350,000 FCFA" },
                        { id: 3, name: "Studio Plateau", status: "Loué", rent: "400,000 FCFA" }
                    ],
                    pendingRepairs: 2
                }
            });
        }

        return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: "Erreur serveur : " + error.message }, { status: 500 });
    }
}
