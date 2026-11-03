import { getPendingValidations } from "@/actions/admin-actions"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { FileText, ShieldCheck, Clock, CheckCircle2, XCircle, Eye } from "lucide-react"
import CertificationButton from "./certification-button"
import KycLevelManager from "@/components/admin/KycLevelManager"

export const dynamic = "force-dynamic"

const DOC_TYPE_LABELS: Record<string, string> = {
    CNI_CI: "Carte Nationale d'Identité (CNI)",
    PASS_CI: "Passeport",
    CARTE_RESIDENT: "Carte de Résident",
    ATTESTATION: "Attestation d'Identité",
    PERMIS: "Permis de Conduire",
    CARTE_CONSULAIRE: "Carte Consulaire",
}

export default async function AdminValidationPage() {
    const pendings = await getPendingValidations()

    const identityDocs = await prisma.identityDocument.findMany({
        where: {
            scanS3Key: { not: null },
            docType: { notIn: ["DFE", "RCCM", "NIF", "AGREMENT", "SELFIE"] }
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    role: true,
                    kycLevel: true,
                }
            }
        },
        orderBy: { updatedAt: "desc" },
        take: 50
    }).catch(() => [])

    return (
        <div className="space-y-8">
            <div className="mb-2">
                <h1 className="text-3xl font-black text-gray-900 border-l-4 border-amber-600 pl-4 uppercase tracking-tight">Validations Agences & KYC</h1>
                <p className="mt-1 text-sm text-gray-500 ml-5">
                    Gérez les pièces d&apos;identité déposées (CNI, Passeport, Carte de Résident), les niveaux KYC et la certification des agences.
                </p>
            </div>

            {/* SECTION 1 : PIÈCES D'IDENTITÉ DÉPOSÉES */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2.5">
                        <ShieldCheck className="text-amber-600" size={20} />
                        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                            Pièces d&apos;identité soumises ({identityDocs.length})
                        </h2>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">
                        {identityDocs.filter(d => d.status === "pending" || d.status === "under_review").length} en attente de contrôle
                    </span>
                </div>

                {identityDocs.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        Aucune pièce d&apos;identité avec scan n&apos;a encore été déposée.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {identityDocs.map((doc) => {
                            const fullName = ((doc.user?.firstName ? doc.user.firstName + " " : "") + (doc.user?.lastName || "")).trim() || doc.fullName || "Utilisateur QAPRIL"
                            const docLabel = DOC_TYPE_LABELS[doc.docType] || doc.docType
                            const isVerified = doc.status === "verified"
                            const isRejected = doc.status === "rejected"

                            return (
                                <div key={doc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-gray-900">{fullName}</span>
                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-700">
                                                {doc.user?.role || "USER"}
                                            </span>
                                            {isVerified ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 size={12} /> Vérifié
                                                </span>
                                            ) : isRejected ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                                    <XCircle size={12} /> Refusé
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                                    <Clock size={12} /> À vérifier
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                                            <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                                <FileText size={13} className="text-slate-400" /> {docLabel} — N° {doc.docNumber || "N/A"}
                                            </span>
                                            {doc.user?.email && <span>{doc.user.email}</span>}
                                            {doc.user?.phone && <span>{doc.user.phone}</span>}
                                            <span>Déposé le {new Date(doc.updatedAt).toLocaleDateString("fr-FR")}</span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/admin/validation/${doc.id}`}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shrink-0"
                                    >
                                        <Eye size={15} />
                                        Examiner la pièce
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* CONTRÔLE DES NIVEAUX KYC */}
            <KycLevelManager showBulkUserActions={true} />

            {/* SECTION 2 : DEMANDES DE CERTIFICATION AGENCES */}
            <div className="grid grid-cols-1 gap-6">
                {pendings.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-lg border-2 border-dashed border-gray-300">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tout est à jour</h3>
                        <p className="mt-1 text-sm text-gray-500">Aucune demande de certification agence en attente pour le moment.</p>
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
                                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {user.role}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p><span className="font-medium">Responsable :</span> {(user.firstName ? user.firstName + " " : "") + (user.lastName || "")}</p>
                                                <p><span className="font-medium">E-mail :</span> {user.email}</p>
                                                <p><span className="font-medium">Inscrit le :</span> {new Date(user.createdAt).toLocaleDateString("fr-FR")}</p>
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
