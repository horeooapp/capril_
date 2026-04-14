import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Banknote, CheckCircle, Clock } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminReceiptsPage() {
    const session = await auth()
    
    // Fetch all receipts
    const receipts = await prisma.receipt.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to recent 100 for performance
        include: {
            lease: {
                select: {
                    tenant: { select: { firstName: true, lastName: true, phone: true, email: true } },
                    property: { select: { name: true, propertyCode: true } }
                }
            }
        }
    })

    const totalAmount = receipts.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)

    return (
        <div className="space-y-12 pb-16 relative">
            <div className="fixed inset-0 bg-mesh -z-10 opacity-60"></div>

            <div className="page-header">
                <div>
                    <h1 className="page-title">Registre des Loyers & Quittances</h1>
                    <p className="page-sub">Supervision globale des paiements de flux locatifs.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="date-badge">
                        {receipts.length} Quittances
                    </div>
                </div>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card orange">
                    <div className="kpi-glow"></div>
                    <div className="kpi-label">Volume Encaissements Global</div>
                    <div className="kpi-val">{totalAmount.toLocaleString()} F</div>
                </div>
            </div>

            <div className="panel mt-8">
                <div className="panel-header">
                    <h2 className="panel-title">Transactions Récentes</h2>
                    <div className="panel-action">Historique Complet</div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="lease-table">
                        <thead>
                            <tr>
                                <th>Facture / Réf</th>
                                <th>Locataire</th>
                                <th>Période</th>
                                <th>Montant</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipts.map((r) => {
                                const receipt: any = r;
                                const tenantName = receipt.lease?.tenant?.firstName ? `${receipt.lease.tenant.firstName} ${receipt.lease.tenant.lastName || ''}` : receipt.lease?.tenant?.phone || receipt.lease?.tenant?.email || 'Inconnu'
                                const isPaid = receipt.status?.toLowerCase() === "paid"

                                return (
                                <tr key={receipt.id}>
                                    <td>
                                        <div className="tenant-cell">
                                            <div className="t-avatar" style={{ backgroundColor: 'var(--ci-nuit2)', color: 'var(--text-main)' }}>
                                                <Banknote size={16} />
                                            </div>
                                            <div>
                                                <div className="t-name font-mono text-[11px]">{receipt.receiptRef || 'Non généré'}</div>
                                                <div className="t-loc text-[10px] text-gray-500">{receipt.lease?.property?.name || receipt.lease?.property?.propertyCode || 'Bien Inconnu'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="t-name">{tenantName}</div>
                                    </td>
                                    <td>
                                        <div className="t-name text-gray-400 capitalize">{receipt.periodMonth}</div>
                                    </td>
                                    <td>
                                        <div className="t-name font-mono text-[var(--ci-orange)]">{receipt.totalAmount.toLocaleString()} F</div>
                                    </td>
                                    <td>
                                        {isPaid ? (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--ci-vert)] uppercase tracking-widest bg-[rgba(0,154,61,0.1)] px-3 py-1 rounded-full w-max">
                                                <CheckCircle size={12} />
                                                Payé
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-900 border border-gray-800 px-3 py-1 rounded-full w-max">
                                                <Clock size={12} />
                                                {receipt.status || "En attente"}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )})}
                            
                            {receipts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">
                                        Aucune facture ou quittance générée.
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
