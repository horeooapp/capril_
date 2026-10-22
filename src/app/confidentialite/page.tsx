"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  ShieldCheck, Lock, Database, Eye, Trash2, RefreshCw,
  Mail, ArrowRight, Users, Server, Globe, AlertCircle
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const DATA_TYPES = [
  { icon: <Users className="w-4 h-4" />, label: "Identité", items: ["Nom, Prénoms", "Email & Téléphone", "CNI / Passeport (KYC)"], accent: "#F59E0B", bg: "#FEF3C7" },
  { icon: <Database className="w-4 h-4" />, label: "Bien Immobilier", items: ["Adresse du bien", "Référence cadastrale (ACD)", "Photos & Documents"], accent: "#0EA5E9", bg: "#E0F2FE" },
  { icon: <Lock className="w-4 h-4" />, label: "Données Financières", items: ["Montant du loyer", "Modalités de paiement", "Références de transaction"], accent: "#7C3AED", bg: "#EDE9FE" },
  { icon: <ShieldCheck className="w-4 h-4" />, label: "Données Techniques", items: ["Adresse IP (anonymisée)", "Logs de connexion", "Empreintes cryptographiques"], accent: "#059669", bg: "#D1FAE5" },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="landing-v2-wrapper font-sans text-ink bg-cream min-h-screen overflow-x-hidden relative">
      <div className="noise-overlay"></div>
      <Header />

      <main className="relative z-10">

        {/* ─── HERO ─── */}
        <section className="relative pt-40 pb-32 overflow-hidden" style={{ background: "var(--ink)" }}>
          <div className="absolute inset-0" aria-hidden style={{
            backgroundImage: "radial-gradient(circle at 30% 50%, rgba(245,158,11,0.06) 0%, transparent 60%), radial-gradient(circle at 70% 30%, rgba(14,165,233,0.06) 0%, transparent 60%)",
          }} />
          <div className="absolute inset-0" aria-hidden style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
            backgroundSize: "60px 60px"
          }} />

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-amber-400" style={{ background: "rgba(245,158,11,0.08)" }}>
                <ShieldCheck className="w-3.5 h-3.5" />
                Protection des Données · RGPD-Compatible · Mise à jour 2026
              </span>
              <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 uppercase">
                Politique de<br />
                <span style={{ color: "var(--mango)" }}>Confidentialité</span>
              </h1>
              <p className="text-lg font-medium max-w-2xl mx-auto leading-relaxed mb-12" style={{ color: "rgba(255,255,255,0.5)" }}>
                QAPRIL s&apos;engage à protéger vos données personnelles avec le plus haut niveau de sécurité. Voici comment nous collectons, traitons et protégeons vos informations.
              </p>
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold text-white/60">Dernière mise à jour : 01 Mars 2026</span>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 60H1440V0C1200 40 960 60 720 60C480 60 240 40 0 0V60Z" fill="#FAFAF5" />
            </svg>
          </div>
        </section>

        {/* ─── CONTENT ─── */}
        <div className="max-w-5xl mx-auto px-6 py-24 space-y-24">

          {/* 01 — Données Collectées */}
          <motion.section id="collecte" className="scroll-mt-28"
            custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>01</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-500 mb-1">Transparence</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Données Collectées</h2>
              </div>
            </div>
            <p className="text-lg font-medium text-ink3 leading-relaxed mb-10 max-w-3xl">
              QAPRIL collecte uniquement les données strictement nécessaires à la sécurisation des transactions immobilières et à la conformité réglementaire. Voici les catégories de données que nous traitons :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {DATA_TYPES.map((cat, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cat.bg, color: cat.accent }}>
                      {cat.icon}
                    </div>
                    <h3 className="font-black text-ink">{cat.label}</h3>
                  </div>
                  <ul className="space-y-2">
                    {cat.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm font-medium text-ink3">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.accent }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 02 — Finalités du Traitement */}
          <motion.section id="traitement" className="scroll-mt-28"
            custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>02</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-500 mb-1">Pourquoi</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Finalités du Traitement</h2>
              </div>
            </div>
            <p className="text-lg font-medium text-ink3 leading-relaxed mb-10 max-w-3xl">
              Vos données ne sont <strong>ni vendues, ni louées, ni revendues</strong> à des tiers à des fins commerciales. Elles servent exclusivement aux finalités suivantes :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: <Lock className="w-5 h-5" />, title: "Authentification", desc: "Sécurisation de l'accès à votre compte personnel via OTP et sessions JWT chiffrées.", accent: "#7C3AED", bg: "#EDE9FE" },
                { icon: <ShieldCheck className="w-5 h-5" />, title: "Certification", desc: "Génération et archivage des baux numériques et quittances officielles à valeur légale.", accent: "#059669", bg: "#D1FAE5" },
                { icon: <Database className="w-5 h-5" />, title: "Score ICL", desc: "Calcul de l'Indice de Crédit Locatif pour évaluer la fiabilité locative.", accent: "#0EA5E9", bg: "#E0F2FE" },
                { icon: <Globe className="w-5 h-5" />, title: "Observatoire", desc: "Statistiques agrégées et anonymes pour l'observatoire national du marché locatif ivoirien.", accent: "#F59E0B", bg: "#FEF3C7" },
                { icon: <AlertCircle className="w-5 h-5" />, title: "Conformité KYC", desc: "Vérification d'identité requise par les obligations légales anti-blanchiment en vigueur.", accent: "#CC2020", bg: "#FEE2E2" },
                { icon: <RefreshCw className="w-5 h-5" />, title: "Amélioration", desc: "Amélioration de l'expérience utilisateur via analyses anonymisées de l'utilisation.", accent: "#7C3AED", bg: "#EDE9FE" },
              ].map((use, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: use.bg, color: use.accent }}>
                    {use.icon}
                  </div>
                  <h3 className="font-black text-ink mb-1 text-sm">{use.title}</h3>
                  <p className="text-xs font-medium text-ink3 leading-relaxed">{use.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 03 — Conservation */}
          <motion.section id="conservation" className="scroll-mt-28"
            custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>03</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600 mb-1">Durée</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Durée de Conservation</h2>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { category: "Données de compte actif", duration: "Durée de l'abonnement + 12 mois", detail: "Données de profil, historique des transactions et documents associés.", accent: "#059669" },
                { category: "Documents de bail", duration: "Durée du bail + délai de prescription légale", detail: "Conformément aux obligations de conservation en droit ivoirien des obligations (max. 10 ans).", accent: "#0EA5E9" },
                { category: "Données KYC", duration: "5 ans après la fin de la relation commerciale", detail: "Obligation légale ARTCI en matière de lutte contre le blanchiment de capitaux.", accent: "#7C3AED" },
                { category: "Logs techniques", duration: "12 mois glissants", detail: "Adresses IP anonymisées, logs de connexion et événements de sécurité.", accent: "#F59E0B" },
                { category: "Données anonymisées", duration: "Durée illimitée", detail: "Les données agrégées et anonymisées contribuant à l'Observatoire QAPRIL sont conservées sans limitation.", accent: "#CC2020" },
              ].map((row, i) => (
                <div key={i} className="flex gap-4 p-6 bg-white rounded-2xl border border-black/5 shadow-sm">
                  <div className="w-1 rounded-full flex-shrink-0 self-stretch" style={{ background: row.accent }} />
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-black text-ink mb-1 text-sm">{row.category}</h3>
                      <p className="text-xs font-medium text-ink3 leading-relaxed">{row.detail}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-block text-xs font-black px-3 py-1.5 rounded-full whitespace-nowrap" style={{ background: `${row.accent}15`, color: row.accent }}>
                        {row.duration}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 04 — Partage */}
          <motion.section id="partage" className="scroll-mt-28"
            custom={3} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>04</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-500 mb-1">Tiers</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Partage & Sous-traitants</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-lg font-medium text-ink3 leading-relaxed mb-6">
                  QAPRIL ne partage vos données qu&apos;avec des sous-traitants techniques strictement nécessaires au fonctionnement de la plateforme, liés par des accords de confidentialité.
                </p>
                <div className="space-y-3">
                  {[
                    { name: "Hostinger Int'l", role: "Hébergement & BDD", flag: "🇱🇹" },
                    { name: "Vercel Inc.", role: "CDN & Déploiement", flag: "🇺🇸" },
                    { name: "Orange CI / MTN CI", role: "Paiements Mobile Money", flag: "🇨🇮" },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-black/5">
                      <span className="text-2xl" suppressHydrationWarning>{p.flag}</span>
                      <div>
                        <p className="font-black text-ink text-sm">{p.name}</p>
                        <p className="text-xs font-medium text-ink3">{p.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8 rounded-3xl border border-red-100 bg-red-50">
                <h3 className="font-black text-red-800 mb-4 text-sm uppercase tracking-wide">Jamais partagé avec</h3>
                <ul className="space-y-3">
                  {[
                    "Régies publicitaires ou plateformes de ciblage",
                    "Courtiers en données ou data brokers",
                    "Tiers non contractualisés",
                    "Organismes hors cadre légal ivoirien",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm font-medium text-red-900">
                      <span className="text-red-500 flex-shrink-0 font-black">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 05 — Vos Droits */}
          <motion.section id="droits" className="scroll-mt-28"
            custom={4} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>05</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-500 mb-1">Droits Utilisateurs</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Vos Droits sur vos Données</h2>
              </div>
            </div>
            <p className="text-lg font-medium text-ink3 leading-relaxed mb-10 max-w-3xl">
              Conformément aux lois applicables, vous disposez des droits suivants sur vos données personnelles. Pour exercer ces droits, contactez notre Délégué à la Protection des Données.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {[
                { icon: <Eye className="w-5 h-5" />, title: "Droit d'Accès", desc: "Obtenez une copie de toutes les données personnelles que nous détenons sur vous.", accent: "#0EA5E9" },
                { icon: <RefreshCw className="w-5 h-5" />, title: "Droit de Rectification", desc: "Corrigez toute donnée inexacte ou incomplète vous concernant.", accent: "#059669" },
                { icon: <Trash2 className="w-5 h-5" />, title: "Droit à l'Effacement", desc: "Demandez la suppression de vos données, sous réserve des obligations légales.", accent: "#CC2020" },
                { icon: <Lock className="w-5 h-5" />, title: "Droit à la Portabilité", desc: "Recevez vos données dans un format structuré et lisible par machine.", accent: "#7C3AED" },
                { icon: <AlertCircle className="w-5 h-5" />, title: "Droit d'Opposition", desc: "Opposez-vous au traitement de vos données pour des finalités non essentielles.", accent: "#F59E0B" },
                { icon: <ShieldCheck className="w-5 h-5" />, title: "Droit à la Limitation", desc: "Demandez la limitation du traitement de vos données dans certains cas.", accent: "#0EA5E9" },
              ].map((right, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${right.accent}15`, color: right.accent }}>
                    {right.icon}
                  </div>
                  <h3 className="font-black text-ink mb-1 text-sm">{right.title}</h3>
                  <p className="text-xs font-medium text-ink3 leading-relaxed">{right.desc}</p>
                </div>
              ))}
            </div>

            {/* DPO Contact */}
            <div className="p-10 rounded-[2.5rem]" style={{ background: "var(--ink)" }}>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/30 mb-4">Contact Délégué à la Protection des Données</p>
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="flex-1">
                  <p className="text-white font-medium text-sm leading-relaxed opacity-70 mb-4">
                    Pour exercer vos droits ou pour toute question relative à la protection de vos données, contactez notre DPO. Nous vous répondrons dans un délai de <strong className="text-white">30 jours ouvrés</strong>.
                  </p>
                </div>
                <div className="flex-shrink-0 space-y-3">
                  <a href="mailto:protection@qapril.net" className="flex items-center gap-3 p-4 rounded-2xl border border-white/10 hover:border-white/25 transition-all group">
                    <Mail className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-white/40">Email DPO</p>
                      <p className="font-black text-white text-sm font-mono">protection@qapril.net</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ─── Cross-links ─── */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Mentions Légales", href: "/mentions-legales", desc: "Informations éditeur" },
                { label: "CGU", href: "/cgu", desc: "Conditions générales d'utilisation" },
                { label: "Contact", href: "/contact", desc: "Nous contacter" },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="flex items-center justify-between p-5 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-lg transition-all group">
                  <div>
                    <p className="font-black text-ink text-sm">{link.label}</p>
                    <p className="text-xs text-ink3 mt-0.5">{link.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-black/20 group-hover:text-black/60 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
