import { getProperties } from "@/actions/properties"
import { getCurrentUser } from "@/actions/users"
import RegularizationAlert from "@/components/dashboard/RegularizationAlert"
import { ReliabilityBadge } from "@/components/ReliabilityBadge"
import Link from "next/link"

interface DashboardProperty {
    id: string;
    name?: string | null;
    address: string;
    city: string;
    neighborhood: string;
    leases: Array<{
        id: string;
        cdcDeposits: Array<{ amount: number }>;
        receipts?: Array<{ paidAt: Date | string | null }>;
    }>;
}

export default async function DashboardOverview() {
    // Fetch user and properties
    const user = await getCurrentUser()
    const properties = await getProperties() as unknown as DashboardProperty[]

    const totalProperties = properties.length
    const totalLeases = properties.reduce((acc: number, current: DashboardProperty) => acc + (current.leases?.length || 0), 0)

    // Calculate total funds in Escrow/CDC for this manager/owner
    let totalSecuredFunds = 0
    properties.forEach((p: DashboardProperty) => {
        p.leases?.forEach((l) => {
            if (l.cdcDeposits?.[0]?.amount) totalSecuredFunds += l.cdcDeposits[0].amount
        })
    })

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    let receiptsThisMonth = 0
    properties.forEach((p: DashboardProperty) => {
        p.leases?.forEach((l) => {
            if (l.receipts) {
                receiptsThisMonth += l.receipts.filter((r) => r.paidAt && new Date(r.paidAt) >= startOfMonth).length
            }
        })
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                    {user && <ReliabilityBadge score={750} />}
                </div>
            </div>

            <RegularizationAlert />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-primary">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Logements gérés</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalProperties}</dd>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-secondary">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Contrats actifs</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalLeases}</dd>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Fonds Sécurisés (CDC/Séquestre)</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalSecuredFunds.toLocaleString()} FCFA</dd>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Quittances générées ce mois</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{receiptsThisMonth}</dd>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                {/* Quick Actions section */}
                <section className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
                    <div className="space-y-4">
                        <Link href="/dashboard/properties" className="block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Ajouter un nouveau logement
                        </Link>
                        <Link href="/dashboard/leases" className="block w-full text-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-orange-600">
                            Générer une nouvelle quittance
                        </Link>
                    </div>
                </section>

                {/* Properties overview */}
                <section className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Vos récents logements</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {properties.slice(0, 3).map((prop) => (
                            <li key={prop.id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-primary truncate">{prop.name || prop.address}</p>
                                        <p className="text-sm text-gray-500">{prop.city}</p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {(prop.leases?.length || 0)} contrat(s)
                                    </div>
                                </div>
                            </li>
                        ))}
                        {properties.length === 0 && (
                            <li className="px-6 py-8 text-center text-gray-500 text-sm">
                                Aucun logement enregistré pour l&apos;instant.
                            </li>
                        )}
                    </ul>
                </section>
            </div>
        </div>
    )
}
