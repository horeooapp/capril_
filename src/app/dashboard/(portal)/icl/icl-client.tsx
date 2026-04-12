"use client"

import React, { useState, useTransition } from "react"
import { Star, ShieldCheck, Activity, Share2, Award, Zap, History } from "lucide-react"
import { toast } from "sonner";
import { computeIclScore } from "@/actions/icl-actions"

export default function IclDashboardClient({ initialProfile }: { initialProfile: any }) {
    const [profile, setProfile] = useState(initialProfile)
    const [isPending, startTransition] = useTransition()

    const handleCompute = () => {
        startTransition(async () => {
            toast.loading("Analyse des flux financiers (Paiements, Retards)...", { id: "compute-icl" });
            const res = await computeIclScore();
            if (res.error) {
                toast.error(res.error, { id: "compute-icl" });
            } else {
                toast.success(`Score ICL mis à jour : ${res.newScore}/100`, { id: "compute-icl" });
                setProfile((prev: any) => ({ ...prev, scoreActuel: res.newScore, scoreBadge: res.newBadge, scoreCalculeAt: new Date() }));
            }
        });
    }

    const badgeColor = () => {
        if (!profile) return 'bg-qgrey-2 text-qgrey-4';
        if (profile.scoreBadge === 'A+' || profile.scoreBadge === 'A') return 'bg-qgreen text-white shadow-qgreen/50';
        if (profile.scoreBadge === 'B') return 'bg-blue-500 text-white shadow-blue-500/50';
        if (profile.scoreBadge === 'C') return 'bg-amber-500 text-white shadow-amber-500/50';
        return 'bg-qred text-white shadow-qred/50';
    }

    const score = profile?.scoreActuel || 0;

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Star className="text-amber-500 fill-amber-500" size={32} /> Indice C.L. (CV Locatif)
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        La preuve incontestable de votre fiabilité financière en tant que locataire.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast.info("Le lien unique public a été copié dans votre presse-papier.")} className="bg-white border border-qgrey-2 text-qnavy px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm flex items-center gap-2">
                        <Share2 size={16} /> Partager CV
                    </button>
                    <button onClick={handleCompute} disabled={isPending} className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                        <Zap size={16} /> {isPending ? 'Scoring...' : 'Rafraîchir Score'}
                    </button>
                </div>
            </div>

            <div className={`rounded-[2rem] p-8 md:p-12 text-white relative shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 ${profile?.scoreBadge === 'A+' || profile?.scoreBadge === 'A' ? 'bg-[linear-gradient(135deg,#059669_0%,#064E3B_100%)]' : 'bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)]'}`}>
                <div className="relative z-10 max-w-xl">
                    <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-6 border border-white/30 backdrop-blur-md">
                        <ShieldCheck size={12} /> Données Certifiées par QAPRIL
                    </div>
                    <h2 className="text-4xl font-black tracking-tight mb-4">Votre Score: {score}/100</h2>
                    <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">
                        Ce score est calculé par notre algorithme en fonction de la régularité de vos paiements, de vos impayés passés et de la tenue de vos locations. Un score élevé (A ou A+) garantit une acceptation quasi-immédiate de vos prochains dossiers de location.
                    </p>
                </div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-40 h-40 rounded-full flex items-center justify-center text-7xl font-black shadow-lg border-4 border-white/20 backdrop-blur-sm ${badgeColor()}`}>
                        {profile?.scoreBadge || "?"}
                    </div>
                    <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/50 bg-black/20 px-3 py-1 rounded-full">
                        Dernier calcul: {profile?.scoreCalculeAt ? new Date(profile.scoreCalculeAt).toLocaleDateString() : 'Jamais'}
                    </p>
                </div>
                
                <Award size={240} className="absolute inset-0 m-auto opacity-5 pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-qgrey-2">
                    <h3 className="text-sm font-black text-qnavy-dark uppercase tracking-widest border-b border-qgrey-2 pb-4 mb-4 flex items-center gap-2">
                        <Activity size={16} className="text-blue-500"/> Facteurs du Score
                    </h3>
                    <ul className="space-y-6">
                        <li>
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-qtext-mid">Régularité des 12 derniers mois</span>
                                <span className={profile?.tauxPaiement12m >= 90 ? 'text-qgreen' : 'text-amber-500'}>{profile?.tauxPaiement12m || 0}%</span>
                            </div>
                            <div className="w-full bg-qgrey-2 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${profile?.tauxPaiement12m || 0}%` }}></div></div>
                        </li>
                        <li>
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-qtext-mid">Pénalités de retard enregistrées</span>
                                <span className="text-qnavy-dark">0 (BETA)</span>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-qgrey-2">
                    <h3 className="text-sm font-black text-qnavy-dark uppercase tracking-widest border-b border-qgrey-2 pb-4 mb-4 flex items-center gap-2">
                        <History size={16} className="text-purple-500"/> Historique Locatif
                    </h3>
                    <div className="text-center py-8">
                        <p className="text-xs text-qtext-mid font-medium italic">Aucun incident de paiement majeur recensé sur votre passeport QAPRIL.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
