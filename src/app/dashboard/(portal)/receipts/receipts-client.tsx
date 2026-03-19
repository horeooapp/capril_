"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
    Receipt, 
    FileText, 
    Calendar, 
    Printer, 
    MapPin, 
    CheckCircle2, 
    SearchX,
    ChevronRight,
    Search,
    Filter
} from "lucide-react"

interface ReceiptItem {
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
      staggerChildren: 0.05
    }
  }
}

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
}

export default function ReceiptsClient({ receipts }: { receipts: ReceiptItem[] }) {
    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-12"
        >
            {/* Header section with refined glass branding */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#1F4E79] tracking-tighter leading-none mb-4 uppercase">
                        Quittances.
                    </h1>
                    <p className="text-[16px] text-gray-500 font-medium tracking-wide flex items-center gap-2">
                        <Receipt size={16} className="text-[#C55A11]" />
                        Archives certifiées et historique infalsifiable de vos revenus <span className="text-[#1F4E79] font-bold">QAPRIL Secure</span>.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-primary transition-colors shadow-sm active:scale-95">
                        <Search size={20} />
                    </button>
                    <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-primary transition-colors shadow-sm active:scale-95">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {receipts.length === 0 ? (
                <motion.div variants={item} className="glass-panel rounded-[3rem] p-24 text-center border border-white/40 shadow-2xl flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border border-white rotate-3">
                        <SearchX size={48} className="text-gray-300" />
                    </div>
                    <h3 className="text-3xl font-black text-[#1F4E79] uppercase tracking-tighter mb-4 italic">Historique vierge</h3>
                    <p className="text-[16px] text-gray-500 max-w-sm font-medium mb-10 leading-relaxed">
                        Les quittances certifiées seront générées automatiquement lors de la validation des paiements de vos locataires. <br />
                        <span className="text-[14px] font-black uppercase tracking-widest text-[#C55A11] mt-4 block">Protocole d'archivage actif</span>
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-6">
                    {/* Simplified Header for Table Simulation */}
                    <div className="hidden lg:grid grid-cols-12 gap-6 px-10 py-4">
                        <div className="col-span-4 text-[12px] font-black text-gray-400 uppercase tracking-widest leading-none italic">Transaction / Datation</div>
                        <div className="col-span-4 text-[12px] font-black text-gray-400 uppercase tracking-widest leading-none italic">Affectation Patrimoniale</div>
                        <div className="col-span-3 text-[12px] font-black text-gray-400 uppercase tracking-widest leading-none italic">Flux Financiers</div>
                        <div className="col-span-1"></div>
                    </div>

                    <div className="space-y-4">
                        {receipts.map((receipt) => receipt && (
                            <motion.div 
                                key={receipt.id} 
                                variants={item}
                                className="glass-card-premium rounded-[2.2rem] p-8 lg:grid lg:grid-cols-12 lg:items-center gap-6 border border-white/40 shadow-xl hover:scale-[1.01] transition-all group"
                            >
                                <div className="col-span-4 space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-[16px] font-black text-[#1F4E79] mb-2 uppercase tracking-tight italic">
                                            {receipt.receiptRef}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                            <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                Certifiée le {new Date(receipt.createdAt).toLocaleDateString('fr-FR')}
                                                <CheckCircle2 size={12} className="text-emerald-500" />
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-4 mt-6 lg:mt-0 space-y-4 lg:border-l lg:border-gray-100 lg:pl-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} className="text-gray-300" />
                                            <span className="text-[14px] font-bold text-gray-800 uppercase tracking-tight italic">
                                                {receipt.lease?.leaseRef || 'BAIL-CERTIFIÉ'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} className="text-[#C55A11] opacity-60" />
                                            <p className="text-[14px] font-black text-gray-400 uppercase tracking-widest line-clamp-1">
                                                {receipt.lease?.property?.addressLine1 || 'Localisation certifiée'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-3 mt-6 lg:mt-0 lg:border-l lg:border-gray-100 lg:pl-6">
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-2xl font-black text-[#1F4E79] tracking-tighter leading-none italic">
                                                {Number(receipt.amountFcfa).toLocaleString('fr-FR')}
                                            </span>
                                            <span className="text-[14px] font-bold text-gray-300 uppercase tracking-widest">FCFA</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-[#375623]/60" />
                                            <span className="text-[12px] font-black text-[#375623] uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                {new Date(receipt.periodStart).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1 mt-6 lg:mt-0 flex justify-end">
                                    <Link 
                                        href={`/receipts/${receipt.id}`} 
                                        target="_blank"
                                        className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-xl hover:shadow-gray-200 active:scale-95"
                                    >
                                        <Printer size={22} className="group-hover:rotate-6 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    )
}
