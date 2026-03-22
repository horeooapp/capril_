import { getReceiptsForTenant } from "@/actions/receipts"
import { NotificationSettings } from "@/components/notifications/NotificationSettings"

export const dynamic = "force-dynamic"
import { 
    FileText, 
    Download, 
    MapPin, 
    User, 
    CheckCircle2, 
    Clock,
    ArrowUpRight,
    SearchX
} from "lucide-react"
import Link from "next/link"

interface TenantReceipt {
    id: string;
    periodMonth: string;
    totalAmount: number | string;
    receiptRef: string;
    lease: {
        property: {
            address: string;
            owner: {
                fullName: string | null;
                email: string | null;
            };
        };
    };
}

export default async function LocataireDashboard() {
    const receipts = await getReceiptsForTenant() as unknown as TenantReceipt[]

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#1F4E79] tracking-tighter uppercase mb-4">
                        Mes Quittances.
                    </h1>
                    <p className="text-[16px] text-gray-500 font-medium tracking-wide">
                        Historique consolidé de vos paiements <span className="text-[#1F4E79] font-bold">QAPRIL Secure</span>.
                    </p>
                </div>
                {receipts.length > 0 && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-[#375623]/10 rounded-2xl border border-[#375623]/20">
                        <CheckCircle2 size={18} className="text-[#375623]" />
                        <span className="text-[14px] font-black uppercase tracking-widest text-[#375623]">Comptabilité à jour</span>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-6">
                {receipts.length === 0 ? (
                    <div className="glass-panel rounded-[3rem] py-32 px-10 text-center border border-white/40 shadow-xl flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-[2rem] flex items-center justify-center mb-8 border border-gray-100 rotate-3 group-hover:rotate-0 transition-transform">
                            <SearchX size={40} />
                        </div>
                        <h3 className="text-3xl font-black text-[#1F4E79] uppercase tracking-tighter mb-4">Aucun document archivé</h3>
                        <p className="text-[16px] text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
                            Il semble que votre bailleur n'ait pas encore émis de quittance électronique. <br />
                            <span className="text-[14px] font-black uppercase tracking-widest text-[#C55A11] mt-4 block">Vérification en cours...</span>
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {receipts.map((receipt, index) => (
                            <div 
                                key={receipt.id} 
                                className="glass-card-premium p-8 rounded-[2.5rem] border border-white/40 shadow-xl hover:scale-[1.01] transition-all group relative overflow-hidden"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[50px] -mr-20 -mt-20 group-hover:opacity-100 opacity-50 transition-opacity"></div>
                                
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-3 transition-transform">
                                                <FileText size={28} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="text-xl font-black text-[#1F4E79] uppercase tracking-tight">
                                                        {receipt.periodMonth}
                                                    </h4>
                                                    <span className="px-3 py-1 bg-[#375623]/10 text-[#375623] text-[12px] font-black uppercase tracking-widest rounded-lg border border-[#375623]/20">
                                                        Certifié Payé
                                                    </span>
                                                </div>
                                                <p className="text-[14px] font-black text-gray-400 uppercase tracking-[0.2em]">Réf: {receipt.receiptRef}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                                    <MapPin size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Localisation</span>
                                                    <span className="text-[14px] font-bold text-gray-700">{receipt.lease.property.address}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                                    <User size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Bailleur</span>
                                                    <span className="text-[14px] font-bold text-gray-700">{receipt.lease.property.owner.fullName || receipt.lease.property.owner.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row lg:flex-col items-center gap-6 lg:items-end w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                                        <div className="text-center lg:text-right w-full lg:w-auto">
                                            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2">Montant Acquitté</p>
                                            <p className="text-4xl font-black text-[#1F4E79] tracking-tighter">
                                                {Number(receipt.totalAmount).toLocaleString('fr-FR')} <span className="text-xl">FCFA</span>
                                            </p>
                                        </div>
                                        
                                        <Link 
                                            href={`/receipts/${receipt.id}`}
                                            target="_blank"
                                            className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-[#1F4E79] text-white rounded-2xl font-black uppercase tracking-widest text-[14px] hover:bg-[#163a5a] transition-all shadow-2xl active:scale-95 group/btn"
                                        >
                                            <Download size={18} className="group-hover/btn:translate-y-0.5 transition-transform" />
                                            <span>Télécharger PDF</span>
                                            <ArrowUpRight size={16} className="opacity-40 group-hover/btn:opacity-100 transition-opacity" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Préférences de Notification */}
            <NotificationSettings />

            {/* Bottom Insight */}
            <div className="glass-panel p-8 rounded-[2.5rem] border border-white/40 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-400"></div>
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner border border-blue-100">
                        <Clock size={32} />
                    </div>
                    <div>
                        <h5 className="font-black text-[#1F4E79] uppercase tracking-tight text-lg">Mise à jour Automatique</h5>
                        <p className="text-[14px] font-medium text-gray-500">Votre archivage est synchronisé en temps réel avec le grand livre du bailleur.</p>
                    </div>
                </div>
                <Link href="/locataire/leases" className="px-8 py-4 bg-white border border-gray-100 rounded-2xl text-[14px] font-black uppercase tracking-widest text-[#1F4E79] hover:bg-gray-50 transition-colors shadow-sm">
                    Gérer mes contrats
                </Link>
            </div>
        </div>
    )
}
