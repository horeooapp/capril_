import { getLeaseById } from "@/actions/leases"
import { ReliabilityBadge } from "@/components/ReliabilityBadge"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function LeaseDetailPage({ params }: { params: { id: string } }) {
    const lease = await getLeaseById(params.id)

    if (!lease) {
        notFound()
    }

    // @ts-ignore
    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Détails du Bail</h1>
                    <p className="text-sm text-gray-500">Réf: {lease.id}</p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        href={`/dashboard/certificates/${lease.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        📄 Certificat de Location
                    </Link>
                    <button className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-all transform hover:scale-105">
                        Générer Quittance
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Parties Section */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Parties au Contrat</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Locataire</h3>
                                <p className="text-lg font-bold">{lease.tenant.name || "N/A"}</p>
                                <p className="text-sm text-gray-600">{lease.tenant.email}</p>
                                <div className="pt-2">
                                    <ReliabilityBadge score={lease.tenant.reliabilityScore} showLabel={true} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Logement</h3>
                                <p className="text-lg font-bold">{lease.property.name || lease.property.address}</p>
                                <p className="text-sm text-gray-600">{lease.property.city}, {lease.property.neighborhood}</p>
                                <p className="text-xs text-gray-400">Type: {lease.property.type}</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary Section */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Conditions Financières</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Loyer Mensuel</p>
                                <p className="text-lg font-bold">{lease.rentAmount.toLocaleString()} FCFA</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Charges</p>
                                <p className="text-lg font-bold">{(lease.charges || 0).toLocaleString()} FCFA</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Caution</p>
                                <p className="text-lg font-bold">{(lease.deposit || 0).toLocaleString()} FCFA</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${lease.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {lease.status === 'ACTIVE' ? 'Actif' : 'Clôturé'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mediation UI Placeholder */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-xl font-semibold text-gray-800">Médiation Numérique</h2>
                            {!lease.mediation && (
                                <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Ouvrir un litige</button>
                            )}
                        </div>
                        {lease.mediation ? (
                            <div className="p-4 bg-orange-50 rounded-md border border-orange-100">
                                <p className="font-medium text-orange-800">{lease.mediation.subject}</p>
                                <p className="text-xs text-orange-600 mt-1">Status: {lease.mediation.status}</p>
                                <div className="mt-4 text-center">
                                    <button className="text-sm underline text-orange-700">Accéder à l'espace de médiation</button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic text-center py-4">Aucune médiation en cours.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Security Pack (Escrow/CDC) */}
                    <div className="bg-white shadow rounded-lg p-6 border-t-4 border-primary">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Pack Sécurité & Preuve</h2>

                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase">Caution Sécurisée</p>
                                {lease.cdcDeposit ? (
                                    <div className="mt-2">
                                        <p className="text-sm font-bold text-green-700">✅ Consignation CDC</p>
                                        <p className="text-xs text-gray-500">Réf: {lease.cdcDeposit.cdcReference || "Paiement en attente"}</p>
                                    </div>
                                ) : lease.escrow ? (
                                    <div className="mt-2">
                                        <p className="text-sm font-bold text-blue-700">🔒 Séquestre Virtuel</p>
                                        <p className="text-xs text-gray-500">Status: {lease.escrow.status}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-red-500 mt-1">Non sécurisé</p>
                                )}
                            </div>

                            <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase">Assurance Loyer</p>
                                {lease.insurance && lease.insurance.status === 'ACTIVE' ? (
                                    <div className="mt-2">
                                        <p className="text-sm font-bold text-green-700">🛡️ Active ({lease.insurance.provider})</p>
                                        <p className="text-xs text-gray-500">Police: {lease.insurance.policyNo}</p>
                                    </div>
                                ) : (
                                    <div className="mt-2 flex justify-between items-center">
                                        <p className="text-sm text-gray-500 italic">Non assuré</p>
                                        <button className="text-[10px] bg-primary text-white px-2 py-0.5 rounded">Souscrire</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
