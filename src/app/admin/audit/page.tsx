import { getGlobalAuditLogs } from "@/actions/admin-actions"
import { auth } from "@/auth"
import { Role } from "@prisma/client"

export default async function AdminAuditLogsPage() {
    const session = await auth()
    if (!session || (session.user?.role !== Role.ADMIN && session.user?.role !== Role.SUPER_ADMIN)) {
        return (
            <div className="p-8 text-center text-red-600 font-bold">
                Accès non autorisé
            </div>
        )
    }

    const logs = await getGlobalAuditLogs()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-gray-900 pl-4">Journal d&apos;Audit Global</h1>
                <div className="text-sm text-gray-500 bg-white border px-3 py-1 rounded shadow-sm">
                    {logs.length} Événements récents
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log: any) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 uppercase">
                                        {log.module}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {log.action}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.user?.fullName || log.user?.email || "Système"}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-400 font-mono truncate max-w-xs">
                                    {log.entityId ? `ID: ${log.entityId}` : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
