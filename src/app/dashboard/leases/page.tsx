import { getProperties } from "@/actions/properties"
import Link from "next/link"

export default async function LeasesPage() {
    // We fetch properties and extract leases to show them
    const properties = await getProperties().catch(() => [])

    // Flatten leases and inject property info
    const leases = properties.flatMap((prop: any) =>
        (prop.leases || []).map((lease: any) => ({
            ...lease,
            propertyName: prop.addressLine1,
            propertyCode: prop.propertyCode,
            propertyCommune: prop.commune
        }))
    )

    return (
        <div className="space-y-10 py-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Registre des Contrats</h1>
                    <p className="text-gray-500 mt-1">Suivez l'état de vos baux et la conformité règlementaire.</p>
                </div>
                <Link href="/dashboard/leases/new" className="bg-[#FF8200] hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-orange-200 transition-all transform hover:-translate-y-1 text-center">
                    + Créer un Bail Digital
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {leases.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-16 text-center">
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <span className="text-5xl">📄</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-3">Aucun contrat actif</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-10 text-lg">
                            Commencez par créer un bail digital pour l'un de vos biens immobiliers afin de sécuriser vos revenus.
                        </p>
                        <Link href="/dashboard/leases/new" className="inline-flex items-center px-10 py-4 bg-[#FF8200] text-white font-black rounded-2xl shadow-lg hover:bg-orange-600 transition-all">
                            Initier mon premier contrat
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Référence / Bien</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Locataire / Statut</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Conditions</th>
                                    <th className="px-8 py-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {leases.map((lease: any) => (
                                    <tr key={lease.id} className="hover:bg-gray-50/30 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-[#FF8200] mb-1">{lease.leaseRef}</span>
                                                <span className="text-xs font-bold text-gray-900">{lease.propertyCode} - {lease.propertyName}</span>
                                                <span className="text-[10px] text-gray-400">{lease.propertyCommune}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-sm font-bold text-gray-800">
                                                    {lease.tenant?.fullName || lease.tenant?.phone || "Locataire en attente"}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                        lease.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 
                                                        lease.status === 'DRAFT' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600'
                                                    }`}>
                                                        {lease.status === 'ACTIVE' ? 'Actif' : lease.status === 'DRAFT' ? 'Brouillon' : lease.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900">{parseInt(lease.monthlyRentFcfa).toLocaleString()} <small className="text-[10px] font-bold">FCFA</small></span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Début: {new Date(lease.startDate).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link href={`/dashboard/leases/${lease.id}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-400 group-hover:bg-[#FF8200] group-hover:text-white transition-all shadow-sm">
                                                →
                                            </Link>
                                        </td>
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
