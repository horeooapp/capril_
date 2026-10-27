"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
    Wrench, Phone, Mail, MapPin, X, Star, ShieldCheck, 
    Calendar, DollarSign, Clock, Award, Building2, CheckCircle2,
    BookOpen, Send
} from "lucide-react"

interface ProviderDetailModalProps {
    provider: any | null;
    onClose: () => void;
    onAssignClick?: (provider: any) => void;
    unassignedTicketsCount?: number;
}

export default function ProviderDetailModal({
    provider,
    onClose,
    onAssignClick,
    unassignedTicketsCount = 0
}: ProviderDetailModalProps) {
    if (!provider) return null

    const meta = provider.metadata || {}
    const zones = meta.zonesIntervention || (provider.adresse ? [provider.adresse] : ["Abidjan"])
    const certifications = meta.certifications || []
    const sousSpecialites = meta.sousSpecialites || []

    return (
        <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                            <Wrench size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black text-white capitalize">{provider.nom}</h2>
                                <div className="flex items-center gap-1 bg-amber-400/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/30 text-[11px]">
                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                    <span>{provider.noteMoyenne || "5.0"}</span>
                                </div>
                            </div>
                            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                                {provider.specialite} · {meta.statutJuridique || "Artisan Partenaire Certifié"}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 flex items-center justify-center transition-colors border border-slate-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Interventions</span>
                            <span className="text-lg font-black text-slate-900">{provider._count?.tickets || 0}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Délai Urgence</span>
                            <span className="text-xs font-black text-amber-600 block mt-1">{meta.delaiIntervention || "Sous 4h"}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Expérience</span>
                            <span className="text-lg font-black text-slate-900">{meta.experienceAnnees || 5} ans</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Garantie Travaux</span>
                            <span className="text-xs font-black text-emerald-600 block mt-1">{meta.garantieMois || 3} mois</span>
                        </div>
                    </div>

                    {/* Contact & Legal */}
                    <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 size={14} className="text-amber-500" />
                            Coordonnées & Identification Légale
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <Phone size={14} className="text-slate-400" />
                                <span>Principal : <strong>{provider.telephone}</strong></span>
                            </div>
                            {meta.telephoneUrgence && (
                                <div className="flex items-center gap-2 text-amber-700 font-bold">
                                    <Phone size={14} className="text-amber-500" />
                                    <span>Astreinte 24/7 : {meta.telephoneUrgence}</span>
                                </div>
                            )}
                            {provider.email && (
                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                    <Mail size={14} className="text-slate-400" />
                                    <span>{provider.email}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <MapPin size={14} className="text-slate-400" />
                                <span>{provider.adresseAffichee || provider.adresse || "Abidjan"}</span>
                            </div>
                            {meta.rccm && (
                                <div className="sm:col-span-2 text-slate-600 font-medium">
                                    <span>N° RCCM / Registre des Métiers : <strong>{meta.rccm}</strong></span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sub-specialties */}
                    {sousSpecialites.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                Domaines d'Intervention & Spécialisations Techniques
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {sousSpecialites.map((s: string) => (
                                    <span key={s} className="bg-slate-100 text-slate-800 text-[11px] font-bold px-3 py-1 rounded-xl border border-slate-200">
                                        ✓ {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Coverage Zones */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Communes d'Intervention Couvertes
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {zones.map((z: string) => (
                                <span key={z} className="bg-amber-50 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-amber-200 flex items-center gap-1">
                                    <MapPin size={10} className="text-amber-500" />
                                    {z.split(" (")[0]}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Certifications & Tarifs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <DollarSign size={14} className="text-emerald-500" />
                                Barème Tarifaire
                            </h4>
                            <div className="space-y-1 text-xs">
                                <p className="text-slate-600">
                                    Taux horaire indicatif : <strong>{meta.tauxHoraire ? `${Number(meta.tauxHoraire).toLocaleString('fr-FR')} FCFA/h` : "Sur devis"}</strong>
                                </p>
                                <p className="text-slate-600">
                                    Forfait diagnostic / déplacement : <strong>{meta.forfaitDeplacement ? `${Number(meta.forfaitDeplacement).toLocaleString('fr-FR')} FCFA` : "10 000 FCFA"}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-amber-500" />
                                Habilitations & Agréments
                            </h4>
                            <div className="space-y-1 text-xs">
                                {certifications.length > 0 ? (
                                    certifications.map((c: string) => (
                                        <div key={c} className="flex items-center gap-1.5 text-emerald-700 font-bold">
                                            <CheckCircle2 size={12} />
                                            <span>{c}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-slate-500 italic">Agrément standard validé par la plateforme</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-white transition-colors"
                    >
                        Fermer la Fiche
                    </button>
                    {onAssignClick && unassignedTicketsCount > 0 && (
                        <button
                            onClick={() => {
                                onClose()
                                onAssignClick(provider)
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
                        >
                            <Send size={14} className="text-amber-400" />
                            <span>Assigner un Bon ({unassignedTicketsCount})</span>
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
