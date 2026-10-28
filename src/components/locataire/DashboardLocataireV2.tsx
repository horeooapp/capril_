"use client";

import { useState } from "react";
import { Bell, AlertTriangle, Zap, Scale, Award, FileText, Receipt, CheckCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/ui/StatCard";
import { SectionCard } from "@/components/dashboard/ui/SectionCard";
import { Badge } from "@/components/dashboard/ui/Badge";
import NotificationCenter from "@/components/dashboard/NotificationCenter";

const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

export default function DashboardLocataireV2({ data, session }: { data: any; session: any }) {
  const profile = data?.profile;
  const mainBail = data?.bails?.[0];
  const sc = profile?.scoreActuel || 0;

  return (
    <div className="space-y-6">
      {/* HEADER CLARITY */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <p className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-1">Espace Locataire</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Bonjour, {session?.user?.name?.split(" ")[0] || "Locataire"}.
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Bail {mainBail?.leaseReference || "—"} · {mainBail?.property?.name || "—"}
          </p>
        </div>
        <div>
            <NotificationCenter />
        </div>
      </div>

      {/* ALERTE IMPAYÉ */}
      {mainBail?.status === "LOYER_IMPAYE" && (
        <div className="bg-red-50 border border-red-200 rounded-[12px] p-4 flex items-start gap-4">
          <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-700 text-sm mb-1">ALERTE LOYER EN RETARD</h4>
            <p className="text-xs text-red-600/80">Votre loyer de ce mois n'a pas encore été détecté. Si vous avez déjà payé, soumettez votre preuve.</p>
          </div>
          <Link href="/mon-espace-locataire/leases" className="flex-shrink-0 bg-red-600 hover:bg-red-700 transition-colors text-white px-3 py-1.5 rounded-[8px] text-[11px] font-semibold">
            Voir Détails
          </Link>
        </div>
      )}

      {/* STATS RAPIDES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            label="Loyer mensuel" 
            value={`${fmt(mainBail?.rentAmount)} XOF`} 
            sub={`Échéance le ${mainBail?.paymentDay || 5}`} 
        />
        <StatCard 
            label="Quittances disponibles" 
            value={(data?.quittances?.length || 0).toString()} 
            sub="Historique de paiement" 
        />
        <StatCard 
            label="Score de Confiance ICL" 
            value={sc.toString()} 
            sub={sc >= 700 ? "Excellent profil" : "Profil à améliorer"}
            trend={sc >= 700 ? "up" : "down"}
        />
        <StatCard 
            label="Dépôt de garantie" 
            value={data?.caution ? "Séquestré ✓" : "Non défini"} 
            sub="Protégé par QAPRIL" 
        />
      </div>

      {/* ACTIONS RAPIDES (STYLE CLARITY) */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {[
              { label: "Mon Bail", icon: <FileText size={16} />, href: "/mon-espace-locataire/leases" },
              { label: "Paiements", icon: <Receipt size={16} />, href: "/mon-espace-locataire/receipts" },
              { label: "CIE/SODECI", icon: <Zap size={16} />, href: "/mon-espace-locataire/utilities" },
              { label: "Mes Droits", icon: <Scale size={16} />, href: "/mon-espace-locataire/rights" },
              { label: "Score ICL", icon: <Award size={16} />, href: "/mon-espace-locataire/trust" },
          ].map((action, i) => (
              <Link key={i} href={action.href} className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-[10px] hover:border-sky-500 hover:bg-sky-50 text-slate-600 hover:text-sky-700 transition-all">
                  {action.icon}
                  <span className="text-[11px] font-semibold tracking-wide text-center">{action.label}</span>
              </Link>
          ))}
      </div>

      {/* BIFURCATION ETATS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MON LOGEMENT */}
        <SectionCard title="État de l'Installation">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{mainBail?.property?.name || "Propriété"}</h3>
                <p className="text-[12px] font-medium text-slate-500 mt-1">{mainBail?.property?.address || "—"}</p>
              </div>
              <Badge color={mainBail?.status === 'ACTIVE' ? 'green' : 'gray'}>
                  {mainBail?.status || "ACTIF"}
              </Badge>
            </div>
            
            <div className="bg-slate-50 rounded-[8px] p-4 flex justify-between items-center text-[12px] border border-slate-100">
              <span className="text-slate-500 font-medium">Bailleur / Gestionnaire</span>
              <span className="font-semibold text-slate-800">
                {mainBail?.typeGestion === "agreee"
                  ? "Gestion Déléguée (Agence)"
                  : (mainBail?.bailleurMasque ? "Identité masquée" : ((mainBail?.landlord?.firstName || '') + " " + (mainBail?.landlord?.lastName || '')).trim() || "—")}
              </span>
            </div>

            {mainBail?.sha && (
              <div className="bg-emerald-50 rounded-[8px] p-3 border border-emerald-100 flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-600" />
                <div>
                  <p className="text-[11px] font-semibold text-emerald-800">Bail Certifié (Blockchain)</p>
                  <p className="text-[10px] font-mono text-emerald-600/70 truncate w-48 sm:w-full">{mainBail.sha}</p>
                </div>
              </div>
            )}
            
            <div className="pt-2">
                <Link href="/mon-espace-locataire/leases" className="text-[12px] font-semibold text-sky-600 hover:text-sky-700">
                    Voir les détails du contrat →
                </Link>
            </div>
          </div>
        </SectionCard>

        {/* PROCHAIN PAIEMENT & QUITTANCES */}
        <div className="space-y-6">
            <SectionCard title="Échéance en cours">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-[12px] flex flex-col items-center justify-center border ${data?.nextPaymentInDays <= 5 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className="text-2xl font-bold">{data?.nextPaymentInDays ?? "?"}</span>
                    <span className="text-[9px] font-semibold uppercase">{data?.nextPaymentInDays <= 5 ? "Jours !" : "Jours"}</span>
                </div>
                <div>
                  <p className="text-[12px] text-slate-500 font-medium">Loyer à régler avant le {mainBail?.paymentDay || 5}</p>
                  <p className="text-xl font-bold text-slate-800">{fmt(mainBail?.rentAmount)} XOF</p>
                </div>
              </div>
              <div className="mt-4">
                  <Link href="/mon-espace-locataire/leases" className="inline-block bg-slate-900 text-white px-4 py-2 rounded-[8px] text-[11px] font-semibold hover:bg-slate-800 transition-colors">
                      Payer mon loyer
                  </Link>
              </div>
            </SectionCard>

            <SectionCard title="Dernières Quittances" action="Historique complet">
                <div className="-mx-1 px-1">
                {data?.quittances?.length > 0 ? (
                    data.quittances.slice(0, 3).map((q: any, i: number) => (
                    <div key={q.id} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 text-[12.5px]">
                        <div>
                        <div className="font-medium text-slate-700">{q.periodMonth}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{q.receiptRef}</div>
                        </div>
                        <div className="text-right">
                        <div className="font-semibold text-slate-800 mb-1">{fmt(q.totalAmount)} XOF</div>
                        <Badge color={q.status === "paid" ? "green" : "red"}>{q.status === "paid" ? "Payé" : "En attente"}</Badge>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-[12px] text-slate-400 py-4 text-center">Aucune quittance disponible.</div>
                )}
                </div>
            </SectionCard>
        </div>
      </div>
    </div>
  );
}
