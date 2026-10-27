import { getPendingValidations } from "@/actions/admin-actions"
import CertificationButton from "./certification-button"
import KycLevelManager from "@/components/admin/KycLevelManager"

export default async function AdminValidationPage() {
    const pendings = await getPendingValidations()

    return (
        <div className="space-y-8">
            <div className="mb-2">
                <h1 className="text-3xl font-black text-gray-900 border-l-4 border-amber-600 pl-4 uppercase tracking-tight">Validations Agences & KYC</h1>
                <p className="mt-1 text-sm text-gray-500 ml-5">
                    Gérez les niveaux d'exigence KYC et les demandes de certification pour les professionnels de l&apos;immobilier.
                </p>
            </div>

            {/* CONTRÔLE DES NIVEAUX KYC */}
            <KycLevelManager showBulkUserActions={true} />

            <div className="grid grid-cols-1 gap-6">
                {pendings.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-lg border-2 border-dashed border-gray-300">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tout est à jour</h3>
                        <p className="mt-1 text-sm text-gray-500">Aucune demande de validation en attente pour le moment.</p>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {pendings.map((user) => (
                                <li key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-1">
                                                <h3 className="text-lg font-bold text-gray-900 mr-2">{user.legalEntity?.companyName || (user.firstName ? user.firstName + " " : "") + (user.lastName || "")}</h3>
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p><span className="font-medium">Responsable :</span> {(user.firstName ? user.firstName + " " : "") + (user.lastName || "")}</p>
                                                <p><span className="font-medium">E-mail :</span> {user.email}</p>
                                                <p><span className="font-medium">Inscrit le :</span> {new Date(user.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <CertificationButton userId={user.id} />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
