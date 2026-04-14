import { getAuditLogs } from "@/actions/audit"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"
import { ShieldCheck, Search } from "lucide-react"

interface AuditLog {
    id: string;
    timestamp: string | Date;
    action: string;
    entityType: string;
    entityId: string;
    details: string | null;
    user: { name: string | null; email: string | null } | null;
}

export default async function AuditPage() {
    const session = await auth()

    // Only ADMIN and AUDITOR can access this page
    const userRole = session?.user?.role as string
    if (userRole !== "ADMIN" && userRole !== "AUDITOR") {
        redirect("/dashboard")
    }

    const logs = await getAuditLogs() as unknown as AuditLog[]

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <ShieldCheck className="text-indigo-600" size={32} /> Journal d&apos;Audit
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Traçabilité complète des actions sur la plateforme QAPRIL.
                    </p>
                </div>
            </div>

            <SectionCard title="Logs Système" noPadding>
                <div className="p-4 border-b border-slate-100 flex items-center justify-end bg-slate-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="Filtrer les logs..." className="w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white border-b border-slate-100">
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Date & Heure</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Utilisateur</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Action</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Entité</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 whitespace-nowrap text-[12px] font-semibold text-slate-500">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="p-4 whitespace-nowrap text-[13.5px] font-bold text-slate-900">
                                        {log.user?.name || log.user?.email || 'Système'}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <Badge color={
                                            log.action.includes('CREATE') ? 'emerald' :
                                            log.action.includes('DELETE') ? 'rose' :
                                            log.action.includes('UPDATE') ? 'amber' : 'gray'
                                        }>
                                            {log.action}
                                        </Badge>
                                    </td>
                                    <td className="p-4 whitespace-nowrap text-[13px] font-bold text-slate-600">
                                        {log.entityType} <span className="text-[11px] font-medium text-slate-400">({log.entityId.substring(0, 8)}...)</span>
                                    </td>
                                    <td className="p-4 text-[13px] text-slate-600 truncate max-w-xs font-medium">
                                        {log.details || '-'}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-[13px] font-medium">
                                        Aucun événement d&apos;audit trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    )
}
