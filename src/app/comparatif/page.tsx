"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  Calculator,
  Percent,
  Check,
  X,
  FileText,
  CreditCard,
  Building2,
  HelpCircle
} from "lucide-react";

export default function ComparatifPage() {
  const [nbBiens, setNbBiens] = useState(3);
  const [loyerMoyen, setLoyerMoyen] = useState(250000);

  // Calcul du gain financier annuel par rapport aux agences classiques (10% de frais de gestion)
  const fraisAgenceClassiqueAnnuel = nbBiens * loyerMoyen * 0.10 * 12;
  const coutQaprilAnnuel = 4900 * 12; // Formule Sérénité
  const economieAnnuelle = Math.max(0, fraisAgenceClassiqueAnnuel - coutQaprilAnnuel);
  const heuresGagnees = nbBiens * 4 * 12; // ~4h de gestion par mois par bien

  const CRITERES = [
    {
      titre: "Rédaction et signature du contrat de bail",
      traditionnel: "Papier manuscrit, 2 à 3 semaines d'attente, déplacements fatigants, risque d'erreurs ou de clauses illégales.",
      qapril: "15 minutes chrono sur votre téléphone. Signature par code secret SMS sans se déplacer, 100 % conforme à la loi ivoirienne n° 2019-576.",
      status: "win"
    },
    {
      titre: "Mode d'encaissement des loyers",
      traditionnel: "Paiement en espèces avec risques de vol ou de faux billets, chèques sans provision et allers-retours incessants.",
      qapril: "Paiement direct par Wave, Orange Money, MTN MoMo, Moov ou carte. L'argent arrive directement sur votre compte en sécurité.",
      status: "win"
    },
    {
      titre: "Délivrance des reçus de loyer",
      traditionnel: "Petits carnets achetés au marché ou en librairie, reçus souvent perdus, raturés ou source de contestations.",
      qapril: "Reçu officiel en PDF envoyé instantanément sur le téléphone avec code QR vérifiable par la banque et les impôts.",
      status: "win"
    },
    {
      titre: "Gestion et sécurité de la caution",
      traditionnel: "Caution dépensée par le propriétaire avant le départ du locataire, disputes presque assurées à la remise des clés.",
      qapril: "Caution plafonnée à 2 mois maximum selon la loi. Remboursement rapide sous 48h sans palabre si le logement est propre.",
      status: "win"
    },
    {
      titre: "Choix et sérieux du locataire",
      traditionnel: "Choix au feeling, faux bulletins de salaire, aucun moyen de savoir si le locataire paie vraiment à bonne date.",
      qapril: "Carnet de Confiance (Score ICL) qui vérifie l'historique réel des paiements. Évite 85% des risques d'impayés.",
      status: "win"
    },
    {
      titre: "États des lieux d'entrée et de sortie",
      traditionnel: "Feuille volante écrite à la va-vite sans photos, entraînant des querelles infinies sur les dégradations.",
      qapril: "Constat avec photos nettes sur smartphone. Comparaison visuelle claire entre l'entrée et la sortie sans contestation possible.",
      status: "win"
    },
    {
      titre: "Partage des factures CIE & SODECI",
      traditionnel: "Calculs compliqués sur des bouts de papier, discussions tendues entre voisins de cour, risques de coupure.",
      qapril: "Relevé des compteurs en photo. Calcul automatique au franc près de la part de chacun sur l'avis de loyer.",
      status: "win"
    },
    {
      titre: "Déclarations foncières pour les impôts",
      traditionnel: "Calculs manuels fastidieux en fin d'année, reçus manquants, risques de pénalités avec la DGI.",
      qapril: "Bilan annuel complet et certifié prêt en un clic pour votre déclaration d'impôts fonciers.",
      status: "win"
    },
    {
      titre: "Gestion des maisons à distance (Diaspora)",
      traditionnel: "Dépendance totale envers la famille ou des démarcheurs informels, manque d'informations et loyers non reversés.",
      qapril: "Suivi en direct depuis votre téléphone où que vous soyez dans le monde, alertes automatiques et argent sécurisé.",
      status: "win"
    },
    {
      titre: "Gestion des retards et impayés",
      traditionnel: "Disputes houleuses, déplacements pour réclamer l'argent, procédures judiciaires lentes et coûteuses.",
      qapril: "Rappels polis par SMS/WhatsApp, accord d'entente à l'amiable et mise en demeure officielle prête pour commissaire de justice.",
      status: "win"
    },
    {
      titre: "Frais et commissions de gestion",
      traditionnel: "Agences qui prennent 8 % à 10 % sur chaque loyer chaque mois (ex: 300 000 FCFA par an pour un loyer de 250 000 FCFA).",
      qapril: "Zéro commission en pourcentage sur vos loyers. Votre loyer vous revient à 100 % (1er bien gratuit pour tester).",
      status: "win"
    },
    {
      titre: "Valeur juridique et preuve officielle",
      traditionnel: "Bouts de papier faciles à contester devant la police ou le tribunal, contrats mal ficelés sans protection.",
      qapril: "Contrats signés par SMS avec code secret et reçus officiels infalsifiables, 100 % valables devant la justice ivoirienne.",
      status: "win"
    }
  ];

  return (
    <div className="landing-v2-wrapper font-sans text-ink bg-cream min-h-screen overflow-x-hidden relative">
      <div className="noise-overlay" />
      <Header />

      <main className="relative z-10">
        {/* ─── HERO SECTION ─── */}
        <section
          className="relative pt-40 pb-28 overflow-hidden"
          style={{ background: "var(--ink)" }}
        >
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
              backgroundSize: "60px 60px"
            }}
          />
          <div
            className="absolute inset-0 z-0"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.14) 0%, transparent 65%), radial-gradient(circle at 80% 80%, rgba(239,68,68,0.1) 0%, transparent 55%)"
            }}
          />

          <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 text-[11px] font-black uppercase tracking-[0.3em] mb-8 text-amber-400"
                style={{ background: "rgba(245,158,11,0.08)" }}
              >
                <Scale className="w-3.5 h-3.5" />
                Comparatif Clair · Gestion à l'Ancienne vs QAPRIL
              </span>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8 uppercase">
                Pourquoi Choisir QAPRIL <br />
                <span style={{ color: "var(--mango)" }}>pour vos Locations en Côte d'Ivoire</span>
              </h1>

              <p
                className="text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed mb-10"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Comparez point par point la gestion traditionnelle (papier, déplacements et palabres) avec la gestion simple, rapide et officielle de QAPRIL.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── CALCULATEUR D'ÉCONOMIE & ROI ─── */}
        <section className="py-20 px-6 max-w-5xl mx-auto -mt-14 relative z-20">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706]">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[#D97706] uppercase tracking-wider block">
                  Simulateur de Rentabilité
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Calculez vos économies en passant à QAPRIL
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
              {/* Sliders de simulation */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                    <span>Nombre de biens loués :</span>
                    <span className="text-sm font-black text-[#D97706] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      {nbBiens} {nbBiens > 1 ? "biens" : "bien"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={nbBiens}
                    onChange={(e) => setNbBiens(Number(e.target.value))}
                    className="w-full accent-[#D97706] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                    <span>1 bien</span>
                    <span>10 biens</span>
                    <span>20 biens</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                    <span>Loyer mensuel moyen par bien :</span>
                    <span className="text-sm font-black text-[#D97706] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      {loyerMoyen.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="1500000"
                    step="25000"
                    value={loyerMoyen}
                    onChange={(e) => setLoyerMoyen(Number(e.target.value))}
                    className="w-full accent-[#D97706] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                    <span>50 000 FCFA</span>
                    <span>750 000 FCFA</span>
                    <span>1 500 000 FCFA</span>
                  </div>
                </div>
              </div>

              {/* Résultat visuel */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center shadow-lg">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 block mb-2">
                  Économie Réalisée par An
                </span>
                <div className="text-3xl sm:text-4xl font-[1000] text-white tracking-tight mb-2">
                  +{economieAnnuelle.toLocaleString("fr-FR")} <span className="text-lg text-amber-400">FCFA</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed mb-6">
                  Par rapport aux 10% prélevés par une agence classique, tout en conservant une protection juridique totale.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 text-left">
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-bold">Commission QAPRIL</div>
                    <div className="text-sm font-black text-emerald-400">0% sur le loyer</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-bold">Temps économisé</div>
                    <div className="text-sm font-black text-amber-400">~{heuresGagnees}h / an</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TABLEAU COMPARATIF ANALYTIQUE COMPLET ─── */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#B45309] mb-3 inline-block">
              Grille Comparative 12 Critères
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              La Différence en Détail
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Chaque aspect de votre gestion locative comparé entre la méthode traditionnelle et l'infrastructure QAPRIL.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 bg-white rounded-3xl shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="p-5 text-xs font-black uppercase tracking-wider text-slate-700 w-1/4">
                    Critères Métiers
                  </th>
                  <th className="p-5 text-xs font-black uppercase tracking-wider text-red-600 w-3/8 bg-red-50/40">
                    Gestion Traditionnelle & Manuelle
                  </th>
                  <th className="p-5 text-xs font-black uppercase tracking-wider text-[#B45309] w-3/8 bg-amber-50/50">
                    Infrastructure QAPRIL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {CRITERES.map((c, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-5 font-bold text-slate-900 align-top">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-mono text-[10px] flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <span>{c.titre}</span>
                      </div>
                    </td>

                    <td className="p-5 text-slate-600 leading-relaxed align-top bg-red-50/20">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{c.traditionnel}</span>
                      </div>
                    </td>

                    <td className="p-5 text-slate-900 font-medium leading-relaxed align-top bg-amber-50/30">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" />
                        <span>{c.qapril}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── BANNIÈRE CTA BAS DE PAGE ─── */}
        <section
          className="py-20 px-6 text-center text-white relative overflow-hidden"
          style={{ background: "var(--ink)" }}
        >
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.15) 0%, transparent 70%)"
            }}
          />
          <div className="max-w-3xl mx-auto relative z-10">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-400 mb-4 inline-block">
              Transition Sans Risque
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 uppercase">
              Prêt à passer à une gestion locative professionnelle ?
            </h2>
            <p
              className="text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Testez gratuitement avec votre premier bien et premier bail à 0 FCFA. Sans engagement.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="qp-btn-gold-solid px-8 py-4 rounded-xl text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-500/20"
              >
                Tester Gratuitement <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tarifs"
                className="px-8 py-4 rounded-xl text-sm font-bold text-white border border-white/20 hover:bg-white/10 transition-colors"
              >
                Découvrir Nos Tarifs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
