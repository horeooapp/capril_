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
      traditionnel: "Papier manuscrit, 2 à 3 semaines de délais, déplacements physiques, risque élevé de clauses nulles ou abusives.",
      qapril: "15 minutes chrono en ligne. Signature électronique OTP SMS certifiée, 100 % conforme à la loi ivoirienne n° 2019-576.",
      status: "win"
    },
    {
      titre: "Mode d'encaissement des loyers",
      traditionnel: "Paiement en espèces sans traçabilité, chèques sans provision, manipulations de billets et risques de vol.",
      qapril: "Collecte instantanée par Wave, Orange Money, MTN MoMo, Moov et Carte Bancaire. Rapprochement bancaire sans faille.",
      status: "win"
    },
    {
      titre: "Délivrance des quittances de loyer",
      traditionnel: "Carnets à souche achetés en papeterie, délivrance manuelle différée, pertes de quittances et contestations.",
      qapril: "PDF sécurisé horodaté délivré automatiquement dès encaissement, avec QR Code vérifiable auprès de la DGI et des banques.",
      status: "win"
    },
    {
      titre: "Gestion et séquestre de la caution",
      traditionnel: "Sommes versées directement au propriétaire, souvent dépensées, litiges quasi-systématiques à la sortie.",
      qapril: "Plafonnement légal strict à 2 mois. Séquestre officiel garantissant la restitution immédiate sous 48h.",
      status: "win"
    },
    {
      titre: "Sélection et solvabilité du locataire",
      traditionnel: "Évaluation subjective au feeling, bulletins de salaire facilement falsifiables, aucun historique locatif vérifié.",
      qapril: "Score ICL (Indice de Confiance Locative) algorithmique fondé sur l'historique vérifié. Réduction de 85% du risque d'impayé.",
      status: "win"
    },
    {
      titre: "États des lieux d'entrée et de sortie",
      traditionnel: "Feuilles volantes descriptives succinctes sans photos probantes, sources de désaccords interminables.",
      qapril: "Constat numérique contradictoire avec photos HD horodatées et comparateur visuel automatique entrée/sortie.",
      status: "win"
    },
    {
      titre: "Gestion des charges (CIE & SODECI)",
      traditionnel: "Calculs manuels contestés sur un bout de papier, retards de régularisation, coupures de compteurs collectives.",
      qapril: "Saisie d'index de compteurs divisionnaires, répartition automatique des charges au centime près sur l'avis d'échéance.",
      status: "win"
    },
    {
      titre: "Déclarations fiscales foncières",
      traditionnel: "Calculs complexes en fin d'année, oublis de déclarations, risques de redressement fiscal DGI.",
      qapril: "Bilan fiscal foncier annuel pré-rempli en un clic avec toutes les quittances horodatées conformes.",
      status: "win"
    },
    {
      titre: "Gestion à distance (Diaspora & Bailleurs éloignés)",
      traditionnel: "Dépendance totale envers des proches ou démarcheurs informels, manque d'informations et déconvenues financières.",
      qapril: "Tableau de bord complet en temps réel accessible depuis le monde entier, notifications instantanées et traçabilité.",
      status: "win"
    },
    {
      titre: "Traitement des retards et impayés",
      traditionnel: "Visites houleuses, tensions personnelles, procédures judiciaires d'expulsion lentes (8 à 18 mois).",
      qapril: "Relances préventives automatiques par SMS/WhatsApp, centre de médiation en ligne sous 14 jours et mises en demeure OHADA.",
      status: "win"
    },
    {
      titre: "Modèle de tarification & Commissions",
      traditionnel: "Agences prélevant 8 % à 10 % sur chaque loyer chaque mois à perpétuité (ex: 300 000 FCFA/an sur un loyer de 250 000 FCFA).",
      qapril: "Zéro commission en pourcentage sur vos loyers. Abonnement fixe abordable sans engagement (à partir de 0 FCFA pour tester).",
      status: "win"
    },
    {
      titre: "Valeur juridique probante des actes",
      traditionnel: "Reçus sur papier libre facilement contestables, clauses déclarées nulles par le juge ivoirien.",
      qapril: "Actes scellés par signature électronique qualifiée OTP et empreinte cryptographique SHA-256 pleinement opposables.",
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
                Benchmark Analytique · Méthodes Classiques vs QAPRIL
              </span>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8 uppercase">
                Pourquoi le Marché Ivoirien <br />
                <span style={{ color: "var(--mango)" }}>Migre vers QAPRIL</span>
              </h1>

              <p
                className="text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed mb-10"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Découvrez point par point pourquoi les méthodes manuelles et les agences traditionnelles cèdent la place à l'infrastructure technologique certifiée la plus sécurisée de Côte d'Ivoire.
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
