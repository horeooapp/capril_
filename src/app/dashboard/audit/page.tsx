import { getAuditLogs } from "@/actions/audit"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AuditPage() {
    const session = await auth()

    // Only ADMIN and AUDITOR can access this page
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "AUDITOR") {
        redirect("/dashboard")
    }

    const logs = await getAuditLogs()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Journal d'Audit</h1>
            <p className="text-gray-500 text-sm">Traçabilité complète des actions sur la plateforme QAPRIL.</p>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entité</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                            <li key={log.id} style={{ display: 'table-row' }}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {log.user?.name || log.user?.email || 'Système'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.entityType} ({log.entityId.substring(0, 8)}...)
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                                    {log.details || '-'}
                                </td>
                            </li>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && (
                    <div className="px-6 py-10 text-center text-gray-500">
                        Aucun log d'audit trouvé.
                    </div>
                )}
            </div>
        </div>
    )
}
