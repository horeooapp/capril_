"use client";

import { useState } from "react";
import { Bell, AlertTriangle, ChevronRight, ShieldCheck, CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const T = {
  navy: "#0D2B6E", navyPale: "#EEF2FA",
  green: "#1A7A3C", greenPale: "#E8F5EE",
  orange: "#C05B00", orangePale: "#FFF3E0",
  red: "#A00000", redPale: "#FEECEC",
  teal: "#0E7490", tealPale: "#E0F4F9",
  purple: "#5B21B6", purplePale: "#EDE9FE",
  gold: "#C9A84C",
  grey1: "#F2F5FA", grey2: "#D6DCE8", grey3: "#8FA0BC",
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

export default function DashboardLocataireV2({ data, session }: { data: any; session: any }) {
  const [sheets, setSheets] = useState<Record<string, boolean>>({});
  const op = (k: string) => setSheets(s => ({ ...s, [k]: true }));
  const cl = (k: string) => setSheets(s => ({ ...s, [k]: false }));

  const profile = data?.profile;
  const mainBail = data?.bails?.[0];
  const sc = profile?.scoreActuel || 0;
  const scColor = sc >= 850 ? T.green : sc >= 700 ? T.teal : sc >= 550 ? T.orange : T.red;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mesh Background (Admin Style) */}
      <div className="fixed inset-0 bg-mesh -z-20 opacity-70"></div>
      <div className="fixed inset-0 bg-ivory-pattern opacity-30 -z-10 animate-pulse-slow"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12 relative z-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Espace Locataire • Supervision</p>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              Bonjour, {session?.user?.name?.split(" ")[0] || "Locataire"}.
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-3 border-l-2 border-primary pl-4 uppercase tracking-widest">
              Bail {mainBail?.leaseReference || "—"} · {mainBail?.property?.name || "—"}
            </p>
          </div>
          <button onClick={() => op("notifs")}
            className="w-10 h-10 rounded-2xl bg-white border border-[#D6DCE8] shadow-sm flex items-center justify-center text-[#0D2B6E] hover:bg-[#EEF2FA] transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        {/* MODULES EN HAUT */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] px-2">Console & Outils</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { href: "/locataire/leases",   icon: "📄", label: "Mon Bail",      color: T.teal },
              { href: "/locataire/receipts", icon: "🧾", label: "Paiements",     color: T.green },
              { href: "/locataire/utilities",icon: "⚡", label: "CIE / SODECI",  color: T.orange },
              { href: "/locataire/rights",   icon: "⚖️", label: "Mes Droits",    color: T.purple },
              { href: "/locataire/trust",    icon: "🎫", label: "Score ICL",     color: T.gold },
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

        {/* ALERTE IMPAYÉ */}
        {mainBail?.status === "LOYER_IMPAYE" && (
          <div className="bg-[#FEECEC] border border-red-200 rounded-2xl p-5 flex items-start gap-4">
            <AlertTriangle size={20} className="text-[#A00000] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-black text-[#A00000] text-sm mb-1">ALERTE LOYER EN RETARD</h4>
              <p className="text-sm text-[#2D3F5E]">Votre loyer de ce mois n'a pas encore été détecté. Si vous avez déjà payé, soumettez votre preuve.</p>
            </div>
            <Link href="/locataire/leases" className="flex-shrink-0 bg-[#A00000] text-white px-4 py-2 rounded-xl text-xs font-black uppercase">Voir →</Link>
          </div>
        )}        {/* KPIs */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Loyer / mois" value={`${fmt(mainBail?.rentAmount)} F`} icon="💰" color={T.navy} bg={T.navyPale} href="/locataire/leases" />
            <StatCard label="Quittances" value={data?.quittances?.length || 0} icon="🧾" color={T.green} bg={T.greenPale} href="/locataire/receipts" />
            <StatCard label="Score ICL" value={sc} icon="⭐" color={scColor} bg={scColor + "18"} href="/locataire/trust" />
            <StatCard label="Caution" value={data?.caution ? "Séquestrée ✓" : "—"} icon="🔒" color={T.teal} bg={T.tealPale} href="/locataire/leases" />
          </div>
        </section>

        {/* MON LOGEMENT */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">État de l&apos;installation</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Carte logement */}
            <Link href="/locataire/leases" className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all block group">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{mainBail?.property?.name || "Propriété"}</h3>
                  <p className="text-xs font-medium text-gray-400 mt-2 uppercase tracking-widest">{mainBail?.property?.address || "—"}</p>
                </div>
                <Badge label={mainBail?.status || "ACTIF"} color="white" bg={T.teal} />
              </div>
              <div className="flex gap-2 flex-wrap mb-4">
                <Badge label="BAIL CERTIFIÉ" bg={T.navyPale} color={T.navy} size={9} />
                <Badge label={`ÉCHÉANCE J-${data?.nextPaymentInDays ?? "?"}`} bg={T.orangePale} color={T.orange} size={9} />
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 flex justify-between items-center text-xs border border-gray-100">
                <span className="text-gray-400 font-black uppercase tracking-widest">Bailleur / Gestion</span>
                <span className="font-black text-gray-900 uppercase tracking-tighter">
                  {mainBail?.typeGestion === "agreee"
                    ? `Masqué (Agence agréée)`
                    : (mainBail?.bailleurMasque ? "Identité masquée" : mainBail?.landlord?.fullName || "—")}
                </span>
              </div>
              {mainBail?.sha && (
                <div className="mt-3 p-3 rounded-xl" style={{ background: T.greenPale }}>
                  <p className="text-[10px] font-black text-[#1A7A3C] flex items-center gap-1 mb-1"><CheckCircle size={12} /> SHA-256</p>
                  <p className="text-[9px] font-mono text-[#6A7D9E] truncate">{mainBail.sha}</p>
                </div>
              )}
            </Link>

            {/* Prochain paiement */}
            <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary blur-[100px] opacity-20 -mr-32 -mt-32 group-hover:opacity-40 transition-opacity"></div>
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8">Paiement Échéance</h4>
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl font-black flex-shrink-0 border border-white/10 bg-white/5"
                  style={{ color: data?.nextPaymentInDays <= 5 ? T.red : T.teal }}>
                  {data?.nextPaymentInDays ?? "?"}
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tighter uppercase">{data?.nextPaymentInDays <= 5 ? "ALERTE" : "Jours"}</p>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Échéance : {mainBail?.paymentDay || 5} du mois</p>
                  <p className="text-xl font-black text-primary mt-2">{fmt(mainBail?.rentAmount)} FCFA</p>
                </div>
              </div>
              <Link href="/locataire/leases"
                className="w-full block text-center bg-white/10 hover:bg-primary text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 hover:border-transparent transition-all">
                Canaux de Règlement →
              </Link>
            </div>
          </div>
        </section>



        {/* CIE / SODECI PREVIEW */}
        {data?.facturesUtilities?.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-end px-2">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">🔌 Services & Utilités</h2>
              <Link href="/locataire/utilities" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Configuration →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {data.facturesUtilities.slice(0, 3).map((f: any, i: number) => (
                <Link key={i} href="/locataire/utilities" className="bg-white rounded-2xl p-4 border border-[#D6DCE8] shadow-sm hover:shadow-md transition-shadow block">
                  <div className="text-2xl mb-2">{f.typeUtility === "CIE" ? "⚡" : "💧"}</div>
                  <p className="text-xs font-black uppercase" style={{ color: f.typeUtility === "CIE" ? "#F97316" : T.teal }}>{f.typeUtility}</p>
                  <p className="text-lg font-black text-[#0D2B6E] mt-1">{fmt(f.montantTotal)} F</p>
                  <Badge label={f.statut} color={T.green} bg={T.greenPale} size={8} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* DERNIÈRES QUITTANCES */}
        {data?.quittances?.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-end px-2">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Historique des Flux</h2>
              <Link href="/locataire/receipts" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Accéder aux reçus →</Link>
            </div>
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
              {data.quittances.slice(0, 4).map((q: any, i: number) => (
                <Link key={q.id} href="/locataire/receipts" className={`flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors block ${i < data.quittances.slice(0, 4).length - 1 ? "border-b border-[#EEF2F7]" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${q.status === "paid" ? "bg-emerald-50" : "bg-red-50"}`}>
                      {q.status === "paid" ? "🧾" : "⚠️"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-[#0D2B6E] uppercase">{q.periodMonth}</p>
                      <p className="text-[10px] font-mono text-[#6A7D9E]">{q.receiptRef}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#0D2B6E]">{fmt(q.totalAmount)} F</p>
                      <Badge label={q.status === "paid" ? "Payé" : "En attente"}
                        color={q.status === "paid" ? T.green : T.red}
                        bg={q.status === "paid" ? T.greenPale : T.redPale} size={8} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── SHEET NOTIFICATIONS ── */}
      <Sheet open={sheets.notifs} onClose={() => cl("notifs")} title="NOTIFICATIONS" tc={T.navy}>
        <div className="space-y-3">
          {[["SMS", "Alertes loyer & quittances"], ["WhatsApp", "Notifications importantes"], ["Email", "Rapports mensuels"]].map(([l, s], i) => (
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
