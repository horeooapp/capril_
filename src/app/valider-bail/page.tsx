"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { validateLeaseWithCode } from "@/actions/lease.actions";
import { ShieldCheck, Key, ArrowRight, CheckCircle2, AlertCircle, Building2, HelpCircle } from "lucide-react";

function ValiderBailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, status } = useSession();

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const codeFromUrl = searchParams.get("code") || searchParams.get("otp");
        if (codeFromUrl) {
            setOtp(codeFromUrl.replace(/\D/g, "").slice(0, 6));
        }
    }, [searchParams]);

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanOtp = otp.trim().replace(/\D/g, "");
        if (cleanOtp.length !== 6) {
            setError("Veuillez saisir un code à 6 chiffres valide.");
            return;
        }

        if (status === "unauthenticated") {
            // Sauvegarder le code et rediriger vers la connexion
            toast.info("Veuillez vous connecter pour sceller votre signature.");
            router.push(`/login?callbackUrl=${encodeURIComponent(`/valider-bail?code=${cleanOtp}`)}`);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const leaseId = searchParams.get("leaseId") || undefined;
            const res = await validateLeaseWithCode(cleanOtp, leaseId);
            if (res.success) {
                setSuccess(true);
                toast.success("🎉 Votre contrat de bail est validé et actif !");
                setTimeout(() => {
                    router.push("/mon-espace-locataire");
                }, 1500);
            } else {
                setError(res.error || "Code de validation incorrect ou expiré.");
                toast.error(res.error || "Échec de validation.");
            }
        } catch (err: any) {
            setError(err.message || "Erreur de connexion au serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 px-4 py-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Header */}
            <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-8 border-b border-slate-800 relative z-10">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="QAPRIL" className="h-9 w-auto object-contain" />
                    <div>
                        <span className="font-black text-lg tracking-tight uppercase block leading-none text-white">QAPRIL</span>
                        <span className="text-[10px] font-bold text-[#FF8200] uppercase tracking-wider block mt-0.5">Validation de Bail</span>
                    </div>
                </Link>

                <Link 
                    href="/mon-espace-locataire" 
                    className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 transition-colors"
                >
                    Mon Espace Locataire →
                </Link>
            </header>

            {/* Main Card */}
            <main className="max-w-md mx-auto w-full my-auto py-8 relative z-10">
                {success ? (
                    <div className="bg-slate-800/90 border border-emerald-500/50 rounded-3xl p-8 text-center space-y-4 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
                        <CheckCircle2 size={56} className="text-emerald-400 mx-auto" />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Bail Validé avec Succès !</h1>
                        <p className="text-sm text-slate-300 font-medium">
                            Votre contrat est désormais signé électroniquement selon la Loi N° 2019-576.
                        </p>
                        <p className="text-xs text-amber-400 font-bold uppercase tracking-wider animate-pulse pt-2">
                            Redirection vers votre Espace Locataire...
                        </p>
                    </div>
                ) : (
                    <div className="bg-slate-950/80 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-[#FF8200] flex items-center justify-center mx-auto border border-amber-500/30">
                                <Key size={26} />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                                Validation de Bail
                            </h1>
                            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                                Saisissez le code à 6 chiffres reçu sur votre WhatsApp, SMS ou Email pour valider et signer votre contrat.
                            </p>
                        </div>

                        <form onSubmit={handleValidate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 text-center">
                                    Code de signature (6 chiffres)
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
                                    className="w-full h-16 text-center text-3xl font-black font-mono tracking-[0.4em] bg-slate-900 border-2 border-slate-700 focus:border-amber-500 rounded-2xl text-white outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-600"
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2 animate-shake">
                                    <AlertCircle size={16} className="shrink-0 text-rose-400" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={loading || otp.trim().length !== 6}
                                className="w-full h-13 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                        <span>Vérification en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Valider & Activer le Bail ✍️</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2 text-[11px] text-slate-400">
                            <p className="font-bold text-slate-300 flex items-center gap-1.5">
                                <HelpCircle size={14} className="text-amber-400" />
                                <span>Où trouver mon code ?</span>
                            </p>
                            <p className="leading-relaxed">
                                Le code de validation vous est envoyé dès que le propriétaire génère votre contrat de bail. Vous pouvez également le retrouver en vous connectant sur votre <Link href="/mon-espace-locataire" className="text-amber-400 underline font-bold">Espace Locataire</Link>.
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 pt-6 border-t border-slate-800 relative z-10">
                <p>QAPRIL — Plateforme certifiée conforme à la Loi N° 2019-576 sur le bail d'habitation en Côte d'Ivoire.</p>
            </footer>
        </div>
    );
}

export default function ValiderBailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                Chargement de l'espace de validation...
            </div>
        }>
            <ValiderBailContent />
        </Suspense>
    );
}

