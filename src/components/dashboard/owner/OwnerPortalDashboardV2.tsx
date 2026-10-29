"use client"

import { useMemo, useTransition } from "react"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"
import { 
  Building2, 
  Plus, 
  Receipt, 
  MapPin, 
  ChevronRight, 
  ArrowUpRight, 
  CheckCircle2, 
  Store, 
  ToggleLeft, 
  ToggleRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  UserCheck
} from "lucide-react"
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
          commune: p.commune || p.city || "Abidjan",
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

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Propriétaire";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* ── TOP HEADER / GREETING & QUICK ACTIONS (Apple / FinTech Precision) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.03)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Espace Propriétaire · Gestion Directe
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bonjour, <span className="text-emerald-700">{displayName}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Supervisez votre patrimoine immobilier, vos quittances certifiées et vos flux locatifs en temps réel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link 
            href="/dashboard/leases/new" 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5"
          >
            <Plus size={15} />
            <span>Nouveau Bail</span>
          </Link>
          <Link 
            href="/dashboard/properties/new" 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5"
          >
            <Building2 size={15} className="text-slate-400" />
            <span>Ajouter un Bien</span>
          </Link>
          <Link 
            href="/dashboard/receipts" 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
          >
            <Receipt size={15} className="text-slate-500" />
            <span>Quittances</span>
          </Link>
        </div>
      </div>

      {/* ── STATS CARDS (FinTech High Contrast) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Biens Actifs" 
          value={(aggregates?.activeLeasesCount || 0).toString()} 
          sub={`Taux d'occupation : ${aggregates?.occupancyRate || 0}%`} 
        />
        <StatCard 
          label="Loyer Mensuel Portefeuille" 
          value={`${fmt(aggregates?.totalPortfolioValue || 0)} XOF`} 
          sub="Revenu locatif brut estimé" 
          trend="up" 
        />
        <StatCard 
          label="Alertes & Réclamations" 
          value={(aggregates?.pendingReclamationsCount || 0).toString()} 
          sub={(aggregates?.pendingReclamationsCount || 0) === 0 ? "Tout est à jour" : "Action requise"} 
          trend={(aggregates?.pendingReclamationsCount || 0) > 0 ? "down" : undefined} 
        />
        <StatCard 
          label="Wallet QAPRIL" 
          value={`${fmt(walletBalance)} XOF`} 
          sub="Solde disponible immédiat" 
        />
      </div>

      {/* ── BIFURCATION ETATS : BIENS & DERNIERS FLUX ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BIENS & ETAT LOCATIF */}
        <SectionCard 
          title="Biens & État Locatif" 
          icon={<Building2 size={18} className="text-slate-500" />}
          action={
            <div className="flex items-center gap-3">
              <Link href="/dashboard/properties" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                Voir tout ({entities.flatMap((e: any) => e.unites).length})
              </Link>
            </div>
          }
        >
          <div className="space-y-3">
            {entities.flatMap((e: any) => e.unites).slice(0, 5).map((u: any, i: number) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-white transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 font-bold shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                    <Building2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {u.name || u.label}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="shrink-0" />
                      <span>{u.commune || "Abidjan"}</span>
                      {u.tenantName && u.tenantName !== "Anonyme" && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-600 font-medium">{u.tenantName}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    u.statut === "occupé" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" 
                      : "bg-slate-100 text-slate-600 border border-slate-200/60"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.statut === "occupé" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                    {u.statut === "occupé" ? "Occupé" : "Vacant"}
                  </span>
                  <span className="text-xs font-black text-slate-900 font-mono w-[85px] text-right">
                    {fmt(u.loyer)} <span className="text-[10px] font-normal text-slate-400">XOF</span>
                  </span>
                </div>
              </div>
            ))}

            {entities.length === 0 && (
              <div className="text-xs text-slate-400 py-8 text-center flex flex-col items-center justify-center gap-2">
                <Building2 size={28} className="text-slate-300" />
                <p>Aucun bien rattaché pour le moment.</p>
                <Link href="/dashboard/properties/new" className="text-emerald-600 font-bold hover:underline text-xs">
                  + Ajouter mon premier bien
                </Link>
              </div>
            )}
          </div>
        </SectionCard>

        {/* DERNIERS FLUX VERIFIES */}
        <SectionCard 
          title="Derniers flux vérifiés (Quittances)"
          icon={<Receipt size={18} className="text-slate-500" />}
          action={
            <Link href="/dashboard/receipts" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
              Historique complet <ChevronRight size={13} />
            </Link>
          }
        >
          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <div className="text-xs text-slate-400 py-8 text-center flex flex-col items-center justify-center gap-2">
                <Receipt size={28} className="text-slate-300" />
                <p>Aucun flux récent enregistré.</p>
                <p className="text-[11px] text-slate-400">Les quittances certifiées apparaîtront ici dès encaissement.</p>
              </div>
            ) : (
              recentPayments.slice(0, 5).map((p, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-white transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                      {p.locataire ? p.locataire.charAt(0).toUpperCase() : "L"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {p.locataire || "Locataire"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {p.mois} · Mode : <span className="font-medium text-slate-600">{p.mode || "Mobile Money"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <div className="text-xs font-black text-slate-900 font-mono">
                      {p.montant}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-0.5">
                      <CheckCircle2 size={11} /> {p.statut || "Réglé"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* ── GESTION DE LA MARKETPLACE (Mise en Location Directe) ── */}
      <SectionCard 
        title="Marketplace Locative QAPRIL"
        icon={<Store size={18} className="text-slate-500" />}
        action={
          <span className="text-[11px] font-medium text-slate-500">
            Visibilité publique instantanée
          </span>
        }
      >
        <div className="mb-4 text-xs text-slate-500 font-medium">
          Publiez ou retirez vos logements de la marketplace publique en un clic. Les candidats certifiés ICL peuvent postuler directement.
        </div>

        <div className="overflow-x-auto relative rounded-xl border border-slate-200/70">
          {/* Skeleton Overlay */}
          {isPending && (
            <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-slate-700">Actualisation de la Marketplace...</span>
              </div>
            </div>
          )}

          <table className={`w-full text-left border-collapse min-w-[620px] transition-opacity ${isPending ? 'opacity-40' : ''}`}>
            <thead>
              <tr className="border-b border-slate-200/70 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/70">
                <th className="p-3.5">Bien Immobilier</th>
                <th className="p-3.5">Loyer Demandé</th>
                <th className="p-3.5">État Locatif</th>
                <th className="p-3.5">Visibilité Store</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {entities.flatMap((e: any) => e.unites).map((u: any, i: number) => (
                <tr key={u.id || i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400 shrink-0" />
                      <span>{u.name || u.label}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-black text-slate-800 font-mono">
                    {fmt(u.loyer)} <span className="text-[10px] text-slate-400 font-normal">XOF</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      u.statut === "occupé" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                        : "bg-slate-100 text-slate-600 border border-slate-200/50"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.statut === "occupé" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                      {u.statut === "occupé" ? "Loué" : "Vacant"}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      u.isOnline 
                        ? "bg-purple-50 text-purple-700 border border-purple-200/50" 
                        : "bg-amber-50 text-amber-700 border border-amber-200/50"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isOnline ? "bg-purple-500" : "bg-amber-500"}`}></span>
                      {u.isOnline ? "En Ligne" : "Hors Ligne"}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      disabled={isPending}
                      onClick={() => handleToggleMarketplace(u.id.replace('E-', ''), !u.isOnline, u.name || u.label)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        u.isOnline 
                          ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 hover:-translate-y-0.5" 
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 hover:-translate-y-0.5"
                      }`}
                    >
                      {u.isOnline ? <ToggleRight size={17} className="text-rose-500"/> : <ToggleLeft size={17} className="text-slate-400"/>}
                      {u.isOnline ? "Retirer" : "Publier"}
                    </button>
                  </td>
                </tr>
              ))}
              {entities.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-xs text-slate-400 py-8 text-center">
                    Aucun bien disponible pour la mise en ligne.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── ALERTES & ACTIONS REQUISES ── */}
      <SectionCard 
        title="Alertes & Événements Prioritaires"
        icon={<AlertCircle size={18} className="text-slate-500" />}
        action="Tout marquer comme vu"
      >
         {activeAlerts.length === 0 ? (
           <div className="text-xs text-slate-400 py-6 text-center flex items-center justify-center gap-2">
             <ShieldCheck size={18} className="text-emerald-500" />
             <span>Toutes les formalités, quittances et déclarations sont à jour.</span>
           </div>
         ) : activeAlerts.map((a: any, i: number) => (
           <div key={i} className="flex justify-between items-center p-3 mb-2.5 bg-slate-50/80 border border-slate-100 rounded-xl text-xs">
             <span className="text-slate-700 font-medium flex items-center gap-2">
               <span>{a.icon || "🔔"}</span>
               <span>{a.text}</span>
             </span>
             <Link href="/dashboard/disputes" className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-slate-700 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors inline-block">
               {a.btn || "Traiter"}
             </Link>
           </div>
         ))}
      </SectionCard>

    </div>
  );
}
