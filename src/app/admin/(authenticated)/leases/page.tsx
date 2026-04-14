import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { ShieldAlert, FileText, CheckCircle, XCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminLeasesPage() {
    const session = await auth()
    
    // Fetch all leases (no filtering by agency since it's global admin view)
    const leases = await prisma.lease.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            tenant: {
                select: { firstName: true, lastName: true, phone: true, email: true }
            },
            landlord: {
                select: { firstName: true, lastName: true, phone: true, email: true }
            },
            property: {
                select: { name: true, propertyCode: true, address: true, commune: true }
            }
        }
    })

    return (
        <div className="space-y-12 pb-16 relative">
            <div className="fixed inset-0 bg-mesh -z-10 opacity-60"></div>

            <div className="page-header">
                <div>
                    <h1 className="page-title">Registre des Baux</h1>
                    <p className="page-sub">Supervision globale des contrats de location.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="date-badge">
                        {leases.length} Baux Continus
                    </div>
                </div>
            </div>

            <div className="panel">
                <div className="panel-header">
                    <h2 className="panel-title">Contrats Actifs et En Cours</h2>
                    <div className="panel-action">Filtrer / Rechercher</div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="lease-table">
                        <thead>
                            <tr>
                                <th>Contrat / Bien</th>
                                <th>Locataire</th>
                                <th>Bailleur</th>
                                <th>Loyer Mensuel</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leases.map((lease) => {
                                const tenantName = lease.tenant?.firstName ? `${lease.tenant.firstName} ${lease.tenant.lastName || ''}` : lease.tenant?.phone || lease.tenant?.email || 'Locataire Inconnu'
                                const landlordName = lease.landlord?.firstName ? `${lease.landlord.firstName} ${lease.landlord.lastName || ''}` : lease.landlord?.phone || lease.landlord?.email || 'Bailleur Inconnu'
                                
                                const isDraft = lease.status === "DRAFT"
                                const isActive = lease.status === "ACTIVE" || lease.status === "ACTIVE_DECLARATIF"

                                return (
                                <tr key={lease.id}>
                                    <td>
                                        <div className="tenant-cell">
                                            <div className="t-avatar" style={{ backgroundColor: 'var(--ci-nuit2)', color: 'var(--text-main)' }}>
                                                <FileText size={16} />
                                            </div>
                                            <div>
                                                <div className="t-name font-mono text-[11px]">{lease.property?.propertyCode || 'N/A'}</div>
                                                <div className="t-loc text-[10px] text-gray-500">{lease.property?.name || lease.property?.commune || 'Bien Inconnu'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="t-name">{tenantName}</div>
                                    </td>
                                    <td>
                                        <div className="t-name text-gray-400">{landlordName}</div>
                                    </td>
                                    <td>
                                        <div className="t-name font-mono">{(lease.rentAmount + lease.chargesAmount).toLocaleString()} F</div>
                                        <div className="t-loc text-[9px]">CAUTION: {lease.depositAmount?.toLocaleString()} F</div>
                                    </td>
                                    <td>
                                        {isActive ? (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--ci-vert)] uppercase tracking-widest bg-[rgba(0,154,61,0.1)] px-3 py-1 rounded-full w-max">
                                                <CheckCircle size={12} />
                                                Actif
                                            </div>
                                        ) : isDraft ? (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-900 border border-gray-800 px-3 py-1 rounded-full w-max">
                                                Brouillon
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--ci-orange)] uppercase tracking-widest bg-[rgba(255,102,0,0.1)] px-3 py-1 rounded-full w-max">
                                                {lease.status}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )})}
                            
                            {leases.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">
                                        Aucun contrat de bail enregistré dans la plateforme.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
