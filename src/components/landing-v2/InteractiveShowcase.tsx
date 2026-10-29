"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  CreditCard,
  ShieldCheck,
  Award,
  Smartphone,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  QrCode,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface FeatureStory {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  badgeColor: string;
  accentColor: string;
  image: string;
  icon: React.ElementType;
  mockup: {
    title: string;
    status: string;
    statusColor: string;
    details: { label: string; val: string }[];
    actionLabel: string;
  };
  keyBenefits: string[];
}

const STORIES: FeatureStory[] = [
  {
    id: "bail",
    tag: "CONTRAT & SIGNATURE",
    title: "Bail numérique certifié & signature SMS instantanée",
    subtitle: "Rédigez en 5 minutes. Vos deux parties signent par code OTP SMS légal (Loi 2019-576). Zéro déplacement.",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    accentColor: "#D97706",
    image: "/images/feature_leases.jpg",
    icon: FileCheck,
    mockup: {
      title: "Contrat de Bail d'Habitation N° 2026-CI-84",
      status: "Signé & Scellé Numériquement",
      statusColor: "text-emerald-500 bg-emerald-50 border-emerald-200",
      details: [
        { label: "Bailleur", val: "M. Kouamé Jean-Marc" },
        { label: "Locataire", val: "Mlle Touré Aminata" },
        { label: "Bien", val: "Appartement 3P · Cocody Angré 8e" },
        { label: "Signature", val: "OTP SMS certifié 2026-04-18" },
      ],
      actionLabel: "Télécharger le Bail Scellé PDF",
    },
    keyBenefits: [
      "100% conforme au Code de la Construction ivoirien",
      "Signature juridique horodatée par SMS OTP",
      "Archivage infalsifiable vérifiable par QR Code",
    ],
  },
  {
    id: "paiement",
    tag: "PAIEMENT SANS FRICTION",
    title: "Paiements Wave, MoMo & Quittance Officielle instantanée",
    subtitle: "Réglez en 1 clic. Le propriétaire reçoit les fonds instantanément et le locataire sa quittance DGI avec QR code.",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    accentColor: "#059669",
    image: "/images/feature_mobile_payment.jpg",
    icon: CreditCard,
    mockup: {
      title: "Quittance de Loyer Dématérialisée",
      status: "Paiement Réconcilié ✓",
      statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      details: [
        { label: "Montant Réglé", val: "220 000 XOF" },
        { label: "Canal", val: "Wave Money Côte d'Ivoire" },
        { label: "Mois Échu", val: "Avril 2026" },
        { label: "Reçu QR", val: "QR-2026-PAY-8823 Validé DGI" },
      ],
      actionLabel: "Afficher le Reçu QR Code",
    },
    keyBenefits: [
      "Zéro déplacement en agence, zéro manipulation d'espèces",
      "Quittances générées automatiquement valides pour visas et banques",
      "Réconciliation bancaire en temps réel sans litige",
    ],
  },
  {
    id: "caution",
    tag: "GARANTIE CDC-CI",
    title: "2 mois de caution séquestrés à la Caisse des Dépôts",
    subtitle: "Plafonnement légal strict. La caution est mise en sécurité à la CDC-CI et restituée sans tracasserie à la sortie.",
    badgeColor: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    accentColor: "#0284C7",
    image: "/images/cdc_visual.png",
    icon: ShieldCheck,
    mockup: {
      title: "Certificat de Consignation CDC-CI",
      status: "Fonds Sécurisés à la Caisse des Dépôts",
      statusColor: "text-sky-600 bg-sky-50 border-sky-200",
      details: [
        { label: "Réglementation", val: "Loi 2019 · Plafond 2 Mois" },
        { label: "Montant Consigné", val: "440 000 XOF" },
        { label: "Identifiant CDC-CI", val: "CDC-CI-ESCROW-4091" },
        { label: "Restitution", val: "Automatique sous 15 jours" },
      ],
      actionLabel: "Vérifier le Certificat CDC-CI",
    },
    keyBenefits: [
      "Fin des exigences abusives de 4 à 6 mois d'avance",
      "Protection étatique inviolable pour locataire et bailleur",
      "Déblocage garanti et transparent après état des lieux",
    ],
  },
  {
    id: "score",
    tag: "SCORE ICL & CONFIANCE",
    title: "Passeport Locatif & Score de Réputation ICL",
    subtitle: "Chaque loyer à temps renforce le score du locataire. Les bailleurs choisissent des profils sérieux certifiés.",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    accentColor: "#7C3AED",
    image: "/images/feature_icl_score.jpg",
    icon: Award,
    mockup: {
      title: "Passeport Locatif Individuel Certifié",
      status: "Grade A+ (Excellente Ponctualité)",
      statusColor: "text-purple-600 bg-purple-50 border-purple-200",
      details: [
        { label: "Score ICL", val: "940 / 1000 Points" },
        { label: "Historique", val: "36 mois consécutifs sans retard" },
        { label: "Identité", val: "CNI Vérifiée ONECI" },
        { label: "Garantie", val: "Dossier Prioritaire Réseau" },
      ],
      actionLabel: "Partager mon Passeport ICL",
    },
    keyBenefits: [
      "Accès prioritaire aux meilleures locations d'Abidjan",
      "Réduction drastique des impayés pour les propriétaires",
      "Reconnaissance de l'intégrité et de la bonne foi",
    ],
  },
];

export default function InteractiveShowcase() {
  const [activeStory, setActiveStory] = useState<FeatureStory>(STORIES[0]);

  return (
    <div className="w-full">
      {/* 4 Tabs Pilotes Interactifs avec Icônes & Rendu Meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {STORIES.map((s) => {
          const isSelected = activeStory.id === s.id;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStory(s)}
              className={`p-4 rounded-2xl text-left border transition-all duration-300 relative cursor-pointer group ${
                isSelected
                  ? "bg-white border-slate-300 shadow-xl shadow-slate-200/80 -translate-y-1"
                  : "bg-slate-100/80 border-slate-200 hover:bg-white hover:border-slate-300"
              }`}
            >
              {isSelected && (
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: s.accentColor }}
                />
              )}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isSelected ? "text-white" : "text-slate-600 bg-white"
                  }`}
                  style={{ backgroundColor: isSelected ? s.accentColor : undefined }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                  0{STORIES.indexOf(s) + 1}
                </span>
              </div>
              <div className="text-xs font-black text-slate-900 truncate">{s.tag}</div>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                {s.title.split("&")[0]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Scène Interactive Animée */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStory.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
        >
          {/* Colonne Gauche : Pitch Épuré + Avantages Clés (5 cols) */}
          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
            <div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-4 border ${activeStory.badgeColor}`}
              >
                <activeStory.icon className="w-3.5 h-3.5" />
                {activeStory.tag}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug mb-3">
                {activeStory.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                {activeStory.subtitle}
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                {activeStory.keyBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: activeStory.accentColor }}
                    />
                    <span className="text-xs font-semibold text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-all"
                style={{ backgroundColor: activeStory.accentColor }}
              >
                Tester maintenant <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] font-mono text-slate-400 font-semibold">
                Scellé par protocole QAPRIL
              </span>
            </div>
          </div>

          {/* Colonne Droite : Visuel Immersif + Widget Mockup Flottant UI (7 cols) */}
          <div className="lg:col-span-7 relative bg-slate-900 min-h-[380px] lg:min-h-[460px] flex items-center justify-center p-6 sm:p-10 overflow-hidden group">
            {/* Image de fond avec transition douce */}
            <div className="absolute inset-0">
              <img
                src={activeStory.image}
                alt={activeStory.title}
                className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>

            {/* Widget Glassmorphism flottant par-dessus l'image (Style Apple / iOS) */}
            <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="text-[11px] font-black text-slate-900 tracking-wide truncate max-w-[220px]">
                  {activeStory.mockup.title}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${activeStory.mockup.statusColor}`}
                >
                  {activeStory.mockup.status}
                </span>
              </div>

              <div className="space-y-2 py-1 font-mono text-xs">
                {activeStory.mockup.details.map((d, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <span className="text-slate-500 text-[11px] font-sans font-medium">{d.label}</span>
                    <span className="text-slate-900 font-bold text-[11px]">{d.val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> Sécurisé & Certifié
                </span>
                <span
                  className="font-black text-[11px] flex items-center gap-1 cursor-pointer"
                  style={{ color: activeStory.accentColor }}
                >
                  {activeStory.mockup.actionLabel}
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
