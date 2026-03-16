import { getFiscalStats } from "@/actions/fiscal-actions"
import { Shield, TrendingUp, Users, DollarSign, Clock } from "lucide-react"

export default async function DGIDashboardPage() {
    const res = await getFiscalStats()
    if (!res.success) return <div>Erreur de chargement</div>

    const { stats, recentRegistrations } = res

    return (
        <div className="p-8 space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between bg-slate-900 p-10 rounded-[3rem] text-white overflow-hidden relative shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-widest italic">Direction Générale des Impôts</h1>
                    </div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest ml-14">Observatoire de l&apos;Enregistrement Fiscal des Baux · Module M17</p>
                </div>
                <div className="hidden lg:block">
                    <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Dernière Mise à Jour</span>
                        <span className="text-sm font-black text-white">{new Date().toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Baux Déclarés", val: stats.totalDossiers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Taux de Conformité", val: `${stats.complianceRate.toFixed(1)}%`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Droits Collectés", val: `${stats.totalCollected.toLocaleString()} FCFA`, icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Pénalités", val: `${stats.totalPenalties.toLocaleString()} FCFA`, icon: Clock, color: "text-red-600", bg: "bg-red-50" },
                ].map((s, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 hover:translate-y-[-5px] transition-all group">
                        <div className={`${s.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <s.icon className={`w-8 h-8 ${s.color}`} />
                        </div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{s.val}</span>
                    </div>
                ))}
            </div>

            {/* Tables / List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                    <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Derniers Enregistrements</h2>
                        <span className="text-[10px] bg-slate-900 text-white px-4 py-1 rounded-full font-black uppercase tracking-widest">Temps Réel</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence</th>
                                    <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Commune</th>
                                    <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Loyer</th>
                                    <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Droits DGI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold">
                                {recentRegistrations?.map((reg: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6 text-sm text-slate-900 underline decoration-primary/30 underline-offset-4">{reg.lease.leaseReference}</td>
                                        <td className="px-10 py-6 text-sm text-slate-500">{reg.lease.property.commune}</td>
                                        <td className="px-10 py-6 text-sm text-slate-900">{reg.loyerMensuel.toLocaleString()} FCFA</td>
                                        <td className="px-10 py-6 text-sm text-green-600 font-black">{reg.totalDgi.toLocaleString()} FCFA</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Alerts / Distribution */}
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl overflow-hidden relative">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/20 to-transparent"></div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-black uppercase tracking-tight mb-8">Alertes & Rappels</h3>
                        <div className="space-y-6">
                            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 block">Dossiers en Retard (J+30)</span>
                                <span className="text-3xl font-black">12</span>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">Baux signés il y a plus de 30 jours sans paiement fiscal.</p>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2 block">Accord DGI Mobile</span>
                                <span className="text-sm font-black">ACTIF</span>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">Canal de reversement CinetPay vers e-impôts opérationnel.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
