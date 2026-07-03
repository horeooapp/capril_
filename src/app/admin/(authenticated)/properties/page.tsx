import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Building2, Home } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminPropertiesPage() {
    const session = await auth()
    
    // Fetch all properties
    const properties = await prisma.property.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            owner: { select: { firstName: true, lastName: true, phone: true, email: true } },
            manager: { select: { firstName: true, lastName: true, legalEntity: { select: { companyName: true } } } },
            leases: { 
                where: { status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "LOYER_IMPAYE", "MISE_EN_DEMEURE"] } },
                take: 1, 
                include: { tenant: { select: { firstName: true, lastName: true, email: true, phone: true } } } 
            },
            _count: { select: { leases: true } },
            images: { take: 1, orderBy: { isMain: 'desc' } }
        }
    })

    return (
        <div className="space-y-12 pb-16 relative">
            <div className="fixed inset-0 bg-mesh -z-10 opacity-60"></div>

            <div className="page-header">
                <div>
                    <h1 className="page-title">Inventaire des Biens</h1>
                    <p className="page-sub">Vue d'ensemble du parc immobilier global.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="date-badge">
                        {properties.length} Biens Enregistrés
                    </div>
                </div>
            </div>

            <div className="panel">
                <div className="panel-header">
                    <h2 className="panel-title">Registre Foncier</h2>
                    <div className="panel-action">Rechercher...</div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="lease-table">
                        <thead>
                            <tr>
                                <th>Référence / Nom</th>
                                <th>Propriétaire</th>
                                <th>Occupant(s)</th>
                                <th>Localisation</th>
                                <th>Occupation</th>
                                <th>Gestionnaire</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties.map((p) => {
                                const prop: any = p;
                                const ownerName = prop.owner?.firstName ? `${prop.owner.firstName} ${prop.owner.lastName || ''}` : prop.owner?.phone || prop.owner?.email || 'Inconnu'
                                const managerName = prop.manager?.legalEntity?.companyName || (prop.manager?.firstName ? `${prop.manager.firstName} ${prop.manager.lastName || ''}` : "Propriétaire En Direct")
                                const hasLeases = prop._count?.leases > 0;

                                return (
                                <tr key={prop.id}>
                                    <td>
                                        <div className="tenant-cell">
                                            <div className="overflow-hidden rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-200" style={{ width: '64px', height: '64px', backgroundColor: 'var(--ci-nuit2)', color: 'var(--text-main)' }}>
                                                {prop.images && prop.images.length > 0 ? (
                                                    <img src={prop.images[0].s3Key} alt="" className="w-full h-full object-cover" />
                                                ) : prop.propertyType === 'RESIDENCE' || prop.propertyType === 'IMMEUBLE' ? (
                                                    <Building2 size={24} />
                                                ) : (
                                                    <Home size={24} />
                                                )}
                                            </div>
                                            <div className="ml-2">
                                                <div className="t-name font-mono text-[11px] mb-1">{prop.propertyCode}</div>
                                                <div className="t-loc text-[11px] text-gray-500 font-semibold">{prop.name || prop.propertyType}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="t-name">{ownerName}</div>
                                    </td>
                                    <td>
                                        <div className="t-name">
                                            {hasLeases && prop.leases?.length > 0 
                                                ? `${prop.leases[0].tenant?.firstName || ''} ${prop.leases[0].tenant?.lastName || ''}`.trim() || prop.leases[0].tenant?.phone || 'Anonyme'
                                                : <span className="text-gray-600">—</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="t-name text-gray-400 truncate max-w-[200px]">{prop.commune}</div>
                                        <div className="t-loc text-[10px] truncate max-w-[200px]">{prop.address}</div>
                                    </td>
                                    <td>
                                        {hasLeases ? (
                                            <div className="pill pill-active"><div className="pill-dot"></div>Occupé ({prop._count.leases})</div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-900 border border-gray-800 px-3 py-1 rounded-full w-max">
                                                Vacant
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="t-name text-gray-400">{managerName}</div>
                                    </td>
                                </tr>
                            )})}
                            
                            {properties.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        Aucun bien immobilier enregistré.
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
