"use client";

import React, { useState } from "react";
import { LogOut, ShieldAlert, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { forceDisconnectAllAccounts } from "@/actions/system-actions";

interface GlobalSessionRevokeCardProps {
    initialLastRevokedAt?: string | null;
    initialRevokedBy?: string | null;
    initialImpactedCount?: number;
}

export default function GlobalSessionRevokeCard({
    initialLastRevokedAt,
    initialRevokedBy,
    initialImpactedCount,
}: GlobalSessionRevokeCardProps) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [reason, setReason] = useState("");
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [lastRevokedAt, setLastRevokedAt] = useState<string | null>(initialLastRevokedAt || null);
    const [lastRevokedBy, setLastRevokedBy] = useState<string | null>(initialRevokedBy || null);
    const [impactedCount, setImpactedCount] = useState<number | undefined>(initialImpactedCount);

    const handleRevoke = async () => {
        setLoading(true);
        setStatusMessage(null);
        try {
            const res = await forceDisconnectAllAccounts(reason.trim() || undefined);
            if (res.success) {
                setStatusMessage(`Déconnexion générale réussie : ${res.totalUsersImpacted ?? 0} comptes ont été révoqués.`);
                if (res.revokedAt) setLastRevokedAt(res.revokedAt);
                setLastRevokedBy("Vous (Admin)");
                if (res.totalUsersImpacted !== undefined) setImpactedCount(res.totalUsersImpacted);
                setShowConfirm(false);
                setReason("");
            } else {
                setStatusMessage(`Erreur : ${res.error || "Impossible de forcer la déconnexion."}`);
            }
        } catch (err: any) {
            setStatusMessage(`Erreur réseau : ${err.message || String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                            Déconnexion Globale & Révocation des Sessions
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                                Action Souveraine
                            </span>
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Invalide instantanément tous les jetons JWT mobiles et sessions web pour forcer l'ensemble des propriétaires, locataires et agences à se reconnecter.
                        </p>
                    </div>
                </div>

                {!showConfirm ? (
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold tracking-wide transition-colors shrink-0 flex items-center justify-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    >
                        <ShieldAlert className="w-4 h-4" />
                        Déconnecter tous les comptes
                    </button>
                ) : (
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setShowConfirm(false)}
                            disabled={loading}
                            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleRevoke}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    Révocation en cours...
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Confirmer la déconnexion
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Formulaire de confirmation détaillé */}
            {showConfirm && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-red-900">
                                Attention : Cette opération va immédiatement interrompre la session de tous les utilisateurs actuellement connectés sur mobile ou web.
                            </p>
                            <p className="text-[11px] text-red-700 mt-1">
                                Ils devront saisir à nouveau leur code secret OTP ou leurs identifiants pour accéder à leur compte.
                            </p>
                            <input
                                type="text"
                                placeholder="Motif de la déconnexion (ex: Mise à jour système, maintenance de sécurité...)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full mt-3 px-3 py-2 text-xs rounded-md border border-red-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Message de statut */}
            {statusMessage && (
                <div className={`mt-3 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    statusMessage.startsWith("Erreur") 
                        ? "bg-red-50 border border-red-200 text-red-800" 
                        : "bg-emerald-50 border border-emerald-200 text-emerald-800"
                }`}>
                    {statusMessage.startsWith("Erreur") ? (
                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    )}
                    <span>{statusMessage}</span>
                </div>
            )}

            {/* Historique de la dernière révocation */}
            <div className="mt-3 pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
                <div>
                    Dernière révocation générale :{" "}
                    <span className="font-semibold text-slate-800">
                        {lastRevokedAt ? new Date(lastRevokedAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        }) : "Aucune déconnexion générale récente"}
                    </span>
                    {lastRevokedBy && ` · Par ${lastRevokedBy}`}
                </div>
                {typeof impactedCount === "number" && (
                    <div className="text-slate-700 font-bold">
                        {impactedCount} comptes révoqués
                    </div>
                )}
            </div>
        </div>
    );
}

