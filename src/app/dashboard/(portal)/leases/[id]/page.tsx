/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLeaseById } from "@/actions/leases"
import { ReliabilityBadge } from "@/components/ReliabilityBadge"
import Link from "next/link"
import { notFound } from "next/navigation"
import GenerateReceiptForm from "@/components/dashboard/GenerateReceiptForm"
import LeaseProcedureActions from "@/components/dashboard/LeaseProcedureActions"
import MediationCenter from "@/components/dashboard/MediationCenter"
import { auth } from "@/auth"

import { LeaseStatus } from "@prisma/client"
import FiscalRegistrationBox from "@/components/FiscalRegistrationBox"
import { getOrCreateFiscalDossier } from "@/actions/fiscal-actions"
import { isFeatureEnabled } from "@/lib/features"
import { getLeaseProceduralState } from "@/lib/arrears-engine"
import ArrearsProceduralBox from "@/components/ArrearsProceduralBox"
import CDCRestitutionBox from "@/components/CDCRestitutionBox"
import EdlManager from "@/components/dashboard/edl/EdlManager"
import { getEdlsByLease } from "@/actions/edl-actions"

export default async function LeaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: leaseId } = await params
    const session = await auth()
    const lease = await getLeaseById(leaseId) as any 
    
    interface Lease {
        id: string;
        leaseReference: string | null;
        status: LeaseStatus;
        rentAmount: number;
        chargesAmount: number;
        depositAmount: number;
        startDate: string | Date;
        signedAt: string | Date | null;
        tenant: { id: string; fullName: string | null; email: string | null; phone: string | null; reliabilityScore?: number } | null;
        property: { name: string | null; address: string; commune: string; propertyType: string };
        procedurePhases: any[];
        repaymentPlans: any[];
        mediation: any;
        cdcDeposits: any[];
        insurance: any;
    }

    if (!lease) {
        notFound()
    }

    const tLease = lease as unknown as Lease;
    const userId = session?.user?.id || ""

    // Feature Flags Check
    const showFiscal = await isFeatureEnabled("M17_FISCAL")
    const showCdc = await isFeatureEnabled("CDC_CONSIGNATION")
    const showInsurance = await isFeatureEnabled("ASSURANCE_LOYER")
    const showMediation = await isFeatureEnabled("MEDIATION_CENTER")

    // Fetch Fiscal Dossier for M17 if enabled
    const fiscalRes = showFiscal ? await getOrCreateFiscalDossier(leaseId) : { success: false, data: null }
    const fiscalDossier = fiscalRes.success ? (fiscalRes as any).data : null

    // Fetch Procedural State for Arrears
    const proceduralState = await getLeaseProceduralState(leaseId)

    // EDL Feature & Data
    const showEdl = await isFeatureEnabled("M-EDL")
    const edls = showEdl ? await getEdlsByLease(leaseId) : []

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-8">
            {/* Hybrid Automation: Arrears Procedural Action */}
            {proceduralState.active && (
                <ArrearsProceduralBox leaseId={leaseId} proceduralState={proceduralState} />
            )}

            <div className="flex justify-between items-center bg-white shadow-sm p-4 rounded-xl border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Détails du Bail</h1>
                    <p className="text-sm text-gray-500 font-mono text-[#FF8200] font-bold">Référence: {tLease.leaseReference}</p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        href={`/dashboard/certificates/${tLease.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all font-bold"
                    >
                        📄 Certificat
                    </Link>
                    <GenerateReceiptForm leaseId={tLease.id} monthlyRentFcfa={tLease.rentAmount} />
                </div>
            </div>

            {/* Alerte Signature si PENDING_SIGNATURE */}
            {(tLease.status === "PENDING_SIGNATURE" || tLease.status === "DRAFT") && (
                <div className="mb-8 p-6 bg-orange-50 border-2 border-orange-200 rounded-3xl flex flex-col md:flex-row justify-between items-center shadow-lg shadow-orange-100 animate-pulse">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-black text-orange-800 uppercase tracking-tight">Validation Requise ✍️</h3>
                        <p className="text-orange-700 text-sm font-medium">Ce contrat de bail est en attente de signature numérique bilatérale.</p>
                    </div>
                    <Link 
                        href={`/dashboard/leases/${tLease.id}/signature`}
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
                                <p className="text-lg font-bold">{tLease.tenant?.fullName || "N/A"}</p>
                                <p className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded inline-block">{tLease.tenant?.email}</p>
                                <div className="pt-2">
                                    <ReliabilityBadge score={tLease.tenant?.reliabilityScore || 750} showLabel={true} />
                                </div>
                            </div>
                            {/* Property Details Column */}
                        <div className="space-y-6">
                            {/* Hybrid Automation: CDC Restitution */}
                            {tLease.cdcDeposits?.[0] && (tLease.status === "TERMINATED" || tLease.status === "ACTIVE") && (
                                <CDCRestitutionBox leaseId={leaseId} deposit={tLease.cdcDeposits[0]} />
                            )}
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Logement</h3>
                                <p className="text-lg font-bold">{tLease.property.name || tLease.property.address}</p>
                                <p className="text-sm text-gray-600">{tLease.property.commune}</p>
                                <p className="text-xs text-gray-400 font-medium">Type: {tLease.property.propertyType}</p>
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
                                <p className="text-xl font-black text-gray-900">{Number(tLease.rentAmount).toLocaleString()} <span className="text-xs font-normal">FCFA</span></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase">Charges</p>
                                <p className="text-xl font-black text-gray-900">{Number(tLease.chargesAmount || 0).toLocaleString()} <span className="text-xs font-normal">FCFA</span></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase">Caution</p>
                                <p className="text-xl font-black text-gray-900">{Number(tLease.depositAmount || 0).toLocaleString()} <span className="text-xs font-normal">FCFA</span></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
                                <div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${
                                        tLease.status === 'ACTIVE' 
                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                            : tLease.status === 'LOYER_IMPAYE' || tLease.status === 'MISE_EN_DEMEURE'
                                                ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                                                : 'bg-orange-100 text-orange-800 border border-orange-200'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full mr-2 ${tLease.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        {tLease.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Procedure Tracking (Added) */}
                    {(tLease.procedurePhases?.length > 0 || tLease.status !== "ACTIVE") && (
                        <div className="bg-white shadow rounded-2xl overflow-hidden border border-gray-100 italic">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <span className="mr-2">⚖️</span> Suivi de la Procédure de Recouvrement
                                </h2>
                                <span className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold uppercase tracking-widest">Valeur Probante QAPRIL</span>
                            </div>
                            <div className="p-6 space-y-4">
                                {tLease.procedurePhases?.map((phase: { phaseNumber: number, name: string, description: string, createdAt: string | Date }, idx: number) => (
                                    <div key={idx} className="flex space-x-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                                {phase.phaseNumber}
                                            </div>
                                            {idx < (tLease.procedurePhases.length - 1) && <div className="w-0.5 h-full bg-red-200 my-1"></div>}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-sm font-black text-gray-900">{phase.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{phase.description}</p>
                                            <p className="text-[10px] text-gray-400 mt-2 font-mono">Horodatage: {new Date(phase.createdAt).toLocaleString('fr-FR')}</p>
                                        </div>
                                    </div>
                                ))}
                                {tLease.repaymentPlans?.[0] && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <h4 className="text-sm font-bold text-blue-900 mb-2">🤝 Plan de Clémence en cours</h4>
                                        <p className="text-xs text-blue-800">{tLease.repaymentPlans[0].details}</p>
                                        <div className="mt-3 flex items-center space-x-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest border border-blue-200 ${
                                                tLease.repaymentPlans[0].status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                Status: {tLease.repaymentPlans[0].status}
                                            </span>
                                            {tLease.repaymentPlans[0].tenantSignature && (
                                                <span className="text-[10px] text-green-600 font-bold italic">✓ Signé par le locataire</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mediation Section */}
                    {showMediation && (
                        <div className="bg-white shadow rounded-2xl p-6 border border-gray-100">
                            <MediationCenter 
                                leaseId={tLease.id} 
                                userId={userId} 
                                initialMediation={tLease.mediation} 
                            />
                        </div>
                    )}

                    {/* EDL Section */}
                    {showEdl && (
                        <div className="bg-white shadow rounded-2xl p-6 border border-gray-100">
                            <EdlManager leaseId={tLease.id} initialEdls={edls} />
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Fiscal Registration Box (M17) */}
                    {fiscalDossier && (
                        <FiscalRegistrationBox 
                            dossier={fiscalDossier as any} 
                            leaseReference={tLease.leaseReference || "N/A"} 
                        />
                    )}

                    {/* Security Pack (Escrow/CDC) */}
                    {(showCdc || showInsurance) && (
                        <div className="bg-white shadow rounded-2xl p-6 border-t-4 border-primary border-x border-b border-gray-100">
                            <h2 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">Pack Sécurité & Preuve</h2>

                            <div className="space-y-4">
                                {showCdc && (
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Caution Sécurisée</p>
                                        {tLease.cdcDeposits?.[0] ? (
                                            <div className="mt-2 text-center py-2">
                                                <p className="text-sm font-black text-green-700">✅ CONSIGNATION CDC</p>
                                                <p className="text-[10px] text-gray-500 font-mono mt-1">Réf: {tLease.cdcDeposits[0].cdcReference || "Paiement en attente"}</p>
                                            </div>
                                        ) : (
                                            <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                                                <p className="text-xs font-bold text-red-600 mb-1">Non sécurisé</p>
                                                <p className="text-[10px] text-red-400 leading-tight">La caution est détenue hors système QAPRIL. Risque de litige élevé.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {showInsurance && (
                                    <div className={`p-5 rounded-2xl border-2 transition-all ${tLease.insurance && tLease.insurance.status === 'ACTIVE' ? 'bg-green-50 border-green-100' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assurance Impayés</p>
                                            {tLease.insurance && tLease.insurance.status === 'ACTIVE' ? (
                                                <span className="text-[10px] bg-green-600 text-white px-3 py-1 rounded-full font-black shadow-sm uppercase tracking-widest">ACTIVE</span>
                                            ) : (
                                                <span className="text-[10px] bg-gray-400 text-white px-3 py-1 rounded-full font-black shadow-sm uppercase tracking-widest">ABSENTE</span>
                                            )}
                                        </div>
                                        {tLease.insurance && tLease.insurance.status === 'ACTIVE' ? (
                                            <div className="mt-2">
                                                <p className="text-md font-black text-gray-900 flex items-center">
                                                    <span className="mr-2">🛡️</span> {tLease.insurance.provider}
                                                </p>
                                                <p className="text-[10px] text-gray-500 mt-2 font-mono italic tracking-tight bg-white/50 px-2 py-1 rounded">Police N°: {tLease.insurance.policyNo}</p>
                                            </div>
                                        ) : (
                                            <div className="mt-2">
                                                <p className="text-xs text-blue-900 font-bold leading-snug">Prenez l&apos;option Assurance QAPRIL pour protéger 100% de vos revenus.</p>
                                                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 uppercase tracking-widest">
                                                    Activer la Protection
                                                </button>
                                                <p className="text-[9px] text-blue-400 text-center mt-3 font-medium uppercase tracking-tighter">Partenariat Strategique RCI</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Procedure Actions Sidebar */}
                    <div className="bg-white shadow rounded-2xl p-6 border border-gray-100 shadow-red-100/50">
                        <LeaseProcedureActions leaseId={leaseId} currentStatus={tLease.status} userId={userId} />
                    </div>
                </div>
            </div>
        </div>
    )
}
