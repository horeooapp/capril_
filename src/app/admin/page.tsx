import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function AdminDashboardOverview() {
    // Agrégation des statistiques nationales
    const totalUsers = await prisma.user.count()
    const totalProperties = await prisma.property.count()
    const totalLeases = await prisma.lease.count()
    const totalReceipts = await prisma.receipt.count()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Observatoire National du Logement</h1>
                <div className="bg-white border rounded-md px-3 py-1 shadow-sm text-sm text-gray-500">
                    Mise à jour: Aujourd'hui
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-lg">
                    <div className="px-4 py-5 sm:p-6 flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 truncate">Utilisateurs Inscrits</dt>
                            <dd className="mt-1 text-2xl font-semibold text-gray-900">{totalUsers}</dd>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-lg">
                    <div className="px-4 py-5 sm:p-6 flex items-center">
                        <div className="p-3 rounded-full bg-orange-100 text-primary mr-4">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 truncate">Logements Déclarés</dt>
                            <dd className="mt-1 text-2xl font-semibold text-gray-900">{totalProperties}</dd>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-lg">
                    <div className="px-4 py-5 sm:p-6 flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-secondary mr-4">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 truncate">Baux Locatifs Actifs</dt>
                            <dd className="mt-1 text-2xl font-semibold text-gray-900">{totalLeases}</dd>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-lg">
                    <div className="px-4 py-5 sm:p-6 flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 truncate">Quittances Émises</dt>
                            <dd className="mt-1 text-2xl font-semibold text-gray-900">{totalReceipts}</dd>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert / Validation Section */}
            <div className="mt-8 bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Demandes de validation Agence / Bailleur professionnel</h3>
                </div>
                <div className="p-6 text-center text-gray-500">
                    Aucune demande de validation en attente.
                </div>
            </div>

        </div>
    )
}
