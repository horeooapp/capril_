"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { signLease, requestSignatureOTP } from "@/actions/lease.actions";
import { 
    ShieldCheck, 
    Key, 
    FileText, 
    Building2, 
    ArrowRight, 
    Sparkles, 
    RefreshCw, 
    CheckCircle2, 
    AlertCircle 
} from "lucide-react";

interface PendingLeaseValidationCardProps {
    lease: {
        id: string;
        leaseReference?: string;
        rentAmount?: number;
        depositAmount?: number;
        property?: {
            name?: string | null;
            address?: string | null;
            commune?: string | null;
        } | null;
        landlord?: {
            firstName?: string | null;
            lastName?: string | null;
            phone?: string | null;
        } | null;
    };
    onSuccess?: () => void;
}

export default function PendingLeaseValidationCard({ lease, onSuccess }: PendingLeaseValidationCardProps) {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!lease || !lease.id) return null;

    const propertyTitle = lease.property?.name || lease.property?.address || "Logement déclaré";
    const commune = lease.property?.commune || "Abidjan";
    const rent = Number(lease.rentAmount || 0);
    const landlordName = lease.landlord?.firstName 
        ? `${lease.landlord.firstName} ${lease.landlord.lastName || ""}`.trim()
        : "Votre Bailleur";

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanOtp = otp.trim().replace(/\D/g, "");
        if (cleanOtp.length !== 6) {
            setError("Veuillez saisir les 6 chiffres de votre code de validation.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await signLease(lease.id, cleanOtp);
            if (res.success) {
                setSuccess(true);
                toast.success("🎉 Félicitations ! Votre contrat de bail est validé et signé avec succès.");
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        window.location.reload();
                    }
                }, 1200);
            } else {
                setError(res.error || "Code de validation incorrect ou expiré.");
                toast.error(res.error || "Échec de validation du code.");
            }
        } catch (err: any) {
            setError(err.message || "Erreur de connexion.");
            toast.error("Une erreur inattendue est survenue.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError(null);
        try {
            const res = await requestSignatureOTP(lease.id);
            if (res.success) {
                toast.success("🔑 Nouveau code de signature envoyé par WhatsApp et SMS !");
            } else {
                toast.error(res.error || "Impossible de renvoyer le code pour le moment.");
            }
        } catch (_err) {
            toast.error("Erreur lors de l'envoi du code.");
        } finally {
            setResending(false);
        }
    };

    if (success) {
        return (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-8 text-center shadow-lg shadow-emerald-100/50 animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle2 size={48} className="text-emerald-600 mx-auto mb-3" />
                <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight">Contrat Validé & Scellé !</h3>
                <p className="text-sm text-emerald-700 mt-1 font-medium">Votre bail officiel {lease.leaseReference} est désormais actif et certifié v3.0.</p>
                <p className="text-xs text-emerald-600 mt-3 font-bold uppercase tracking-wider">Actualisation de votre espace...</p>
            </div>
        );
    }

    return (
        <section className="relative overflow-hidden rounded-3xl border-2 border-amber-400/90 bg-gradient-to-br from-white via-amber-50/40 to-orange-50/30 p-6 sm:p-8 shadow-[0_12px_36px_-6px_rgba(217,119,6,0.18)]">
            {/* Background Glow */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header Badge & Title */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-amber-200/80">
                <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>Action Requise · Signature de Bail</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Validez votre Contrat de Bail avec votre Code ✍️
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        Votre bailleur a généré votre bail officiel. Saisissez ci-dessous le code reçu par WhatsApp, SMS ou Email pour le signer électroniquement.
                    </p>
                </div>

                {lease.leaseReference && (
                    <div className="text-left md:text-right shrink-0 bg-white/80 backdrop-blur px-4 py-2.5 rounded-2xl border border-amber-200 shadow-sm">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Référence Bail</span>
                        <span className="block font-mono font-black text-sm text-amber-700">{lease.leaseReference}</span>
                    </div>
                )}
            </div>

            {/* Grid: Details on Left, OTP Input on Right */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
                
                {/* Details Box */}
                <div className="lg:col-span-6 space-y-4">
                    <div className="p-4 bg-white/90 rounded-2xl border border-amber-200/70 shadow-sm space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                                <Building2 size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bien Concerné</p>
                                <p className="text-sm font-black text-slate-900 truncate">{propertyTitle}</p>
                                <p className="text-xs text-slate-500 font-medium">{commune}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Loyer Mensuel</span>
                                <span className="font-mono font-black text-slate-900 text-sm">
                                    {rent.toLocaleString('fr-FR')} XOF
                                </span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Bailleur</span>
                                <span className="font-bold text-slate-800 text-xs truncate block">
                                    {landlordName}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800 font-medium">
                        <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                        <span>Conforme Loi N° 2019-576 & scellé par empreinte cryptographique SHA-256.</span>
                    </div>
                </div>

                {/* Form Box: OTP Code */}
                <div className="lg:col-span-6 flex flex-col justify-between p-5 bg-white rounded-2xl border border-amber-300 shadow-sm">
                    <form onSubmit={handleValidate} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <Key size={14} className="text-amber-600" />
                                    <span>Code de Validation (6 chiffres)</span>
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 normal-case">WhatsApp / SMS / Mail</span>
                            </label>

                            <input 
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value.replace(/\D/g, ""));
                                    setError(null);
                                }}
                                placeholder="• • • • • •"
                                className="w-full h-14 text-center text-3xl font-black font-mono tracking-[0.4em] bg-slate-50 border-2 border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-300 text-slate-900"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
                                <AlertCircle size={15} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading || otp.trim().length !== 6}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                    <span>Validation en cours...</span>
                                </>
                            ) : (
                                <>
                                    <span>Valider & Signer le Bail ✍️</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Actions: Resend & Full Contract */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
                        <button 
                            type="button"
                            onClick={handleResend}
                            disabled={resending || loading}
                            className="text-amber-800 hover:text-amber-950 font-bold underline flex items-center gap-1 disabled:opacity-50"
                        >
                            <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
                            <span>{resending ? "Envoi..." : "Renvoyer mon code"}</span>
                        </button>

                        <Link 
                            href={`/mon-espace-locataire/leases/${lease.id}/signature`}
                            className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1"
                        >
                            <FileText size={12} />
                            <span>Lire le contrat complet</span>
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
}

