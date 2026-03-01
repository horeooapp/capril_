import { generateRentalCertificate } from "@/actions/certificates"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function CertificatePage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) redirect("/api/auth/signin")

    const cert = await generateRentalCertificate(params.id)

    return (
        <div className="max-w-4xl mx-auto p-8 my-10 bg-white shadow-2xl border-t-8 border-orange-500 rounded-lg">
            <div className="flex justify-between items-start border-b pb-6 mb-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">QAPRIL</h1>
                    <p className="text-sm font-bold text-orange-600 uppercase tracking-widest">Certificat Locatif Numérique</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Référence : <span className="font-mono font-bold text-gray-900">{cert.certificateId}</span></p>
                    <p className="text-sm text-gray-500">Date d'émission : {cert.issueDate.toLocaleDateString('fr-FR')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <section>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Informations Locataire</h2>
                    <div className="space-y-1">
                        <p className="text-xl font-bold text-gray-900">{cert.tenant.name || "N/A"}</p>
                        <p className="text-gray-600">{cert.tenant.email}</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Informations Logement</h2>
                    <div className="space-y-1">
                        <p className="text-xl font-bold text-gray-900">{cert.property.name || "Logement QAPRIL"}</p>
                        <p className="text-gray-600">{cert.property.address}, {cert.property.city}</p>
                    </div>
                </section>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-12">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Statut de Conformité</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Identité</p>
                        <p className={`font-bold ${cert.status.isCertified ? 'text-green-600' : 'text-orange-500'}`}>
                            {cert.status.isCertified ? '✓ Vérifiée' : '! En attente'}
                        </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Dernier Loyer</p>
                        <p className="font-bold text-gray-900">
                            {cert.status.lastReceiptDate ? new Date(cert.status.lastReceiptDate).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Séquestre (Caution)</p>
                        <p className="font-bold text-blue-600">{cert.status.escrowStatus || 'Géré par QAPRIL'}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-dashed border-gray-200">
                <div className="mb-6 md:mb-0">
                    <p className="text-[10px] text-gray-400 font-mono break-all max-w-md">
                        HASH DE VÉRIFICATION : {cert.verificationHash}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Ce document est une preuve numérique générée par QAPRIL. Toute modification invalide le certificat.
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    {/* Placeholder for QR Code - typically generated on client side or via API */}
                    <div className="w-24 h-24 bg-gray-900 rounded-lg flex items-center justify-center text-white text-[10px] text-center p-2">
                        SCANNER POUR VÉRIFIER
                    </div>
                    <p className="text-[10px] mt-2 font-bold text-gray-400">AUTHENTICITÉ GARANTIE</p>
                </div>
            </div>

            <div className="mt-10 text-center print:hidden">
                <button
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-gray-900 text-white rounded-md font-bold hover:bg-black transition-colors"
                >
                    Télécharger en PDF / Imprimer
                </button>
            </div>
        </div>
    )
}
