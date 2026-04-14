import { ShieldAlert, Search, Ban, Activity, ShieldCheck } from "lucide-react"
import { getComplianceDashboard } from "@/actions/compliance-actions"
import ComplianceClient from "./ComplianceClient"

export default async function CompliancePage() {
    const res = await getComplianceDashboard();
    
    if (!res.success) {
        return (
            <div className="p-12 bg-red-50 rounded-[2.5rem] border border-red-100 text-center">
                <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
                <h1 className="text-xl font-bold text-red-900 mb-2">Erreur de chargement</h1>
                <p className="text-red-700/60 max-w-md mx-auto">{res.error || "Impossible de charger le module de conformité."}</p>
            </div>
        )
    }

    const { stats, suspiciousProfiles, logs } = res;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                            <ShieldAlert size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight uppercase">
                            Conformité
                        </h1>
                    </div>
                    <p className="text-gray-500 font-medium max-w-2xl px-1">
                        Module M-FRAUDE-KYC : Surveillance des risques, scores de confiance et gestion de la liste noire documentaire.
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <a href="/admin/validation" className="px-6 py-4 bg-white text-slate-800 font-black rounded-2xl border-2 border-slate-800/10 hover:bg-gray-50 transition-all flex items-center gap-3 uppercase tracking-widest text-xs">
                        <Search size={18} />
                        Vérifier Document
                    </a>
                    <a href="/admin/users" className="px-6 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest text-xs">
                        <Ban size={18} />
                        Gérer Liste Noire
                    </a>
                </div>
            </div>

            {/* Risk Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Score Moyen", value: stats?.avgScore || 0, icon: <Activity size={24} />, color: "bg-blue-50 text-blue-600" },
                    { label: "Alertes Fraude", value: stats?.alerts || 0, icon: <ShieldAlert size={24} />, color: "bg-red-50 text-red-600" },
                    { label: "Certifiés", value: stats?.certified || 0, icon: <ShieldCheck size={24} />, color: "bg-emerald-50 text-emerald-600" },
                    { label: "Blacklistés", value: stats?.blacklisted || 0, icon: <Ban size={24} />, color: "bg-gray-900 text-white" },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-[2.5rem] bg-white/50 border border-white/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div className="text-4xl font-black text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Monitoring & Live Feed */}
            <ComplianceClient initialProfiles={suspiciousProfiles || []} logs={logs || []} />
        </div>
    )
}
