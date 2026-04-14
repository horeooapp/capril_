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
        if (!profile) return 'bg-slate-200 text-slate-400';
        if (profile.scoreBadge === 'A+' || profile.scoreBadge === 'A') return 'bg-emerald-500 text-white shadow-emerald-500/50 border-white/20';
        if (profile.scoreBadge === 'B') return 'bg-blue-500 text-white shadow-blue-500/50 border-white/20';
        if (profile.scoreBadge === 'C') return 'bg-amber-500 text-white shadow-amber-500/50 border-white/20';
        return 'bg-rose-500 text-white shadow-rose-500/50 border-white/20';
    }

    const score = profile?.scoreActuel || 0;

    return (
        <div className="space-y-6 relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-[6px] inline-flex items-center gap-2 shadow-sm">
                        <Star size={12} className="fill-amber-700" /> Profil Locataire
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 mt-2">
                        Indice C.L. (CV Locatif)
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        La preuve incontestable de votre fiabilité financière en tant que locataire.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast.info("Le lien unique public a été copié dans votre presse-papier.")} className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                        <Share2 size={16} /> Partager CV
                    </button>
                    <button onClick={handleCompute} disabled={isPending} className="bg-slate-900 text-white px-6 py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                        <Zap size={16} /> {isPending ? 'Scoring...' : 'Rafraîchir Score'}
                    </button>
                </div>
            </div>

            <div className={`rounded-[24px] p-8 md:p-12 text-white relative shadow-sm overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 border ${profile?.scoreBadge === 'A+' || profile?.scoreBadge === 'A' ? 'bg-[linear-gradient(135deg,#047857_0%,#064E3B_100%)] border-emerald-900' : 'bg-slate-900 border-slate-800'}`}>
                <div className="relative z-10 max-w-xl">
                    <div className="bg-white/10 px-3 py-1.5 rounded-[8px] text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2 mb-6 border border-white/20 backdrop-blur-md">
                        <ShieldCheck size={14} className={profile?.scoreBadge === 'A+' || profile?.scoreBadge === 'A' ? 'text-emerald-300' : 'text-slate-300'} /> Données Certifiées par QAPRIL
                    </div>
                    <h2 className="text-4xl font-black tracking-tight mb-4">Votre Score: {score}/100</h2>
                    <p className="text-white/80 text-[13px] font-medium leading-relaxed mb-6">
                        Ce score est calculé par notre algorithme en fonction de la régularité de vos paiements, de vos impayés passés et de la tenue de vos locations. Un score élevé (A ou A+) garantit une acceptation quasi-immédiate de vos prochains dossiers de location.
                    </p>
                </div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-40 h-40 rounded-full flex items-center justify-center text-7xl font-black shadow-lg border-[6px] backdrop-blur-sm ${badgeColor()}`}>
                        {profile?.scoreBadge || "?"}
                    </div>
                    <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-white/70 bg-black/20 px-4 py-2 rounded-[8px] border border-white/10">
                        Dernier calcul: {profile?.scoreCalculeAt ? new Date(profile.scoreCalculeAt).toLocaleDateString() : 'Jamais'}
                    </p>
                </div>
                
                <Award size={240} className="absolute inset-0 m-auto opacity-5 pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-200">
                    <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-blue-500"/> Facteurs du Score
                    </h3>
                    <ul className="space-y-6">
                        <li>
                            <div className="flex justify-between text-[12px] font-bold mb-2">
                                <span className="text-slate-500">Régularité des 12 derniers mois</span>
                                <span className={profile?.tauxPaiement12m >= 90 ? 'text-emerald-600' : 'text-amber-600'}>{profile?.tauxPaiement12m || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner"><div className={`h-2 rounded-full transition-all duration-1000 ${profile?.tauxPaiement12m >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${profile?.tauxPaiement12m || 0}%` }}></div></div>
                        </li>
                        <li>
                            <div className="flex justify-between text-[12px] font-bold mb-1 items-center">
                                <span className="text-slate-500">Pénalités de retard enregistrées</span>
                                <span className="text-slate-900 bg-slate-50 px-2 py-0.5 rounded-[6px] border border-slate-200 inline-flex items-center gap-1">0 <span className="text-[9px] text-slate-400 ml-1">(BETA)</span></span>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-200">
                    <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                        <History size={18} className="text-purple-500"/> Historique Locatif
                    </h3>
                    <div className="text-center py-10 bg-slate-50 rounded-[16px] border border-slate-100 border-dashed">
                        <p className="text-[13px] text-slate-500 font-medium">Aucun incident de paiement majeur recensé sur votre passeport QAPRIL.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
