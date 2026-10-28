"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Check, X, ShieldCheck, Zap, HelpCircle, ArrowRight,
  Sparkles, Building2, Users, Briefcase, Award, CreditCard
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export default function TarifsPage() {
  const [annual, setAnnual] = useState(true);

  const PLANS = [
    {
      id: "locataire",
      badge: "Locataires",
      name: "Locataire Sérénité",
      desc: "Idéal pour tous les locataires souhaitant formaliser leur bail et payer sans contrainte.",
      price: "0",
      period: "Gratuit à vie",
      highlight: false,
      accent: "#059669",
      features: [
        "Signature de bail par OTP SMS certifié",
        "Paiement sans surcoût via Wave, Orange, MTN, Moov",
        "Quittances PDF horodatées illimitées avec QR code",
        "Historique de paiement téléchargeable pour dossier visa/banque",
        "Calcul et valorisation de votre Score ICL",
        "Support client 7j/7",
      ],
      notIncluded: [
        "Gestion multi-biens",
        "Exports comptables fiscaux",
        "Garantie contentieux bailleur",
      ],
      ctaText: "Créer mon Espace Locataire",
      ctaLink: "/mon-espace-locataire/login",
    },
    {
      id: "bailleur",
      badge: "Le plus populaire",
      name: "Bailleur Sérénité",
      desc: "Pour les propriétaires gérant de 1 à 20 logements en Côte d'Ivoire ou depuis la diaspora.",
      price: annual ? "2 000" : "2 500",
      period: "XOF / bien / mois",
      note: annual ? "Facturé annuellement (24 000 XOF/an)" : "Sans engagement de durée",
      highlight: true,
      accent: "#F59E0B",
      features: [
        "Premier bien 100 % GRATUIT pour tester",
        "Rédaction et signature de baux certifiés illimités",
        "Encaissement direct Mobile Money (Wave, Orange, MTN, Moov)",
        "Génération et envoi automatique des quittances",
        "Vérification des locataires via le Score ICL",
        "Relances automatiques par SMS & WhatsApp avant impayé",
        "Export des états locatifs certifiés pour la DGI",
        "Assistance juridique litiges locatifs",
      ],
      notIncluded: [
        "Gestion multi-utilisateurs pour collaborateurs d'agence",
      ],
      ctaText: "Commencer avec 1 bien gratuit",
      ctaLink: "/dashboard/login",
    },
    {
      id: "agence",
      badge: "Agences & Cabinets",
      name: "Agence & Mandataire",
      desc: "Conçu pour les administrateurs de biens, agences immobilières agréées et notaires.",
      price: annual ? "24 000" : "29 000",
      period: "XOF / mois (jusqu'à 30 lots)",
      note: "Lots supplémentaires dégressifs à 700 XOF/mois",
      highlight: false,
      accent: "#7C3AED",
      features: [
        "Toutes les fonctionnalités Bailleur Sérénité",
        "Espace multi-gestionnaires avec gestion des droits",
        "Gestion centralisée des mandats de gestion",
        "Personnalisation avec le logo de votre agence",
        "Rapports de gérance mensuels pour chaque propriétaire",
        "Séquestre officiel et comparateur d'état des lieux photo",
        "Accompagnement et formation de votre équipe",
        "Ligne téléphonique prioritaire dédiée",
      ],
      notIncluded: [],
      ctaText: "Ouvrir un compte Agence",
      ctaLink: "/dashboard/login",
    },
  ];

  const MATRIX = [
    { cat: "Général & Accès", rows: [
      { f: "Plateforme web mobile (aucun téléchargement requis)", l: true, b: true, a: true },
      { f: "Archivage sécurisé à vie des contrats", l: true, b: true, a: true },
      { f: "Application de conformité au droit ivoirien", l: true, b: true, a: true },
    ]},
    { cat: "Baux & Signatures", rows: [
      { f: "Signature électronique certifiée par OTP SMS", l: true, b: true, a: true },
      { f: "Scellement cryptographique et QR Code officiel", l: true, b: true, a: true },
      { f: "Modèles personnalisés avec logo d'agence", l: false, b: false, a: true },
    ]},
    { cat: "Paiements & Quittances", rows: [
      { f: "Paiement Wave, Orange Money, MTN MoMo, Moov", l: true, b: true, a: true },
      { f: "Quittances PDF automatiques scellées", l: true, b: true, a: true },
      { f: "Rapprochement bancaire automatisé", l: false, b: true, a: true },
      { f: "Rapports comptables annuels pour la DGI", l: false, b: true, a: true },
    ]},
    { cat: "Intelligence & Sécurité", rows: [
      { f: "Score ICL (Indice de Confiance Locative)", l: "Consultation", b: "Complet", a: "Complet & API" },
      { f: "Relances automatisées WhatsApp & SMS", l: false, b: true, a: true },
      { f: "Comparateur d'État des Lieux numérique (EDL)", l: false, b: true, a: true },
      { f: "Support prioritaire par téléphone", l: false, b: false, a: true },
    ]},
  ];

  const TARIF_FAQS = [
    {
      q: "Y a-t-il des frais cachés ou des commissions sur les loyers ?",
      a: "Non. QAPRIL ne prend aucune commission en pourcentage sur vos loyers. Le locataire paie exactement le montant de son loyer, et le propriétaire souscrit à un abonnement fixe clair sans aucune surprise.",
    },
    {
      q: "Puis-je tester gratuitement avant de m'engager ?",
      a: "Oui, chaque nouveau propriétaire peut enregistrer son premier bien et signer son premier bail à 0 XOF. Vous ne payez que si vous ajoutez d'autres biens et êtes pleinement satisfait du service.",
    },
    {
      q: "Quels sont les moyens de paiement acceptés pour l'abonnement ?",
      a: "Vous pouvez régler votre abonnement via Wave, Orange Money, MTN MoMo, Moov Money ou par carte bancaire (Visa / Mastercard).",
    },
    {
      q: "Puis-je résilier à tout moment ?",
      a: "Oui. Pour la formule mensuelle, la résiliation s'effectue en un clic depuis votre espace sans frais ni préavis. Vos contrats et quittances passés restent accessibles à vie.",
    },
  ];

  return (
    <div className="landing-v2-wrapper font-sans text-ink bg-cream min-h-screen overflow-x-hidden relative">
      <div className="noise-overlay"></div>
      <Header />

      <main className="relative z-10">

        {/* ─── HERO ─── */}
        <section className="relative pt-40 pb-28 overflow-hidden" style={{ background: "var(--ink)" }}>
          <div className="absolute inset-0" aria-hidden style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
          <div className="absolute inset-0 z-0" aria-hidden style={{
            backgroundImage: "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(5,150,105,0.08) 0%, transparent 50%)"
          }} />

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-amber-400" style={{ background: "rgba(245,158,11,0.08)" }}>
                <CreditCard className="w-3.5 h-3.5" />
                Tarification Transparente · 0 Frais Cachés
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8 uppercase">
                Nos Tarifs <br />
                <span style={{ color: "var(--mango)" }}>Simples & Clairs</span>
              </h1>
              <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
                Gratuit pour les locataires. Formules abordables et flexibles pour les propriétaires et professionnels en Côte d&apos;Ivoire.
              </p>

              {/* Monthly / Annual toggle */}
              <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-xl">
                <button
                  onClick={() => setAnnual(false)}
                  className={`px-5 py-2 rounded-full text-xs font-black transition-all ${
                    !annual ? "bg-white text-black shadow-md" : "text-white/70 hover:text-white"
                  }`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setAnnual(true)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black transition-all ${
                    annual ? "bg-[#F59E0B] text-black shadow-md" : "text-white/70 hover:text-white"
                  }`}
                >
                  <span>Annuel</span>
                  <span className="px-2 py-0.5 rounded-full bg-black/20 text-[10px] font-extrabold uppercase">
                    -20%
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── PRICING CARDS ─── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-24">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`rounded-[2.5rem] p-8 sm:p-10 border transition-all flex flex-col justify-between relative ${
                  plan.highlight
                    ? "bg-white border-[#F59E0B] shadow-2xl lg:-translate-y-4 ring-4 ring-[#F59E0B]/10"
                    : "bg-white border-black/8 shadow-md hover:shadow-xl"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#F59E0B] text-black font-black text-[11px] uppercase tracking-widest shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  {!plan.highlight && (
                    <span className="inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-black/5 text-ink/60 mb-4">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-2xl font-black text-ink mb-2">{plan.name}</h3>
                  <p className="text-xs text-ink3 leading-relaxed mb-6">{plan.desc}</p>

                  {/* Price Block */}
                  <div className="py-6 border-y border-black/5 mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-[1000] text-ink tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-xs font-bold text-ink3">
                        {plan.period}
                      </span>
                    </div>
                    {plan.note && (
                      <p className="text-[11px] text-amber-700 font-semibold mt-1">
                        {plan.note}
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-ink">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((nf, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-black/30">
                        <X className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{nf}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={plan.ctaLink}
                  className={`w-full py-4 rounded-2xl text-center font-black text-xs uppercase tracking-wider transition-all shadow-md ${
                    plan.highlight
                      ? "bg-[#F59E0B] hover:bg-[#D97706] text-black hover:scale-105"
                      : "bg-black hover:bg-neutral-800 text-white"
                  }`}
                >
                  {plan.ctaText}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* ─── COMPARATIVE MATRIX ─── */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-black/8 shadow-xl mb-24"
          >
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-black/5 text-ink/60 mb-3">
                Comparatif Exhaustif
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-ink tracking-tight uppercase">
                Grille des fonctionnalités par offre
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-black/10">
                    <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-ink/40 w-1/2">Fonctionnalité</th>
                    <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-emerald-600 text-center">Locataire</th>
                    <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-amber-600 text-center">Bailleur Sérénité</th>
                    <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-purple-600 text-center">Agence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {MATRIX.map((sec, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <tr className="bg-cream/70">
                        <td colSpan={4} className="py-3 px-4 text-xs font-black uppercase tracking-wider text-ink">
                          {sec.cat}
                        </td>
                      </tr>
                      {sec.rows.map((r, rIdx) => (
                        <tr key={rIdx} className="hover:bg-cream/40 transition-colors">
                          <td className="py-3 px-4 text-xs font-semibold text-ink">{r.f}</td>
                          <td className="py-3 px-4 text-center text-xs font-bold">
                            {typeof r.l === "boolean" ? (
                              r.l ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-black/20 mx-auto" />
                            ) : (
                              <span className="text-emerald-700">{r.l}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center text-xs font-bold">
                            {typeof r.b === "boolean" ? (
                              r.b ? <Check className="w-4 h-4 text-amber-600 mx-auto" /> : <X className="w-4 h-4 text-black/20 mx-auto" />
                            ) : (
                              <span className="text-amber-800">{r.b}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center text-xs font-bold">
                            {typeof r.a === "boolean" ? (
                              r.a ? <Check className="w-4 h-4 text-purple-600 mx-auto" /> : <X className="w-4 h-4 text-black/20 mx-auto" />
                            ) : (
                              <span className="text-purple-800">{r.a}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ─── FAQ ─── */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-24"
          >
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-black/5 text-ink/60 mb-3">
                Transparence
              </span>
              <h3 className="text-3xl font-black text-ink tracking-tight uppercase">
                Questions fréquentes sur la facturation
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TARIF_FAQS.map((faq, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 border border-black/8 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <h4 className="font-black text-base text-ink">{faq.q}</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-ink3 leading-relaxed pl-8">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ─── CTA BANNER ─── */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="p-10 sm:p-14 rounded-[2.5rem] text-center relative overflow-hidden"
            style={{ background: "var(--ink)" }}
          >
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                Testez sans aucun risque
              </h3>
              <p className="text-white/60 text-base leading-relaxed">
                Votre premier bien est 100 % gratuit pour toujours. Profitez de toute la puissance de QAPRIL dès aujourd&apos;hui.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/dashboard/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-sm uppercase tracking-wider transition-all shadow-lg hover:scale-105"
                >
                  Ajouter mon premier bien gratuit
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 text-white hover:bg-white/10 font-bold text-sm uppercase tracking-wider transition-all"
                >
                  Contacter un conseiller
                </Link>
              </div>
            </div>
          </motion.div>

        </section>
      </main>

      <Footer />
    </div>
  );
}
