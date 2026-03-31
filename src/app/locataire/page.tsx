import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getTenantDashboard } from "@/actions/tenant-actions"
import Link from "next/link"
import { ShieldCheck, Calendar, Receipt, AlertCircle, TrendingUp, Key, Lock, ChevronRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function LocataireDashboardPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== "TENANT") {
        redirect("/locataire/login")
    }

    const data = await getTenantDashboard()
    
    if (!data.success) {
        return (
            <div className="flex items-center justify-center p-8 text-center text-qred bg-qred-pale border-2 border-qred/20 rounded-2xl max-w-lg mx-auto mt-12">
                <AlertCircle className="mr-3 text-qred" />
                Erreur de chargement: {data.error}
            </div>
        )
    }

    if (!data.hasLease) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
                <div className="w-24 h-24 bg-qnavy-pale rounded-full flex items-center justify-center text-4xl shadow-inner mb-6">🏠</div>
                <h1 className="text-2xl font-black text-qnavy-dark mb-4">Bienvenue sur votre Espace QAPRIL</h1>
                <p className="text-qtext-mid max-w-md mx-auto mb-8 font-medium">
                    Vous n'avez actuellement aucun bail actif rattaché à votre profil ({data.user?.phone || 'Téléphone non configuré'}).
                    Demandez à votre propriétaire de digitaliser votre loyer.
                </p>
                <Link href="/onboarding/tenant" className="bg-qnavy hover:bg-qnavy-light text-white font-black px-8 py-4 rounded-xl shadow-[0_8px_16px_rgba(13,43,110,0.2)]">
                    Compléter mon profil
                </Link>
            </div>
        )
    }

    const lease = data.lease as any
    const utilites = data.utilities as any[]

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* V4 Welcome Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter italic flex items-center gap-3">
                        RÉSUMÉ
                        <span className="bg-qnavy-dark text-white text-[10px] px-3 py-1 rounded-full not-italic tracking-widest font-black uppercase shadow-md shadow-qnavy/20">LOCATAIRE</span>
                    </h1>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#C55A11] mt-2 flex items-center gap-2">
                        <Lock size={12} /> SESSION SÉCURISÉE — {new Date().toLocaleDateString('fr-CI', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                
                {data.score && (
                    <div className="bg-white p-4 rounded-[2rem] shadow-[0_8px_24px_rgba(13,43,110,0.06)] border border-qgrey-2 flex items-center gap-4">
                        <div className="w-12 h-12 bg-qgreen-pale rounded-xl flex items-center justify-center">
                            <ShieldCheck className="text-qgreen" size={24} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-qtext-light uppercase tracking-widest">Score ICL de Confiance</p>
                            <p className="text-xl font-black text-qgreen">{data.score} <span className="text-xs text-qgreen-dark uppercase tracking-widest">/ 850</span></p>
                        </div>
                    </div>
                )}
            </header>

             {/* Arrears / Alert Banner */}
            {lease.computedStatus === "EN_RETARD" && (
                <div className="bg-qred-pale border border-qred/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_4px_24px_rgba(255,0,0,0.1)] mb-8 animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <AlertCircle className="text-qred" size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-qred uppercase tracking-widest">Loyer en retard</h3>
                            <p className="text-[11px] font-bold text-qred-dark mt-1">
                                Vous avez {lease.totalArrears.toLocaleString()} FCFA de solde impayé. Évitez les pénalités d'Avis Juridique.
                            </p>
                        </div>
                    </div>
                    <Link href="/locataire/receipts" className="w-full sm:w-auto text-center bg-qred text-white font-black text-xs uppercase px-8 py-4 rounded-xl hover:bg-qred-dark transition-all shadow-lg shadow-qred/30 focus:ring-4 focus:ring-qred/40 whitespace-nowrap">
                        Régler Maintenant
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Loyer Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.04)] col-span-1 md:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_top_right,var(--color-qnavy-pale),transparent_70%)] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                    
                    <div className="flex items-center justify-between mb-8 z-10 relative">
                        <p className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Loyer du mois</p>
                        <span className="px-3 py-1 bg-qgreen-pale text-qgreen text-[9px] font-black rounded-full uppercase tracking-widest">Auto-prélèvement INACTIF</span>
                    </div>
                    
                    <div className="flex items-end gap-3 z-10 relative">
                        <span className="text-5xl lg:text-6xl font-black text-qnavy-dark tracking-tighter">
                            {lease.rentAmount.toLocaleString()}
                        </span>
                        <span className="text-lg font-black text-qtext-mid uppercase mb-2">FCFA</span>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 z-10 relative">
                        <Link href="/locataire/receipts" className="flex-1 bg-qnavy hover:bg-qnavy-light text-white font-black rounded-xl uppercase tracking-widest shadow-[0_8px_16px_rgba(13,43,110,0.2)] transition-all px-6 py-4 flex items-center justify-center gap-2">
                           <Calendar size={18} /> Accéder aux Quittances
                        </Link>
                        <Link href={`/locataire/leases`} className="flex-1 bg-white border-2 border-qgrey-2 hover:border-qnavy/30 text-qnavy font-black rounded-xl uppercase tracking-widest transition-all px-6 py-4 flex items-center justify-center gap-2">
                           Détails du Bail <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* Logement Info */}
                <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#1F4E79_100%)] p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-between">
                    <div>
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
                            <Key size={20} className="text-white" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Mon Logement</p>
                        <h3 className="text-xl font-black leading-tight mb-2">
                            {lease.property?.name || "Logement QAPRIL"}
                        </h3>
                        <p className="text-sm text-white/70 font-medium">Bail Réf: {lease.leaseReference}</p>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Propriétaire / Gérant</p>
                        <p className="text-sm font-bold truncate">
                            {lease.landlord?.lastName} {lease.landlord?.firstName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Utilites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Energie Preview */}
                <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.04)]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-qorange-pale rounded-xl flex items-center justify-center">
                                <span className="text-xl">⚡</span>
                            </div>
                            <h3 className="text-sm font-black text-qnavy-dark uppercase tracking-widest">Compteurs & OCR</h3>
                        </div>
                        <Link href="/locataire/cie-sodeci" className="text-[10px] font-black text-qorange hover:underline uppercase tracking-widest">
                            Ouvrir le Scanner →
                        </Link>
                    </div>
                    
                    {utilites.length > 0 ? (
                        <div className="space-y-3">
                            {utilites.slice(0, 2).map((u, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-qgrey-2">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp size={16} className={u.typeUtility === "CIE" ? "text-qorange" : "text-blue-500"} />
                                        <span className="text-xs font-bold text-qtext-mid uppercase">{u.typeUtility} OCR</span>
                                    </div>
                                    <span className="text-xs font-black text-qred bg-qred-pale px-3 py-1 rounded-lg">À Payer — {u.montantTotal} F</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-6 bg-background rounded-2xl border border-dashed border-qgrey-2">
                            <p className="text-xs font-bold text-qtext-mid">Aucune dette d'énergie détectée.</p>
                            <p className="text-[10px] text-qtext-light mt-1 w-full max-w-48 mx-auto">Voulez-vous scanner votre dernière facture CIE ?</p>
                        </div>
                    )}
                </div>

                {/* Droits & Recours */}
                <div className="bg-[linear-gradient(135deg,#FDF6E3_0%,#F5E6BE_100%)] p-6 sm:p-8 rounded-[2rem] border border-[#C9A84C]/20 shadow-sm relative overflow-hidden group">
                     <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <ShieldCheck className="text-[#C9A84C]" size={20} />
                        </div>
                        <h3 className="text-sm font-black text-qnavy-dark uppercase tracking-widest shadow-transparent text-[#97782A]">Mes Droits & Requêtes</h3>
                    </div>
                    <p className="text-xs font-bold text-[#97782A]/80 leading-relaxed max-w-xs relative z-10 mb-6">
                        Une fuite d'eau ? Une quittance non délivrée ? Signalez un incident de maintenance ou une anomalie juridique couverte par vos droits de locataire sous bail digital.
                    </p>
                    <Link href="/locataire/rights" className="inline-block bg-white text-[#97782A] font-black uppercase text-[10px] px-6 py-3 rounded-xl border border-[#C9A84C]/30 hover:shadow-md transition-shadow">
                        Ouvrir un ticket d'assistance
                    </Link>

                    <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                        <ShieldCheck size={180} />
                    </div>
                </div>
            </div>
            
        </div>
    )
}
