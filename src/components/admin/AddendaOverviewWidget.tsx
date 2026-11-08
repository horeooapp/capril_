"use client";

import React from "react";
import { Mic, MapPin, FileCheck2, ShieldCheck, QrCode, Compass, Users } from "lucide-react";
import Link from "next/link";

interface AddendaMetricsProps {
    vocalSessionsCount: number;
    vocalIntentsCount: number;
    geolocatedPropertiesCount: number;
    gpsCapturesCount: number;
    maPosteAddressesCount: number;
    declaredOccupantsCount: number;
    confirmedOccupantsCount: number;
    attestationsCount: number;
    qrVerificationsCount: number;
    levelCounts: {
        A: number;
        B: number;
        C: number;
    };
}

export default function AddendaOverviewWidget({
    vocalSessionsCount,
    vocalIntentsCount,
    geolocatedPropertiesCount,
    gpsCapturesCount,
    maPosteAddressesCount,
    declaredOccupantsCount,
    confirmedOccupantsCount,
    attestationsCount,
    qrVerificationsCount,
    levelCounts,
}: AddendaMetricsProps) {
    return (
        <div className="panel" style={{ marginTop: "20px", marginBottom: "20px" }}>
            <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 className="panel-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        Supervision des Innovations 2026 (ADD-27 · ADD-28 · ADD-29)
                        <span style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#E3F5EC", color: "#1B4D3E" }}>
                            Déployé en Production
                        </span>
                    </h2>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        État d'adoption du pilotage vocal, de l'adressage républicain La Poste CI et des attestations officielles opposables
                    </p>
                </div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--ci-vert)" }}>
                    Conforme Décret 2019-576 & Loi 2013-546
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* BLOC 1 : PILOTAGE VOCAL (ADD-27) */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                                <Mic size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                ADD-27 Vocal
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">
                            Assistant Intelligent & Cockpit Vocal
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">
                            Saisie et guidage pas à pas des bailleurs et locataires en langage naturel ivoirien.
                        </p>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Sessions vocales actives :</span>
                                <span className="font-bold text-slate-900">{vocalSessionsCount}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Intentions traitées :</span>
                                <span className="font-bold text-slate-900">{vocalIntentsCount}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Verrou RG-AST-01 :</span>
                                <span className="font-bold text-emerald-700">100% Sécurisé (Tactile)</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-emerald-700 flex items-center justify-between">
                        <span>Modules Bailleur & Locataire actifs</span>
                        <ShieldCheck size={14} />
                    </div>
                </div>

                {/* BLOC 2 : GÉOLOCALISATION & ADRESSAGE MAPOSTE (ADD-28) */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                                <MapPin size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                ADD-28 La Poste CI
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">
                            GPS Certifié & Adresses MaPoste
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">
                            Certification in situ des logements (≤ 50 m) et attribution de boîtes postales numériques.
                        </p>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Biens positionnés :</span>
                                <span className="font-bold text-slate-900">{geolocatedPropertiesCount}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Captures GPS terrain :</span>
                                <span className="font-bold text-slate-900">{gpsCapturesCount}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Boîtes MaPoste attribuées :</span>
                                <span className="font-bold text-amber-700">{maPosteAddressesCount}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-amber-700 flex items-center justify-between">
                        <span>Conforme Décret 2019-576</span>
                        <Compass size={14} />
                    </div>
                </div>

                {/* BLOC 3 : OCCUPANTS & ATTESTATIONS (ADD-29) */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                                <FileCheck2 size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                                ADD-29 Opposable
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">
                            Occupants & Attestations de Résidence
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">
                            Justificatif de domicile certifié à 3 niveaux (A/B/C) avec QR Code public et sceau SHA-256.
                        </p>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Occupants déclarés :</span>
                                <span className="font-bold text-slate-900">{declaredOccupantsCount} (dont {confirmedOccupantsCount} confirmés)</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Attestations émises :</span>
                                <span className="font-bold text-slate-900">{attestationsCount} (A: {levelCounts.A} · B: {levelCounts.B} · C: {levelCounts.C})</span>
                            </div>
                            <div className="flex justify-between items-center py-1 px-2.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-slate-600">Vérifications QR Code :</span>
                                <span className="font-bold text-sky-700">{qrVerificationsCount} requêtes publiques</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-sky-700 flex items-center justify-between">
                        <span>Opposable banques, visas & CIE</span>
                        <QrCode size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
}

