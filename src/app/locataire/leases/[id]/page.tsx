import { auth } from "@/auth"
import { getLeaseById } from "@/actions/leases"
import { notFound } from "next/navigation"
import Link from "next/link"
import ProtectedLogo from "@/components/ProtectedLogo"

export default async function TenantLeaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    const { id } = await params
    
    // @ts-ignore
    const userId = session?.user?.id
    if (!userId) return null

    const lease = await getLeaseById(id)
    if (!lease) notFound()

    if (lease.tenantId !== userId) {
        return <div className="p-8 text-center text-red-600 font-bold uppercase">Accès non autorisé.</div>
    }

    const formatDate = (date: any) => date ? new Date(date).toLocaleDateString('fr-FR') : '---';

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Mon Contrat de Bail</h1>
                <Link href="/locataire/leases" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest">
                    ← Retour à mes contrats
                </Link>
            </div>

            {lease.status === "PENDING" && (
                <div className="mb-8 p-6 bg-orange-50 border-2 border-orange-200 rounded-3xl flex flex-col md:flex-row justify-between items-center shadow-lg shadow-orange-100">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-black text-orange-800 uppercase tracking-tight">Signature Attendue ✍️</h3>
                        <p className="text-orange-700 text-sm font-medium">Vous devez signer ce contrat numériquement pour valider votre installation.</p>
                    </div>
                    <Link 
                        href={`/locataire/leases/${lease.id}/signature`}
                        className="px-8 py-3 bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 transition-all uppercase tracking-widest text-sm shadow-md"
                    >
                        Signer le Contrat
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Référence du bien</p>
                                <h2 className="text-xl font-bold uppercase">{lease.property.address}</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Statut</p>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                    lease.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                    {lease.status}
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 border-b pb-1">Dates clés</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase">Début</p>
                                            <p className="font-black text-gray-900">{formatDate(lease.startDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase">Fin</p>
                                            <p className="font-black text-gray-900">{formatDate(lease.endDate)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 border-b pb-1">Bailleur</h3>
                                    <p className="font-black text-gray-900 text-lg uppercase">{lease.property.owner.name}</p>
                                    <p className="text-sm text-gray-500">{lease.property.owner.email}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Résumé Financier</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Loyer Principal</span>
                                    <span className="font-black text-gray-900">{lease.rentAmount.toLocaleString()} FCFA</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span className="text-xs font-bold uppercase">Charges</span>
                                    <span className="font-bold">{lease.charges.toLocaleString()} FCFA</span>
                                </div>
                                <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-primary">
                                    <span className="text-xs font-black uppercase">Total Mensuel</span>
                                    <span className="text-xl font-black">{(lease.rentAmount + lease.charges).toLocaleString()} FCFA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Pack */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight mb-4">🛡️ Sécurité Caution</h3>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase">Montant Consigné</p>
                                    <p className="text-lg font-black text-blue-900">{lease.deposit.toLocaleString()} FCFA</p>
                                </div>
                                <span className="bg-blue-600 text-white text-[8px] px-2 py-1 rounded font-black uppercase">Sécurisé</span>
                            </div>
                        </div>
                        <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                            <h3 className="text-sm font-black text-orange-900 uppercase tracking-tight mb-4">📄 Contrat Validé</h3>
                            <Link 
                                href={`/locataire/leases/${lease.id}/signature`}
                                className="block w-full py-2 text-center text-xs font-black uppercase tracking-widest border-2 border-orange-200 text-orange-600 rounded-xl hover:bg-white transition-all bg-white/50"
                            >
                                Voir le contrat complet
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-4">Informations Juridiques</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">N° Officiel</p>
                                <p className="text-sm font-bold text-gray-800">{lease.officialLeaseNumber || "Non défini"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Renouvellement</p>
                                <p className="text-sm font-bold text-gray-800">{lease.renewalMode}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Date de Signature</p>
                                <p className="text-sm font-bold text-gray-800">{formatDate(lease.signedAt)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-2xl p-6 text-white">
                        <h3 className="text-sm font-black uppercase tracking-tight mb-4 text-orange-500">Aide QAPRIL</h3>
                        <p className="text-xs text-gray-400 leading-relaxed font-medium">
                            Besoin d'aide avec votre contrat ? Notre service de médiation est disponible 24/7 pour résoudre vos litiges à l'amiable.
                        </p>
                        <button className="mt-4 w-full py-2 text-[10px] font-black uppercase tracking-widest border border-gray-700 rounded-lg hover:border-gray-500 transition-colors">
                            Contacter le Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
