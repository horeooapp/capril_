"use client";

import React from "react";
import { 
    Clock, 
    FileText, 
    TrendingUp, 
    UserCheck, 
    ShieldCheck, 
    AlertTriangle, 
    CheckCircle2, 
    ArrowRight,
    Scale,
    FileSignature,
    History
} from "lucide-react";
import Link from "next/link";

export interface ContractualGovernanceMetricsProps {
    // Candidatures IC-01
    candidaturesTotal: number;
    candidaturesPending: number;

    // Révisions de loyer MRL-01
    propositionsLoyerTotal: number;
    propositionsLoyerPending: number;
    propositionsLoyerAccepted: number;

    // Deux Horloges (Reprise des baux antérieurs)
    leaseOpeningStatesTotal: number;
    leaseOpeningStatesConfirmed: number;
    leaseOpeningStatesContested: number;

    // Attestations ADD-29 & Foyer
    attestationsTotal: number;
    occupantsTotal: number;
}

export default function ContractualGovernanceWidget({
    candidaturesTotal,
    candidaturesPending,
    propositionsLoyerTotal,
    propositionsLoyerPending,
    propositionsLoyerAccepted,
    leaseOpeningStatesTotal,
    leaseOpeningStatesConfirmed,
    leaseOpeningStatesContested,
    attestationsTotal,
    occupantsTotal,
}: ContractualGovernanceMetricsProps) {
    const openingConfirmationRate = leaseOpeningStatesTotal > 0 
        ? Math.round((leaseOpeningStatesConfirmed / leaseOpeningStatesTotal) * 100) 
        : 0;

    return (
        <div className="panel" style={{ marginTop: "20px", marginBottom: "20px" }}>
            <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 className="panel-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        Gouvernance Contractuelle & Conformité CCH
                        <span style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#E0E7FF", color: "#3730A3" }}>
                            Norme 2026
                        </span>
                    </h2>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Reprise des baux anciens (Deux Horloges), révisions triennales (MRL-01), candidatures uniques et attestations de résidence
                    </p>
                </div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--ci-vert)" }}>
                    Conforme CCH 2019 & IC-01-R1
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* BLOC 1 : DEUX HORLOGES - REPRISE DES BAUX */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                                <History size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                                Deux Horloges
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">
                            Reprise des Baux Antérieurs
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">
                            Transition sécurisée pour les baux en cours signés avant QAPRIL. Respect de l'antériorité contractuelle et régularisation progressive.
                        </p>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Baux repris inscrits :</span>
                                <span className="font-bold text-slate-900">{leaseOpeningStatesTotal}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">États validés 2 parties :</span>
                                <span className="font-bold text-emerald-700">{leaseOpeningStatesConfirmed} ({openingConfirmationRate}%)</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Contestations ouvertes :</span>
                                <span className={`font-bold ${leaseOpeningStatesContested > 0 ? "text-amber-700" : "text-slate-500"}`}>
                                    {leaseOpeningStatesContested}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Horloge Légale & Horloge Système</span>
                        <Scale size={14} className="text-indigo-600" />
                    </div>
                </div>

                {/* BLOC 2 : RÉVISIONS DE LOYER MRL-01 */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                                <TrendingUp size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Révision Triennale
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">
                            Révision Triennale Encadrée
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">
                            Contrôle strict du délai triennal (3 ans minimum selon Art. 422 CCH). Notification préalable et consentement explicite.
                        </p>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Propositions enregistrées :</span>
                                <span className="font-bold text-slate-900">{propositionsLoyerTotal}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">En cours de préavis :</span>
                                <span className="font-bold text-amber-700">{propositionsLoyerPending}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Acceptées & appliquées :</span>
                                <span className="font-bold text-emerald-700">{propositionsLoyerAccepted}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Plafonds & Droit CCH</span>
                        <FileSignature size={14} className="text-emerald-600" />
                    </div>
                </div>

                {/* BLOC 3 : CANDIDATURES IC-01 & ATTESTATIONS FOYER ADD-29 */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                                <UserCheck size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                Candidatures & Résidence
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">
                            Candidatures & Attestations Foyer
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">
                            Machine à états stricte (unicité par logement, anti-spam) et délivrance des attestations de résidence certifiées avec QR Code.
                        </p>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Total candidatures :</span>
                                <span className="font-bold text-slate-900">{candidaturesTotal}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">En cours d'examen :</span>
                                <span className="font-bold text-amber-700">{candidaturesPending}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Occupants déclarés / confirmés :</span>
                                <span className="font-bold text-slate-900">{occupantsTotal}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Attestations délivrées :</span>
                                <span className="font-bold text-indigo-700">{attestationsTotal}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Traçabilité & Démarches officielles</span>
                        <ShieldCheck size={14} className="text-amber-600" />
                    </div>
                </div>
            </div>
        </div>
    );
}
