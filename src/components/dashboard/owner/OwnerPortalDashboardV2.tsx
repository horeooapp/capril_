"use client"

import { useMemo, useTransition } from "react"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"
import { Bell, Wallet, Building2, ClipboardList, Receipt, MapPin, Scale, ChevronRight, FileSignature, Users, BarChart3, Store, ToggleLeft, ToggleRight } from "lucide-react"
import { toast } from "sonner"
import { togglePropertyMarketplaceStatus } from "@/actions/marketplace-actions"

export function OwnerPortalDashboardV2({ 
  user, 
  properties: initialProperties,
  activeRole,
  aggregates
}: { 
  user: any, 
  properties: any[],
  activeRole?: string,
  aggregates?: any
}) {
  const [isPending, startTransition] = useTransition();
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
      const isOnline = p.annonces?.some((a: any) => a.statut === "ACTIVE") || false;
      acc[key].unites.push({
        ...p, 
        isOnline,
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

  const recentPayments: any[] = useMemo(() => {
    return aggregates?.recentPayments || []
  }, [aggregates]);

  const activeAlerts: any[] = useMemo(() => {
      return aggregates?.alerts || []
  }, [aggregates]);

  const walletBalance = aggregates?.walletBalance || 0;

  const handleToggleMarketplace = (propertyId: string, newState: boolean, name: string) => {
    startTransition(async () => {
      const res = await togglePropertyMarketplaceStatus(propertyId, newState);
      if (res.success) {
        toast.success(newState ? `"${name}" a été publié sur la Marketplace.` : `"${name}" a été retiré de la Marketplace.`);
      } else {
        toast.error(res.error || "Erreur lors de la mise à jour.");
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* STATS RAPIDES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            label="Biens actifs" 
            value={(aggregates?.activeLeasesCount || 0).toString()} 
            sub={`Occupation : ${aggregates?.occupancyRate || 0}%`} 
        />
        <StatCard 
            label="Loyer Mensuel (Portefeuille)" 
            value={`${fmt(aggregates?.totalPortfolioValue || 0)} XOF`} 
            sub="Revenu brut estimé" 
            trend="up" 
        />
        <StatCard 
            label="Alertes actives" 
            value={(aggregates?.pendingReclamationsCount || 0).toString()} 
            sub="Réclamations & Litiges" 
            trend={(aggregates?.pendingReclamationsCount || 0) > 0 ? "down" : undefined} 
        />
        <StatCard 
            label="Wallet QAPRIL" 
            value={`${fmt(walletBalance)} XOF`} 
            sub="Solde disponible" 
        />
      </div>



      {/* BIFURCATION ETATS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard 
          title="Biens & État Locatif" 
          action={
            <div className="flex gap-4">
              <Link href="/dashboard/leases/new" className="text-slate-500 hover:text-slate-900 transition-colors">Bail</Link>
              <Link href="/dashboard/properties/new" className="text-emerald-600 hover:text-emerald-700 transition-colors">Nouveau Bien</Link>
            </div>
          }
        >
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="min-w-[300px]">
              {entities.flatMap((e: any) => e.unites).slice(0, 5).map((u: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 text-[12.5px]">
                  <span className="text-slate-700 font-medium truncate max-w-[55%]">{u.name || u.label}</span>
                  <div className="flex items-center gap-3">
                    <Badge color={u.statut === "occupé" ? "green" : "gray"}>{u.statut === "occupé" ? "ACTIVE" : "VACANT"}</Badge>
                    <span className="font-semibold text-slate-800 w-[70px] text-right">{fmt(u.loyer)} XOF</span>
                  </div>
                </div>
              ))}
              {entities.length === 0 && (
                <div className="text-[12px] text-slate-400 py-4 text-center">Aucun bien rattaché à ce espace.</div>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard 
          title="Derniers flux vérifiés (Quittances)"
          action={<Link href="/dashboard/receipts" className="text-slate-500 hover:text-slate-900 transition-colors">Voir tout</Link>}
        >
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="min-w-[300px]">
              {recentPayments.length === 0 ? (
                <div className="text-[12px] text-slate-400 py-4 text-center">Aucun flux récent enregistré.</div>
              ) : recentPayments.map((p, i) => (
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
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Gestion de la Marketplace (Mise en location)">
        <div className="px-4 pt-1 text-xs font-semibold text-slate-500">Publiez ou retirez vos biens du store locatif public en un clic</div>
        <div className="overflow-x-auto mt-2 relative">
          {/* Skeleton Overlay */}
          {isPending && (
            <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-medium text-slate-600">Mise à jour...</span>
              </div>
            </div>
          )}
          <table className={`w-full text-left border-collapse min-w-[600px] transition-opacity ${isPending ? 'opacity-40' : ''}`}>
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">
                <th className="p-3.5">Bien Immobilier</th>
                <th className="p-3.5">Loyer Demandé</th>
                <th className="p-3.5">Statut Occupation</th>
                <th className="p-3.5">Visibilité Marketplace</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {entities.flatMap((e: any) => e.unites).map((u: any, i: number) => (
                <tr key={u.id || i} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-xs text-slate-900">{u.name || u.label}</td>
                  <td className="p-3.5 font-semibold text-xs text-slate-700">{fmt(u.loyer)} FCFA</td>
                  <td className="p-3.5">
                    <Badge color={u.statut === "occupé" ? "green" : "gray"}>
                      {u.statut === "occupé" ? "Loué" : "Vacant"}
                    </Badge>
                  </td>
                  <td className="p-3.5">
                    <Badge color={u.isOnline ? "purple" : "amber"}>
                      {u.isOnline ? "En Ligne (Store)" : "Hors Ligne"}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      disabled={isPending}
                      onClick={() => handleToggleMarketplace(u.id.replace('E-', ''), !u.isOnline, u.name || u.label)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        u.isOnline 
                          ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200" 
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      }`}
                    >
                      {u.isOnline ? <ToggleRight size={18} className="text-rose-500"/> : <ToggleLeft size={18} className="text-slate-400"/>}
                      {u.isOnline ? "Retirer" : "Mettre en ligne"}
                    </button>
                  </td>
                </tr>
              ))}
              {entities.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-xs text-slate-400 py-6 text-center">Aucun bien disponible pour la mise en ligne.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Alertes & Actions Requises" action="Tout archiver">
         {activeAlerts.length === 0 ? (
           <div className="text-[12px] text-slate-400 py-4 text-center">Aucune alerte en cours.</div>
         ) : activeAlerts.map((a: any, i: number) => (
           <div key={i} className="flex justify-between items-center p-2 mb-2 bg-slate-50 rounded-[7px] text-[12.5px]">
             <span className="text-slate-700 font-medium">{a.icon} {a.text}</span>
             <button className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-medium text-slate-700 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50 transition-colors">
               {a.btn}
             </button>
           </div>
         ))}
      </SectionCard>

    </div>
  );
}
