import { getLeaseById } from "@/actions/leases"
import { ReliabilityBadge } from "@/components/ReliabilityBadge"
import Link from "next/link"
import { notFound } from "next/navigation"
import GenerateReceiptForm from "@/components/dashboard/GenerateReceiptForm"
import LeaseProcedureActions from "@/components/dashboard/LeaseProcedureActions"
import MediationCenter from "@/components/dashboard/MediationCenter"
import { auth } from "@/auth"

export default async function LeaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: leaseId } = await params
    const lease = await getLeaseById(leaseId)
    const session = await auth()

    if (!lease) {
        notFound()
    }

    const userId = session?.user?.id || ""

    // @ts-ignore
    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Détails du Bail</h1>
                    <p className="text-sm text-gray-500 font-mono text-[#FF8200] font-bold">Référence: {lease.leaseRef}</p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        href={`/dashboard/certificates/${lease.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all font-bold"
                    >
                        📄 Certificat
                    </Link>
                    <GenerateReceiptForm leaseId={lease.id} monthlyRentFcfa={lease.monthlyRentFcfa} />
                </div>
            </div>

            {/* Alerte Signature si PENDING */}
            {lease.status === "PENDING" && (
                <div className="mb-8 p-6 bg-orange-50 border-2 border-orange-200 rounded-3xl flex flex-col md:flex-row justify-between items-center shadow-lg shadow-orange-100 animate-pulse">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-black text-orange-800 uppercase tracking-tight">Validation Requise ✍️</h3>
                        <p className="text-orange-700 text-sm font-medium">Ce contrat de bail est en attente de signature numérique bilatérale.</p>
                    </div>
                    <Link 
                        href={`/dashboard/leases/${lease.id}/signature`}
                        className="px-8 py-3 bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 transition-all uppercase tracking-widest text-sm shadow-md"
                    >
                        Accéder à la Signature
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Parties Section */}
                    <div className="bg-white shadow rounded-2xl p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                            <span className="mr-2">🤝</span> Parties au Contrat
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Locataire</h3>
                                <p className="text-lg font-bold">{lease.tenant.name || "N/A"}</p>
                                <p className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded inline-block">{lease.tenant.email}</p>
                                <div className="pt-2">
                                    <ReliabilityBadge score={lease.tenant.reliabilityScore} showLabel={true} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Logement</h3>
                                <p className="text-lg font-bold">{lease.property.name || lease.property.address}</p>
                                <p className="text-sm text-gray-600">{lease.property.city}, {lease.property.neighborhood}</p>
                                <p className="text-xs text-gray-400 font-medium">Type: {lease.property.type}</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary Section */}
                    <div className="bg-white shadow rounded-2xl p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                            <span className="mr-2">💳</span> Conditions Financières
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase">Loyer Mensuel</p>
                                <p className="text-xl font-black text-gray-900">{lease.rentAmount.toLocaleString()} <span className="text-xs font-normal">FCFA</span></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase">Charges</p>
                                <p className="text-xl font-black text-gray-900">{(lease.charges || 0).toLocaleString()} <span className="text-xs font-normal">FCFA</span></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase">Caution</p>
                                <p className="text-xl font-black text-gray-900">{(lease.deposit || 0).toLocaleString()} <span className="text-xs font-normal">FCFA</span></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
                                <div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${
                                        lease.status === 'ACTIVE' 
                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                            : lease.status === 'LOYER_IMPAYE' || lease.status === 'MISE_EN_DEMEURE'
                                                ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                                                : 'bg-orange-100 text-orange-800 border border-orange-200'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full mr-2 ${lease.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        {lease.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Procedure Tracking (Added) */}
                    {(lease.procedurePhases?.length > 0 || lease.status !== "ACTIVE") && (
                        <div className="bg-white shadow rounded-2xl overflow-hidden border border-gray-100 italic">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <span className="mr-2">⚖️</span> Suivi de la Procédure de Recouvrement
                                </h2>
                                <span className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold uppercase tracking-widest">Valeur Probante QAPRIL</span>
                            </div>
                            <div className="p-6 space-y-4">
                                {lease.procedurePhases?.map((phase: any, idx: number) => (
                                    <div key={idx} className="flex space-x-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                                {phase.phaseNumber}
                                            </div>
                                            {idx < (lease.procedurePhases.length - 1) && <div className="w-0.5 h-full bg-red-200 my-1"></div>}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-sm font-black text-gray-900">{phase.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{phase.description}</p>
                                            <p className="text-[10px] text-gray-400 mt-2 font-mono">Horodatage: {new Date(phase.createdAt).toLocaleString('fr-FR')}</p>
                                        </div>
                                    </div>
                                ))}
                                {lease.repaymentPlans?.[0] && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <h4 className="text-sm font-bold text-blue-900 mb-2">🤝 Plan de Clémence en cours</h4>
                                        <p className="text-xs text-blue-800">{lease.repaymentPlans[0].details}</p>
                                        <div className="mt-3 flex items-center space-x-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest border border-blue-200 ${
                                                lease.repaymentPlans[0].status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                Status: {lease.repaymentPlans[0].status}
                                            </span>
                                            {lease.repaymentPlans[0].tenantSignature && (
                                                <span className="text-[10px] text-green-600 font-bold italic">✓ Signé par le locataire</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mediation Section */}
                    <div className="bg-white shadow rounded-2xl p-6 border border-gray-100">
                        <MediationCenter 
                            leaseId={lease.id} 
                            userId={userId} 
                            initialMediation={lease.mediation} 
                        />
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Security Pack (Escrow/CDC) */}
                    <div className="bg-white shadow rounded-2xl p-6 border-t-4 border-primary border-x border-b border-gray-100">
                        <h2 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">Pack Sécurité & Preuve</h2>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Caution Sécurisée</p>
                                {lease.cdcDeposit ? (
                                    <div className="mt-2 text-center py-2">
                                        <p className="text-sm font-black text-green-700">✅ CONSIGNATION CDC</p>
                                        <p className="text-[10px] text-gray-500 font-mono mt-1">Réf: {lease.cdcDeposit.cdcReference || "Paiement en attente"}</p>
                                    </div>
                                ) : lease.escrow ? (
                                    <div className="mt-2 bg-blue-600 p-3 rounded-xl text-white shadow-lg">
                                        <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Séquestre Virtuel</p>
                                        <p className="text-lg font-black">{lease.escrow.amount.toLocaleString()} FCFA</p>
                                        <p className="text-[10px] font-bold mt-2 py-1 px-2 bg-white/20 rounded inline-block uppercase tracking-tighter">Status: {lease.escrow.status}</p>
                                    </div>
                                ) : (
                                    <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                                        <p className="text-xs font-bold text-red-600 mb-1">Non sécurisé</p>
                                        <p className="text-[10px] text-red-400 leading-tight">La caution est détenue hors système QAPRIL. Risque de litige élevé.</p>
                                    </div>
                                )}
                            </div>

                            <div className={`p-5 rounded-2xl border-2 transition-all ${lease.insurance && lease.insurance.status === 'ACTIVE' ? 'bg-green-50 border-green-100' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assurance Impayés</p>
                                    {lease.insurance && lease.insurance.status === 'ACTIVE' ? (
                                        <span className="text-[10px] bg-green-600 text-white px-3 py-1 rounded-full font-black shadow-sm uppercase tracking-widest">ACTIVE</span>
                                    ) : (
                                        <span className="text-[10px] bg-gray-400 text-white px-3 py-1 rounded-full font-black shadow-sm uppercase tracking-widest">ABSENTE</span>
                                    )}
                                </div>
                                {lease.insurance && lease.insurance.status === 'ACTIVE' ? (
                                    <div className="mt-2">
                                        <p className="text-md font-black text-gray-900 flex items-center">
                                            <span className="mr-2">🛡️</span> {lease.insurance.provider}
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-2 font-mono italic tracking-tight bg-white/50 px-2 py-1 rounded">Police N°: {lease.insurance.policyNo}</p>
                                    </div>
                                ) : (
                                    <div className="mt-2">
                                        <p className="text-xs text-blue-900 font-bold leading-snug">Prenez l'option Assurance QAPRIL pour protéger 100% de vos revenus.</p>
                                        <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 uppercase tracking-widest">
                                            Activer la Protection
                                        </button>
                                        <p className="text-[9px] text-blue-400 text-center mt-3 font-medium uppercase tracking-tighter">Partenariat Strategique RCI</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Procedure Actions Sidebar */}
                    <div className="bg-white shadow rounded-2xl p-6 border border-gray-100 shadow-red-100/50">
                        <LeaseProcedureActions leaseId={leaseId} currentStatus={lease.status} userId={userId} />
                    </div>
                </div>
            </div>
        </div>
    )
}
