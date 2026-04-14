"use client"

import { useMemo } from "react"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"
import { Bell, Wallet, Building2, ClipboardList, Receipt, MapPin, Scale, ChevronRight } from "lucide-react"

export function OwnerPortalDashboardV2({ 
  user, 
  properties: initialProperties,
  activeRole
}: { 
  user: any, 
  properties: any[],
  activeRole?: string
}) {
  const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

  const entities = useMemo(() => {
    const grouped = initialProperties.reduce((acc: any, p: any) => {
      const key = `${p.address}-${p.propertyType}`;
      if (!acc[key]) {
        acc[key] = {
          id: `E-${p.id}`, 
          code: p.propertyCode || `ENT-${p.id}`,
          nom: p.name || p.address || "Propriété sans nom", 
          adresse: p.address || "Adresse inconnue", 
          unites: []
        };
      }
      acc[key].unites.push({
        ...p, 
        label: p.name || `Unité ${p.unitNumber || ''}`,
        statut: p.status === "active" ? "occupé" : "vacant",
        paiement: p.leases?.[0]?.statutFiscal === "A_JOUR" ? "À jour" : p.leases?.[0]?.statutFiscal === "EN_RETARD" ? "Impayé" : "—",
        loyer: p.leases?.[0]?.rentAmount || p.declaredRentFcfa || 0,
        tenantName: (((p.leases?.[0]?.tenant?.firstName || '') + " " + (p.leases?.[0]?.tenant?.lastName || '')).trim() || "Anonyme")
      });
      return acc;
    }, {});
    return Object.values(grouped);
  }, [initialProperties]);

  const stats = useMemo(() => {
    const all = entities.flatMap((e: any) => e.unites);
    const totalLoyers = all.filter((u: any) => u.statut === "occupé").reduce((s: number, u: any) => s + u.loyer, 0);
    const encaisse = all.filter((u: any) => u.paiement === "À jour").reduce((s: number, u: any) => s + u.loyer, 0);
    const impayesN = all.filter((u: any) => u.paiement === "Impayé").length;
    const vacants = all.filter((u: any) => u.statut === "vacant").length;
    return { totalLoyers, encaisse, impayesN, vacants, total: all.length, loues: all.length - vacants };
  }, [entities]);

  const recentPayments = useMemo(() => {
    return [
      { locataire: "Coulibaly A.", mois: "Avr 2026", montant: "350 000 ₣", mode: "WAVE", statut: "COMPLET", color: "green" },
      { locataire: "Diallo M.", mois: "Avr 2026", montant: "65 000 ₣", mode: "ORANGE", statut: "COMPLET", color: "green" },
      { locataire: "Koffi R.", mois: "Avr 2026", montant: "40 000 ₣", mode: "SMS", statut: "PARTIEL", color: "blue" },
    ]
  }, []);

  return (
    <div className="space-y-6">
      
      {/* STATS RAPIDES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
            label="Biens totaux" 
            value={stats.total.toString()} 
            sub={`${stats.loues} loués · ${stats.vacants} vacants`} 
        />
        <StatCard 
            label="Loyers du mois (Attendu)" 
            value={`${fmt(stats.totalLoyers)} ₣`} 
            sub={`Encaissé : ${fmt(stats.encaisse)} ₣`} 
            trend={stats.encaisse > 0 ? "up" : undefined} 
        />
        <StatCard 
            label="Impayés actifs" 
            value={stats.impayesN.toString()} 
            sub={stats.impayesN > 0 ? "Retards enregistrés" : "Aucun impayé"} 
            trend={stats.impayesN > 0 ? "down" : undefined} 
        />
        <StatCard 
            label="Wallet QAPRIL" 
            value="845 000 ₣" 
            sub="Solde disponible" 
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
              { label: "Nouveau Bien", icon: <Building2 size={16} />, href: "/dashboard/properties/new" },
              { label: "Générer Bail", icon: <ClipboardList size={16} />, href: "/dashboard/leases/new" },
              { label: "Quittances", icon: <Receipt size={16} />, href: "/dashboard/receipts" },
              { label: "États des lieux", icon: <MapPin size={16} />, href: "/dashboard/inspections" },
              { label: "Procédures", icon: <Scale size={16} />, href: "/dashboard/disputes" },
              { label: "Portefeuille", icon: <Wallet size={16} />, href: "/dashboard/wallet" },
          ].map((action, i) => (
              <Link key={i} href={action.href} className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-[10px] hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-all">
                  {action.icon}
                  <span className="text-[11px] font-semibold tracking-wide text-center">{action.label}</span>
              </Link>
          ))}
      </div>

      {/* BIFURCATION ETATS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <SectionCard title="Biens & État Locatif">
          {entities.flatMap((e: any) => e.unites).slice(0, 5).map((u: any, i: number) => (
            <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 text-[12.5px]">
              <span className="text-slate-700 font-medium truncate max-w-[50%]">{u.name || u.label}</span>
              <div className="flex items-center gap-3">
                <Badge color={u.statut === "occupé" ? "green" : "gray"}>{u.statut === "occupé" ? "ACTIVE" : "VACANT"}</Badge>
                <span className="font-semibold text-slate-800 w-[70px] text-right">{fmt(u.loyer)} ₣</span>
              </div>
            </div>
          ))}
          {entities.length === 0 && (
             <div className="text-[12px] text-slate-400 py-4 text-center">Aucun bien rattaché à ce espace.</div>
          )}
        </SectionCard>

        <SectionCard title="Derniers flux vérifiés (Quittances)">
          {recentPayments.map((p, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-[12.5px]">
              <div>
                <div className="font-medium text-slate-700">{p.locataire}</div>
                <div className="text-[11px] text-slate-400">{p.mois} · Pmt {p.mode}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-800">{p.montant}</div>
                <Badge color={p.color as any}>{p.statut}</Badge>
              </div>
            </div>
          ))}
        </SectionCard>
      </div>

      <SectionCard title="Alertes & Actions Requises" action="Tout archiver">
        {[
          { icon: "🔴", text: "Loyer impayé J+7 — Aucun paiement détecté sur la parcelle A2", btn: "Relancer" },
          { icon: "🟡", text: "Déclaration fiscale — Vos baux arrivent à échéance DGI", btn: "Déclarer" },
          { icon: "🔵", text: "État des lieux de sortie prévu pour le 30 Avril", btn: "Planifier" }
        ].map((a, i) => (
          <div key={i} className="flex justify-between items-center p-2 mb-2 bg-slate-50 rounded-[7px] text-[12.5px]">
            <span className="text-slate-700 font-medium">{a.icon} {a.text}</span>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-[5px] text-[11px] font-semibold text-slate-600 hover:text-sky-600 hover:border-sky-200 transition-colors">
              {a.btn}
            </button>
          </div>
        ))}
      </SectionCard>

    </div>
  );
}
