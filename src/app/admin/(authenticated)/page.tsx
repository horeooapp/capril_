import { 
    Banknote, 
    ShieldCheck, 
    Scale, 
    UserCheck, 
    FileText, 
    Database, 
    ArrowUpRight,
    Users,
    AlertTriangle
} from "lucide-react"
import Link from "next/link"
import DemoToggle from "@/components/admin/DemoToggle"
import StatCard from "@/components/admin/StatCard"

export const dynamic = "force-dynamic"

export default async function AdminDashboardOverview() {
    // Phase 1: Restore UI structure with STATIC data to confirm rendering 
    // doesn't crash without Prisma involvement.
    const isDemoMode = true; // Temporary static
    const data = {
        fiscalStats: { _sum: { totalDgi: 25450000 } },
        cdcStats: { _sum: { amount: 15800000 } },
        activeMediations: 12,
        kycAutoRate: 94,
        totalUsers: 482,
        totalProperties: 125,
        totalLeases: 114,
        totalMandates: 42,
        activeColocs: 18,
        landLeases: 7,
    }

    try {
        return (
            <div className="space-y-12 pb-16 relative">
                <div className="fixed inset-0 bg-mesh -z-10 opacity-60"></div>
                
                {/* Core Global Stats Grid - Testing StatCard without Icons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard 
                        title="Volume Fiscal (M17)" 
                        value={`${Number(data.fiscalStats?._sum?.totalDgi || 0).toLocaleString()} FCFA`} 
                        icon={Banknote} 
                        color="orange"
                        trend="SIM_DGI"
                        delay={0.1}
                    />
                    <StatCard 
                        title="Consignation CDC (M18)" 
                        value={`${Number(data.cdcStats?._sum?.amount || 0).toLocaleString()} FCFA`} 
                        icon={ShieldCheck} 
                        color="blue"
                        trend="Sécurisé"
                        delay={0.2}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="glass-panel p-20 text-center rounded-[2.5rem] border border-dashed border-gray-200">
                           <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em]">Flux de Données en cours de Diagnostic</p>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <section className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600 blur-[130px] opacity-20 -mr-40 -mt-40 group-hover:opacity-40 transition-opacity"></div>
                            <h4 className="label-tech text-primary mb-6 text-xs font-black uppercase tracking-widest">Moteur Fiscal Consolidated</h4>
                            <p className="text-2xl font-black mb-10 leading-tight">Consolider tous les flux <br /><span className="text-orange-400">DGI Côte d&apos;Ivoire</span>.</p>
                            <Link href="/admin/fiscal" className="flex items-center justify-between w-full p-6 bg-white/10 hover:bg-primary transition-all rounded-2xl border border-white/10 hover:border-transparent group/btn">
                                <span className="font-black uppercase tracking-widest text-[10px]">Lancer le rapport</span>
                                <ArrowUpRight size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </Link>
                        </section>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="glass-card-premium p-8 rounded-[2rem]">
                                <p className="label-tech mb-2 text-xs font-black uppercase tracking-widest">Utilisateurs Totaux</p>
                                <div className="flex items-end justify-between">
                                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{data.totalUsers || 0}</p>
                                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100">
                                        <Users size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error: any) {
        return (
            <div className="p-12 bg-red-50/50 border-2 border-red-100 rounded-[3rem] flex flex-col items-center text-center backdrop-blur-xl">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-red-200/50 rotate-3">
                    <AlertTriangle size={36} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">Interruption Supervision.</h2>
                <code className="text-[10px] text-red-700 bg-white p-6 rounded-2xl border border-red-200 max-w-full overflow-auto">
                    {String(error)}
                </code>
            </div>
        )
    }
}
