"use client"

import { motion, Variants } from "framer-motion"
import { FileText, Download, Calendar, Hash, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function ReceiptsContent({ receipts, lease }: any) {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    }

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto space-y-8 pb-20 px-1"
        >
            {/* Header V4 */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        Quittances
                        <span className="hidden sm:inline-block bg-qgreen/10 text-qgreen text-[10px] px-3 py-1 rounded-full tracking-widest font-black uppercase border border-qgreen/20">SHA-256</span>
                    </h1>
                    <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-qtext-light mt-2">
                        Historique certifié QAPRIL
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {lease.computedStatus === "EN_RETARD" ? (
                        <div className="bg-qred-pale p-5 rounded-[1.5rem] shadow-sm border border-qred/20 flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
                            <div className="text-left sm:text-right">
                                <p className="text-[9px] font-black text-qred uppercase tracking-widest">Solde Dû</p>
                                <p className="text-lg sm:text-xl font-black text-qred-dark whitespace-nowrap">{lease.totalArrears.toLocaleString()} <span className="text-xs">FCFA</span></p>
                            </div>
                            <Link href="/mon-espace-locataire/payment" className="bg-qred hover:bg-qred-dark text-white font-black px-6 py-3 rounded-xl uppercase text-[10px] tracking-widest transition-all shadow-md shadow-qred/30 shrink-0">
                                Payer Maintenant →
                            </Link>
                        </div>
                    ) : (
                        <Link href="/mon-espace-locataire/payment" className="bg-qnavy hover:bg-qnavy-dark text-white font-black px-8 py-4 rounded-2xl uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-qnavy/20 flex items-center gap-2">
                           Régler mon Loyer <ShieldCheck size={16} />
                        </Link>
                    )}
                </div>
            </motion.div>

            {/* List */}
            {receipts.length === 0 ? (
                <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-16 text-center border border-qgrey-2 shadow-sm">
                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                        📜
                    </div>
                    <h2 className="text-lg font-black text-qnavy-dark uppercase tracking-widest">Aucune quittance</h2>
                    <p className="text-sm text-qtext-mid max-w-sm mx-auto mt-2 font-medium">
                        Vos quittances apparaîtront ici certifiées (SHA-256).
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {receipts.map((receipt: any) => (
                        <motion.div 
                            variants={itemVariants}
                            key={receipt.id} 
                            className="bg-white p-5 sm:p-6 rounded-[2rem] border border-qgrey-2 shadow-[0_4px_24px_rgba(13,43,110,0.03)] hover:shadow-[0_12px_40px_rgba(13,43,110,0.08)] transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-4 sm:gap-5">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-qgreen-pale text-qgreen rounded-2xl flex items-center justify-center border border-qgreen/10 group-hover:scale-105 transition-transform shrink-0">
                                    <FileText size={28} />
                                </div>
                                <div className="overflow-hidden">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-base sm:text-lg font-black text-qnavy-dark uppercase truncate">{receipt.periodMonth}</h3>
                                        <span className="px-2.5 py-1 bg-qgreen text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 shadow-sm shadow-qgreen/20 shrink-0">
                                            <ShieldCheck size={10} /> Validé
                                        </span>
                                    </div>
                                    <div className="flex gap-4 text-[10px] sm:text-[11px] text-qtext-light font-bold">
                                        <span className="flex items-center gap-1.5 uppercase tracking-widest truncate">
                                            <Hash size={12} /> {receipt.receiptRef}
                                        </span>
                                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                                            <Calendar size={12} /> {new Date(receipt.paidAt).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 border-t border-qgrey-2 md:border-0 pt-4 md:pt-0">
                                <div className="text-left md:text-right">
                                    <p className="text-[9px] font-black text-qtext-light uppercase tracking-widest mb-1">Total Payé</p>
                                    <p className="text-lg sm:text-xl font-black text-qnavy-dark whitespace-nowrap">{Number(receipt.totalAmount).toLocaleString()} <span className="text-xs">FCFA</span></p>
                                </div>
                                <Link 
                                    href={`/receipts/${receipt.id}`} 
                                    target="_blank"
                                    className="w-12 h-12 sm:w-14 sm:h-14 bg-background border border-qgrey-2 hover:border-qnavy/40 text-qnavy rounded-xl transition-all flex items-center justify-center shrink-0"
                                    title="Télécharger PDF"
                                >
                                    <Download size={20} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Note d'Information */}
            <motion.div variants={itemVariants} className="bg-[linear-gradient(135deg,#0D2B6E_0%,#1F4E79_100%)] p-6 sm:p-8 rounded-[2rem] shadow-xl text-white flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mt-12 overflow-hidden">
                 <div className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center text-3xl shrink-0 border border-white/20">
                    💡
                 </div>
                 <div className="text-center sm:text-left">
                    <h4 className="font-black text-white uppercase tracking-widest mb-2 flex flex-wrap justify-center sm:justify-start items-center gap-2">
                        Preuve certifiée <span className="text-qorange">SHA-256</span>
                    </h4>
                    <p className="text-[11px] sm:text-sm text-white/70 leading-relaxed font-medium">
                        Vos factures QAPRIL sont inviolables. L'empreinte sécurisée augmente votre Indice de Confiance Locatif.
                    </p>
                 </div>
            </motion.div>
        </motion.div>
    )
}
