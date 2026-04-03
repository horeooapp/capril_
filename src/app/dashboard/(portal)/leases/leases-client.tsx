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
                    <h1 className="text-4xl md:text-6xl font-black text-qnavy-dark tracking-tighter leading-none mb-4 uppercase">
                        Contrats.
                    </h1>
                    <p className="text-qtext-light font-medium tracking-wide flex items-center gap-2">
                        <ClipboardList size={14} className="text-qorange" />
                        Registre centralisé des baux digitaux et conformité locative <span className="text-qnavy font-black">QAPRIL Secure</span>.
                    </p>
                </div>
                <Link 
                    href="/dashboard/leases/new" 
                    className="px-8 py-4 bg-[linear-gradient(135deg,var(--color-qnavy-dark)_0%,var(--color-qnavy)_100%)] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:opacity-90 transition-all shadow-[0_12px_40px_rgba(13,43,110,0.2)] flex items-center gap-3 active:scale-95 group"
                >
                    <Plus size={16} />
                    <span>Créer un bail digital</span>
                </Link>
            </div>

            {leases.length === 0 ? (
                <motion.div variants={item} className="bg-white rounded-[3rem] p-24 text-center border border-qgrey-2 shadow-[0_24px_80px_rgba(13,43,110,0.05)] flex flex-col items-center">
                    <div className="w-24 h-24 bg-qnavy-pale rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border border-white rotate-3">
                        <FileText size={48} className="text-qnavy" />
                    </div>
                    <h3 className="text-2xl font-black text-qnavy-dark uppercase tracking-tighter mb-4 italic">Aucun contrat actif</h3>
                    <p className="text-qtext-light max-w-sm font-medium mb-10 leading-relaxed">
                        Établissez votre premier bail numérique pour sécuriser vos revenus et automatiser vos quittances. <br />
                        <span className="text-[10px] uppercase font-black tracking-widest text-qorange mt-4 block">Génération IA de contrats disponible</span>
                    </p>
                    <Link href="/dashboard/leases/new" className="px-10 py-5 bg-qnavy-dark text-white font-black rounded-2xl shadow-xl hover:bg-qnavy transition-all uppercase tracking-widest text-[10px]">
                        Initier un contrat
                    </Link>
                </motion.div>
            ) : (
                <div className="space-y-6">
                    {/* Simplified Header for Table Simulation */}
                    <div className="hidden lg:grid grid-cols-12 gap-6 px-10 py-4">
                        <div className="col-span-4 text-[10px] font-black text-qtext-light uppercase tracking-widest leading-none">Contrat / Patrimoine</div>
                        <div className="col-span-4 text-[10px] font-black text-qtext-light uppercase tracking-widest leading-none">Parties Prenantes</div>
                        <div className="col-span-3 text-[10px] font-black text-qtext-light uppercase tracking-widest leading-none">Flux Financiers</div>
                        <div className="col-span-1"></div>
                    </div>

                    <div className="space-y-4">
                        {leases.map((lease) => (
                            <motion.div 
                                key={lease.id} 
                                variants={item}
                                className="bg-white rounded-[2rem] p-8 lg:grid lg:grid-cols-12 lg:items-center gap-6 border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.06)] hover:border-qnavy/20 hover:scale-[1.01] transition-all group overflow-hidden"
                            >
                                <div className="col-span-4 space-y-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-black text-qnavy uppercase tracking-[0.1em] italic">
                                                {lease.leaseReference || 'REF-PENDING'}
                                            </span>
                                            {lease.status === 'ACTIVE' && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-qgreen animate-pulse"></div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-qgrey-1 rounded-[14px] flex items-center justify-center text-qnavy shadow-inner border border-white group-hover:bg-qnavy group-hover:text-white transition-all">
                                                <Building2 size={24} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-qnavy-dark leading-none mb-1 group-hover:text-qorange transition-colors">{lease.propertyName}</span>
                                                <span className="text-[10px] font-bold text-qtext-light uppercase tracking-widest">{lease.propertyCode} • {lease.propertyCommune}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-4 mt-6 lg:mt-0 space-y-4 lg:border-l lg:border-qgrey-2 lg:pl-6">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-qnavy-pale rounded-lg flex items-center justify-center text-qnavy border border-white shadow-sm">
                                                <User size={14} />
                                            </div>
                                                {lease.tenant?.fullName || lease.tenant?.phone || "En attente"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                                lease.status === 'ACTIVE' 
                                                ? 'bg-qgreen-pale text-qgreen border-qgreen/20' 
                                                : 'bg-qorange-pale text-qorange border-qorange/20'
                                            }`}>
                                                {lease.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                {lease.status === 'ACTIVE' ? 'Certifié Actif' : 'Validation...'}
                                            </span>
                                            {lease.statutFiscal && (
                                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                                    lease.statutFiscal === 'PAYE_CONFIRME' || lease.statutFiscal === 'ENREGISTRE'
                                                    ? 'bg-qnavy-pale text-qnavy border-qnavy/20' 
                                                    : 'bg-qgrey-1 text-qtext-light border-qgrey-2'
                                                }`}>
                                                    <ShieldCheck size={12} />
                                                    {lease.statutFiscal === 'PAYE_CONFIRME' || lease.statutFiscal === 'ENREGISTRE' ? 'DGI Confirmé' : 'DGI En attente'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-3 mt-6 lg:mt-0 lg:border-l lg:border-qgrey-2 lg:pl-6">
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-2xl font-black text-qnavy-dark tracking-tighter leading-none italic">
                                                {Number(lease.rentAmount || 0).toLocaleString('fr-FR')}
                                            </span>
                                            <span className="text-[11px] font-bold text-qtext-mid uppercase tracking-widest">FCFA</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-qorange" />
                                            <span className="text-[10px] font-black text-qtext-light uppercase tracking-wider">
                                                Effet: {new Date(lease.startDate).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1 mt-6 lg:mt-0 flex justify-end">
                                    <Link 
                                        href={`/dashboard/leases/${lease.id}`} 
                                        className="w-14 h-14 rounded-2xl bg-qnavy-pale border border-qnavy/10 flex items-center justify-center text-qnavy hover:bg-qnavy hover:text-white transition-all shadow-sm active:scale-95 group/btn"
                                    >
                                        <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
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
