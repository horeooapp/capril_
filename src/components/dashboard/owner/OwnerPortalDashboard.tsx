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
    <div className="min-h-screen bg-[#F2F5FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#8FA0BC] font-bold uppercase tracking-widest mb-1">Espace Propriétaire</p>
            <h1 className="text-2xl font-black text-[#0D2B6E] uppercase">
              Bonjour, {user?.name?.split(" ")[0] || "Propriétaire"} 👋
            </h1>
            <p className="text-sm text-[#6A7D9E] mt-1">{entities.length} bien(s) · {stats.total} unité(s) locative(s)</p>
          </div>
          <button onClick={() => op("notifs")}
            className="w-10 h-10 rounded-2xl bg-white border border-[#D6DCE8] shadow-sm flex items-center justify-center text-[#0D2B6E] hover:bg-[#EEF2FA] transition-colors relative">
            <Bell size={18} />
            {stats.impayesN > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
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

        {/* KPIs */}
        <section>
          <h2 className="text-xs font-black text-[#6A7D9E] uppercase tracking-[0.15em] mb-4">Indicateurs financiers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Loyers / mois" value={`${fmt(stats.totalLoyers)} F`} icon="💰" color={T.navy} bg={T.navyPale} />
            <StatCard label="Encaissé" value={`${fmt(stats.encaisse)} F`} icon="✅" color={T.green} bg={T.greenPale} />
            <StatCard label="Unités vacantes" value={stats.vacants} icon="🏚" color={stats.vacants > 0 ? T.orange : T.green} bg={stats.vacants > 0 ? T.orangePale : T.greenPale} />
            <StatCard label="Impayés" value={stats.impayesN} icon="⚠️" color={stats.impayesN > 0 ? T.red : T.green} bg={stats.impayesN > 0 ? T.redPale : T.greenPale} />
          </div>
        </section>

        {/* TAUX D'ENCAISSEMENT */}
        <section>
          <div className="bg-white rounded-2xl p-6 border border-[#D6DCE8] shadow-sm">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-xs text-[#6A7D9E] font-bold uppercase tracking-wider">Taux d'encaissement du mois</p>
                <p className="text-3xl font-black text-[#0D2B6E]">{tauxEncaissement}<span className="text-base text-[#6A7D9E]">%</span></p>
              </div>
              <Badge
                label={tauxEncaissement === 100 ? "PARFAIT ✓" : tauxEncaissement >= 80 ? "BON" : "À AMÉLIORER"}
                color="white"
                bg={tauxEncaissement === 100 ? T.green : tauxEncaissement >= 80 ? T.teal : T.orange} />
            </div>
            <div className="h-3 bg-[#F2F5FA] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${tauxEncaissement}%`, background: tauxEncaissement === 100 ? T.green : tauxEncaissement >= 80 ? T.teal : T.orange }} />
            </div>
            <p className="text-xs text-[#6A7D9E] mt-2">{fmt(stats.encaisse)} FCFA encaissés sur {fmt(stats.totalLoyers)} FCFA attendus</p>
          </div>
        </section>

        {/* PATRIMOINE */}
        <section>
          <h2 className="text-xs font-black text-[#6A7D9E] uppercase tracking-[0.15em] mb-4">Mon patrimoine</h2>
          <div className="space-y-3">
            {entities.map((e: any) => {
              const s = entiteStats(e);
              return (
                <div key={e.id}
                  className="bg-white rounded-2xl p-5 border border-[#D6DCE8] shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderLeftWidth: 4, borderLeftColor: s.impayes > 0 ? T.red : T.green }}
                  onClick={() => setSelectedEntite(selectedEntite?.id === e.id ? null : e)}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#EEF2FA] flex items-center justify-center text-2xl flex-shrink-0">{entiteIcon(e.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-black text-[#0D2B6E]">{e.nom}</p>
                      <p className="text-xs text-[#6A7D9E] mb-2">{e.adresse} · {e.commune}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge label={`${s.total} unités`} color={T.grey4} bg={T.grey1} />
                        <Badge label={`${s.occupes} occupés`} color={T.green} bg={T.greenPale} />
                        {s.vacants > 0 && <Badge label={`${s.vacants} vacant(s)`} color={T.orange} bg={T.orangePale} />}
                        {s.impayes > 0 && <Badge label={`${s.impayes} impayé(s)`} color={T.red} bg={T.redPale} />}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-black text-[#0D2B6E]">{fmt(s.loyers)}</p>
                      <p className="text-[9px] text-[#6A7D9E]">FCFA / mois</p>
                    </div>
                    <ChevronRight size={14} className={`text-[#8FA0BC] transition-transform ${selectedEntite?.id === e.id ? "rotate-90" : ""}`} />
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

        {/* MODULES RAPIDES */}
        <section>
          <h2 className="text-xs font-black text-[#6A7D9E] uppercase tracking-[0.15em] mb-4">Outils & gestion</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/dashboard/properties", icon: "🏘️", label: "Biens",        color: T.teal },
              { href: "/dashboard/leases",     icon: "📄", label: "Baux",          color: T.navy },
              { href: "/dashboard/receipts",   icon: "🧾", label: "Quittances",   color: T.green },
              { href: "/dashboard/financial",  icon: "📊", label: "Finances",     color: T.gold },
            ].map((m, i) => (
              <Link key={i} href={m.href}
                className="bg-white border border-[#D6DCE8] rounded-2xl p-4 text-center hover:shadow-md transition-all group block"
                style={{ borderTopWidth: 3, borderTopColor: m.color }}>
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{m.icon}</div>
                <p className="text-xs font-black" style={{ color: m.color }}>{m.label}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* ── SHEETS ── */}
      <Sheet open={sheets.relance} onClose={() => cl("relance")} title="RELANCER LE LOCATAIRE" tc={T.red}>
        <p className="text-sm text-[#2D3F5E] mb-4">Une relance SMS + WhatsApp sera envoyée immédiatement au locataire.</p>
        <button className="w-full bg-[#A00000] text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-900 transition-colors">
          Envoyer la relance
        </button>
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
