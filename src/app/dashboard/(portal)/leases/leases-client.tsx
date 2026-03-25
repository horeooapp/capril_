"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
    ClipboardList, 
    Plus, 
    Building2, 
    User, 
    Calendar, 
    ArrowRight,
    Search,
    Filter,
    FileText,
    CheckCircle2,
    Clock,
    ShieldCheck
} from "lucide-react"

interface Lease {
    id: string;
    leaseReference: string | null;
    status: string;
    statutFiscal?: string;
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
      staggerChildren: 0.05
    }
  }
}

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
}

export default function LeasesClient({ leases }: { leases: Lease[] }) {
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
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-4 uppercase">
                        Contrats.
                    </h1>
                    <p className="text-gray-500 font-medium tracking-wide flex items-center gap-2">
                        <ClipboardList size={14} className="text-primary" />
                        Registre centralisé des baux digitaux et conformité locative <span className="text-gray-900 font-bold">QAPRIL Secure</span>.
                    </p>
                </div>
                <Link 
                    href="/dashboard/leases/new" 
                    className="px-8 py-4 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-2xl flex items-center gap-3 active:scale-95 group"
                >
                    <Plus size={16} />
                    <span>Créer un bail digital</span>
                </Link>
            </div>

            {leases.length === 0 ? (
                <motion.div variants={item} className="glass-panel rounded-[3rem] p-24 text-center border border-white/40 shadow-2xl flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border border-white rotate-3">
                        <FileText size={48} className="text-blue-300" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4 italic">Aucun contrat actif</h3>
                    <p className="text-gray-500 max-w-sm font-medium mb-10 leading-relaxed">
                        Établissez votre premier bail numérique pour sécuriser vos revenus et automatiser vos quittances. <br />
                        <span className="text-[10px] uppercase font-black tracking-widest text-primary mt-4 block">Génération IA de contrats disponible</span>
                    </p>
                    <Link href="/dashboard/leases/new" className="px-10 py-5 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-primary transition-all uppercase tracking-widest text-[10px]">
                        Initier un contrat
                    </Link>
                </motion.div>
            ) : (
                <div className="space-y-6">
                    {/* Simplified Header for Table Simulation */}
                    <div className="hidden lg:grid grid-cols-12 gap-6 px-10 py-4">
                        <div className="col-span-4 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none italic">Contrat / Patrimoine</div>
                        <div className="col-span-4 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none italic">Parties Prenantes</div>
                        <div className="col-span-3 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none italic">Flux Financiers</div>
                        <div className="col-span-1"></div>
                    </div>

                    <div className="space-y-4">
                        {leases.map((lease) => (
                            <motion.div 
                                key={lease.id} 
                                variants={item}
                                className="glass-card-premium rounded-[2.2rem] p-8 lg:grid lg:grid-cols-12 lg:items-center gap-6 border border-white/40 shadow-xl hover:scale-[1.01] transition-all group"
                            >
                                <div className="col-span-4 space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-primary mb-2 uppercase tracking-tight italic">
                                            {lease.leaseReference || 'REF-PENDING'}
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-lg group-hover:bg-gray-900 group-hover:text-white transition-all">
                                                <Building2 size={24} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 leading-none mb-1 group-hover:text-primary transition-colors">{lease.propertyName}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{lease.propertyCode} • {lease.propertyCommune}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-4 mt-6 lg:mt-0 space-y-4 lg:border-l lg:border-gray-100 lg:pl-6">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 border border-white shadow-sm">
                                                <User size={14} />
                                            </div>
                                            <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight">
                                                {lease.tenant?.fullName || lease.tenant?.phone || "En attente"}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${
                                                lease.status === 'ACTIVE' 
                                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                                                : 'bg-orange-50 text-orange-700 ring-orange-600/20'
                                            }`}>
                                                {lease.status === 'ACTIVE' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                                {lease.status === 'ACTIVE' ? 'Certifié Actif' : 'Validation...'}
                                            </span>
                                            {lease.statutFiscal && (
                                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${
                                                    lease.statutFiscal === 'PAYE_CONFIRME' || lease.statutFiscal === 'ENREGISTRE'
                                                    ? 'bg-blue-50 text-blue-700 ring-blue-600/20' 
                                                    : 'bg-slate-50 text-slate-500 ring-slate-400/20'
                                                }`}>
                                                    <ShieldCheck size={10} />
                                                    {lease.statutFiscal === 'PAYE_CONFIRME' || lease.statutFiscal === 'ENREGISTRE' ? 'DGI : Confirmé' : 'DGI : En attente'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-3 mt-6 lg:mt-0 lg:border-l lg:border-gray-100 lg:pl-6">
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-2xl font-black text-gray-900 tracking-tighter leading-none italic">
                                                {Number(lease.rentAmount || 0).toLocaleString('fr-FR')}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">FCFA</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-primary opacity-60" />
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                                                Depuis le {new Date(lease.startDate).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1 mt-6 lg:mt-0 flex justify-end">
                                    <Link 
                                        href={`/dashboard/leases/${lease.id}`} 
                                        className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-xl hover:shadow-gray-200"
                                    >
                                        <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
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
