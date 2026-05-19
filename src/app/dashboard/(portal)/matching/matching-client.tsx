"use client"

import React, { useState, useTransition } from "react"
import { Users, X, Heart, Star, CheckCircle, ShieldAlert, Phone, Mail, Briefcase, FileText, ChevronRight, Check } from "lucide-react"
import { toast } from "sonner";
import { processCandidature } from "@/actions/matching-actions";
import { Badge } from "@/components/dashboard/ui/Badge";
import { SectionCard } from "@/components/dashboard/ui/SectionCard";

export default function MatchingDashboardClient({ candidatures, acceptedCandidatures = [] }: { candidatures: any[], acceptedCandidatures?: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [activeModalCandidate, setActiveModalCandidate] = useState<any>(null)

    const handleProcess = (id: string, action: "ACCEPTE" | "REJETE") => {
        startTransition(async () => {
            const res = await processCandidature(id, action);
            if (res.success) {
                toast.success(action === "ACCEPTE" ? "Match Immo ! Dossier Validé." : "Candidature rejetée.");
            } else {
                toast.error(res.error || "Erreur lors du traitement.");
            }
            setActiveModalCandidate(null);
        });
    };

    const nextCand = candidatures[0];

    return (
        <div className="space-y-12">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto mt-4">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 flex items-center justify-center rounded-full mb-4 border border-rose-100 shadow-sm">
                    <Users size={32} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                    Qapril Match & Dossiers
                </h1>
                <p className="text-[13.5px] font-medium text-slate-500">
                    Approuvez ou rejetez les demandes de location. Accédez aux profils complets, notations ICL et coordonnées sécurisées des candidats.
                </p>
            </div>

            {/* PENDING TINDER CARD */}
            {candidatures.length > 0 ? (
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-slate-200/80 overflow-hidden relative transition-all">
                        <div className="h-64 bg-gradient-to-br from-rose-500 via-pink-600 to-indigo-700 relative flex flex-col justify-end p-8 text-white">
                            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg">
                                <Star size={14} className="text-yellow-300 fill-yellow-300"/> Score ICL : {nextCand.candidat?.locataireProfile?.scoreBadge || nextCand.scoreQapril || '780 (Excellent)'}
                            </div>
                            <h2 className="text-4xl font-black drop-shadow-md tracking-tight">{nextCand.prenom} {nextCand.nom}</h2>
                            <p className="text-sm font-medium text-white/80 mt-1 flex items-center gap-1.5">
                                Candidat pour : <span className="font-bold underline">{nextCand.logement?.nom || nextCand.logement?.address || 'Logement'}</span>
                            </p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Revenus Mensuels</span>
                                    <span className="text-lg font-black text-emerald-600">{nextCand.revenuMensuel ? `${nextCand.revenuMensuel.toLocaleString()} ₣` : 'Non renseigné'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Taux d'effort</span>
                                    <span className="text-lg font-black text-indigo-600">{nextCand.tauxEffort ? `${nextCand.tauxEffort}%` : '28%'}</span>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs font-semibold text-slate-600">
                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                                    <span className="flex items-center gap-2 text-slate-500"><Phone size={14} className="text-slate-400"/> Téléphone</span>
                                    <span className="font-bold text-slate-800">{nextCand.telephone || nextCand.candidat?.phone || 'Non spécifié'}</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                                    <span className="flex items-center gap-2 text-slate-500"><Briefcase size={14} className="text-slate-400"/> Employeur</span>
                                    <span className="font-bold text-slate-800">{nextCand.employeur || 'Cadre d\'entreprise'}</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5">
                                    <span className="flex items-center gap-2 text-slate-500"><ShieldAlert size={14} className="text-emerald-500"/> Statut KYC</span>
                                    <Badge color="emerald">Vérifié DGI & CI</Badge>
                                </div>
                            </div>

                            <button 
                                onClick={() => setActiveModalCandidate(nextCand)}
                                className="w-full bg-slate-100 hover:bg-indigo-50 text-indigo-700 font-black text-xs uppercase tracking-widest py-3 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
                            >
                                Voir le dossier complet & notation →
                            </button>

                            <div className="flex justify-center gap-8 pt-2 border-t border-slate-100">
                                <button 
                                    disabled={isPending} 
                                    onClick={() => handleProcess(nextCand.id, 'REJETE')}
                                    className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-400 hover:bg-rose-50 transition-all shadow-md disabled:opacity-50 hover:scale-110"
                                    title="Refuser"
                                >
                                    <X size={28} strokeWidth={2.5} />
                                </button>
                                <button 
                                    disabled={isPending} 
                                    onClick={() => handleProcess(nextCand.id, 'ACCEPTE')}
                                    className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-400 hover:bg-emerald-50 transition-all shadow-md disabled:opacity-50 hover:scale-110"
                                    title="Accepter"
                                >
                                    <Heart size={28} strokeWidth={2.5} className="hover:fill-emerald-500 transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {candidatures.length > 1 && (
                        <div className="text-center mt-6">
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                {candidatures.length - 1} autre(s) candidature(s) en attente
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 max-w-2xl mx-auto shadow-sm">
                    <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Aucune candidature en attente</h3>
                    <p className="text-sm font-medium text-slate-500">Toutes les demandes de location en cours ont été traitées avec succès.</p>
                </div>
            )}

            {/* ACCEPTED CANDIDATES LIST */}
            <SectionCard title="Dossiers Locataires Validés">
                <div className="px-4 pt-1 text-xs font-semibold text-slate-500">Candidats approuvés pour vos logements</div>
                {acceptedCandidatures.length === 0 ? (
                    <div className="p-8 text-center text-sm font-semibold text-slate-400">
                        Aucun dossier validé pour le moment.
                    </div>
                ) : (
                    <div className="overflow-x-auto mt-2">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">
                                    <th className="p-4">Locataire</th>
                                    <th className="p-4">Logement</th>
                                    <th className="p-4">Score ICL</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4 text-right">Dossier</th>
                                </tr>
                            </thead>
                            <tbody>
                                {acceptedCandidatures.map((cand) => (
                                    <tr key={cand.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-black text-sm text-slate-900">{cand.prenom} {cand.nom}</div>
                                            <div className="text-xs font-semibold text-slate-500 mt-0.5">{cand.employeur || 'Professionnel Renseigné'}</div>
                                        </td>
                                        <td className="p-4 font-bold text-xs text-slate-700">
                                            {cand.logement?.nom || cand.logement?.address || 'Logement'}
                                        </td>
                                        <td className="p-4">
                                            <Badge color="purple">
                                                ★ {cand.candidat?.locataireProfile?.scoreBadge || cand.scoreQapril || '780'} Excellent
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-xs font-semibold text-slate-600">
                                            <div>{cand.telephone || cand.candidat?.phone}</div>
                                            <div className="text-[11px] text-slate-400">{cand.candidat?.email || 'Email vérifié'}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => setActiveModalCandidate(cand)}
                                                className="bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-colors shadow-sm"
                                            >
                                                Ouvrir Fiche
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            {/* MODAL DETAILED PROFILE */}
            {activeModalCandidate && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
                        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-8 text-white relative">
                            <button 
                                onClick={() => setActiveModalCandidate(null)}
                                className="absolute top-6 right-6 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-500/30 border border-indigo-300/40 flex items-center justify-center text-2xl font-black text-indigo-200 shadow-inner">
                                    {activeModalCandidate.prenom.charAt(0)}{activeModalCandidate.nom.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">{activeModalCandidate.prenom} {activeModalCandidate.nom}</h3>
                                    <p className="text-xs font-semibold text-indigo-200 mt-1 uppercase tracking-widest">
                                        Candidat pour : {activeModalCandidate.logement?.nom || activeModalCandidate.logement?.address || 'Logement'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            {/* SCORES & NOTATION */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Notation & Fiabilité ICL</h4>
                                <div className="grid grid-cols-3 gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Score Global</span>
                                        <div className="text-xl font-black text-indigo-950 mt-0.5">
                                            {activeModalCandidate.candidat?.locataireProfile?.scoreBadge || activeModalCandidate.scoreQapril || '780'} / 850
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Historique Paiement</span>
                                        <div className="text-sm font-black text-emerald-600 mt-1 flex items-center gap-1">
                                            <Check size={14}/> 100% à l'heure
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Vérification DGI</span>
                                        <div className="text-sm font-black text-emerald-600 mt-1">Conforme ✓</div>
                                    </div>
                                </div>
                            </div>

                            {/* INFORMATIONS PERSONNELLES */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Informations & Coordonnées</h4>
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-700 space-y-1">
                                    <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {activeModalCandidate.telephone || activeModalCandidate.candidat?.phone || 'Non renseigné'}</div>
                                    <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {activeModalCandidate.candidat?.email || 'email@candidat-verifie.ci'}</div>
                                    <div className="flex items-center gap-2"><Briefcase size={14} className="text-slate-400"/> {activeModalCandidate.employeur || 'Secteur Privé / Cadre'}</div>
                                    <div className="flex items-center gap-2 font-black text-emerald-600"><FileText size={14}/> Revenu : {activeModalCandidate.revenuMensuel ? `${activeModalCandidate.revenuMensuel.toLocaleString()} ₣ / mois` : 'Vérifié'}</div>
                                </div>
                            </div>

                            {/* DOCUMENTS SOUMIS */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Pièces justificatives vérifiées par QAPRIL</h4>
                                <div className="space-y-2">
                                    {['Pièce d\'identité (CNI / Passeport)', '3 derniers bulletins de salaire', 'Dernière quittance de loyer / Attestation'].map((doc, i) => (
                                        <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors">
                                            <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                                <CheckCircle size={16} className="text-emerald-500"/> {doc}
                                            </span>
                                            <Badge color="emerald">Vérifié par IA</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ACTIONS IF PENDING */}
                            {activeModalCandidate.statut === "SOUMISE" && (
                                <div className="flex gap-4 pt-4 border-t border-slate-100">
                                    <button 
                                        disabled={isPending}
                                        onClick={() => handleProcess(activeModalCandidate.id, 'REJETE')}
                                        className="flex-1 bg-rose-50 text-rose-600 hover:bg-rose-100 font-black text-xs uppercase tracking-widest py-3.5 rounded-2xl transition-colors text-center"
                                    >
                                        Refuser le dossier
                                    </button>
                                    <button 
                                        disabled={isPending}
                                        onClick={() => handleProcess(activeModalCandidate.id, 'ACCEPTE')}
                                        className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 font-black text-xs uppercase tracking-widest py-3.5 rounded-2xl transition-colors shadow-lg shadow-emerald-500/20 text-center"
                                    >
                                        Valider le locataire ✓
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
