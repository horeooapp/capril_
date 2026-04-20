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
import { AlertCircle, FileText, Download, Edit3, ShieldAlert, CheckCircle2, ShieldCheck } from "lucide-react"
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
        property?: { name?: string | null; address?: string | null; commune?: string | null; propertyType?: string | null } | null;
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
        <div className="space-y-8 relative">
            {/* Hybrid Automation: Arrears Procedural Action */}
            {proceduralState.active && (
                <ArrearsProceduralBox leaseId={leaseId} proceduralState={proceduralState} />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm p-6 md:p-8 rounded-[20px] border border-slate-200 gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                        <FileText className="text-slate-500" size={32}/> Détails du Bail
                    </h1>
                    <p className="text-sm font-bold text-amber-600 uppercase tracking-widest mt-2">{tLease.leaseReference}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {(tLease.status === "DRAFT" || tLease.status === "PENDING_SIGNATURE" || tLease.status === "PENDING_CONFIRMATION") && (
                        <Link
                            href={`/dashboard/leases/${tLease.id}/edit`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 shadow-sm text-[11px] font-bold rounded-[10px] text-slate-700 bg-white hover:bg-slate-50 transition-all uppercase tracking-widest"
                        >
                            <Edit3 size={16}/> Éditer Intégralement
                        </Link>
                    )}
                    <Link
                        href={`/dashboard/certificates/${tLease.id}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 shadow-sm text-[11px] font-bold rounded-[10px] text-slate-700 bg-white hover:bg-slate-50 transition-all uppercase tracking-widest"
                    >
                        <Download size={16}/> Certificat
                    </Link>
                    <GenerateReceiptForm leaseId={tLease.id} monthlyRentFcfa={tLease.rentAmount} />
                </div>
            </div>

            {/* Alerte Signature si PENDING_SIGNATURE */}
            {(tLease.status === "PENDING_SIGNATURE" || tLease.status === "DRAFT") && (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-[20px] flex flex-col items-start shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-amber-700">
                        <ShieldAlert size={24}/>
                        <div>
                            <h3 className="text-[13px] font-black uppercase tracking-widest">Validation Requise</h3>
                            <p className="text-[12px] font-medium mt-1">Ce contrat global (BDQ/Numérique) est en attente de signature bilatérale.</p>
                        </div>
                    </div>
                    <Link 
                        href={`/dashboard/leases/${tLease.id}/signature`}
                        className="w-full sm:w-auto px-6 py-3 bg-amber-600 text-white font-bold rounded-[10px] hover:bg-amber-700 transition-colors uppercase tracking-widest text-[11px] shadow-sm flex items-center justify-center gap-2"
                    >
                        Accéder à la Signature
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[20px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                        <h2 className="text-lg font-black text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2 uppercase tracking-tight">
                            <span className="text-amber-500">🤝</span> Parties Actives
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-3 bg-slate-50 p-6 rounded-[16px] border border-slate-100">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preneur (Locataire)</h3>
                                <p className="text-[18px] font-black text-slate-900">{tLease.tenant?.fullName || "Non défini"}</p>
                                <p className="text-[12px] text-slate-600 font-medium">{tLease.tenant?.email || "En attente d'inscription"}</p>
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
                                <div className="bg-slate-50 p-6 rounded-[16px] border border-slate-100 h-full">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bien Immobilier Concédé</h3>
                                    <p className="text-[14px] font-black text-slate-900 leading-tight">{tLease.property?.name || tLease.property?.address || "Bien supprimé ou inconnu"}</p>
                                    <p className="text-[13px] font-medium text-slate-500 mt-1">{tLease.property?.commune || "N/A"}</p>
                                    <span className="mt-3 inline-block px-3 py-1 bg-white text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-[6px] border border-slate-200 shadow-sm">
                                        Type: {tLease.property?.propertyType || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary Section */}
                    <div className="bg-white shadow-sm rounded-[20px] p-8 border border-slate-200">
                        <h2 className="text-lg font-black text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2 uppercase tracking-tight">
                            <span className="text-emerald-500">💳</span> Bilan Financier
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-5 bg-slate-50 rounded-[16px] border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Loyer Net</p>
                                <p className="text-xl font-black text-slate-900">{Number(tLease.rentAmount).toLocaleString()} <span className="text-[10px] text-slate-500 font-bold">FCFA</span></p>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-[16px] border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Charges</p>
                                <p className="text-xl font-black text-slate-900">{Number(tLease.chargesAmount || 0).toLocaleString()} <span className="text-[10px] text-slate-500 font-bold">FCFA</span></p>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-[16px] border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Caution</p>
                                <p className="text-xl font-black text-slate-900">{Number(tLease.depositAmount || 0).toLocaleString()} <span className="text-[10px] text-slate-500 font-bold">FCFA</span></p>
                            </div>
                            <div className="p-5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cycle de vie</p>
                                <div>
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-[8px] text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                                        tLease.status === 'ACTIVE' 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                            : tLease.status === 'LOYER_IMPAYE' || tLease.status === 'MISE_EN_DEMEURE'
                                                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${tLease.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
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
                        <div className="bg-white shadow-sm rounded-[20px] overflow-hidden border border-slate-200">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-widest flex items-center">
                                    <span className="mr-2">⚖️</span> Suivi de Quartier
                                </h2>
                                <span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-1 rounded-[6px] font-bold uppercase tracking-widest border border-rose-200">Valeur Probante QAPRIL</span>
                            </div>
                            <div className="p-6 space-y-4">
                                {tLease.procedurePhases?.map((phase: { phaseNumber: number, name: string, description: string, createdAt: string | Date }, idx: number) => (
                                    <div key={idx} className="flex space-x-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-[12px] border border-rose-200">
                                                {phase.phaseNumber}
                                            </div>
                                            {idx < (tLease.procedurePhases.length - 1) && <div className="w-0.5 h-full bg-slate-200 my-1"></div>}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-[13px] font-bold text-slate-900">{phase.name}</p>
                                            <p className="text-[12px] font-medium text-slate-500 mt-1">{phase.description}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-2 font-mono">Horodatage: {new Date(phase.createdAt).toLocaleString('fr-FR')}</p>
                                        </div>
                                    </div>
                                ))}
                                {tLease.repaymentPlans?.[0] && (
                                    <div className="mt-4 p-5 bg-blue-50 border border-blue-100 rounded-[12px]">
                                        <h4 className="text-[12px] font-bold text-blue-900 mb-2">🤝 Plan de Clémence en cours</h4>
                                        <p className="text-[11px] font-medium text-blue-800">{tLease.repaymentPlans[0].details}</p>
                                        <div className="mt-3 flex items-center space-x-4">
                                            <span className={`text-[10px] px-2 py-1 rounded-[6px] font-bold uppercase tracking-widest border ${
                                                tLease.repaymentPlans[0].status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                                            }`}>
                                                Status: {tLease.repaymentPlans[0].status}
                                            </span>
                                            {tLease.repaymentPlans[0].tenantSignature && (
                                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Signé locataire</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mediation Section */}
                    {showMediation && (
                        <div className="bg-white shadow-sm rounded-[20px] p-8 border border-slate-200">
                            <MediationCenter 
                                leaseId={tLease.id} 
                                userId={userId} 
                                initialMediation={tLease.mediation} 
                            />
                        </div>
                    )}

                    {/* EDL Section */}
                    {showEdl && (
                        <div className="bg-white shadow-sm rounded-[20px] p-8 border border-slate-200">
                            <EdlManager leaseId={tLease.id} initialEdls={edls} />
                        </div>
                    )}

                    {/* Reminders History (M-RECOUVREMENT) */}
                    {tLease.reminders?.length > 0 && (
                        <div className="bg-white shadow-sm rounded-[20px] p-8 border border-slate-200">
                            <h2 className="text-[14px] font-black text-slate-900 mb-6 flex items-center uppercase tracking-widest">
                                <span className="mr-2 text-slate-400">📢</span> Historique des Relances
                            </h2>
                            <div className="space-y-3">
                                {tLease.reminders?.map((rem: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-[12px] border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle size={16} className="text-slate-400" />
                                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{rem.type}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-bold font-mono">{new Date(rem.sentAt).toLocaleDateString()}</span>
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
                        <div className="bg-slate-900 rounded-[20px] p-8 shadow-lg relative overflow-hidden text-white border border-slate-800">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><ShieldCheck size={100}/></div>
                            <h2 className="text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-widest">Pack Sécurité & Preuve</h2>

                            <div className="space-y-5 relative z-10">
                                {showCdc && (
                                    <div className="p-5 bg-white/5 rounded-[16px] border border-white/10 backdrop-blur-sm">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Caution</p>
                                            <span className="text-[12px] font-black">{Number(tLease.depositAmount || 0).toLocaleString()} FCFA</span>
                                        </div>
                                        
                                        {tLease.cdcDeposits?.[0] ? (
                                            <div className="mt-4 p-4 bg-emerald-500/20 rounded-[10px] border border-emerald-500/30 text-center">
                                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-2 mb-1">
                                                    <CheckCircle2 size={12}/> Sécurisée (CDC)
                                                </p>
                                                <p className="text-[9px] text-emerald-200 font-mono">Réf: {tLease.cdcDeposits[0].cdcReference || "Traitement..."}</p>
                                            </div>
                                        ) : (
                                            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-[10px]">
                                                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><ShieldAlert size={12}/> Non sécurisé</p>
                                                <p className="text-[10px] text-slate-300 mb-4 text-center">La caution n'est pas versée.</p>
                                                
                                                <Link 
                                                    href={`/dashboard/payments/simulate?tid=CAUT_${tLease.id}&amount=${tLease.depositAmount}`}
                                                    className="block w-full text-center px-4 py-3 bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-[8px] hover:bg-slate-100 transition-colors shadow-sm"
                                                >
                                                    Payer par Carte/Wave
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {showInsurance && (
                                    <div className={`p-5 rounded-[16px] border backdrop-blur-sm ${tLease.insurance && tLease.insurance.status === 'ACTIVE' ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-indigo-900/50 border-indigo-500/30'}`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assurance</p>
                                            {tLease.insurance && tLease.insurance.status === 'ACTIVE' ? (
                                                <span className="text-[9px] bg-emerald-500 text-white px-2 py-1 rounded-[6px] font-bold uppercase tracking-widest">ACTIVE</span>
                                            ) : (
                                                <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-1 rounded-[6px] font-bold uppercase tracking-widest">ABSENTE</span>
                                            )}
                                        </div>
                                        {tLease.insurance && tLease.insurance.status === 'ACTIVE' ? (
                                            <div className="mt-2 text-center">
                                                <p className="text-[12px] font-black text-emerald-400">{tLease.insurance.provider}</p>
                                                <p className="text-[9px] text-emerald-200 mt-2 font-mono">Police: {tLease.insurance.policyNo}</p>
                                            </div>
                                        ) : (
                                            <div className="mt-2">
                                                <InsuranceButton leaseId={tLease.id} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Procedure Actions Sidebar */}
                    <div className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm">
                        <LeaseProcedureActions leaseId={leaseId} currentStatus={tLease.status} />
                    </div>
                </div>
            </div>
        </div>
    )
}
