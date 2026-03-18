import { prisma } from "@/lib/prisma"
import { 
    Banknote, 
    ShieldCheck, 
    Scale, 
    UserCheck, 
    FileText, 
    Database, 
    ArrowUpRight,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Users
} from "lucide-react"
import Link from "next/link"
import { getDemoMode } from "@/actions/demo-actions"
import { getDemoData } from "@/lib/demo-data"
import DemoToggle from "@/components/admin/DemoToggle"
import StatCard from "@/components/admin/StatCard"

export default async function AdminDashboard() {
    const isDemoMode = await getDemoMode()
    
    try {
        let data: any;

        if (isDemoMode) {
            data = getDemoData()
        } else {
            const [totalUsers, totalProperties, totalLeases, totalMandates, activeColocs, landLeases] = await Promise.all([
                prisma.user.count().catch(() => 0),
                prisma.property.count().catch(() => 0),
                prisma.lease.count().catch(() => 0),
                (prisma as any).mandate ? (prisma as any).mandate.count({ where: { status: "ACTIVE" } }).catch(() => 0) : Promise.resolve(0),
                (prisma as any).colocataire ? (prisma as any).colocataire.count({ where: { status: "ACTIF" } }).catch(() => 0) : Promise.resolve(0),
                (prisma as any).landLeaseInfo ? (prisma as any).landLeaseInfo.count().catch(() => 0) : Promise.resolve(0)
            ])
            
            const fiscalStats = await prisma.fiscalDossier.aggregate({
                where: { statut: { in: ["PAYE_CONFIRME", "PAIEMENT_PARTIEL"] as any } },
                _sum: { totalDgi: true }
            }).catch(() => ({ _sum: { totalDgi: 0 } }))

            const cdcStats = await prisma.cDCDeposit.aggregate({
                where: { status: "CONSIGNED" as any },
                _sum: { amount: true }
            }).catch(() => ({ _sum: { amount: 0 } }))

            const activeMediations = await prisma.mediation.count({
                where: { status: "OPEN" as any }
            }).catch(() => 0)

            const kycAutoValidated = await prisma.identityDocument.count({
                where: { status: "verified" as any, verifiedByUserId: "SYSTEM_AI" }
            }).catch(() => 0)
            const totalKycDocs = await prisma.identityDocument.count({
                where: { status: "verified" as any }
            }).catch(() => 0)
            const kycAutoRate = totalKycDocs > 0 ? Math.round((kycAutoValidated / totalKycDocs) * 100) : 0

            const documentsUnderReview = await prisma.identityDocument.findMany({
                where: { status: "under_review" as any },
                select: {
                    id: true,
                    docType: true,
                    status: true,
                    createdAt: true,
                    user: {
                        select: {
                            fullName: true
                        }
                    }
                },
                take: 3,
                orderBy: { createdAt: 'desc' }
            }).catch(() => [])

            const recentAuditLogs = await prisma.auditLog.findMany({
                select: {
                    id: true,
                    action: true,
                    module: true,
                    createdAt: true,
                    user: {
                        select: {
                            fullName: true,
                            role: true
                        }
                    }
                },
                take: 5,
                orderBy: { createdAt: 'desc' }
            }).catch(() => [])

            data = {
                totalUsers, totalProperties, totalLeases,
                totalMandates, activeColocs, landLeases,
                fiscalStats, cdcStats, activeMediations,
                kycAutoRate, documentsUnderReview, recentAuditLogs
            }
        }

        return (
            <div className="space-y-12 pb-16 relative">
                <div className="fixed inset-0 bg-mesh -z-10 opacity-60"></div>
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-4 uppercase animate-in fade-in slide-in-from-left-4 duration-700 ease-out">
                            Supervision.
                        </h1>
                        <p className="text-gray-500 font-medium tracking-wide">
                            Contrôle intégral des flux <span className="text-primary font-bold">QAPRIL National</span>.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <DemoToggle initialEnabled={isDemoMode} />
                        <div className="h-12 w-[1px] bg-gray-200 hidden md:block"></div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Niveau d&apos;accès</span>
                            <span className="text-sm font-bold text-gray-900">ADMINISTRATEUR CENTRAL</span>
                        </div>
                    </div>
                </div>

                {/* Core Global Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard 
                        title="Volume Fiscal (M17)" 
                        value={`${Number(data.fiscalStats?._sum?.totalDgi || 0).toLocaleString()} FCFA`} 
                        icon={Banknote} 
                        color="orange"
                        trend={isDemoMode ? "SIM_DGI" : "+12.4%"}
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
                    <StatCard 
                        title="Médiations Actives (M19)" 
                        value={(data.activeMediations || 0).toString()} 
                        icon={Scale} 
                        color="red"
                        trend="En cours"
                        delay={0.3}
                    />
                    <StatCard 
                        title="Auto-KYC IA (M21)" 
                        value={`${data.kycAutoRate}%`} 
                        icon={UserCheck} 
                        color="purple"
                        trend="Efficience"
                        delay={0.4}
                    />
                </div>

                {/* New Modules Activity Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard 
                        title="Mandats Actifs" 
                        value={(data.totalMandates || 0).toString()} 
                        icon={FileText} 
                        color="slate"
                        delay={0.5}
                    />
                    <StatCard 
                        title="Colocs Actives" 
                        value={(data.activeColocs || 0).toString()} 
                        icon={Database} 
                        color="emerald"
                        delay={0.6}
                    />
                    <StatCard 
                        title="Baux Terrains" 
                        value={(data.landLeases || 0).toString()} 
                        icon={ArrowUpRight} 
                        color="amber"
                        delay={0.7}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        <section className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/40 shadow-xl">
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-xl text-red-600">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <h3 className="font-black text-gray-900 uppercase tracking-tighter text-xl">
                                        Anomalies & Vérifications
                                    </h3>
                                </div>
                                <Link href="/admin/validation" className="label-tech hover:text-primary transition-colors">Voir tout</Link>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {(data.documentsUnderReview || []).length > 0 ? data.documentsUnderReview.map((doc: any) => (
                                    <div key={doc.id} className="p-6 flex justify-between items-center hover:bg-white/50 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xl shadow-inner border border-white">
                                                {doc.user?.fullName?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{doc.user?.fullName || "Inconnu"}</p>
                                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mt-1">ID: {doc.docType} • FLAG_REVIEW</p>
                                            </div>
                                        </div>
                                        <Link href={`/admin/validation`} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-sm">
                                            <ArrowUpRight size={18} />
                                        </Link>
                                    </div>
                                )) : (
                                    <div className="p-20 text-center">
                                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Aucune anomalie critique</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/40 shadow-2xl shadow-gray-200/50">
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                                        <Activity size={20} />
                                    </div>
                                    <h3 className="font-black text-gray-900 uppercase tracking-tighter text-xl">
                                        Flux d&apos;Audit système
                                    </h3>
                                </div>
                                <Link href="/admin/audit" className="label-tech hover:text-blue-600 transition-colors">Logs complets</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-4">Horodatage</th>
                                            <th className="px-8 py-4">Action</th>
                                            <th className="px-8 py-4">Opérateur</th>
                                            <th className="px-8 py-4 text-right">Module</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100/50">
                                        {(data.recentAuditLogs || []).map((log: any) => (
                                            <tr key={log.id} className="hover:bg-white/40 transition-colors">
                                                <td className="px-8 py-5 text-gray-400 font-mono text-[11px]">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={12} />
                                                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString('fr-FR') : "-"}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="font-bold text-gray-900 text-sm">{(log.action || "CORE_EVENT").replace(/_/g, ' ')}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-gray-700">{log.user?.fullName || "SYSTEM"}</span>
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{log.user?.role || "AUTO"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <span className="px-3 py-1 bg-gray-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-gray-900/10">
                                                        {log.module}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
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
                            <div className="glass-card-premium p-8 rounded-[2rem]">
                                <p className="label-tech mb-2 text-xs font-black uppercase tracking-widest">Patrimoine National</p>
                                <div className="flex items-end justify-between">
                                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{data.totalProperties || 0}</p>
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                                        <Database size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error: any) {
        console.error("[ADMIN DASHBOARD] Critical render error:", error)
        return (
            <div className="p-12 bg-red-50/50 border-2 border-red-100 rounded-[3rem] flex flex-col items-center text-center backdrop-blur-xl">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-red-200/50 rotate-3">
                    <AlertTriangle size={36} />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Interruption Supervision.</h2>
                <div className="bg-white p-8 rounded-[2.5rem] border border-red-200 mb-10 max-w-2xl w-full shadow-2xl shadow-red-100/50 text-[11px]">
                    <p className="text-red-900 font-mono text-left whitespace-pre-wrap leading-relaxed">
                        <span className="font-black text-red-600 uppercase block mb-3 border-b border-red-100 pb-2">Diagnostic Technique QAPRIL-OS:</span>
                        {error?.message || String(error)}
                    </p>
                </div>
                <div className="flex flex-col items-center gap-6">
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">Synchronisation Base de Données requise</p>
                     <div className="flex gap-4">
                        <DemoToggle initialEnabled={isDemoMode} />
                        <Link href="/admin" className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-2xl active:scale-95">
                            Relancer l&apos;audit
                        </Link>
                     </div>
                </div>
            </div>
        )
    }
}
