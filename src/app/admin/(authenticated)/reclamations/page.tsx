import React from "react"
import { AlertCircle, Search, Clock } from "lucide-react"
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
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-rose-600 text-[12px] font-black uppercase tracking-[0.3em] mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>M-RCL • Réclamations</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Suivi SAV & Incidents.</h1>
                    <p className="text-[14px] text-gray-500 font-medium">Contrôle des délais d&apos;intervention et auto-clôture 144h.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        Monitoring Actif
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tickets Ouverts</p>
                    <p className="text-3xl font-black text-gray-900">{reclamations.length}</p>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Délai Moyen</p>
                    <p className="text-3xl font-black text-indigo-600">48h</p>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Auto-clôtures (144h)</p>
                    <p className="text-3xl font-black text-rose-600">0</p>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Satisfaction</p>
                    <p className="text-3xl font-black text-emerald-600">--%</p>
                </div>
            </div>

            <ReclamationsClient tickets={reclamations} signalements={signalements} />
        </div>
    )
}
