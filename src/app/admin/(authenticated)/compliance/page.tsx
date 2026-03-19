import { ShieldAlert, Users, Search, Ban, Activity, ShieldCheck } from "lucide-react"

export default function CompliancePage() {
    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-10 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-50 rounded-2xl">
                            <ShieldAlert className="text-red-600" size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-[#1F4E79] tracking-tight uppercase">
                            Conformité
                        </h1>
                    </div>
                    <p className="text-gray-500 font-medium max-w-2xl px-1">
                        Module M-FRAUDE-KYC : Surveillance des risques, scores de confiance et gestion de la liste noire documentaire.
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-white text-[#1F4E79] font-black rounded-2xl border-2 border-[#1F4E79]/10 hover:bg-gray-50 transition-all flex items-center gap-3 uppercase tracking-widest text-xs">
                        <Search size={18} />
                        Vérifier Document
                    </button>
                    <button className="px-6 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest text-xs">
                        <Ban size={18} />
                        Blacklister
                    </button>
                </div>
            </div>

            {/* Risk Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Score Moyen", value: "14", icon: <Activity size={24} />, color: "bg-blue-50 text-blue-600" },
                    { label: "Alertes Fraude", value: "3", icon: <ShieldAlert size={24} />, color: "bg-red-50 text-red-600" },
                    { label: "Certifiés", value: "158", icon: <ShieldCheck size={24} />, color: "bg-emerald-50 text-emerald-600" },
                    { label: "Blacklistés", value: "7", icon: <Ban size={24} />, color: "bg-gray-900 text-white" },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-[2.5rem] bg-white/50 border border-white/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div className="text-4xl font-black text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-sm font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Monitoring & Live Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Risky Profiles */}
                <div className="rounded-[3rem] bg-white/40 border border-white/60 backdrop-blur-2xl p-8 shadow-sm">
                    <h3 className="text-xl font-black text-[#1F4E79] uppercase tracking-wider mb-8 flex items-center gap-3">
                        <Users size={24} className="opacity-50" />
                        Profils Suspects
                    </h3>
                    
                    <div className="space-y-4">
                        {[
                            { name: "Kouassi Jean-Marc", score: 85, reason: "Empreinte device multiple" },
                            { name: "Soro Alassane", score: 62, reason: "Hash document suspect" },
                            { name: "Bakayoko Amina", score: 45, reason: "Incohérence KYC" },
                        ].map((user, i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-white/60 border border-white/50 hover:bg-white transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-800">{user.name}</div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{user.reason}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-xl font-black text-red-600">{user.score}</div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RISQUE</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audit Log / Activity */}
                <div className="rounded-[3rem] bg-white/40 border border-white/60 backdrop-blur-2xl p-8 shadow-sm">
                    <h3 className="text-xl font-black text-[#1F4E79] uppercase tracking-wider mb-8 flex items-center gap-3">
                        <Activity size={24} className="opacity-50" />
                        Journal de Surveillance
                    </h3>
                    
                    <div className="space-y-6">
                        {[
                            { time: "10:45", msg: "Score recalculé pour #USER_991", type: "info" },
                            { time: "09:12", msg: "Nouvel hash ajouté à la Blacklist", type: "alert" },
                            { time: "Aujourd'hui", msg: "Audit hebdomadaire complété", type: "success" },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-4 group">
                                <div className="w-16 text-right pt-1 font-black text-[10px] text-gray-400 uppercase tracking-widest">{log.time}</div>
                                <div className="relative pt-1">
                                    <div className={`w-3 h-3 rounded-full ${log.type === 'alert' ? 'bg-red-500 animate-pulse' : 'bg-[#1F4E79]/30'}`}></div>
                                    {i !== 2 && <div className="absolute top-4 left-[5.5px] bottom-[-24px] w-[1px] bg-[#1F4E79]/10"></div>}
                                </div>
                                <div className="flex-1 pb-6">
                                    <div className="text-sm font-bold text-gray-600 group-hover:text-[#1F4E79] transition-colors">{log.msg}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
