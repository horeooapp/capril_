"use client";

import React from "react";
import { 
    Home, 
    CreditCard, 
    ShieldCheck, 
    ArrowRight, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    MapPin, 
    FileText, 
    Scale,
    Send,
    Lock
} from "lucide-react";
import Link from "next/link";

export interface AdoptionEngineMetricsProps {
    // Déclarations de logement (BailDeclaratif)
    bdqTotal: number;
    bdqPending: number;
    bdqConfirmed: number;
    bdqContested: number;
    bdqTotalRentDeclared: number;

    // Déclarations de paiement (DeclarationPaiement)
    paymentDeclarationsTotal: number;
    paymentDeclarationsPending: number;
    paymentDeclarationsConfirmed: number;
    paymentDeclarationsContested: number;
    paymentAmountConfirmed: number;
    paymentAmountPending: number;

    // Préavis & CCH
    preavisTotal: number;
    preavisPending: number;
    geolocatedPropertiesCount: number;
    totalPropertiesCount: number;
}

export default function AdoptionEngineOverviewWidget({
    bdqTotal,
    bdqPending,
    bdqConfirmed,
    bdqContested,
    bdqTotalRentDeclared,
    paymentDeclarationsTotal,
    paymentDeclarationsPending,
    paymentDeclarationsConfirmed,
    paymentDeclarationsContested,
    paymentAmountConfirmed,
    paymentAmountPending,
    preavisTotal,
    preavisPending,
    geolocatedPropertiesCount,
    totalPropertiesCount,
}: AdoptionEngineMetricsProps) {
    const confirmationRate = bdqTotal > 0 ? Math.round((bdqConfirmed / bdqTotal) * 100) : 0;
    const paymentValidationRate = paymentDeclarationsTotal > 0 ? Math.round((paymentDeclarationsConfirmed / paymentDeclarationsTotal) * 100) : 0;
    const geoRate = totalPropertiesCount > 0 ? Math.round((geolocatedPropertiesCount / totalPropertiesCount) * 100) : 0;

    return (
        <div className="panel" style={{ marginTop: "20px", marginBottom: "20px" }}>
            <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 className="panel-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        Moteur d'Adoption & Déclarations Spontanées (IC-01)
                        <span style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#FEF3C7", color: "#92400E" }}>
                            Nouveau 2026
                        </span>
                    </h2>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Supervision en temps réel des déclarations locataires de logement, des règlements hors-plateforme et des préavis CCH
                    </p>
                </div>
                <Link
                    href="/admin/declarations"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
                >
                    <span>Consulter le registre</span>
                    <ArrowRight size={14} />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* BLOC 1 : DÉCLARATION LOGEMENT */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                                <Home size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                Logement Locataire
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">
                            Déclarations de Logement Spontanées
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">
                            Locataires déclarant leur logement actuel et invitant leur bailleur en 1 clic.
                        </p>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Total déclarations reçues :</span>
                                <span className="font-bold text-slate-900">{bdqTotal}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-amber-50/60 border border-amber-100">
                                <span className="text-amber-800 flex items-center gap-1">
                                    <Clock size={12} /> En attente validation bailleur :
                                </span>
                                <span className="font-bold text-amber-900">{bdqPending}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-emerald-50/60 border border-emerald-100">
                                <span className="text-emerald-800 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Confirmées (baux créés) :
                                </span>
                                <span className="font-bold text-emerald-900">{bdqConfirmed} ({confirmationRate}%)</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Loyers mensuels déclarés :</span>
                                <span className="font-bold text-slate-900">{bdqTotalRentDeclared.toLocaleString()} F</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-amber-700 flex items-center justify-between">
                        <span>Adoption virale instantanée</span>
                        <Send size={14} />
                    </div>
                </div>

                {/* BLOC 2 : PAIEMENTS HORS-PLATEFORME */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                                <CreditCard size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Règlements Wave / MoMo
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">
                            Paiements Déclarés Hors-Plateforme
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">
                            Flux « J'ai payé autrement » avec quittance officielle émise en 1 clic par le bailleur.
                        </p>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Total paiements déclarés :</span>
                                <span className="font-bold text-slate-900">{paymentDeclarationsTotal}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-amber-50/60 border border-amber-100">
                                <span className="text-amber-800 flex items-center gap-1">
                                    <Clock size={12} /> À confirmer par bailleur :
                                </span>
                                <span className="font-bold text-amber-900">{paymentDeclarationsPending} ({paymentAmountPending.toLocaleString()} F)</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-emerald-50/60 border border-emerald-100">
                                <span className="text-emerald-800 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Quittances certifiées émises :
                                </span>
                                <span className="font-bold text-emerald-900">{paymentDeclarationsConfirmed} ({paymentValidationRate}%)</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Volume certifié réglé :</span>
                                <span className="font-bold text-emerald-700">{paymentAmountConfirmed.toLocaleString()} F</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-emerald-700 flex items-center justify-between">
                        <span>Quittance certifiée avec empreinte horodatée</span>
                        <FileText size={14} />
                    </div>
                </div>

                {/* BLOC 3 : CONFORMITÉ CCH & GÉOLOCALISATION */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                                <Scale size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                                CCH & Adressage
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">
                            Garanties Légales & Géocodage
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">
                            Plafonnement des cautions/avances, préavis de 30 jours et localisation in situ.
                        </p>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Préavis de congé en cours :</span>
                                <span className="font-bold text-slate-900">{preavisPending} (sur {preavisTotal} total)</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-sky-50/60 border border-sky-100">
                                <span className="text-sky-800 flex items-center gap-1">
                                    <ShieldCheck size={12} /> Plafonds CCH Art. 415-416 :
                                </span>
                                <span className="font-bold text-sky-900">100% Conforme (≤ 2 mois)</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Biens géolocalisés (GPS) :</span>
                                <span className="font-bold text-slate-900">{geolocatedPropertiesCount} / {totalPropertiesCount} ({geoRate}%)</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Protection identité bailleur :</span>
                                <span className="font-bold text-emerald-700">Actif (« Bailleur certifié »)</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-sky-700 flex items-center justify-between">
                        <span>Code de la Construction & Habitation</span>
                        <MapPin size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
}
