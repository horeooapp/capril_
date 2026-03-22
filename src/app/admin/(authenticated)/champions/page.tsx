import { Trophy, Users, Banknote, ShieldCheck, ChevronRight, UserCheck, Star } from "lucide-react";
import Link from "next/link";
import { getAllChampions } from "@/actions/champion-actions";
import StatCard from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";

export default async function ChampionsAdminPage() {
    const champions = await getAllChampions();

    const totalCommissions = champions.reduce((acc: number, curr: any) => acc + Number(curr.totalCommissionsFcfa), 0);
    const totalProspects = champions.reduce((acc: number, curr: any) => acc + (curr._count?.prospects || 0), 0);

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">Réseau Champions.</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Gestion de la force commerciale et des commissions de parrainage.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Recrutement de masse</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard 
                    title="Champions Actifs" 
                    value={champions.length.toString()} 
                    icon={<Trophy size={24} />} 
                    color="indigo"
                    trend="Force Digitale"
                />
                <StatCard 
                    title="Total Prospects" 
                    value={totalProspects.toLocaleString()} 
                    icon={<Users size={24} />} 
                    color="blue"
                    trend="Pipeline"
                />
                <StatCard 
                    title="Volume Commissions" 
                    value={`${totalCommissions.toLocaleString()} FCFA`} 
                    icon={<Banknote size={24} />} 
                    color="emerald"
                    trend="Flux de Sortie"
                />
            </div>

            {/* Champions Table */}
            <div className="glass-card-premium overflow-hidden rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Liste des Ambassadeurs QAPRIL</h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Trié par performance</span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Champion</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Zone Principale</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statistiques</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gains Cumulés</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {champions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic font-medium">
                                        Aucun champion enregistré pour le moment.
                                    </td>
                                </tr>
                            ) : (
                                champions.map((champion: any, index: number) => (
                                    <tr key={champion.id} className="group hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">
                                                    {champion.user?.fullName?.charAt(0) || "C"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-900 leading-none mb-1">{champion.user?.fullName}</span>
                                                    <span className="text-[10px] text-gray-500 font-medium">{champion.user?.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                {champion.zonePrincipale}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-gray-900">{champion._count?.prospects}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Prospects</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-indigo-600">{champion._count?.commissions}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Comms</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-indigo-600">
                                                {Number(champion.totalCommissionsFcfa).toLocaleString()} FCFA
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${champion.statut === "ACTIF" ? "bg-green-500" : "bg-red-500"}`}></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">{champion.statut}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link 
                                                href={`/admin/champions/${champion.id}`}
                                                className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg transition-all inline-flex items-center justify-center"
                                            >
                                                <ChevronRight size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Leaderboard Section Visual Hint */}
            <div className="bg-gray-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600 blur-[150px] opacity-20 -mr-40 -mt-40 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <Star size={20} className="fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ambassadeur de la Zone</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic">Optimisez votre force de vente locale.</h2>
                        <p className="text-white/40 font-medium max-w-lg">Le réseau Champion QAPRIL permet une pénétration terrain sans précédent en Côte d&apos;Ivoire.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
