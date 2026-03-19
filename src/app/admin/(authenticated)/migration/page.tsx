import { Database, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { prisma } from "@/lib/prisma"
import MigrationUpload from "@/components/admin/MigrationUpload"

export default async function MigrationPage() {
    const sessions = await prisma.migrationSession.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
    }).catch(() => [])

    const totalSessions = await prisma.migrationSession.count().catch(() => 0)
    const pendingSessions = await prisma.migrationSession.count({ where: { statut: { in: ["UPLOADE", "EN_ANALYSE"] } } }).catch(() => 0)
    const committedSessions = await prisma.migrationSession.count({ where: { statut: "COMMITE" } }).catch(() => 0)

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#1F4E79]/10 rounded-2xl">
                            <Database className="text-[#1F4E79]" size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-[#1F4E79] tracking-tight uppercase">
                            Migration
                        </h1>
                    </div>
                    <p className="text-gray-500 font-medium max-w-2xl px-1">
                        Module M-MIGRATION : Importez vos données historiques depuis Excel ou CSV avec validation intelligente.
                    </p>
                </div>
                
                <MigrationUpload />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Sessions Totales", value: totalSessions.toString(), icon: <Database size={24} />, color: "bg-blue-50 text-blue-600" },
                    { label: "En Attente", value: pendingSessions.toString(), icon: <Clock size={24} />, color: "bg-amber-50 text-amber-600" },
                    { label: "Validées / Commitées", value: committedSessions.toString(), icon: <CheckCircle size={24} />, color: "bg-emerald-50 text-emerald-600" },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-[2.5rem] bg-white/50 border border-white/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="text-4xl font-black text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Recent Sessions List */}
            <div className="rounded-[3rem] bg-white/40 border border-white/60 backdrop-blur-2xl shadow-sm overflow-hidden p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-[#1F4E79] uppercase tracking-wider">Sessions Récentes</h2>
                    <span className="px-4 py-2 bg-white/60 rounded-full text-xs font-black text-gray-500 uppercase tracking-widest border border-white/50">Derniers 30 jours</span>
                </div>

                {sessions.length === 0 ? (
                    <div className="space-y-4 text-center py-20 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                        <div className="flex justify-center mb-4 text-gray-300">
                            <AlertCircle size={48} strokeWidth={1} />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aucune session active pour le moment</p>
                        <p className="text-gray-400/60 text-xs italic">Uploadez un fichier CSV pour démarrer le pipeline M-MIGRATION</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    <th className="px-6 py-4">Fichier</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Erreurs</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session: any) => (
                                    <tr key={session.id} className="bg-white/60 hover:bg-white transition-colors group">
                                        <td className="px-6 py-4 rounded-l-2xl font-bold text-gray-700">{session.fichierNom}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                session.statut === 'COMMITE' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                                {session.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-red-500">{session.nbErreurs}</td>
                                        <td className="px-6 py-4 rounded-r-2xl text-xs text-gray-400">{session.createdAt.toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
