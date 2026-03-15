"use client"

import { motion } from "framer-motion"
import Link from "next/link"

interface Receipt {
    id: string;
    receiptRef: string;
    createdAt: Date | string;
    amountFcfa: number | string;
    periodStart: Date | string;
    lease: {
        leaseRef?: string;
        property?: {
            addressLine1?: string;
        };
    };
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function ReceiptsClient({ receipts }: { receipts: Receipt[] }) {
    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-12"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-4 uppercase">
                        Quittances.
                    </h1>
                    <p className="text-gray-500 font-medium tracking-wide">
                        Archives certifiées et historique infalsifiable de vos revenus locatifs.
                    </p>
                </div>
            </div>

            {receipts.length === 0 ? (
                <motion.div variants={item} className="glass-panel rounded-[3rem] p-20 text-center flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-white">
                        <span className="text-4xl grayscale opacity-50">🧾</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">Historique vierge</h3>
                    <p className="text-gray-500 max-w-sm font-medium mb-10 leading-relaxed">
                        Les quittances certifiées seront générées automatiquement lors de la validation des paiements de vos locataires.
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={item} className="glass-panel rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction / Datation</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Affectation Patrimoniale</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Flux Financiers</th>
                                    <th className="px-10 py-6 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {receipts.map((receipt) => receipt && (
                                    <tr key={receipt.id} className="hover:bg-white transition-all group">
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-orange-600 mb-2 uppercase tracking-tighter">{receipt.receiptRef}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        ÉMISE LE {new Date(receipt.createdAt).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 mb-1">{receipt.lease?.leaseRef || 'BAIL-CERTIFIÉ'}</span>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] line-clamp-1">
                                                    📍 {receipt.lease?.property?.addressLine1 || 'Localisation certifiée'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <div className="flex items-baseline gap-1 mb-2">
                                                    <span className="text-lg font-black text-gray-900 tracking-tighter">{parseInt(String(receipt.amountFcfa)).toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-gray-400">FCFA</span>
                                                </div>
                                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 w-fit">
                                                    {new Date(receipt.periodStart).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <Link 
                                                href={`/receipts/${receipt.id}`} 
                                                target="_blank"
                                                className="inline-flex items-center gap-3 px-6 py-2.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-orange-600 transition-all shadow-lg active:scale-95 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                            >
                                                <span>Imprimer</span>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}
