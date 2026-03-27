import { ShieldAlert, Scale, MessageSquare, Clock, ArrowRight, Gavel } from "lucide-react"
import Link from "next/link"

export default function TenantRightsPage() {
    return (
        <div className="space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-[#1F4E79] tracking-tight uppercase">Mes Droits & Médiation</h1>
                    <p className="text-gray-500 font-medium">Cadre légal QAPRIL : Protection, Conciliation et Accompagnement.</p>
                </div>
            </div>

            {/* Main Rights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* RCL - Révision de Loyer */}
                <div className="glass-panel p-8 rounded-[3rem] border border-white/40 shadow-xl bg-gradient-to-br from-[#1F4E79]/5 to-white group hover:shadow-2xl transition-all">
                    <div className="w-16 h-16 bg-[#1F4E79] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-6 transition-transform">
                        <Scale size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter mb-4">Révision de Loyer (RCL)</h3>
                    <p className="text-gray-500 font-medium leading-relaxed mb-6">
                        Toute révision de loyer sur QAPRIL doit être justifiée et acceptée. Le protocole RCL (ADD-16) garantit un dialogue équitable entre vous et votre bailleur.
                    </p>
                    <Link href="/locataire/rights/rcl" className="inline-flex items-center gap-2 text-[12px] font-black text-[#1F4E79] uppercase tracking-widest hover:underline">
                        Consulter mon statut RCL <ArrowRight size={16} />
                    </Link>
                </div>

                {/* MRL - Médiation de Recouvrement */}
                <div className="glass-panel p-8 rounded-[3rem] border border-white/40 shadow-xl bg-gradient-to-br from-[#C55A11]/5 to-white group hover:shadow-2xl transition-all">
                    <div className="w-16 h-16 bg-[#C55A11] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:-rotate-6 transition-transform">
                        <MessageSquare size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter mb-4">Médiation (MRL)</h3>
                    <p className="text-gray-500 font-medium leading-relaxed mb-6">
                        En cas de difficulté de paiement, le protocole MRL (M-BRL-01) privilégie la conciliation à l'expulsion. Déclarez une fragilité pour bénéficier d'un plan d'apurement.
                    </p>
                    <Link href="/locataire/rights/mediation" className="inline-flex items-center gap-2 text-[12px] font-black text-[#C55A11] uppercase tracking-widest hover:underline">
                        Ouvrir une médiation <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Préavis Légal */}
                <Link href="/locataire/preavis" className="md:col-span-2 glass-panel p-8 rounded-[3rem] border border-white/40 shadow-xl bg-white flex flex-col md:flex-row items-center justify-between group hover:bg-gray-50 transition-all">
                    <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center shrink-0">
                            <Clock size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter">Déclareser mon Préavis</h3>
                            <p className="text-gray-500 font-medium">Gérez votre départ officiellement et sécurisez votre caution.</p>
                        </div>
                    </div>
                    <ArrowRight size={32} className="text-gray-300 group-hover:translate-x-2 transition-transform" />
                </Link>
            </div>

            {/* Legal Alert */}
            <div className="glass-panel p-8 rounded-[2.5rem] border border-red-100 bg-red-50/20 flex flex-col md:flex-row items-center gap-8">
                 <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl shrink-0">
                    <Gavel className="text-red-600" />
                 </div>
                 <div>
                    <h4 className="font-black text-red-600 uppercase tracking-tighter mb-1">Protection Juridique</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        QAPRIL n'est pas un tribunal, mais un tiers de confiance. Tous les échanges réalisés dans ces modules sont datés, certifiés et archivés pour servir de preuve en cas de contentieux devant les autorités compétentes.
                    </p>
                 </div>
            </div>
        </div>
    )
}
