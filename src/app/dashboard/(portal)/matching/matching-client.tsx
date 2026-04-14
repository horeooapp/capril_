"use client"

import React, { useTransition } from "react"
import { Users, X, Heart, Star, CheckCircle, ShieldAlert } from "lucide-react"
import { toast } from "sonner";
import { processCandidature } from "@/actions/matching-actions";
import { Badge } from "@/components/dashboard/ui/Badge";

export default function MatchingDashboardClient({ candidatures }: { candidatures: any[] }) {
    const [isPending, startTransition] = useTransition()

    if (candidatures.length === 0) {
        return (
             <div className="space-y-8">
                 <div className="flex flex-col items-center text-center max-w-2xl mx-auto my-20">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 flex items-center justify-center rounded-full mb-6 border border-rose-100 shadow-sm">
                        <Users size={40} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                        Qapril Match
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500">
                        Aucune nouvelle candidature en attente pour le moment.
                    </p>
                </div>
            </div>
        )
    }

    const nextCand = candidatures[0]

    return (
        <div className="space-y-6">
             <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 flex items-center justify-center rounded-full mb-4 border border-rose-100 shadow-sm">
                    <Users size={32} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                    Qapril Match
                </h1>
                <p className="text-[13.5px] font-medium text-slate-500">
                    Approuvez ou rejetez les candidatures. L'IA de QAPRIL scrute les KYC pour recommander les meilleurs profils.
                </p>
            </div>

            <div className="flex justify-center">
                 {/* Tinder Card UI */}
                 <div className="w-full max-w-sm bg-white rounded-[24px] shadow-lg border border-slate-200 overflow-hidden relative transition-transform">
                     <div className="h-56 bg-gradient-to-br from-rose-500 to-pink-700 relative flex items-end p-6">
                         <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                              <Star size={12} className="text-yellow-300 fill-yellow-300"/> Score ICL : {nextCand.candidat?.locataireProfile?.scoreBadge || nextCand.scoreQapril || 'N/A'}
                         </div>
                         <h2 className="text-3xl font-black text-white relative z-10 drop-shadow-md">{nextCand.prenom} {nextCand.nom?.charAt(0)}.</h2>
                     </div>
                     <div className="p-8">
                          <div className="space-y-4 mb-8">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cible</span>
                                  <span className="text-[13px] font-bold text-slate-900">{nextCand.logement?.nom || nextCand.logement?.adresse || 'Logement inconnu'}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Revenus (Décl.)</span>
                                  <span className="text-[13px] font-black text-emerald-600">{nextCand.revenuMensuel?.toLocaleString()} FCFA / mois</span>
                              </div>
                              <div className="flex justify-between items-center pb-2">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vérification KYC</span>
                                  {nextCand.candidat?.kycLevel === 'VERIFIED' ? (
                                      <Badge color="emerald">Vérifié</Badge>
                                  ) : (
                                      <Badge color="amber">En Attente</Badge>
                                  )}
                              </div>
                          </div>
                          
                          <div className="flex justify-center gap-8">
                              <button disabled={isPending} onClick={(e) => { e.preventDefault(); startTransition(async () => { const res = await processCandidature(nextCand.id, 'REJETE'); if(res.success) toast.success("Candidature rejetée."); else toast.error(res.error) }) }} className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm disabled:opacity-50 hover:scale-110">
                                  <X size={28} />
                              </button>
                              <button disabled={isPending} onClick={(e) => { e.preventDefault(); startTransition(async () => { const res = await processCandidature(nextCand.id, 'ACCEPTE'); if(res.success) toast.success("Match Immo ! Dossier Validé."); else toast.error(res.error) }) }} className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm disabled:opacity-50 hover:scale-110">
                                  <Heart size={28} className="hover:fill-emerald-500 transition-colors" />
                              </button>
                          </div>
                     </div>
                     
                     <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                         <p className="text-[10.5px] font-semibold text-slate-500 flex items-center justify-center gap-1.5"><ShieldAlert size={14} className="text-indigo-500"/> QAPRIL garantit cet utilisateur.</p>
                     </div>
                 </div>
            </div>
            
            <div className="text-center mt-12 pb-8">
                 <p className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400 mb-4">Fil d'attente ({candidatures.length - 1} restants)</p>
                 <div className="flex justify-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></div>
                     {Array.from({length: Math.min(3, candidatures.length - 1)}).map((_, i) => (
                         <div key={i} className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                     ))}
                 </div>
            </div>
        </div>
    )
}
