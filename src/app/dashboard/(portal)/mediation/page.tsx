import React from "react"
import { Scale, Users, Gavel, Search, Settings } from "lucide-react"
import { getMediationStats } from "@/actions/mediation-actions"

export default async function MediationDashboardPage() {
    const stats = await getMediationStats()

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Scale className="text-qorange" size={32} /> Médiation & Litiges
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Résolution amiable, recouvrement forcé et suivi des huissiers.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="bg-white border text-center border-qred rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qred-dark">Procédures en cours</p>
                     <p className="text-3xl font-black text-qred mt-1">{stats.ongoing}</p>
                 </div>
                 <div className="bg-white border text-center border-qgrey-2 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qtext-light">Conciliations Réussies</p>
                     <p className="text-3xl font-black text-qnavy mt-1">{stats.resolved}</p>
                 </div>
                 <div className="bg-qorange border border-qorange-dark rounded-3xl p-6 shadow-sm text-center text-white cursor-pointer hover:bg-qorange-dark transition-all">
                     <Gavel size={24} className="mx-auto mb-2 opacity-50"/>
                     <p className="text-[10px] uppercase tracking-widest font-black">Mandater un Huissier</p>
                 </div>
            </div>

            {stats.ongoing === 0 ? (
                <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm p-8">
                    <div className="flex flex-col items-center justify-center text-center py-12">
                        <Scale size={64} className="text-qgreen mb-6" />
                        <h3 className="text-xl font-black text-qnavy-dark mb-2">Aucun litige critique récent</h3>
                        <p className="text-sm font-medium text-qtext-mid max-w-md">
                            Merveilleux ! L'écosystème QAPRIL a réussi à recouvrer préventivement vos quittances. Vous n'avez aucune assignation tribunal en cours.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] border border-qred-pale overflow-hidden shadow-sm p-8">
                     <div className="flex flex-col items-center justify-center text-center py-4">
                        <Gavel size={48} className="text-qred mb-4" />
                        <h3 className="text-xl font-black text-qnavy-dark mb-2">Dossiers CACI en Soumission</h3>
                        <p className="text-sm font-medium text-qtext-mid max-w-md">
                            Vous avez {stats.ongoing} dossier(s) en arbitrage.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
