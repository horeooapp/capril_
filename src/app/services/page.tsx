"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Wrench,
  Scale,
  Droplets,
  Receipt,
  FileCheck2,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  Layers,
  Sparkles,
  Camera,
  Coins,
  History,
  FileText,
  BadgeCheck,
  Users
} from "lucide-react";

export default function ServicesPage() {
  const [activeModule, setActiveModule] = useState(0);

  const MODULES = [
    {
      id: "m-edl",
      code: "MODULE M-EDL",
      title: "États des Lieux (EDL) Numériques & Comparateur HD",
      subtitle: "Constat contradictoire certifié avec galerie photographique haute définition",
      icon: <Camera className="w-6 h-6 text-[#D97706]" />,
      badge: "Entrée & Sortie des Lieux",
      accent: "#D97706",
      desc: "Réalisez vos états des lieux directement sur smartphone ou tablette. Prenez des photos détaillées pièce par pièce, notez l'état des équipements (neuf, bon, usagé, dégradé) et faites signer le locataire immédiatement par signature tactile sécurisée.",
      details: [
        "Inventaire exhaustif pièce par pièce avec grille standardisée",
        "Comparateur visuel automatique entre l'entrée et la sortie pour détecter les dégradations réelles",
        "Distinction juridique entre vétusté d'usage normal et détérioration imputable au locataire",
        "Rapport PDF scellé horodaté immédiatement transmis aux deux parties"
      ],
      legalNote: "Conforme à l'article 15 de la loi n° 2019-576 régissant les états des lieux contradictoires."
    },
    {
      id: "m-mediation",
      code: "MODULE M-MÉDIATION",
      title: "Centre de Médiation & Règlement Amiable",
      subtitle: "Désamorçage des litiges locatifs sans passer par des procédures judiciaires lentes",
      icon: <Scale className="w-6 h-6 text-[#059669]" />,
      badge: "Résolution des Conflits",
      accent: "#059669",
      desc: "En cas de retard de paiement, de retenue sur caution contestée ou de réparations litigieuses, le module de médiation ouvre un canal d'arbitrage structuré pour trouver un accord amiable écrit sous 14 jours.",
      details: [
        "Protocole de médiation guidé étape par étape avec dépôt des pièces justificatives",
        "Échéanciers d'apurement d'arriérés négociés et formalisés en ligne",
        "Procès-verbal de conciliation doté d'une valeur contractuelle obligatoire pour les signataires",
        "Réduction de 90% des saisines judiciaires et préservation de la relation bailleur-locataire"
      ],
      legalNote: "Inspiré des mécanismes de médiation conventionnelle reconnus par l'Acte Uniforme OHADA."
    },
    {
      id: "m-charges",
      code: "MODULE M-CHARGES",
      title: "Gestion des Charges & Fluides CIE / SODECI",
      subtitle: "Suivi rigoureux des compteurs divisionnaires et répartition équitable des charges",
      icon: <Droplets className="w-6 h-6 text-[#0284C7]" />,
      badge: "Fluides & Charges Communes",
      accent: "#0284C7",
      desc: "Automatisez la saisie des index de compteurs d'électricité (CIE) et d'eau (SODECI). Le module calcule au centime près les consommations individuelles et les charges communes d'immeuble (gardiennage, entretien, vidange).",
      details: [
        "Saisie photographique des index de compteurs avec lecture optique",
        "Clé de répartition paramétrable selon les tantièmes ou au forfait déclaré",
        "Intégration directe sur l'avis d'échéance mensuel du loyer",
        "Historique des consommations pour prévenir les fuites et gaspillages anormaux"
      ],
      legalNote: "Supprime les contestations récurrentes sur les factures partagées entre locataires."
    },
    {
      id: "m-fiscal",
      code: "MODULE M-FISCAL",
      title: "Déclarations DGI & Rapprochement Fiscal",
      subtitle: "Génération automatique des bordereaux de déclaration des revenus locatifs",
      icon: <Receipt className="w-6 h-6 text-[#D97706]" />,
      badge: "Fiscalité Foncière & DGI",
      accent: "#D97706",
      desc: "Pour les bailleurs soumis à l'impôt sur le revenu foncier ou aux droits d'enregistrement des baux en Côte d'Ivoire, QAPRIL consolide automatiquement l'ensemble des encaissements certifiés et génère le récapitulatif fiscal officiel.",
      details: [
        "Calcul automatique des acomptes et impôts fonciers applicables selon votre régime",
        "Génération des états récapitulatifs certifiés avec identifiant fiscal DGI",
        "Export au format comptable pour votre expert-comptable ou centre des impôts",
        "Sécurisation contre les pénalités pour déclaration tardive ou incomplète"
      ],
      legalNote: "Conforme aux prescriptions de la Direction Générale des Impôts de Côte d'Ivoire."
    },
    {
      id: "m-recouvrement",
      code: "MODULE M-RECOUVREMENT",
      title: "Procédures de Relance & Mises en Demeure OHADA",
      subtitle: "Gestion automatisée et graduée du recouvrement des loyers impayés",
      icon: <FileCheck2 className="w-6 h-6 text-[#7C3AED]" />,
      badge: "Sécurité Financière",
      accent: "#7C3AED",
      desc: "Dès le premier jour de retard, un calendrier légal de relance s'active. De la simple alerte bienveillante par SMS à la génération d'une mise en demeure formelle prête pour signification par huissier de justice.",
      details: [
        "Relances préventives intelligentes par SMS et WhatsApp à J-3, J et J+3",
        "Application optionnelle des pénalités de retard contractuelles autorisées",
        "Édition automatique de la sommation de payer conforme à l'article 33 de la loi 2019-576",
        "Dossier contentieux complet pré-constitué prêt à être transmis aux commissaires de justice partenaires"
      ],
      legalNote: "Respecte scrupuleusement les délais légaux impératifs préalables à toute action résolutoire."
    },
    {
      id: "m-vault",
      code: "MODULE M-VAULT",
      title: "Coffre-Fort Numérique & Horodatage Cryptographique",
      subtitle: "Conservation souveraine et inviolable de l'intégralité du dossier locatif",
      icon: <Lock className="w-6 h-6 text-[#059669]" />,
      badge: "Archivage Légal & Sécurité",
      accent: "#059669",
      desc: "Tous les documents générés ou téléversés (contrats de bail signés, avenants, quittances, pièces d'identité, états des lieux, photos) sont cryptés et stockés dans un coffre-fort numérique accessible 24h/24 sans limite de durée.",
      details: [
        "Chiffrement AES-256 de chaque document à l'état de repos et en transit",
        "Empreinte numérique SHA-256 garantie inaltérable et vérifiable publiquement",
        "Stockage souverain redondant assurant une disponibilité permanente de 99.98%",
        "Accès sécurisé pour le bailleur, le locataire et les ayants droit en cas de succession"
      ],
      legalNote: "Garantit la pérennité probante des documents pendant toute la durée légale de conservation (10 ans)."
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
                "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.14) 0%, transparent 65%), radial-gradient(circle at 85% 75%, rgba(5,150,105,0.12) 0%, transparent 55%)"
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
                <Layers className="w-3.5 h-3.5" />
                Suite Opérationnelle Complète · 6 Modules Experts
              </span>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8 uppercase">
                Services & Modules <br />
                <span style={{ color: "var(--mango)" }}>de Haute Précision</span>
              </h1>

              <p
                className="text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed mb-12"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Chaque module opérationnel de QAPRIL résout un point de douleur critique de la gestion locative en Côte d'Ivoire. Découvrez comment ces 6 briques technologiques s'articulent pour éliminer 100% des frictions.
              </p>

              {/* Raccourcis rapides */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
                {MODULES.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveModule(idx)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                      activeModule === idx
                        ? "bg-[#D97706] text-white shadow-md shadow-amber-500/20 scale-105"
                        : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white border border-white/10"
                    }`}
                  >
                    <span>{m.code.split(" ")[1]}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── PRÉSENTATION DÉTAILLÉE DES MODULES ─── */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Sommaire des modules à gauche */}
            <div className="lg:col-span-5 space-y-3 sticky top-28">
              <div className="text-xs font-black uppercase tracking-widest text-[#B45309] mb-4">
                Catalogue des Modules
              </div>

              {MODULES.map((mod, idx) => {
                const isSelected = activeModule === idx;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(idx)}
                    className={`w-full p-4 sm:p-5 text-left rounded-xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? "bg-white border-[#D97706] shadow-md ring-1 ring-[#D97706]/30"
                        : "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "bg-amber-100 text-[#B45309]"
                            : "bg-slate-100 text-slate-500 group-hover:text-slate-800"
                        }`}
                      >
                        {mod.icon}
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          {mod.code}
                        </div>
                        <div
                          className={`text-xs sm:text-sm font-black transition-colors ${
                            isSelected ? "text-slate-900" : "text-slate-700"
                          }`}
                        >
                          {mod.title.split("&")[0]}
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform flex-shrink-0 ${
                        isSelected
                          ? "text-[#D97706] translate-x-1"
                          : "text-slate-300 group-hover:text-slate-500"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Vue grand format du module sélectionné */}
            <div className="lg:col-span-7">
              {MODULES.map((mod, idx) => {
                if (activeModule !== idx) return null;
                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#D97706] uppercase tracking-widest block mb-1">
                          {mod.code} · {mod.badge}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                          {mod.title}
                        </h2>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                        {mod.icon}
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium mb-6">
                      {mod.desc}
                    </p>

                    <div className="space-y-3.5 mb-8">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                        Capacités Clés du Module
                      </div>
                      {mod.details.map((item, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-800"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#D97706] flex-shrink-0" />
                      <div>
                        <span className="font-bold text-[#B45309]">Cadre Réglementaire : </span>
                        {mod.legalNote}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── CYCLE DE VIE LOCATIF COMPLET (WORKFLOW) ─── */}
        <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#B45309] mb-3 inline-block">
              Intégration Sans Couture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Comment les Modules s'enchaînent dans la Vie d'un Bail
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Aucun document égaré, aucune double saisie : chaque événement déclenche automatiquement les actions requises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-left relative">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">Entrée dans les Lieux</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Création et signature OTP du bail certifié (M-BAIL), consignation de la caution à la CDC (M-CDC) et état des lieux d'entrée photo HD (M-EDL).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-left relative">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">Pendant la Location</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paiement mensuel Mobile Money, génération immédiate des quittances DGI, répartition des charges CIE/SODECI et relances automatiques (M-CHARGES).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-left relative">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">En Cas de Désaccord</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Activation du centre de médiation en ligne (M-MÉDIATION) pour résoudre les retards ou litiges à l'amiable sous 14 jours avant toute procédure.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-left relative">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center mb-4">
                04
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">Sortie & Restitution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                État des lieux de sortie contradictoire, comparaison automatique avec l'entrée et déblocage de la caution par virement sous 48h sans rétention.
              </p>
            </div>
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
              Déploiement Immédiat
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 uppercase">
              Activez les modules dont votre parc a besoin dès aujourd'hui.
            </h2>
            <p
              className="text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Tous les modules sont inclus dans les formules QAPRIL sans surcoût caché.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="qp-btn-gold-solid px-8 py-4 rounded-xl text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-500/20"
              >
                Accéder aux Services <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tarifs"
                className="px-8 py-4 rounded-xl text-sm font-bold text-white border border-white/20 hover:bg-white/10 transition-colors"
              >
                Voir les Formules & Tarifs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
