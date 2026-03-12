import { verifyQRToken } from "@/actions/verify";
import { notFound } from "next/navigation";

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const result = await verifyQRToken(token);

    if (!result.valid && !result.error) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500">
                {/* Header */}
                <div className={`${result.valid ? 'bg-emerald-600' : 'bg-rose-600'} p-8 text-center text-white relative`}>
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                        </svg>
                    </div>
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
                            {result.valid ? (
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">
                            {result.valid ? 'Document Authentique' : 'Vérification Échouée'}
                        </h1>
                        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">
                            Portail de Transparence QAPRIL
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {result.valid ? (
                        <>
                            <div className="text-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type de Document</span>
                                <h2 className="text-xl font-bold text-slate-900">{result.type === 'RECEIPT' ? 'Quittance Numérique' : 'Certificat Locataire'}</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Référence</span>
                                    <span className="text-sm font-black text-slate-800 font-mono">{result.entity?.reference}</span>
                                </div>
                                
                                {result.type === 'RECEIPT' ? (
                                    <>
                                        <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Période</span>
                                            <span className="text-sm font-bold text-slate-800">{result.entity?.period}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Locataire</span>
                                            <span className="text-sm font-bold text-slate-800">{result.entity?.tenant}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Montant</span>
                                            <span className="text-sm font-black text-emerald-600">{(result.entity?.amount as number).toLocaleString()} FCFA</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Titulaire</span>
                                            <span className="text-sm font-bold text-slate-800">{result.entity?.holder}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Expiration</span>
                                            <span className="text-sm font-bold text-rose-500">
                                                {result.entity?.expiresAt ? new Date(result.entity.expiresAt).toLocaleDateString('fr-FR') : '--'}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-[10px] text-slate-500 text-center leading-relaxed font-medium">
                                    Cet horodatage certifie que le document a été émis par la plateforme QAPRIL conformément à la réglementation en vigueur.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6 space-y-4">
                            <p className="text-slate-600 font-medium">
                                {result.error || "Ce code de vérification est invalide ou a expiré."}
                            </p>
                            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                                <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wide">Avertissement de sécurité</p>
                                <p className="text-[10px] text-rose-500 mt-1 leading-relaxed">
                                    N'acceptez jamais un document dont la signature numérique ne peut être vérifiée sur le portail officiel.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <a 
                            href="https://www.qapril.ci" 
                            className="block w-full text-center py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                        >
                            Retour sur QAPRIL.CI
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Sécurisé par QAPRIL Forensic Audit ™
                    </p>
                </div>
            </div>
        </div>
    );
}
