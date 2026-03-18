"use client"

import { motion } from "framer-motion"
import MandateActions from "@/components/dashboard/MandateActions"
import { MandateStatus, MandateType } from "@prisma/client"

interface Mandate {
    id: string;
    status: MandateStatus;
    mandateType: MandateType;
    startDate: Date | string;
    endDate: Date | string | null;
    property: {
        name: string | null;
        address: string;
        city: string;
        commune: string;
    };
    agent: {
        fullName: string | null;
        email: string | null;
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

export default function MandatesClient({ mandates }: { mandates: Mandate[] }) {
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
                        Mandats.
                    </h1>
                    <p className="text-gray-500 font-medium tracking-wide">
                        Arbitrage et validation des délégations de gestion immobilière.
                    </p>
                </div>
            </div>

            {mandates.length === 0 ? (
                <motion.div variants={item} className="glass-panel rounded-[3rem] p-20 text-center flex flex-col items-center">
                    <div className="w-24 h-24 bg-purple-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-white">
                        <span className="text-4xl grayscale opacity-50">🤝</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">Aucune proposition</h3>
                    <p className="text-gray-500 max-w-sm font-medium mb-10 leading-relaxed">
                        Les agences partenaires pourront vous soumettre des mandats de gestion numérique via ce portail.
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={item} className="glass-panel rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actif Immobilier</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Opérateur Certifié</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nature & Durée</th>
                                    <th className="px-10 py-6 text-right">Arbitrage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {mandates.map((mandate) => (
                                    <tr key={mandate.id} className="hover:bg-white transition-all group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-white group-hover:bg-orange-50 transition-colors">🏢</div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-900 leading-none mb-1">{mandate.property.name || mandate.property.address}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mandate.property.city} • {mandate.property.commune}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-extrabold text-gray-800">{mandate.agent.fullName}</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{mandate.agent.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${
                                                        mandate.mandateType === 'EXCLUSIVE' 
                                                            ? 'bg-purple-50 text-purple-700 ring-purple-600/20' 
                                                            : 'bg-blue-50 text-blue-700 ring-blue-600/20'
                                                    }`}>
                                                        {mandate.mandateType === 'EXCLUSIVE' ? 'Mandat Exclusif' : 'Mandat Simple'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    <span>DÉBUT: {new Date(mandate.startDate).toLocaleDateString('fr-FR')}</span>
                                                    {mandate.endDate && <span className="opacity-60 text-[9px]">FIN: {new Date(mandate.endDate).toLocaleDateString('fr-FR')}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <MandateActions mandateId={mandate.id} currentStatus={mandate.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            <motion.div variants={item} className="bg-gray-900 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 blur-[120px] opacity-10 -mr-40 -mt-40 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-2xl shadow-blue-900/40 text-2xl">
                        💡
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Protocole de gestion QAPRIL</h3>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium">
                            La validation d&apos;un mandat délègue officiellement la gestion de votre bien à l&apos;agence sélectionnée. 
                            Le système certifie l&apos;identité et les garanties de l&apos;opérateur avant toute soumission.
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
