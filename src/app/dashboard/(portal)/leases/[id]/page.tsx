 
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
import { AlertCircle } from "lucide-react"
import { getLeaseProceduralState } from "@/lib/arrears-engine"
import ArrearsProceduralBox from "@/components/ArrearsProceduralBox"
import CDCRestitutionBox from "@/components/CDCRestitutionBox"
import EdlManager from "@/components/dashboard/edl/EdlManager"
import { getEdlsByLease } from "@/actions/edl-actions"
import ColocDashboardBox from "@/components/dashboard/coloc/ColocDashboardBox"
import { getLeaseColocataires, getMonthlySynthesis } from "@/actions/coloc-actions"
import { toast } from "sonner";
import { InsuranceButton } from "@/components/dashboard/leases/InsuranceButton";

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
        reminders: any[];
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

    // Colocation Data
    const colocataires = await getLeaseColocataires(leaseId)
    const currentMonth = new Date().toISOString().substring(0, 7) // "YYYY-MM"
    const synthesis = await getMonthlySynthesis(leaseId, currentMonth)

    return (
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hybrid Automation: Arrears Procedural Action */}
            {proceduralState.active && (
                <ArrearsProceduralBox leaseId={leaseId} proceduralState={proceduralState} />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-[0_12px_40px_rgba(13,43,110,0.06)] p-6 md:p-8 rounded-[2rem] border border-qgrey-2 gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-qnavy-dark tracking-tighter uppercase">Détails du Bail</h1>
                    <p className="text-sm font-black text-qorange uppercase tracking-widest mt-2">{tLease.leaseReference}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {(tLease.status === "DRAFT" || tLease.status === "PENDING_SIGNATURE" || tLease.status === "PENDING_CONFIRMATION") && (
                        <Link
                            href={`/dashboard/leases/${tLease.id}/edit`}
                            className="inline-flex items-center px-6 py-3 border border-qnavy/20 shadow-sm text-[11px] font-black rounded-xl text-qnavy bg-qnavy-pale hover:bg-qnavy hover:text-white transition-all uppercase tracking-widest"
                        >
                            ✏️ Éditer Intégralement
                        </Link>
                    )}
                    <Link
                        href={`/dashboard/certificates/${tLease.id}`}
                        className="inline-flex items-center px-6 py-3 border border-qgrey-2 shadow-sm text-[11px] font-black rounded-xl text-qnavy-dark bg-white hover:bg-qgrey-1 transition-all uppercase tracking-widest"
                    >
                        📄 Certificat
                    </Link>
                    <GenerateReceiptForm leaseId={tLease.id} monthlyRentFcfa={tLease.rentAmount} />
                </div>
            </div>

            {/* Alerte Signature si PENDING_SIGNATURE */}
            {(tLease.status === "PENDING_SIGNATURE" || tLease.status === "DRAFT") && (
                <div className="p-6 bg-qorange-pale border border-qorange/20 rounded-[2rem] flex flex-col md:flex-row justify-between items-center shadow-lg shadow-qorange/10 animate-pulse gap-6">
                    <div>
                        <h3 className="text-lg font-black text-qorange uppercase tracking-widest flex items-center gap-2"><span>✍️</span> Validation Requise</h3>
                        <p className="text-qorange-dark text-sm font-bold mt-1">Ce contrat global (BDQ/Numérique) est en attente de signature bilatérale.</p>
                    </div>
                    <Link 
                        href={`/dashboard/leases/${tLease.id}/signature`}
                        className="px-8 py-4 bg-qorange text-white font-black rounded-[1.2rem] hover:opacity-90 transition-opacity uppercase tracking-widest text-[11px] shadow-[0_8px_20px_rgba(255,130,0,0.3)] shrink-0"
                    >
                        Accéder à la Signature
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.06)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-qnavy-pale rounded-bl-[100%] z-0"></div>
                        <h2 className="text-xl font-black text-qnavy-dark mb-6 border-b border-qgrey-2 pb-4 flex items-center relative z-10 uppercase tracking-widest">
                            <span className="mr-3 text-qorange">🤝</span> Parties Actives
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-3 bg-background p-6 rounded-3xl border border-qgrey-2">
                                <h3 className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Preneur (Locataire)</h3>
                                <p className="text-xl font-black text-qnavy-dark">{tLease.tenant?.fullName || "Non défini"}</p>
                                <p className="text-[11px] text-qtext-mid font-black px-3 py-1 bg-qgrey-1 rounded-lg inline-block">{tLease.tenant?.email || "En attente d'inscription"}</p>
                                <div className="pt-2">
                                    <ReliabilityBadge score={tLease.tenant?.reliabilityScore || 750} showLabel={true} />
                                </div>
                            </div>
                            {/* Property Details Column */}
                            <div className="space-y-4">
                                {/* Hybrid Automation: CDC Restitution */}
                                {tLease.cdcDeposits?.[0] && (tLease.status === "TERMINATED" || tLease.status === "ACTIVE") && (
                                    <CDCRestitutionBox leaseId={leaseId} deposit={tLease.cdcDeposits[0]} />
                                )}
                                <div className="bg-qnavy-pale p-6 rounded-3xl border border-qnavy/10 h-full">
                                    <h3 className="text-[10px] font-black text-qnavy uppercase tracking-widest mb-3">Bien Immobilier Concédé</h3>
                                    <p className="text-lg font-black text-qnavy-dark leading-tight">{tLease.property.name || tLease.property.address}</p>
                                    <p className="text-sm font-bold text-qtext-mid mt-1">{tLease.property.commune}</p>
                                    <span className="mt-3 inline-block px-3 py-1 bg-white text-qnavy text-[10px] font-black uppercase tracking-widest rounded-md border border-qnavy/20">
                                        Type: {tLease.property.propertyType}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary Section */}
                    <div className="bg-white shadow-[0_12px_40px_rgba(13,43,110,0.06)] rounded-[2rem] p-8 border border-qgrey-2">
                        <h2 className="text-xl font-black text-qnavy-dark mb-6 border-b border-qgrey-2 pb-4 flex items-center uppercase tracking-widest">
                            <span className="mr-3 text-qgreen">💳</span> Bilan Financier
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1.5 p-4 bg-background rounded-2xl border border-qgrey-2">
                                <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Loyer Net</p>
                                <p className="text-2xl font-black text-qnavy-dark italic">{Number(tLease.rentAmount).toLocaleString()} <span className="text-[10px] font-bold text-qtext-mid not-italic">FCFA</span></p>
                            </div>
                            <div className="space-y-1.5 p-4 bg-background rounded-2xl border border-qgrey-2">
                                <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Charges</p>
                                <p className="text-2xl font-black text-qtext-mid italic">{Number(tLease.chargesAmount || 0).toLocaleString()} <span className="text-[10px] font-bold text-qtext-mid not-italic">FCFA</span></p>
                            </div>
                            <div className="space-y-1.5 p-4 bg-background rounded-2xl border border-qgrey-2">
                                <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Caution</p>
                                <p className="text-2xl font-black text-qtext-mid italic">{Number(tLease.depositAmount || 0).toLocaleString()} <span className="text-[10px] font-bold text-qtext-mid not-italic">FCFA</span></p>
                            </div>
                            <div className="space-y-1.5 pt-2">
                                <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-2">Cycle de vie</p>
                                <div>
                                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                        tLease.status === 'ACTIVE' 
                                            ? 'bg-qgreen-pale text-qgreen border-qgreen/20' 
                                            : tLease.status === 'LOYER_IMPAYE' || tLease.status === 'MISE_EN_DEMEURE'
                                                ? 'bg-qred-pale text-qred border-qred/20 animate-pulse'
                                                : 'bg-qorange-pale text-qorange border-qorange/20'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${tLease.status === 'ACTIVE' ? 'bg-qgreen' : 'bg-qred'}`}></span>
                                        {tLease.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Colocation Dashboard */}
                    <div className="mt-8">
                        <ColocDashboardBox leaseId={leaseId} colocataires={colocataires} synthesis={synthesis} />
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

                    {/* Reminders History (M-RECOUVREMENT) */}
                    {tLease.reminders?.length > 0 && (
                        <div className="bg-white shadow rounded-2xl p-6 border border-gray-100 italic">
                            <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center">
                                <span className="mr-2">📢</span> Historique des Relances
                            </h2>
                            <div className="space-y-3">
                                {tLease.reminders.map((rem: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-gray-200 rounded-lg text-gray-600">
                                                <AlertCircle size={14} />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700 uppercase tracking-tighter">{rem.type}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-mono">{new Date(rem.sentAt).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
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
                        <div className="bg-white shadow-[0_12px_40px_rgba(13,43,110,0.06)] rounded-[2rem] p-8 border-t-[6px] border-qnavy border-x border-b border-qgrey-2 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,var(--color-qnavy-pale),transparent_70%)] pointer-events-none"></div>
                            <h2 className="text-[13px] font-black text-qnavy-dark mb-6 uppercase tracking-[0.2em]">Pack Sécurité & Preuve</h2>

                            <div className="space-y-5 relative z-10">
                                {showCdc && (
                                    <div className="p-5 bg-background rounded-[1.5rem] border border-qgrey-2">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Caution Demandée</p>
                                            <span className="text-[12px] font-black text-qnavy-dark">{Number(tLease.depositAmount || 0).toLocaleString()} FCFA</span>
                                        </div>
                                        
                                        {tLease.cdcDeposits?.[0] ? (
                                            <div className="mt-4 text-center py-4 bg-qgreen-pale rounded-xl border border-qgreen/20">
                                                <p className="text-[11px] font-black text-qgreen uppercase tracking-widest flex items-center justify-center gap-2">
                                                    ✓ CAUTION SÉCURISÉE (CDC)
                                                </p>
                                                <p className="text-[9px] text-qgreen-dark font-bold mt-2">Réf: {tLease.cdcDeposits[0].cdcReference || "Traitement..."}</p>
                                            </div>
                                        ) : (
                                            <div className="mt-4 p-5 bg-qred-pale border border-qred/20 rounded-xl flex flex-col items-center shadow-[inset_0_2px_10px_rgba(255,0,0,0.03)]">
                                                <p className="text-[13px] font-black text-qred uppercase tracking-widest mb-1">Non sécurisé</p>
                                                <p className="text-[10px] text-qred font-bold leading-relaxed text-center mb-4 max-w-[200px]">La caution n'a pas été versée numériquement. Risque de litige et perte de preuve.</p>
                                                
                                                <Link 
                                                    href={`/dashboard/payments/simulate?tid=CAUT_${tLease.id}&amount=${tLease.depositAmount}`}
                                                    className="w-full text-center px-4 py-3.5 bg-qred text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-md shadow-qred/30 active:scale-95"
                                                >
                                                    Paiement Caution (Carte/Wave)
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {showInsurance && (
                                    <div className={`p-5 rounded-[1.5rem] border-2 transition-all ${tLease.insurance && tLease.insurance.status === 'ACTIVE' ? 'bg-qgreen-pale border-qgreen/20' : 'bg-[linear-gradient(135deg,var(--color-qnavy-light)_0%,var(--color-qnavy)_100%)] border-qnavy-dark shadow-[0_8px_20px_rgba(13,43,110,0.2)]'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${tLease.insurance && tLease.insurance.status === 'ACTIVE' ? 'text-qgreen-dark' : 'text-white/70'}`}>Assurance Impayés</p>
                                            {tLease.insurance && tLease.insurance.status === 'ACTIVE' ? (
                                                <span className="text-[10px] bg-qgreen text-white px-3 py-1 rounded-full font-black shadow-sm uppercase tracking-widest">ACTIVE</span>
                                            ) : (
                                                <span className="text-[10px] bg-white/20 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest backdrop-blur-sm">ABSENTE</span>
                                            )}
                                        </div>
                                        {tLease.insurance && tLease.insurance.status === 'ACTIVE' ? (
                                            <div className="mt-2">
                                                <p className="text-md font-black text-qgreen-dark flex items-center">
                                                    <span className="mr-2">🛡️</span> {tLease.insurance.provider}
                                                </p>
                                                <p className="text-[10px] text-qgreen mt-2 font-bold uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-lg border border-qgreen/10">Police: {tLease.insurance.policyNo}</p>
                                            </div>
                                        ) : (
                                            <div className="mt-2">
                                                <p className="text-[11px] text-white font-bold leading-relaxed">Couvrez 100% de vos risques locatifs avec QAPRIL Assurance.</p>
                                                <InsuranceButton leaseId={tLease.id} />
                                                <p className="text-[8px] text-white/50 text-center mt-3 font-bold uppercase tracking-[0.2em]">Partenariat National</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Procedure Actions Sidebar */}
                    <div className="bg-white rounded-[2rem] p-6 border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.06)]">
                        <LeaseProcedureActions leaseId={leaseId} currentStatus={tLease.status} />
                    </div>
                </div>
            </div>
        </div>
    )
}
