import { prisma } from "@/lib/prisma";
import { Home, CreditCard, ShieldCheck, Clock } from "lucide-react";
import DeclarationsClientTabs from "./DeclarationsClientTabs";

export const dynamic = "force-dynamic";

export default async function AdminDeclarationsPage() {
    // 1. Fetch baux déclaratifs (IC-01 adoption engine)
    const bauxDeclaratifs = await (prisma as any).bailDeclaratif.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
    }).catch(() => []);

    // 2. Fetch déclarations de paiements hors-plateforme
    const declarationsPaiement = await (prisma as any).declarationPaiement.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
            locataire: { select: { firstName: true, lastName: true, phone: true } },
            bail: { 
                include: { 
                    property: { select: { address: true, propertyCode: true, commune: true } } 
                } 
            }
        }
    }).catch(() => []);

    // 3. Fetch déclarations SMS
    const smsDeclarations = await (prisma as any).smsDeclaration.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
            tenant: { select: { firstName: true, lastName: true, phone: true } },
            lease: { 
                include: { 
                    property: { select: { address: true, propertyCode: true } } 
                } 
            }
        }
    }).catch(() => []);

    // Aggregated KPI numbers
    const totalAll = bauxDeclaratifs.length + declarationsPaiement.length + smsDeclarations.length;
    const pendingBaux = bauxDeclaratifs.filter((b: any) => b.statut === "PENDING_LOCATAIRE").length;
    const pendingPayments = declarationsPaiement.filter((p: any) => p.statut === "DECLARE").length;
    const confirmedPayments = declarationsPaiement.filter((p: any) => p.statut === "CONFIRME").length;
    const confirmedBaux = bauxDeclaratifs.filter((b: any) => b.statut === "CONFIRME").length;

    return (
        <div className="space-y-8 pb-20">
            {/* Entête */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Registre des Déclarations
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Supervision des déclarations locataires de logement, des règlements hors-plateforme et des flux déclaratifs.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-amber-300 text-xs font-bold self-start sm:self-auto">
                    <ShieldCheck size={14} className="text-amber-400" />
                    <span>Moteur d'Adoption Républicain</span>
                </div>
            </div>

            {/* KPI Cards Rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Total Enregistré
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                        {totalAll}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">
                        Logements + Règlements + SMS
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-sm">
                    <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Clock size={12} /> Baux en Attente
                    </div>
                    <div className="text-2xl font-black text-amber-950 font-mono">
                        {pendingBaux}
                    </div>
                    <div className="text-[11px] text-amber-700 mt-1 font-medium">
                        À confirmer par bailleur
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-sm">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CreditCard size={12} /> Paiements Confirmés
                    </div>
                    <div className="text-2xl font-black text-emerald-950 font-mono">
                        {confirmedPayments}
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1 font-medium">
                        Quittances certifiées émises
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Home size={12} /> Baux Convertis
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                        {confirmedBaux}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-medium">
                        Contrats de bail créés
                    </div>
                </div>
            </div>

            {/* Onglets et Tableaux Déclaratifs */}
            <DeclarationsClientTabs
                bauxDeclaratifs={bauxDeclaratifs}
                declarationsPaiement={declarationsPaiement}
                smsDeclarations={smsDeclarations}
            />
        </div>
    );
}
