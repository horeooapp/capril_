"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Scale,
  Zap,
  FolderLock,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import Link from "next/link";

interface FeatureModule {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  tag: string;
  tagColor: string;
  icon: React.ElementType;
  badge: string;
  gradient: string;
  previewImage: string;
  interactiveDetails: {
    title: string;
    metrics: { k: string; v: string }[];
    hint: string;
  };
}

const MODULES: FeatureModule[] = [
  {
    id: "edl",
    number: "01",
    title: "État des lieux photo horodaté",
    shortDesc: "Prise de clichés géo-référencés pièce par pièce pour sceller l'état réel et protéger la caution.",
    tag: "Litiges Évités",
    tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Camera,
    badge: "Protection Caution",
    gradient: "from-amber-500/15 via-transparent to-transparent",
    previewImage: "/images/feature_leases.jpg",
    interactiveDetails: {
      title: "Constat Numérique Entrée / Sortie",
      metrics: [
        { k: "Photos HD", v: "18 clichés horodatés" },
        { k: "État Global", v: "Très Bon (98/100)" },
        { k: "Signature", v: "Approbation Locataire & Bailleur" },
      ],
      hint: "Certificat d'état scellé avec empreinte SHA-256",
    },
  },
  {
    id: "amiable",
    number: "02",
    title: "Médiation & accord à l'amiable",
    shortDesc: "Cadre digital d'échanges et échéanciers validés juridiquement pour régler les retards sans tribunal.",
    tag: "Zéro Palabre",
    tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: Scale,
    badge: "92% d'Accords",
    gradient: "from-emerald-500/15 via-transparent to-transparent",
    previewImage: "/images/impact_vision.png",
    interactiveDetails: {
      title: "Protocole de Règlement Amiable",
      metrics: [
        { k: "Délai moyen", v: "Résolution sous 72h" },
        { k: "Échéancier", v: "3 versements validés" },
        { k: "Pénalités", v: "Gelées durant la médiation" },
      ],
      hint: "Valeur de transaction légale sans frais d'huissier",
    },
  },
  {
    id: "fluides",
    number: "03",
    title: "Gestion des charges CIE & SODECI",
    shortDesc: "Relevé des sous-compteurs, répartition équitable au tantième ou à l'index sans surfacturation.",
    tag: "Transparence Nette",
    tagColor: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    icon: Zap,
    badge: "Index Vérifié",
    gradient: "from-sky-500/15 via-transparent to-transparent",
    previewImage: "/images/hero_abidjan_modern_district_1773609699145.png",
    interactiveDetails: {
      title: "Consommation Eau & Électricité",
      metrics: [
        { k: "Index SODECI", v: "142 m³ relevés" },
        { k: "Index CIE", v: "840 kWh relevés" },
        { k: "Part locataire", v: "Directement déduite" },
      ],
      hint: "Factures numérisées et rattachées au bail",
    },
  },
  {
    id: "coffre",
    number: "04",
    title: "Coffre-fort foncier & juridique",
    shortDesc: "Stockage chiffré des titres de propriété (ACD, CMP, Lettres d'attribution) et pièces d'identité.",
    tag: "Cryptage Souverain",
    tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    icon: FolderLock,
    badge: "Conforme ARTCI",
    gradient: "from-indigo-500/15 via-transparent to-transparent",
    previewImage: "/images/passport_visual.png",
    interactiveDetails: {
      title: "Classeur Foncier Souverain",
      metrics: [
        { k: "Titres ACD", v: "Vérifiés au Ministère" },
        { k: "Identités", v: "Vérification ONECI" },
        { k: "Chiffrement", v: "AES-256 haute sécurité" },
      ],
      hint: "Accessible 24h/24 même hors connexion internet",
    },
  },
  {
    id: "observatory",
    number: "05",
    title: "Vrais prix des loyers par quartier",
    shortDesc: "Indicateurs géographiques de marché en temps réel à Abidjan pour fixer et justifier le juste loyer.",
    tag: "Big Data Foncier",
    tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: BarChart3,
    badge: "Observatoire 2026",
    gradient: "from-amber-500/15 via-transparent to-transparent",
    previewImage: "/slider/bg_slider_2.png",
    interactiveDetails: {
      title: "Argus Immobilier Abidjanais",
      metrics: [
        { k: "Cocody / Marcory", v: "10 500 XOF/m²" },
        { k: "Yopougon / Abobo", v: "3 800 XOF/m²" },
        { k: "Tension", v: "94% de demandes actives" },
      ],
      hint: "Comparatif officiel basé sur les baux effectifs",
    },
  },
  {
    id: "whatsapp",
    number: "06",
    title: "Rappels multicanaux SMS & WhatsApp",
    shortDesc: "Notifications douces d'échéance et quittances délivrées directement sur le WhatsApp du locataire.",
    tag: "Relation Apaisée",
    tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: MessageSquare,
    badge: "100% Mobile",
    gradient: "from-emerald-500/15 via-transparent to-transparent",
    previewImage: "/images/feature_mobile_payment.jpg",
    interactiveDetails: {
      title: "Automate de Notification Convivial",
      metrics: [
        { k: "Rappel J-5", v: "Message courtois WhatsApp" },
        { k: "Reçu J+0", v: "Quittance PDF en pièce jointe" },
        { k: "Délivrabilité", v: "99.8% réception immédiate" },
      ],
      hint: "Préserve la convivialité entre bailleur et locataire",
    },
  },
];

export default function InteractiveModulesGrid() {
  const [selectedModule, setSelectedModule] = useState<FeatureModule | null>(null);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const isSelected = selectedModule?.id === m.id;

          return (
            <div
              key={m.id}
              onClick={() => setSelectedModule(isSelected ? null : m)}
              className={`group relative rounded-3xl bg-white border transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between cursor-pointer overflow-hidden ${
                isSelected
                  ? "border-amber-400 shadow-2xl ring-2 ring-amber-400/20 -translate-y-1"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              {/* Gradient d'ambiance en coin */}
              <div
                className={`absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl ${m.gradient} rounded-bl-full pointer-events-none transition-transform group-hover:scale-125 duration-500`}
              />

              <div>
                {/* Header du module : Numéro, Tag & Badge */}
                <div className="flex items-center justify-between gap-3 mb-5 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-amber-400 group-hover:border-slate-900 transition-all duration-300 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      MOD · {m.number}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${m.tagColor}`}
                  >
                    {m.badge}
                  </span>
                </div>

                {/* Titre & Description Épurée */}
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug mb-2 group-hover:text-amber-600 transition-colors">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {m.shortDesc}
                </p>

                {/* Zone Visuelle Miniature Intégrée (Rich Media Card) */}
                <div className="mt-5 rounded-2xl overflow-hidden relative h-36 bg-slate-950 border border-slate-100 group-hover:border-slate-200 transition-colors">
                  <img
                    src={m.previewImage}
                    alt={m.title}
                    className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.05] group-hover:scale-105 group-hover:brightness-[0.9] transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                    <span className="font-semibold truncate max-w-[170px] drop-shadow-sm">
                      {m.interactiveDetails.title}
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold bg-white/10 backdrop-blur-md px-2 py-0.5 rounded border border-white/15">
                      Actif
                    </span>
                  </div>
                </div>

                {/* Accordéon interactif révélé au clic */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs"
                  >
                    {m.interactiveDetails.metrics.map((met, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 font-mono text-[11px]"
                      >
                        <span className="text-slate-500">{met.k}</span>
                        <span className="font-bold text-slate-900">{met.v}</span>
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-400 italic pt-1 text-center">
                      {m.interactiveDetails.hint}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Footer de la carte */}
              <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                  {isSelected ? "Masquer les détails" : "Cliquer pour inspecter"}
                </span>
                <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center text-slate-500 transition-all">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
