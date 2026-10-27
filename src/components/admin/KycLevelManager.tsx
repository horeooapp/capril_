"use client";

import React, { useState, useTransition } from "react";
import { 
    ShieldCheck, 
    ShieldAlert, 
    ShieldOff, 
    Power, 
    RotateCcw, 
    UserCheck, 
    Building2, 
    FileText, 
    Users, 
    AlertTriangle,
    CheckCircle2,
    Lock,
    Unlock,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { 
    disableAllKycLevelsAction, 
    enableAllKycLevelsAction, 
    toggleSingleKycLevelAction,
    bulkUpdateUsersKycAction,
    getKycConfigAction
} from "@/actions/kyc-config-actions";
import { KycLevelsConfig } from "@/lib/kyc-config";

interface KycLevelManagerProps {
    initialConfig?: KycLevelsConfig;
    showBulkUserActions?: boolean;
    compact?: boolean;
}

export default function KycLevelManager({ 
    initialConfig = {
        allDisabled: false,
        level1: true,
        level2: true,
        level3: true,
        level4: true,
    },
    showBulkUserActions = true,
    compact = false,
}: KycLevelManagerProps) {
    const [config, setConfig] = useState<KycLevelsConfig>(initialConfig);
    const [isPending, startTransition] = useTransition();
    const [bulkPending, setBulkPending] = useState<string | null>(null);

    React.useEffect(() => {
        getKycConfigAction().then((latest) => {
            if (latest) setConfig(latest);
        });
    }, []);

    // Compter le nombre de niveaux actifs
    const activeLevelsCount = [config.level1, config.level2, config.level3, config.level4].filter(Boolean).length;
    const isMasterDisabled = config.allDisabled || activeLevelsCount === 0;

    // 1. DÉSACTIVER TOUS LES NIVEAUX
    const handleDisableAll = () => {
        if (!confirm("CONFIRMATION : Voulez-vous vraiment DÉSACTIVER TOUS LES NIVEAUX de KYC ?\n\nEn mode désactivé, les exigences d'identité et de documents légaux seront bypassées sur toute la plateforme (enregistrement de biens, profils, etc.).")) {
            return;
        }

        startTransition(async () => {
            const res = await disableAllKycLevelsAction();
            if (res.success && res.config) {
                setConfig(res.config);
                toast.warning("Tous les niveaux de KYC ont été désactivés (Mode Bypass Actif).");
            } else {
                toast.error(res.error || "Erreur lors de la désactivation");
            }
        });
    };

    // 2. RÉACTIVER TOUS LES NIVEAUX
    const handleEnableAll = () => {
        startTransition(async () => {
            const res = await enableAllKycLevelsAction();
            if (res.success && res.config) {
                setConfig(res.config);
                toast.success("Tous les niveaux de KYC (1, 2, 3 et 4) sont maintenant réactivés.");
            } else {
                toast.error(res.error || "Erreur lors de la réactivation");
            }
        });
    };

    // 3. TOGGLE UN NIVEAU SPÉCIFIQUE
    const handleToggleLevel = (level: 1 | 2 | 3 | 4, currentState: boolean) => {
        const nextState = !currentState;
        startTransition(async () => {
            const res = await toggleSingleKycLevelAction(level, nextState);
            if (res.success && res.config) {
                setConfig(res.config);
                toast.info(`KYC Niveau ${level} ${nextState ? "activé" : "désactivé"}.`);
            } else {
                toast.error(res.error || "Erreur lors du changement d'état");
            }
        });
    };

    // 4. ACTION EN MASSE SUR UTILISATEURS
    const handleBulkUsers = (targetLevel: number, kycStatus: "verified" | "unverified") => {
        const actionLabel = targetLevel === 4 
            ? "passer TOUS les utilisateurs existants au Niveau 4 (Vérifié)" 
            : "réinitialiser TOUS les utilisateurs au Niveau 0 (Non vérifié)";
        
        if (!confirm(`ATTENTION : Cette action va ${actionLabel} en base de données.\n\nVoulez-vous continuer ?`)) {
            return;
        }

        setBulkPending(targetLevel === 4 ? "certify" : "reset");
        startTransition(async () => {
            const res = await bulkUpdateUsersKycAction(targetLevel, kycStatus);
            if (res.success) {
                toast.success(res.message || "Utilisateurs mis à jour avec succès.");
            } else {
                toast.error(res.error || "Erreur lors de la mise à jour des utilisateurs.");
            }
            setBulkPending(null);
        });
    };

    const levelsInfo: Array<{
        level: 1 | 2 | 3 | 4;
        title: string;
        tag: string;
        desc: string;
        unlocked: string;
        icon: React.ReactNode;
        isActive: boolean;
    }> = [
        {
            level: 1,
            title: "Niveau 1 — Identité Déclarée",
            tag: "De Base",
            desc: "Numéro de téléphone vérifié (OTP) et déclaration initiale de pièce d'identité (CNI / Passeport).",
            unlocked: "Création de compte, consultation et alertes",
            icon: <UserCheck className="w-5 h-5" />,
            isActive: !config.allDisabled && config.level1,
        },
        {
            level: 2,
            title: "Niveau 2 — Profil Complet & Biens",
            tag: "Particuliers",
            desc: "Profil complet avec justificatifs. Obligatoire en mode strict pour l'enregistrement de logements particuliers.",
            unlocked: "Ajout de biens particuliers, scoring revenus, label confiance",
            icon: <FileText className="w-5 h-5" />,
            isActive: !config.allDisabled && config.level2,
        },
        {
            level: 3,
            title: "Niveau 3 — Identité Vérifiée Manuelle",
            tag: "Certifié",
            desc: "Contrôle visuel et validation par un agent institutionnel (ANAH / CDC).",
            unlocked: "Certification d'identité certifiée, accès baux sécurisés CDC",
            icon: <ShieldCheck className="w-5 h-5" />,
            isActive: !config.allDisabled && config.level3,
        },
        {
            level: 4,
            title: "Niveau 4 — Professionnel & Agence",
            tag: "PRO / Agences",
            desc: "Validation d'entité légale, RCCM, agrément ministériel ou DFE pour les agences immobilières.",
            unlocked: "Émission de mandats, gestion multi-biens, compte Agence Agréée",
            icon: <Building2 className="w-5 h-5" />,
            isActive: !config.allDisabled && config.level4,
        },
    ];

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden p-6 md:p-8 space-y-8">
            {/* Header & Status Banner */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${
                            isMasterDisabled 
                                ? "bg-amber-100 text-amber-700" 
                                : "bg-emerald-100 text-emerald-800"
                        }`}>
                            {isMasterDisabled ? <ShieldOff className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                        </div>
                        <div>
                            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                                Contrôle de Sécurité Plateforme
                            </span>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Gestion des Niveaux KYC
                                {isMasterDisabled ? (
                                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-300">
                                        Bypass Total Actif
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-300">
                                        {activeLevelsCount}/4 Niveaux Actifs
                                    </span>
                                )}
                            </h2>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 max-w-2xl font-medium">
                        Activez ou désactivez globalement ou individuellement les exigences de vérification KYC (Niveaux 1 à 4). 
                        La désactivation permet aux utilisateurs et agences de tester ou d'opérer sans blocage documentaire.
                    </p>
                </div>

                {/* THE TWO MASTER BUTTONS REQUESTED BY USER */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Bouton DÉSACTIVER TOUS LES NIVEAUX */}
                    <button
                        type="button"
                        onClick={handleDisableAll}
                        disabled={isPending || isMasterDisabled}
                        className={`px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-md active:scale-95 ${
                            isMasterDisabled
                                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                : "bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-700 hover:to-rose-800 shadow-red-600/20 hover:shadow-lg"
                        }`}
                        title="Désactiver tous les niveaux de KYC (bypasser les exigences d'identité et de documents)"
                    >
                        <ShieldOff className="w-4 h-4" />
                        <span>Désactiver tous les niveaux</span>
                    </button>

                    {/* Bouton RÉACTIVER TOUS LES NIVEAUX */}
                    <button
                        type="button"
                        onClick={handleEnableAll}
                        disabled={isPending || (!isMasterDisabled && activeLevelsCount === 4)}
                        className={`px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-md active:scale-95 ${
                            !isMasterDisabled && activeLevelsCount === 4
                                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                : "bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-700 hover:to-teal-800 shadow-emerald-600/20 hover:shadow-lg"
                        }`}
                        title="Réactiver tous les niveaux de KYC (rétablir l'obligation stricte des 4 niveaux)"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Réactiver tous les niveaux</span>
                    </button>
                </div>
            </div>

            {/* Alerte État Général */}
            {isMasterDisabled ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4">
                    <div className="p-2 bg-amber-500 text-white rounded-xl">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                        <p className="font-black text-amber-900">
                            Attention : Le système KYC est actuellement entièrement DÉSACTIVÉ.
                        </p>
                        <p className="text-amber-700 font-medium mt-0.5">
                            Aucun blocage de niveau 1, 2, 3 ou 4 n'est appliqué. Tous les utilisateurs peuvent enregistrer des biens, 
                            créer des baux ou des mandats sans fournir de documents. Cliquez sur « Réactiver tous les niveaux » pour rétablir la conformité.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-4">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                        <p className="font-black text-emerald-900">
                            Conformité Active : {activeLevelsCount} niveau(x) de vérification sur 4 sont appliqués.
                        </p>
                        <p className="text-emerald-700 font-medium mt-0.5">
                            Les règles de sécurité et de filtrage sont en vigueur pour les niveaux cochés ci-dessous.
                        </p>
                    </div>
                </div>
            )}

            {/* GRILLE DES 4 NIVEAUX DE KYC */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {levelsInfo.map((item) => (
                    <div
                        key={item.level}
                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                            item.isActive 
                                ? "bg-slate-50/60 border-slate-800/10 shadow-sm hover:border-slate-800/25" 
                                : "bg-slate-100/60 border-dashed border-slate-300 opacity-60 grayscale"
                        }`}
                    >
                        <div className="space-y-4">
                            {/* Card Header with Icon & Toggle */}
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-2xl ${
                                    item.isActive ? "bg-slate-900 text-white" : "bg-slate-300 text-slate-600"
                                }`}>
                                    {item.icon}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                    item.isActive 
                                        ? "bg-emerald-100 text-emerald-800" 
                                        : "bg-slate-200 text-slate-500"
                                }`}>
                                    {item.tag}
                                </span>
                            </div>

                            {/* Card Title & Desc */}
                            <div className="space-y-1">
                                <h3 className="text-base font-black text-slate-900 leading-tight">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>

                            {/* Ce que ça débloque */}
                            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                                <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">
                                    Impact opérationnel :
                                </span>
                                <span>{item.unlocked}</span>
                            </div>
                        </div>

                        {/* Toggle Button Bottom */}
                        <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                            <span className={`text-xs font-bold ${
                                item.isActive ? "text-emerald-700" : "text-slate-400"
                            }`}>
                                {item.isActive ? "Niveau Actif" : "Désactivé"}
                            </span>

                            <button
                                type="button"
                                onClick={() => handleToggleLevel(item.level, item.isActive)}
                                disabled={isPending}
                                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    item.isActive ? "bg-emerald-600" : "bg-slate-300"
                                }`}
                                aria-label={`Basculer ${item.title}`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        item.isActive ? "translate-x-5" : "translate-x-0"
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* SECTION ACTIONS EN MASSE SUR LES UTILISATEURS EXISTANTS */}
            {showBulkUserActions && (
                <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70 p-6 rounded-3xl">
                    <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            Actions Rapides sur la Base Utilisateurs
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                            Permet de forcer le statut KYC de l'ensemble des comptes de la plateforme en un seul clic.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => handleBulkUsers(4, "verified")}
                            disabled={isPending || bulkPending !== null}
                            className="px-4 py-2.5 bg-slate-900 text-white hover:bg-black font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
                        >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{bulkPending === "certify" ? "Mise à jour..." : "Certifier tous au Niveau 4"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleBulkUsers(0, "unverified")}
                            disabled={isPending || bulkPending !== null}
                            className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                            <span>{bulkPending === "reset" ? "Réinitialisation..." : "Réinitialiser tous à 0"}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
