"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  FileText,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Check,
  ArrowRight,
  Lock,
  Scale,
  Smartphone,
  Award,
  Zap,
  HelpCircle,
  ChevronDown,
  Building,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Landmark,
  BadgePercent
} from "lucide-react";

export default function PiliersPage() {
  const [activePilier, setActivePilier] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const PILIERS = [
    {
      id: "bail-certifie",
      num: "01",
      icon: <FileText className="w-7 h-7 text-[#D97706]" />,
      badge: "Cadre Juridique & Légal",
      title: "Baux Clairs & Signature par SMS",
      lawRef: "Loi N° 2019-576 & Droit Ivoirien",
      accent: "#D97706",
      summary:
        "Création facile de contrats d'habitation ou de commerce 100 % conformes aux lois ivoiriennes. Signature directe par code SMS sans se déplacer, document sécurisé et reconnu par la justice.",
      points: [
        {
          title: "Contrats conformes à la loi ivoirienne",
          desc: "Toutes les mentions obligatoires sont incluses (noms, désignation des lieux, montant du loyer, charges) pour protéger le propriétaire et le locataire."
        },
        {
          title: "Signature rapide par code secret SMS",
          desc: "Chaque partie reçoit un code unique par SMS sur son téléphone pour signer sans avoir besoin de se déplacer ni d'imprimer du papier."
        },
        {
          title: "Document infalsifiable et sécurisé",
          desc: "Le contrat final est scellé numériquement : personne ne peut modifier une ligne ou une condition en cachette."
        },
        {
          title: "Vos contrats gardés en sécurité à vie",
          desc: "Vos contrats signés restent toujours accessibles sur votre téléphone 24h/24, prêts à être présentés en cas de besoin ou devant les autorités."
        }
      ],
      legalImpact: "Élimine les mauvais contrats rédigés à la main qui causent des palabres inutiles."
    },
    {
      id: "paiement-quittance",
      num: "02",
      icon: <CreditCard className="w-7 h-7 text-[#059669]" />,
      badge: "Paiements & Reçus Officiels",
      title: "Paiement Wave & Mobile Money avec Reçu Officiel",
      lawRef: "Paiements Sécurisés UEMOA & DGI-CI",
      accent: "#059669",
      summary:
        "Paiement facile par Wave, Orange Money, MTN MoMo, Moov Money ou carte bancaire. Délivrance instantanée d'un reçu officiel avec code QR de vérification.",
      points: [
        {
          title: "Paiement sur vos comptes habituels",
          desc: "Le locataire paie son loyer en quelques secondes depuis son compte Wave ou Mobile Money, sans problème de monnaie ni déplacement."
        },
        {
          title: "Reçu officiel envoyé sur-le-champ",
          desc: "Dès que le transfert est validé, le reçu officiel en PDF est généré et envoyé automatiquement par SMS et WhatsApp."
        },
        {
          title: "Code QR vérifiable partout",
          desc: "Chaque reçu possède un code QR que la banque, l'employeur ou les impôts peuvent scanner pour vérifier son authenticité en direct."
        },
        {
          title: "Versement direct au propriétaire",
          desc: "Le compte du propriétaire est crédité directement avec mise à jour automatique des comptes sans calculs manuels."
        }
      ],
      legalImpact: "Fini les disputes sur les dates de versement, les faux reçus et les carnets à souche perdus."
    },
    {
      id: "consignation-cdc",
      num: "03",
      icon: <ShieldCheck className="w-7 h-7 text-[#0284C7]" />,
      badge: "Protection de la Caution",
      title: "Caution Protégée à la Caisse des Dépôts (CDC-CI)",
      lawRef: "Plafonnement légal à 2 mois de loyer",
      accent: "#0284C7",
      summary:
        "Sécurisation de la caution selon la loi ivoirienne (2 mois maximum). L'argent est gardé en lieu sûr et restitué rapidement après l'état des lieux sans palabre.",
      points: [
        {
          title: "Respect de la loi (2 mois maximum)",
          desc: "La caution est strictement limitée à deux mois de loyer comme l'exige la loi en Côte d'Ivoire, évitant les abus à l'entrée."
        },
        {
          title: "Caution mise en sécurité",
          desc: "L'argent de la caution est mis de côté en toute neutralité : le propriétaire est couvert et le locataire est rassuré."
        },
        {
          title: "Remboursement rapide sur Mobile Money",
          desc: "À la fin du bail, si la maison est rendue en bon état, la caution est reversée directement sur le Wave ou Mobile Money du locataire sous 48h."
        },
        {
          title: "Entente claire en cas de réparations",
          desc: "Si une réparation est nécessaire, la retenue se fait sur la base de photos et de devis clairs présentés aux deux parties."
        }
      ],
      legalImpact: "Supprime la première source de disputes locatives en Côte d'Ivoire : le refus injustifié de rembourser la caution de départ."
    },
    {
      id: "score-icl",
      num: "04",
      icon: <TrendingUp className="w-7 h-7 text-[#D97706]" />,
      badge: "Confiance & Réputation",
      title: "Carnet de Confiance Locataire (Score ICL)",
      lawRef: "Conforme ARTCI · Données protégées",
      accent: "#D97706",
      summary:
        "Un carnet de confiance qui récompense les locataires sérieux et aide les propriétaires à choisir de bons locataires en toute sérénité.",
      points: [
        {
          title: "Note claire et transparente",
          desc: "Calculée uniquement sur la ponctualité des loyers et le respect du contrat, sans aucun favoritisme."
        },
        {
          title: "Attestation de bon payeur",
          desc: "Le locataire dispose d'un certificat pour prouver son sérieux et trouver son prochain logement plus facilement."
        },
        {
          title: "Moins de risques d'impayés pour le propriétaire",
          desc: "Les bailleurs choisissent en toute confiance des personnes fiables, évitant les retards de loyer et les expulsions."
        },
        {
          title: "Avantages pour les locataires ponctuels",
          desc: "Ceux qui paient à bonne date bénéficient d'une réputation solide et d'un traitement prioritaire pour se loger."
        }
      ],
      legalImpact: "Installe la confiance mutuelle entre propriétaires et locataires sans discrimination."
    }
  ];

  const FAQS = [
    {
      q: "En quoi la signature par SMS est-elle valable en Côte d'Ivoire ?",
      a: "La loi ivoirienne n° 2019-576 ainsi que les textes de l'ARTCI reconnaissent la pleine valeur juridique des contrats signés par code SMS sécurisé. Le code secret unique envoyé sur le téléphone prouve l'accord du signataire, ce qui rend le contrat totalement valable devant la justice ivoirienne."
    },
    {
      q: "Pourquoi mettre la caution en sécurité plutôt que de la verser directement ?",
      a: "En Côte d'Ivoire, la majorité des disputes viennent des cautions non remboursées au départ du locataire. En sécurisant la caution, le propriétaire sait que l'argent est disponible en cas de dégâts avérés, et le locataire a la certitude de revoir son argent sous 48h si le logement est rendu propre et en bon état."
    },
    {
      q: "Comment fonctionne le Carnet de Confiance (Score ICL) du locataire ?",
      a: "Le carnet mesure uniquement la régularité des paiements à bonne date et le respect des lieux. Aucune information personnelle indiscrète n'est demandée : payer son loyer à temps permet simplement de se bâtir une solide réputation de bon payeur."
    },
    {
      q: "Les reçus délivrés par QAPRIL sont-ils reconnus par les banques et les impôts ?",
      a: "Oui, parfaitement. Chaque reçu comporte les mentions obligatoires de la loi, l'adresse exacte du logement, le détail du loyer et un code QR officiel que les banques, employeurs et services des impôts peuvent scanner directement pour vérification."
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
                "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.14) 0%, transparent 65%), radial-gradient(circle at 80% 80%, rgba(5,150,105,0.1) 0%, transparent 55%)"
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
                <Landmark className="w-3.5 h-3.5" />
                Gestion Locative Moderne · Conforme Loi Ivoirienne
              </span>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8 uppercase">
                Les 4 Piliers Fondateurs <br />
                <span style={{ color: "var(--mango)" }}>de QAPRIL en Côte d'Ivoire</span>
              </h1>

              <p
                className="text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed mb-10"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Conçu dans le strict respect de la Loi N° 2019-576, QAPRIL met à votre disposition quatre solutions simples pour gérer vos locations, payer et encaisser les loyers en toute sécurité, sans palabre.
              </p>

              {/* Raccourcis piliers */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {PILIERS.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePilier(idx)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                      activePilier === idx
                        ? "bg-[#D97706] text-white shadow-lg shadow-amber-500/20 scale-105"
                        : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white border border-white/10"
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-75">
                      P{p.num}
                    </span>
                    <span>{p.title.split("&")[0]}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── DETAIL DES 4 PILIERS INTERACTIF ─── */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Colonne latérale de sélection */}
            <div className="lg:col-span-4 space-y-3 sticky top-28">
              <div className="text-xs font-black uppercase tracking-widest text-[#B45309] mb-4">
                Architecture des Piliers
              </div>

              {PILIERS.map((p, idx) => {
                const isActive = activePilier === idx;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePilier(idx)}
                    className={`w-full p-5 text-left rounded-xl border transition-all flex items-center justify-between group ${
                      isActive
                        ? "bg-white border-[#D97706] shadow-md ring-1 ring-[#D97706]/30"
                        : "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                          isActive
                            ? "bg-amber-100 text-[#B45309]"
                            : "bg-slate-100 text-slate-500 group-hover:text-slate-800"
                        }`}
                      >
                        {p.num}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {p.badge}
                        </div>
                        <div
                          className={`text-sm font-black transition-colors ${
                            isActive ? "text-slate-900" : "text-slate-700"
                          }`}
                        >
                          {p.title}
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isActive
                          ? "text-[#D97706] translate-x-1"
                          : "text-slate-300 group-hover:text-slate-500"
                      }`}
                    />
                  </button>
                );
              })}

              <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200 mt-6">
                <div className="flex items-center gap-2 text-xs font-bold text-[#B45309] uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4" /> Conformité Juridique
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Tous les modules QAPRIL respectent rigoureusement les normes de l'ANAH-CI, de la CDC-CI, de la DGI et de l'ARTCI (protection des données personnelles).
                </p>
              </div>
            </div>

            {/* Panneau de détail du Pilier Actif */}
            <div className="lg:col-span-8">
              {PILIERS.map((p, idx) => {
                if (activePilier !== idx) return null;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                          {p.icon}
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold text-[#D97706] uppercase tracking-widest">
                            PILIER {p.num} · {p.badge}
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            {p.title}
                          </h2>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
                        {p.lawRef}
                      </span>
                    </div>

                    <p className="text-base text-slate-700 leading-relaxed mb-8 font-medium">
                      {p.summary}
                    </p>

                    <div className="space-y-4 mb-10">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                        Fonctionnement & Garanties Technologiques
                      </div>
                      {p.points.map((pt, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all flex items-start gap-4"
                        >
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">
                              {pt.title}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {pt.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Impact juridique encadré */}
                    <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 flex items-start gap-3">
                      <Award className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-[#B45309] mb-1">
                          Impact Opérationnel Garanti
                        </div>
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                          {p.legalImpact}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── TABLEAU DE CONFORMITÉ & TEXTES DE LOIS ─── */}
        <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#B45309] mb-3 inline-block">
              Sécurité Juridique Certifiée
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Alignement Total avec le Droit Positif Ivoirien
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              QAPRIL n'est pas un simple outil informatique, c'est l'infrastructure légale certifiée pour éliminer les risques de nullité procédurale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] mb-5">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">
                Loi N° 2019-576 du 26 juin 2019
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Fixe les règles du bail à usage d'habitation en Côte d'Ivoire. QAPRIL automatise les mentions obligatoires, l'encadrement des dépôts de garantie à 2 mois et les conditions de résiliation.
              </p>
              <div className="text-[11px] font-bold text-[#059669] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Clauses intégrées
              </div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7] mb-5">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">
                Consignation Caisse des Dépôts (CDC-CI)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                La consignation institutionnelle des fonds garantit que les cautions ne sont jamais détournées et demeurent immédiatement liquides pour le remboursement de fin de bail.
              </p>
              <div className="text-[11px] font-bold text-[#059669] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Protocole sécurisé
              </div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] mb-5">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">
                Conformité ARTCI & DGI
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Chiffrement de bout en bout des données personnelles hébergées sur serveurs souverains, et quittances avec identifiant fiscal conforme pour les télédéclarations.
              </p>
              <div className="text-[11px] font-bold text-[#059669] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Données protégées & Horodatées
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ PILIERS ─── */}
        <section className="py-20 px-6 max-w-4xl mx-auto border-t border-slate-200">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#B45309] mb-2 inline-block">
              Questions Fréquentes
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tout savoir sur la technologie et le cadre juridique
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-[#D97706] transition-colors"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180 text-[#D97706]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
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
              Rejoignez l'Infrastructure Moderne
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 uppercase">
              Bâtissez votre patrimoine sur des bases inébranlables.
            </h2>
            <p
              className="text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Ne laissez plus le hasard ou les accords verbaux fragiliser vos investissements immobiliers.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="qp-btn-gold-solid px-8 py-4 rounded-xl text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-500/20"
              >
                Créer un Bail Certifié <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 rounded-xl text-sm font-bold text-white border border-white/20 hover:bg-white/10 transition-colors"
              >
                Parler à un Spécialiste
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
