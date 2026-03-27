"use client"

import { useState, useMemo } from "react"
import { Bell, AlertTriangle, ChevronRight, TrendingUp, CheckCircle, X } from "lucide-react"
import Link from "next/link"

const T = {
  navy: "#0D2B6E", navyPale: "#EEF2FA",
  green: "#1A7A3C", greenLight: "#22A050", greenPale: "#E8F5EE",
  orange: "#C05B00", orangePale: "#FFF3E0",
  red: "#A00000", redPale: "#FEECEC",
  teal: "#0E7490", tealPale: "#E0F4F9",
  gold: "#C9A84C", goldPale: "#FDF6E3",
  grey1: "#F2F5FA", grey2: "#D6DCE8", grey3: "#8FA0BC", grey4: "#4A5B7A",
  textMid: "#2D3F5E", textLight: "#6A7D9E",
};

const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

const Badge = ({ label, color, bg, size = 10 }: any) => (
  <span className="inline-flex items-center rounded-md font-bold whitespace-nowrap px-2 py-0.5"
    style={{ background: bg, color, fontSize: size }}>{label}</span>
);

const StatCard = ({ label, value, icon, color, bg, href }: any) => {
  const inner = (
    <div className={`rounded-2xl p-4 border flex flex-col gap-1 h-full ${href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}`}
      style={{ background: bg || T.grey1, borderColor: (color || T.grey2) + "40" }}>
      <div className="text-2xl">{icon}</div>
      <div className="text-xl font-black" style={{ color: color || T.navy }}>{value}</div>
      <div className="text-[10px] font-bold text-[#6A7D9E] uppercase tracking-wider">{label}</div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>;
};

const Sheet = ({ open, onClose, title, tc, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] p-6 z-10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: tc || T.navy }}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export function OwnerPortalDashboard({ user, properties: initialProperties }: { user: any, properties: any[] }) {
  const [sheets, setSheets] = useState<Record<string, boolean>>({});
  const [selectedEntite, setSelectedEntite] = useState<any>(null);
  const [selectedUnite, setSelectedUnite] = useState<any>(null);

  const op = (k: string) => setSheets(s => ({ ...s, [k]: true }));
  const cl = (k: string) => setSheets(s => ({ ...s, [k]: false }));

  const entities = useMemo(() => {
    const grouped = initialProperties.reduce((acc: any, p: any) => {
      const key = p.address;
      if (!acc[key]) {
        acc[key] = {
          id: `E-${p.id}`, code: p.propertyCode || `IMM-${p.id}`,
          nom: p.name || p.address, adresse: p.address, commune: p.commune,
          type: p.propertyType === "building" ? "immeuble" : p.propertyType === "court" ? "cour" : "standalone",
          unites: []
        };
      }
      acc[key].unites.push({
        ...p, label: p.name || "Unité",
        statut: p.status === "active" ? "occupé" : "vacant",
        paiement: p.leases?.[0]?.statutFiscal === "A_JOUR" ? "À jour" : p.leases?.[0]?.statutFiscal === "EN_RETARD" ? "Impayé" : "—",
        loyer: p.leases?.[0]?.rentAmount || p.declaredRentFcfa || 0,
        locataire: p.leases?.[0]?.tenant?.fullName || p.leases?.[0]?.tenant?.name
      });
      return acc;
    }, {});
    return Object.values(grouped).map((e: any) => {
      if (e.unites.length > 1 && e.type === "standalone") e.type = "immeuble";
      return e;
    });
  }, [initialProperties]);

  const stats = useMemo(() => {
    const all = entities.flatMap((e: any) => e.unites);
    const totalLoyers = all.filter((u: any) => u.statut === "occupé").reduce((s: number, u: any) => s + u.loyer, 0);
    const encaisse = all.filter((u: any) => u.paiement === "À jour").reduce((s: number, u: any) => s + u.loyer, 0);
    const impayesN = all.filter((u: any) => u.paiement === "Impayé").length;
    const vacants = all.filter((u: any) => u.statut === "vacant").length;
    return { totalLoyers, encaisse, impayesN, vacants, total: all.length };
  }, [entities]);

  const entiteStats = (e: any) => {
    const us = e.unites || [];
    return {
      total: us.length,
      occupes: us.filter((u: any) => u.statut === "occupé").length,
      vacants: us.filter((u: any) => u.statut === "vacant").length,
      impayes: us.filter((u: any) => u.paiement === "Impayé").length,
      loyers: us.reduce((s: number, u: any) => s + u.loyer, 0)
    };
  };

  const entiteIcon = (type: string) => type === "immeuble" ? "🏢" : type === "cour" ? "🏡" : "🏠";
  const tauxEncaissement = stats.totalLoyers > 0 ? Math.round((stats.encaisse / stats.totalLoyers) * 100) : 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mesh Background (Admin Style) */}
      <div className="fixed inset-0 bg-mesh -z-20 opacity-70"></div>
      <div className="fixed inset-0 bg-ivory-pattern opacity-30 -z-10 animate-pulse-slow"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 relative z-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Espace Propriétaire • Supervision</p>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              Bonjour, {user?.name?.split(" ")[0] || "Propriétaire"}.
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-3 border-l-2 border-primary pl-4 uppercase tracking-widest">
              {entities.length} bien(s) • {stats.total} unité(s) locative(s)
            </p>
          </div>
          <button onClick={() => op("notifs")}
            className="w-12 h-12 rounded-[1.25rem] bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-all relative group">
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            {stats.impayesN > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />}
          </button>
        </div>

        {/* ALERTE IMPAYÉS */}
        {stats.impayesN > 0 && (
          <div className="bg-[#FEECEC] border border-red-200 rounded-2xl p-5 flex items-start gap-4">
            <AlertTriangle size={20} className="text-[#A00000] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-black text-[#A00000] text-sm mb-1">{stats.impayesN} LOYER(S) EN RETARD</h4>
              <p className="text-sm text-[#2D3F5E]">Des locataires n'ont pas encore réglé leur loyer. Consultez le patrimoine ci-dessous pour relancer.</p>
            </div>
          </div>
        )}

        {/* MODULES EN HAUT */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] px-2 text-center">Outils de Pilotage</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { href: "/dashboard/properties", icon: "🏘️", label: "Biens",        color: T.teal },
              { href: "/dashboard/leases",     icon: "📄", label: "Baux",          color: T.navy },
              { href: "/dashboard/receipts",   icon: "🧾", label: "Quittances",   color: T.green },
              { href: "/dashboard/financial",  icon: "📊", label: "Finances",     color: T.gold },
            ].map((m, i) => (
              <Link key={i} href={m.href}
                className="glass-card-premium p-6 text-center group block border-t-4"
                style={{ borderTopColor: m.color }}>
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-500">{m.icon}</div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: m.color }}>{m.label}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* TAUX D'ENCAISSEMENT PROMINENT */}
        <section className="max-w-4xl mx-auto w-full">
          <Link href="/dashboard/financial" className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all block group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary blur-[100px] opacity-10 -mr-32 -mt-32 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Indice de Collection Mensuel</p>
                  <p className="text-5xl font-black text-gray-900 tracking-tighter leading-none italic">{tauxEncaissement}<span className="text-xl text-gray-400 font-bold not-italic ml-1">%</span></p>
                </div>
                <Badge
                  label={tauxEncaissement === 100 ? "PARFAIT ✓" : tauxEncaissement >= 80 ? "CONFORME" : "VIGILANCE"}
                  color="white"
                  bg={tauxEncaissement === 100 ? T.green : tauxEncaissement >= 80 ? T.teal : T.orange} />
              </div>
              <div className="h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${tauxEncaissement}%`, background: tauxEncaissement === 100 ? T.green : tauxEncaissement >= 80 ? T.teal : T.orange }} />
              </div>
              <p className="text-[11px] font-bold text-gray-400 mt-6 uppercase tracking-widest">{fmt(stats.encaisse)} FCFA encaissés • Objectif {fmt(stats.totalLoyers)} FCFA</p>
            </div>
          </Link>
        </section>

        {/* KPIs */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">Indicateurs financiers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <StatCard label="Loyers / mois" value={`${fmt(stats.totalLoyers)} F`} icon="💰" color={T.navy} bg={T.navyPale} href="/dashboard/financial" />
            <StatCard label="Encaissé" value={`${fmt(stats.encaisse)} F`} icon="✅" color={T.green} bg={T.greenPale} href="/dashboard/financial" />
            <StatCard label="Unités vacantes" value={stats.vacants} icon="🏚" color={stats.vacants > 0 ? T.orange : T.green} bg={stats.vacants > 0 ? T.orangePale : T.greenPale} href="/dashboard/properties" />
            <StatCard label="Impayés" value={stats.impayesN} icon="⚠️" color={stats.impayesN > 0 ? T.red : T.green} bg={stats.impayesN > 0 ? T.redPale : T.greenPale} href="/dashboard/leases" />
          </div>
        </section>


        {/* PATRIMOINE */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">Mon patrimoine</h2>
          <div className="space-y-4">
            {entities.map((e: any) => {
              const s = entiteStats(e);
              return (
                <div key={e.id}
                  className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl cursor-pointer hover:shadow-2xl transition-all group"
                  style={{ borderLeftWidth: 8, borderLeftColor: s.impayes > 0 ? T.red : T.green }}
                  onClick={() => setSelectedEntite(selectedEntite?.id === e.id ? null : e)}>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-white transition-colors">{entiteIcon(e.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-black text-gray-900 tracking-tighter uppercase">{e.nom}</p>
                      <p className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">{e.adresse} · {e.commune}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge label={`${s.total} unités`} color="white" bg={T.navy} />
                        <Badge label={`${s.occupes} occupés`} color="white" bg={T.green} />
                        {s.vacants > 0 && <Badge label={`${s.vacants} vacant(s)`} color="white" bg={T.orange} />}
                        {s.impayes > 0 && <Badge label={`${s.impayes} impayé(s)`} color="white" bg={T.red} />}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-black text-gray-900 tracking-tighter">{fmt(s.loyers)}</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">FCFA / mois</p>
                    </div>
                    <ChevronRight size={18} className={`text-gray-300 transition-transform ${selectedEntite?.id === e.id ? "rotate-90" : ""}`} />
                  </div>

                  {/* Unités expandables */}
                  {selectedEntite?.id === e.id && (
                    <div className="mt-4 pt-4 border-t border-[#EEF2F7] space-y-2">
                      {e.unites.map((u: any) => (
                        <div key={u.id} className="flex items-center gap-3 p-3 bg-[#F2F5FA] rounded-xl"
                          style={{ borderLeft: `3px solid ${u.paiement === "Impayé" ? T.red : u.statut === "vacant" ? T.grey3 : T.green}` }}>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-[#0D2B6E]">{u.name || u.label}</p>
                            <p className="text-xs text-[#6A7D9E]">{u.locataire || "Vacant"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-[#0D2B6E]">{fmt(u.loyer)} F</p>
                            <Badge
                              label={u.paiement === "Impayé" ? "Impayé" : u.statut === "vacant" ? "Vacant" : "À jour"}
                              color={u.paiement === "Impayé" ? T.red : u.statut === "vacant" ? T.grey4 : T.green}
                              bg={u.paiement === "Impayé" ? T.redPale : u.statut === "vacant" ? T.grey1 : T.greenPale}
                              size={8} />
                          </div>
                          {u.paiement === "Impayé" && (
                            <button onClick={e => { e.stopPropagation(); op("relance"); }}
                              className="ml-2 bg-[#FEECEC] text-[#A00000] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">
                              Relancer
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {entities.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-[#D6DCE8]">
                <p className="text-3xl mb-2">🏠</p>
                <p className="text-sm font-medium text-[#6A7D9E]">Aucun bien enregistré.</p>
                <Link href="/dashboard/properties/new" className="mt-4 inline-block bg-[#0D2B6E] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#071A45] transition-colors">
                  Ajouter un bien →
                </Link>
              </div>
            )}
          </div>
        </section>


      </div>

      {/* ── SHEETS ── */}
      
      {/* LEVEL 2 : FICHE ENTITÉ (SPEC-UI-4.1) */}
      <Sheet open={!!selectedEntite} onClose={() => setSelectedEntite(null)} title={`Fiche ${selectedEntite?.type}`} tc={T.navy}>
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 italic">
            <p className="text-lg font-black text-gray-900 mb-1">{selectedEntite?.nom}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{selectedEntite?.adresse} · {selectedEntite?.commune}</p>
          </div>
          
          <SecTitle label="Unités du patrimoine" />
          <div className="space-y-3">
            {selectedEntite?.unites.map((u: any) => (
              <div key={u.id} className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-gray-50 group"
                onClick={() => setSelectedUnite(u)}>
                <div>
                  <p className="text-sm font-bold text-navy">{u.name || u.label}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{u.locataire || "— Vacant —"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={`${fmt(u.loyer)} F`} color="white" bg={T.navy} size={8} />
                  <ChevronRight size={14} className="text-gray-200 group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button 
              onClick={() => op("removeEntite")}
              className="w-full bg-red-50 text-red-600 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors">
              Retirer cette entité du portefeuille
            </button>
          </div>
        </div>
      </Sheet>

      {/* LEVEL 3 : FICHE UNITÉ (SPEC-UI-4.5) */}
      <Sheet open={!!selectedUnite} onClose={() => setSelectedUnite(null)} title="Détail de l'unité" tc={T.teal}>
        <div className="space-y-8">
          <div className="flex items-center gap-4 bg-teal-50 p-6 rounded-[2rem]">
            <div className="text-3xl">🔑</div>
            <div>
              <p className="text-lg font-black text-teal-900">{selectedUnite?.name || selectedUnite?.label}</p>
              <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Réf: {selectedUnite?.propertyCode}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-5 rounded-2xl">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Statut Occupation</p>
              <Badge label={selectedUnite?.statut?.toUpperCase()} color="white" bg={selectedUnite?.statut === "occupé" ? T.green : T.orange} />
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Statut Paiement</p>
              <Badge label={selectedUnite?.paiement?.toUpperCase()} color="white" bg={selectedUnite?.paiement === "À jour" ? T.green : T.red} />
            </div>
          </div>

          <div className="space-y-4">
            <SecTitle label="Actions disponibles" />
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white border border-gray-100 p-4 rounded-xl text-[10px] font-black uppercase tracking-tight text-navy hover:bg-gray-50">Émettre Quittance</button>
              <button className="bg-white border border-gray-100 p-4 rounded-xl text-[10px] font-black uppercase tracking-tight text-navy hover:bg-gray-50">Renouveler Bail</button>
              <button className="bg-white border border-gray-100 p-4 rounded-xl text-[10px] font-black uppercase tracking-tight text-navy hover:bg-gray-50">Modifier Loyer</button>
              <button 
                onClick={() => op("removeUnite")}
                className="bg-red-50 text-red-600 p-4 rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-red-100">Retirer Unité</button>
            </div>
          </div>
        </div>
      </Sheet>

      {/* REMOVAL CONFIRMATION (SPEC-UI-4.3) */}
      <Sheet open={sheets.removeEntite || sheets.removeUnite} onClose={() => { cl("removeEntite"); cl("removeUnite"); }} title="CONFIRMATION DE RETRAIT" tc={T.red}>
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-red-50 p-6 rounded-2xl border border-red-100">
            <AlertTriangle stroke={T.red} size={32} />
            <p className="text-xs font-bold text-red-900 leading-relaxed">
              Ce retrait signifie que vous n'êtes plus propriétaire de ce bien. L'historique sera archivé 10 ans selon les obligations fiscales DGI CI.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notification requise (SMS + WhatsApp)</p>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-[11px] text-gray-600 italic">
                "[QAPRIL] Important : Votre propriétaire a retiré ce bien de son portefeuille. Votre bail reste actif mais la gestion QAPRIL est suspendue pour ce bien."
              </p>
            </div>
          </div>

          <button 
            onClick={() => { alert("Action irréversible : Retrait et Notifications envoyées."); cl("removeEntite"); cl("removeUnite"); setSelectedEntite(null); setSelectedUnite(null); }}
            className="w-full bg-red-600 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-800 transition-colors shadow-lg">
            Confirmer + Notifier →
          </button>
        </div>
      </Sheet>

      <Sheet open={sheets.notifs} onClose={() => cl("notifs")} title="NOTIFICATIONS" tc={T.navy}>
        <div className="space-y-3">
          {[["SMS", "Alertes loyer & impayés"], ["WhatsApp", "Notifications urgentes"], ["Email", "Rapports hebdomadaires"]].map(([l, s], i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#F2F5FA] rounded-xl">
              <div>
                <p className="text-sm font-bold text-[#0D2B6E]">{l}</p>
                <p className="text-xs text-[#6A7D9E]">{s}</p>
              </div>
              <div className="w-10 h-6 bg-[#0D2B6E] rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
              </div>
            </div>
          ))}
        </div>
      </Sheet>

    </div>
  );
}
