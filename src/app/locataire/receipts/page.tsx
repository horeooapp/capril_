import { getReceiptsForTenant } from "@/actions/receipts"
import { FileText, Download, Calendar, Hash, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function TenantReceiptsPage() {
    const receipts = await getReceiptsForTenant()

    return (
        <div className="space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-[#1F4E79] tracking-tight uppercase">Mes Quittances</h1>
                    <p className="text-gray-500 font-medium">Historique complet de vos paiements certifiés QAPRIL.</p>
                </div>
            </div>

            {receipts.length === 0 ? (
                <div className="glass-panel rounded-[3rem] p-20 text-center border border-white/40 shadow-xl bg-white/60">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                        📜
                    </div>
                    <h2 className="text-2xl font-black text-gray-400 uppercase tracking-tighter">Aucune quittance</h2>
                    <p className="text-gray-400 max-w-md mx-auto mt-2 font-medium">
                        Vos quittances apparaîtront ici dès que votre premier loyer sera validé par le système.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {receipts.map((receipt: any) => (
                        <div 
                            key={receipt.id} 
                            className="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/40 shadow-lg bg-white/80 hover:shadow-2xl transition-all group relative overflow-hidden"
                        >
                            {/* Status Indicator */}
                            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                        <FileText size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-black text-[#1F4E79] uppercase">{receipt.periodMonth}</h3>
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">
                                                Certifiée
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Hash size={14} className="text-gray-400" />
                                                {receipt.receiptRef}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-gray-400" />
                                                Payé le {new Date(receipt.paidAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Montant Total</p>
                                        <p className="text-2xl font-black text-[#1F4E79]">{Number(receipt.totalAmount).toLocaleString()} <span className="text-xs">FCFA</span></p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link 
                                            href={`/receipts/${receipt.id}`} 
                                            target="_blank"
                                            className="p-4 bg-[#1F4E79] text-white rounded-2xl hover:bg-[#163a5a] transition-all shadow-lg active:scale-95 flex items-center gap-2 font-black uppercase text-[11px] tracking-widest"
                                        >
                                            <Download size={18} />
                                            PDF
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Educational Note */}
            <div className="glass-panel p-8 rounded-[2.5rem] border border-[#1F4E79]/10 bg-[#1F4E79]/5 flex flex-col md:flex-row items-center gap-8">
                 <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl shrink-0">
                    💡
                 </div>
                 <div>
                    <h4 className="font-black text-[#1F4E79] uppercase tracking-tighter mb-1">Quittances Infalsifiable</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Chaque quittance émise sur QAPRIL comporte une empreinte numérique unique (Hash SHA-256). Elle constitue une preuve libératoire de paiement reconnue par les autorités et valorise votre Indice de Confiance Locatif (ICL).
                    </p>
                 </div>
            </div>
        </div>
    )
}
