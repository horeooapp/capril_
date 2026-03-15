"use client"

import { motion } from "framer-motion"
import Link from "next/link"

interface Lease {
    id: string;
    leaseReference: string | null;
    status: string;
    rentAmount: bigint | number;
    startDate: Date | string;
    tenant: { fullName: string | null; phone: string | null } | null;
    propertyName: string;
    propertyCode: string;
    propertyCommune: string;
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

export default function LeasesClient({ leases }: { leases: Lease[] }) {
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
                        Contrats.
                    </h1>
                    <p className="text-gray-500 font-medium tracking-wide">
                        Registre centralisé des baux digitaux et conformité locative.
                    </p>
                </div>
                <Link 
                    href="/dashboard/leases/new" 
                    className="px-8 py-4 bg-orange-500 text-white rounded-[1.5rem] font-bold uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 flex items-center gap-3 active:scale-95 group"
                >
                    <span>Créer un bail digital</span>
                    <svg className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                </Link>
            </div>

            {leases.length === 0 ? (
                <motion.div variants={item} className="glass-panel rounded-[3rem] p-20 text-center flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-white">
                        <span className="text-4xl grayscale opacity-50">📄</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">Aucun contrat actif</h3>
                    <p className="text-gray-500 max-w-sm font-medium mb-10 leading-relaxed">
                        Établissez votre premier bail numérique pour sécuriser vos revenus et automatiser vos quittances.
                    </p>
                    <Link href="/dashboard/leases/new" className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-gray-200 hover:bg-orange-500 transition-all uppercase tracking-widest text-xs">
                        Initier un contrat
                    </Link>
                </motion.div>
            ) : (
                <motion.div variants={item} className="glass-panel rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Référence / Patrimoine</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Parties Prenantes</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Engagements</th>
                                    <th className="px-10 py-6 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {leases.map((lease) => (
                                    <tr key={lease.id} className="hover:bg-white transition-all group">
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-orange-600 mb-2 uppercase tracking-tighter">{lease.leaseReference || 'REF-PENDING'}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-sm shadow-inner border border-white">🏢</div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-gray-900 leading-none mb-1">{lease.propertyName}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{lease.propertyCode} • {lease.propertyCommune}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-xs border border-white shadow-sm">👤</div>
                                                    <span className="text-sm font-extrabold text-gray-800">
                                                        {lease.tenant?.fullName || lease.tenant?.phone || "En attente"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${
                                                        lease.status === 'ACTIVE' 
                                                        ? 'bg-green-50 text-green-700 ring-green-600/20' 
                                                        : 'bg-orange-50 text-orange-700 ring-orange-600/20'
                                                    }`}>
                                                        {lease.status === 'ACTIVE' ? 'Actif' : 'En Validation'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <div className="flex items-baseline gap-1 mb-2">
                                                    <span className="text-lg font-black text-gray-900 tracking-tighter">{Number(lease.rentAmount || 0).toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-gray-400">FCFA</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                                                        DEPUIS LE {new Date(lease.startDate).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <Link 
                                                href={`/dashboard/leases/${lease.id}`} 
                                                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all shadow-inner border border-white"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
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
