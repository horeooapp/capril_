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
      code: "ÉTAT DES LIEUX",
      title: "État des Lieux sur Téléphone avec Photos HD",
      subtitle: "Constat clair avec photos nettes pour protéger le propriétaire et le locataire",
      icon: <Camera className="w-6 h-6 text-[#D97706]" />,
      badge: "Entrée & Sortie des Lieux",
      accent: "#D97706",
      desc: "Réalisez vos états des lieux directement sur smartphone ou tablette. Prenez des photos pièce par pièce, notez l'état des équipements (neuf, bon, usagé, abîmé) et faites signer le locataire directement sur l'écran en toute simplicité.",
      details: [
        "Vérification pièce par pièce avec une liste simple et complète",
        "Comparateur photo automatique entre l'entrée et la sortie pour voir les vrais changements",
        "Distinction claire entre l'usure normale du temps et les dégâts causés par le locataire",
        "Rapport PDF officiel envoyé immédiatement par SMS et WhatsApp aux deux parties"
      ],
      legalNote: "Conforme à la loi n° 2019-576 régissant les états des lieux contradictoires en Côte d'Ivoire."
    },
    {
      id: "m-mediation",
      code: "RÈGLEMENT AMIABLE",
      title: "Entente & Règlement à l'Amiable",
      subtitle: "Résoudre les désaccords rapidement sans passer par des procès longs et coûteux",
      icon: <Scale className="w-6 h-6 text-[#059669]" />,
      badge: "Résolution des Conflits",
      accent: "#059669",
      desc: "En cas de retard de loyer, de désaccord sur la caution ou de réparations contestées, notre outil d'entente vous aide à trouver un accord écrit, équitable et respectueux sans palabre.",
      details: [
        "Procédure d'entente guidée étape par étape avec partage des justificatifs",
        "Possibilité d'étaler les paiements en retard selon un calendrier convenu d'un commun accord",
        "Accord d'entente écrit doté d'une vraie valeur d'engagement pour les deux parties",
        "Évite les convocations au commissariat ou au tribunal et préserve la bonne entente"
      ],
      legalNote: "Reconnu par les mécanismes de conciliation amiable en Côte d'Ivoire."
    },
    {
      id: "m-charges",
      code: "EAU & ÉLECTRICITÉ",
      title: "Suivi des Factures CIE & SODECI",
      subtitle: "Relevé facile des compteurs et partage équitable des factures d'eau et de courant",
      icon: <Droplets className="w-6 h-6 text-[#0284C7]" />,
      badge: "Compteurs & Charges",
      accent: "#0284C7",
      desc: "Prenez simplement en photo les index des compteurs d'électricité (CIE) et d'eau (SODECI). L'application calcule au franc près la consommation de chacun et les charges communes (vidange, gardiennage, nettoyage).",
      details: [
        "Relevé photo des compteurs avec calcul automatique de la consommation",
        "Partage clair et transparent entre les différents locataires de la cour ou de l'immeuble",
        "Montant ajouté clairement sur l'avis de loyer de chaque mois",
        "Historique des consommations pour repérer rapidement les fuites d'eau"
      ],
      legalNote: "Supprime les disputes récurrentes sur le partage des factures CIE et SODECI."
    },
    {
      id: "m-fiscal",
      code: "DÉCLARATION IMPÔTS",
      title: "Bilan des Loyers pour les Impôts (DGI)",
      subtitle: "Récapitulatif officiel de vos revenus locatifs en un seul clic",
      icon: <Receipt className="w-6 h-6 text-[#D97706]" />,
      badge: "Fiscalité & DGI",
      accent: "#D97706",
      desc: "Pour les bailleurs qui déclarent leurs impôts fonciers en Côte d'Ivoire, QAPRIL rassemble tous les loyers réellement encaissés dans l'année et produit le récapitulatif officiel demandé par le fisc.",
      details: [
        "Calcul automatique du total des loyers perçus sur l'année civile",
        "Génération d'un récapitulatif officiel avec références cadastrales et montants certifiés",
        "Téléchargement en PDF prêt à remettre à votre centre des impôts ou comptable",
        "Protection contre les erreurs et les pénalités de retard"
      ],
      legalNote: "Conforme aux exigences de la Direction Générale des Impôts (DGI) de Côte d'Ivoire."
    },
    {
      id: "m-recouvrement",
      code: "RELANCES LOYERS",
      title: "Rappels et Mises en Demeure Officielles",
      subtitle: "Rappels polis par SMS/WhatsApp et courriers officiels en cas de retard",
      icon: <FileCheck2 className="w-6 h-6 text-[#7C3AED]" />,
      badge: "Sécurité des Loyers",
      accent: "#7C3AED",
      desc: "Dès les premiers jours du mois, des rappels automatiques et courtois par SMS et WhatsApp sont envoyés. En cas de retard important, l'application génère une mise en demeure officielle prête pour commissaire de justice.",
      details: [
        "Rappels automatiques et polis par SMS et WhatsApp avant l'échéance",
        "Suivi précis du calendrier des paiements sans avoir à relancer soi-même au téléphone",
        "Génération automatique d'une mise en demeure conforme à la loi ivoirienne n° 2019-576",
        "Dossier complet et propre prêt à transmettre à un commissaire de justice si besoin"
      ],
      legalNote: "Respecte scrupuleusement les délais légaux prévus par la loi ivoirienne avant toute action."
    },
    {
      id: "m-vault",
      code: "CLASSEUR NUMÉRIQUE",
      title: "Classeur Numérique Sécurisé à Vie",
      subtitle: "Tous vos contrats, reçus et pièces d'identité conservés à vie sur votre téléphone",
      icon: <Lock className="w-6 h-6 text-[#059669]" />,
      badge: "Sécurité & Archivage",
      accent: "#059669",
      desc: "Tous vos baux signés, reçus de loyer, pièces d'identité, états des lieux et photos sont gardés dans un coffre numérique sécurisé. Jamais perdus, accessibles 24h/24 où que vous soyez.",
      details: [
        "Documents protégés et scellés pour empêcher toute altération",
        "Accès facile depuis votre smartphone à tout moment, même après plusieurs années",
        "Sauvegarde permanente en ligne pour ne plus jamais égarer de contrat papier",
        "Preuves reconnues et recevables devant toutes les autorités ivoiriennes"
      ],
      legalNote: "Conserve vos preuves locatives pendant toute la durée légale requise."
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
                6 Outils Pratiques · Simple & Efficace
              </span>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8 uppercase">
                Tous les Outils <br />
                <span style={{ color: "var(--mango)" }}>pour Gérer vos Locations</span>
              </h1>

              <p
                className="text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed mb-12"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Chaque outil de QAPRIL a été pensé pour régler les vraies difficultés des locations en Côte d'Ivoire. Découvrez comment faciliter la gestion de vos maisons et éviter les palabres au quotidien.
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
                    <span>{m.code}</span>
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
