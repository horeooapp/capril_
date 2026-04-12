import { getReceiptsForTenant } from "@/actions/receipts"
import { getTenantDashboard } from "@/actions/tenant-actions"
import { FileText, Download, Calendar, Hash, ArrowRight, Wallet, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function TenantReceiptsPage() {
    const receipts = await getReceiptsForTenant()
    const dashboard = await getTenantDashboard()
    
    if (!dashboard.success || !dashboard.hasLease) {
        redirect("/mon-espace-locataire")
    }

    const lease = dashboard.lease as any

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header V4 */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        Quittances
                        <span className="bg-qgreen/10 text-qgreen text-[10px] px-3 py-1 rounded-full tracking-widest font-black uppercase border border-qgreen/20">SHA-256</span>
                    </h1>
                    <p className="text-[11px] font-black uppercase tracking-widest text-qtext-light mt-2">
                        Historique certifié QAPRIL
                    </p>
                </div>

                {lease.computedStatus === "EN_RETARD" && (
                    <div className="bg-qred-pale p-5 rounded-[1.5rem] shadow-sm border border-qred/20 flex items-center gap-5">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-qred uppercase tracking-widest">Solde Dû</p>
                            <p className="text-xl font-black text-qred-dark">{lease.totalArrears.toLocaleString()} <span className="text-xs">FCFA</span></p>
                        </div>
                        <Link href="/mon-espace-locataire/payment" className="bg-qred hover:bg-qred-dark text-white font-black px-6 py-3 rounded-xl uppercase text-[10px] tracking-widest transition-all shadow-md shadow-qred/30">
                            Payer →
                        </Link>
                    </div>
                )}
            </div>

            {/* List */}
            {receipts.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-16 text-center border border-qgrey-2 shadow-sm">
                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                        📜
                    </div>
                    <h2 className="text-lg font-black text-qnavy-dark uppercase tracking-widest">Aucune quittance</h2>
                    <p className="text-sm text-qtext-mid max-w-sm mx-auto mt-2 font-medium">
                        Vos quittances apparaîtront ici et certifiées (SHA-256) dès que votre premier loyer sera validé.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {receipts.map((receipt: any) => (
                        <div 
                            key={receipt.id} 
                            className="bg-white p-6 rounded-[2rem] border border-qgrey-2 shadow-[0_4px_24px_rgba(13,43,110,0.03)] hover:shadow-[0_12px_40px_rgba(13,43,110,0.08)] transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-qgreen-pale text-qgreen rounded-2xl flex items-center justify-center border border-qgreen/10 group-hover:scale-105 transition-transform">
                                    <FileText size={28} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-black text-qnavy-dark uppercase">{receipt.periodMonth}</h3>
                                        <span className="px-2.5 py-1 bg-qgreen text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 shadow-sm shadow-qgreen/20">
                                            <ShieldCheck size={10} /> Validé
                                        </span>
                                    </div>
                                    <div className="flex gap-4 text-[11px] text-qtext-light font-bold">
                                        <span className="flex items-center gap-1.5 uppercase tracking-widest">
                                            <Hash size={12} /> {receipt.receiptRef}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={12} /> {new Date(receipt.paidAt).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 border-t border-qgrey-2 md:border-0 pt-4 md:pt-0 mt-2 md:mt-0">
                                <div className="text-left md:text-right">
                                    <p className="text-[9px] font-black text-qtext-light uppercase tracking-widest mb-1">Total Payé</p>
                                    <p className="text-xl font-black text-qnavy-dark">{Number(receipt.totalAmount).toLocaleString()} <span className="text-xs">FCFA</span></p>
                                </div>
                                <Link 
                                    href={`/receipts/${receipt.id}`} 
                                    target="_blank"
                                    className="w-14 h-14 bg-background border border-qgrey-2 hover:border-qnavy/40 text-qnavy rounded-xl transition-all flex items-center justify-center"
                                    title="Télécharger PDF"
                                >
                                    <Download size={20} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Note d'Information */}
            <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#1F4E79_100%)] p-8 rounded-[2rem] shadow-xl text-white flex flex-col sm:flex-row items-center gap-8 mt-12">
                 <div className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center text-3xl shrink-0 border border-white/20">
                    💡
                 </div>
                 <div>
                    <h4 className="font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                        Preuve de vie certifiée <span className="text-qorange">SHA-256</span>
                    </h4>
                    <p className="text-sm text-white/70 leading-relaxed font-medium">
                        Vos factures QAPRIL sont inviolables. L'empreinte sécurisée augmente dynamiquement votre Indice de Confiance Locatif, favorisant vos futures candidatures immobilières.
                    </p>
                 </div>
            </div>
        </div>
    )
}
