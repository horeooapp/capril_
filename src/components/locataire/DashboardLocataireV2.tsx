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
    <div className="min-h-screen bg-[#F2F5FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#8FA0BC] font-bold uppercase tracking-widest mb-1">Espace Locataire</p>
            <h1 className="text-2xl font-black text-[#0D2B6E] uppercase">
              Bonjour, {session?.user?.name?.split(" ")[0] || "Locataire"} 👋
            </h1>
            <p className="text-sm text-[#6A7D9E] mt-1">
              Bail {mainBail?.leaseReference || "—"} · {mainBail?.property?.name || "—"}
            </p>
          </div>
          <button onClick={() => op("notifs")}
            className="w-10 h-10 rounded-2xl bg-white border border-[#D6DCE8] shadow-sm flex items-center justify-center text-[#0D2B6E] hover:bg-[#EEF2FA] transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

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
        )}

        {/* KPIs */}
        <section>
          <h2 className="text-xs font-black text-[#6A7D9E] uppercase tracking-[0.15em] mb-4">Indicateurs clés</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Loyer / mois" value={`${fmt(mainBail?.rentAmount)} F`} icon="💰" color={T.navy} bg={T.navyPale} href="/locataire/leases" />
            <StatCard label="Quittances" value={data?.quittances?.length || 0} icon="🧾" color={T.green} bg={T.greenPale} href="/locataire/receipts" />
            <StatCard label="Score ICL" value={sc} icon="⭐" color={scColor} bg={scColor + "18"} />
            <StatCard label="Caution" value={data?.caution ? "Séquestrée ✓" : "—"} icon="🔒" color={T.teal} bg={T.tealPale} />
          </div>
        </section>

        {/* MON LOGEMENT */}
        <section>
          <h2 className="text-xs font-black text-[#6A7D9E] uppercase tracking-[0.15em] mb-4">Mon installation</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Carte logement */}
            <Link href="/locataire/leases" className="bg-white rounded-2xl p-6 border border-[#D6DCE8] shadow-sm hover:shadow-md transition-shadow block">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-black text-[#0D2B6E]">{mainBail?.property?.name || "Propriété"}</h3>
                  <p className="text-xs text-[#6A7D9E] mt-1">{mainBail?.property?.address || "—"}</p>
                </div>
                <Badge label={mainBail?.status || "ACTIF"} color={T.teal} bg={T.tealPale} />
              </div>
              <div className="flex gap-2 flex-wrap mb-4">
                <Badge label="BAIL CERTIFIÉ" bg={T.navyPale} color={T.navy} size={9} />
                <Badge label={`ÉCHÉANCE J-${data?.nextPaymentInDays ?? "?"}`} bg={T.orangePale} color={T.orange} size={9} />
              </div>
              <div className="bg-[#F2F5FA] rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="text-[#6A7D9E] font-medium">Bailleur / Gestion</span>
                <span className="font-black text-[#2D3F5E]">
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
            <div className="bg-white rounded-2xl p-6 border border-[#D6DCE8] shadow-sm">
              <h4 className="text-xs font-black text-[#6A7D9E] uppercase tracking-widest mb-4">Prochain paiement</h4>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0"
                  style={{ background: (data?.nextPaymentInDays <= 5 ? T.red : T.teal) + "20", color: data?.nextPaymentInDays <= 5 ? T.red : T.teal }}>
                  {data?.nextPaymentInDays ?? "?"}
                </div>
                <div>
                  <p className="text-2xl font-black text-[#0D2B6E]">{data?.nextPaymentInDays <= 5 ? "URGENT" : "jours"}</p>
                  <p className="text-xs text-[#6A7D9E] mt-1">Loyer dû le {mainBail?.paymentDay || 5} du mois</p>
                  <p className="text-sm font-black text-[#0D2B6E] mt-1">{fmt(mainBail?.rentAmount)} FCFA</p>
                </div>
              </div>
              <Link href="/locataire/leases"
                className="w-full block text-center bg-[#0D2B6E] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#071A45] transition-colors">
                Accéder aux canaux de paiement →
              </Link>
            </div>
          </div>
        </section>

        {/* MODULES RAPIDES */}
        <section>
          <h2 className="text-xs font-black text-[#6A7D9E] uppercase tracking-[0.15em] mb-4">Mes modules</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { href: "/locataire/leases",   icon: "📄", label: "Mon Bail",     sub: "Contrat & certif.",  color: T.teal },
              { href: "/locataire/receipts", icon: "🧾", label: "Paiements",    sub: "Quittances",          color: T.green },
              { href: "/locataire/utilities",icon: "⚡", label: "CIE / SODECI", sub: "Charges",             color: T.orange },
              { href: "/locataire/rights",   icon: "⚖️", label: "Mes Droits",   sub: "RCL, MRL, Préavis",  color: T.purple },
              { href: "/locataire/trust",    icon: "🎫", label: "Mon Score ICL",sub: "Passeport locatif",  color: T.gold },
            ].map((m, i) => (
              <Link key={i} href={m.href}
                className="bg-white border border-[#D6DCE8] rounded-2xl p-4 text-center hover:shadow-md transition-all group block"
                style={{ borderTopWidth: 3, borderTopColor: m.color }}>
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{m.icon}</div>
                <p className="text-xs font-black" style={{ color: m.color }}>{m.label}</p>
                <p className="text-[9px] text-[#8FA0BC] font-medium mt-0.5 hidden sm:block">{m.sub}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* CIE / SODECI PREVIEW */}
        {data?.facturesUtilities?.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-black text-[#6A7D9E] uppercase tracking-[0.15em]">🔌 CIE / SODECI</h2>
              <Link href="/locataire/utilities" className="text-xs font-black text-[#0E7490] uppercase tracking-widest">Tout voir →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.facturesUtilities.slice(0, 3).map((f: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-[#D6DCE8] shadow-sm">
                  <div className="text-2xl mb-2">{f.typeUtility === "CIE" ? "⚡" : "💧"}</div>
                  <p className="text-xs font-black uppercase" style={{ color: f.typeUtility === "CIE" ? "#F97316" : T.teal }}>{f.typeUtility}</p>
                  <p className="text-lg font-black text-[#0D2B6E] mt-1">{fmt(f.montantTotal)} F</p>
                  <Badge label={f.statut} color={T.green} bg={T.greenPale} size={8} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DERNIÈRES QUITTANCES */}
        {data?.quittances?.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-black text-[#6A7D9E] uppercase tracking-[0.15em]">Derniers paiements</h2>
              <Link href="/locataire/receipts" className="text-xs font-black text-[#1A7A3C] uppercase tracking-widest">Tout voir →</Link>
            </div>
            <div className="bg-white rounded-2xl border border-[#D6DCE8] shadow-sm overflow-hidden">
              {data.quittances.slice(0, 4).map((q: any, i: number) => (
                <div key={q.id} className={`flex items-center gap-4 px-5 py-3 ${i < data.quittances.slice(0, 4).length - 1 ? "border-b border-[#EEF2F7]" : ""}`}>
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
