import { User, Settings, ShieldCheck, CreditCard, Bell, LogOut, Star } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function OwnerProfilePage() {
    const session = await auth()
    if (!session?.user) return null

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { fullName: true, email: true, phone: true, kycLevel: true, role: true }
    })

    return (
        <div className="space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header / Hero */}
            <div className="glass-panel p-8 md:p-12 rounded-[3rem] border border-white/40 shadow-xl bg-white/50 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1F4E79]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 bg-[#1F4E79]/5 backdrop-blur-xl rounded-full flex items-center justify-center text-4xl border border-[#1F4E79]/10 shadow-inner">
                        <User size={48} className="text-[#1F4E79]" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2 text-[#1F4E79]">
                            {user?.fullName || "Propriétaire QAPRIL"}
                        </h1>
                        <p className="text-gray-500 font-medium tracking-tight uppercase text-xs">{user?.email}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                            <span className="px-4 py-1.5 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 shadow-sm">
                                Niveau KYC : {user?.kycLevel || 1}
                            </span>
                            <span className="px-4 py-1.5 bg-[#C55A11] rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-orange-900/20">
                                {user?.role || "LANDLORD"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Information Personnelle */}
                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/40 shadow-lg bg-white">
                    <h3 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter mb-6 flex items-center gap-3">
                        <Settings size={22} className="text-gray-400" />
                        Paramètres du Compte
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Téléphone</span>
                            <span className="text-sm font-black text-[#1F4E79]">{user?.phone || "Non renseigné"}</span>
                        </div>
                        <div className="flex justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Langue</span>
                            <span className="text-sm font-black text-[#1F4E79]">Français (CI)</span>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg hover:bg-black transition-all">
                        Modifier mes informations
                    </button>
                </div>

                {/* Score & Trust Portfolio */}
                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/40 shadow-lg bg-gradient-to-br from-indigo-50/50 to-white">
                    <h3 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter mb-6 flex items-center gap-3">
                        <Star size={22} className="text-indigo-500" />
                        Indice de Confiance
                    </h3>
                    <div className="p-6 bg-white rounded-[2rem] border border-indigo-100 shadow-inner flex items-center justify-between mb-6">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score Propriétaire</p>
                            <p className="text-3xl font-black text-indigo-600">890 <span className="text-sm">/ 1000</span></p>
                        </div>
                        <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[12px] uppercase tracking-widest border border-indigo-100">
                            Excellent
                        </div>
                    </div>
                    <p className="text-[13px] text-gray-500 font-medium mb-6 leading-relaxed">
                        Votre score est calculé à partir de la conformité de vos baux et de la promptitude de vos quittances.
                    </p>
                    <Link href="/dashboard/trust" className="block text-center py-4 border-2 border-dashed border-indigo-100 rounded-2xl text-[11px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                        Détails du score
                    </Link>
                </div>

                {/* Securité & Notifications */}
                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/40 shadow-lg bg-white">
                    <h3 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter mb-6 flex items-center gap-3">
                        <ShieldCheck size={22} className="text-emerald-500" />
                        Sécurité & Alertes
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                            <span className="text-sm font-bold text-gray-700">Notifications SMS</span>
                            <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                                <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                            <span className="text-sm font-bold text-gray-700">Alertes WhatsApp</span>
                            <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                                <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wallet / Abonnement */}
                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/40 shadow-lg bg-white">
                    <h3 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter mb-6 flex items-center gap-3">
                        <CreditCard size={22} className="text-[#C55A11]" />
                        Services & Abonnement
                    </h3>
                    <div className="p-6 bg-[#C55A11]/5 rounded-[2rem] border border-[#C55A11]/10 mb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Actuel</p>
                                <p className="text-xl font-black text-[#C55A11]">PREMIUM AGREE</p>
                            </div>
                            <span className="px-3 py-1 bg-white rounded-lg text-[9px] font-black text-[#C55A11] border border-[#C55A11]/20 shadow-sm">ACTIVE</span>
                        </div>
                    </div>
                    <button className="w-full py-4 bg-white border border-gray-100 text-[#1F4E79] rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-sm hover:bg-gray-50 transition-all">
                        Gérer mon abonnement
                    </button>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="text-center px-8">
                <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">
                    Membre Certifié QAPRIL • Depuis {new Date().getFullYear()}
                </p>
                <div className="h-1 w-20 bg-gray-100 mx-auto rounded-full"></div>
            </div>
        </div>
    )
}
