"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, KeyRound, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { validateLeaseWithCode } from "@/actions/lease.actions";
import { toast } from "sonner";

function ValiderBailForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialOtp = searchParams.get("otp") || searchParams.get("code") || "";
    const leaseId = searchParams.get("leaseId") || undefined;

    const [otp, setOtp] = useState(initialOtp);
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim()) {
            toast.error("Veuillez saisir votre code OTP de validation.");
            return;
        }
        setLoading(true);
        try {
            const res = await validateLeaseWithCode(otp.trim(), leaseId);
            if (res.success) {
                setValidated(true);
                toast.success("Contrat de bail validé et activé avec succès !");
                setTimeout(() => {
                    router.push("/mon-espace-locataire/leases");
                }, 1500);
            } else {
                toast.error(res.error || "Code de validation invalide.");
            }
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la validation du bail.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto py-8 px-4">
            <Link
                href="/mon-espace-locataire"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 mb-6"
            >
                <ArrowLeft size={14} /> Retour à mon espace
            </Link>

            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            Valider mon Contrat de Bail
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Signature électronique certifiée QAPRIL (Code OTP SMS/WhatsApp)
                        </p>
                    </div>
                </div>

                {validated ? (
                    <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                        <h2 className="text-base font-black text-emerald-900 uppercase">
                            Bail Validé avec Succès !
                        </h2>
                        <p className="text-xs text-emerald-700">
                            Redirection vers vos contrats en cours...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                Code de validation à 6 chiffres (reçu par SMS)
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Ex: 482910"
                                    maxLength={10}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-lg font-black tracking-widest text-slate-900 focus:outline-none focus:border-slate-900"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Vérification...
                                </>
                            ) : (
                                "Confirmer et signer mon bail"
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function MonEspaceValiderBailPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-slate-400">Chargement...</div>}>
            <ValiderBailForm />
        </Suspense>
    );
}
