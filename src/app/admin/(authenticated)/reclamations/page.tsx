import React from "react"
import { AlertCircle, Search, Clock, FileWarning } from "lucide-react"
import { prisma } from "@/lib/prisma"

import { getSignalements } from "@/actions/signalement-admin-actions"
import ReclamationsClient from "./ReclamationsClient"

export default async function AdminReclamationsPage() {
    const reclamations = await (prisma as any).ticketMaintenance.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
            logement: { select: { propertyCode: true } },
            locataire: { select: { firstName: true, lastName: true } }
        }
    }).catch(() => [])

    const signalements = await getSignalements().catch(() => [])

    return (
        <div className="space-y-8 pb-16 relative">
            <div className="fixed inset-0 bg-mesh -z-10 opacity-60"></div>

            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <FileWarning className="w-8 h-8 text-[var(--ci-orange)]" />
                        M-RCL • RÉCLAMATIONS
                    </h1>
                    <p className="page-sub">Suivi SAV & Incidents. Contrôle des délais d'intervention et auto-clôture 144h.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="date-badge text-[var(--ci-orange)] border-[var(--ci-orange)]/30 bg-[var(--ci-orange)]/10 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ci-orange-light)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--ci-orange)]"></span>
                        </span>
                        Monitoring Actif
                    </div>
                </div>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card orange">
                    <div className="kpi-glow"></div>
                    <span className="kpi-label">Tickets Ouverts</span>
                    <span className="kpi-val">{reclamations.length}</span>
                </div>
                <div className="kpi-card or">
                    <div className="kpi-glow"></div>
                    <span className="kpi-label">Délai Moyen</span>
                    <span className="kpi-val">48h</span>
                </div>
                <div className="kpi-card gris">
                    <div className="kpi-glow"></div>
                    <span className="kpi-label">Auto-clôtures</span>
                    <span className="kpi-val">0</span>
                </div>
                <div className="kpi-card vert">
                    <div className="kpi-glow"></div>
                    <span className="kpi-label">Satisfaction</span>
                    <span className="kpi-val">--%</span>
                </div>
            </div>

            <ReclamationsClient tickets={reclamations} signalements={signalements} />
        </div>
    )
}
