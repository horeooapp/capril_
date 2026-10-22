"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Building2, Mail, MapPin, Globe, ShieldCheck, Server,
  FileText, Scale, AlertCircle, Gavel, Lock, ArrowRight, Phone
} from "lucide-react";

const SECTIONS = [
  { num: "01", id: "editeur", label: "L'Éditeur" },
  { num: "02", id: "hebergement", label: "Hébergement" },
  { num: "03", id: "propriete", label: "Propriété Intellectuelle" },
  { num: "04", id: "responsabilite", label: "Responsabilité" },
  { num: "05", id: "droit", label: "Droit Applicable" },
  { num: "06", id: "cookies", label: "Cookies" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export default function MentionsLegalesPage() {
  return (
    <div className="landing-v2-wrapper font-sans text-ink bg-cream min-h-screen overflow-x-hidden relative">
      <div className="noise-overlay"></div>
      <Header />

      <main className="relative z-10">

        {/* ─── HERO ─── */}
        <section className="relative pt-40 pb-32 overflow-hidden" style={{ background: "var(--ink)" }}>
          <div className="absolute inset-0" aria-hidden style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
          <div className="absolute inset-0 z-0" aria-hidden>
            <div className="hero-blob-1" style={{ opacity: 0.15 }} />
            <div className="hero-blob-2" style={{ opacity: 0.15 }} />
          </div>

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-amber-400" style={{ background: "rgba(245,158,11,0.08)" }}>
                <Gavel className="w-3.5 h-3.5" />
                Informations Éditeur · Version 2026
              </span>
              <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 uppercase">
                Mentions<br />
                <span style={{ color: "var(--mango)" }}>Légales</span>
              </h1>
              <p className="text-lg font-medium max-w-2xl mx-auto leading-relaxed mb-12" style={{ color: "rgba(255,255,255,0.5)" }}>
                Conformément à la loi ivoirienne sur la communication électronique, QAPRIL publie l&apos;ensemble des informations légales relatives à l&apos;édition et l&apos;exploitation de cette plateforme.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {SECTIONS.map((s) => (
                  <a key={s.id} href={`#${s.id}`}
                    className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/50 hover:text-white hover:border-white/30 transition-all"
                    style={{ background: "rgba(255,255,255,0.04)" }}>
                    {s.num} — {s.label}
                  </a>
                ))}
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

          {/* 01 — Éditeur */}
          <motion.section id="editeur" className="scroll-mt-28"
            custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>01</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-500 mb-1">L&apos;Éditeur</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Informations sur la société</h2>
              </div>
            </div>
            <p className="text-lg font-medium text-ink3 leading-relaxed mb-10 max-w-3xl">
              Le site internet <strong>QAPRIL</strong> (accessible à <code className="bg-white border border-black/5 px-2 py-0.5 rounded text-sm">qapril.ci</code>) et les applications mobiles QAPRIL Bailleur et QAPRIL Locataire sont édités par la société QAPRIL Technologies, entreprise de droit ivoirien.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: <Building2 className="w-4 h-4" />, label: "Dénomination Sociale", value: "QAPRIL Technologies SAS", accent: "#F59E0B" },
                { icon: <MapPin className="w-4 h-4" />, label: "Siège Social", value: "Riviéra Bonoumin, Abidjan — Côte d'Ivoire", accent: "#0EA5E9" },
                { icon: <FileText className="w-4 h-4" />, label: "Registre du Commerce", value: "CI-ABJ-2024-B-XXXXX", accent: "#7C3AED" },
                { icon: <Mail className="w-4 h-4" />, label: "Email de Contact", value: "contact@qapril.ci", accent: "#059669" },
                { icon: <Phone className="w-4 h-4" />, label: "Téléphone", value: "+225 07 XX XX XX XX", accent: "#CC2020" },
                { icon: <Globe className="w-4 h-4" />, label: "Directeur de Publication", value: "Direction Générale QAPRIL", accent: "#F59E0B" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.accent}18`, color: item.accent }}>{item.icon}</div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: item.accent }}>{item.label}</p>
                    <p className="font-bold text-ink text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 rounded-3xl border border-amber-200 bg-amber-50">
              <p className="text-sm font-medium text-amber-900 leading-relaxed">
                <strong>Note légale :</strong> L&apos;ensemble des activités de QAPRIL Technologies est soumis à la législation en vigueur en République de Côte d&apos;Ivoire, notamment la loi n°2013-546 relative aux transactions électroniques.
              </p>
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 02 — Hébergement */}
          <motion.section id="hebergement" className="scroll-mt-28"
            custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>02</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-500 mb-1">Infrastructure</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Hébergement & Infrastructure</h2>
              </div>
            </div>
            <p className="text-lg font-medium text-ink3 leading-relaxed mb-10 max-w-3xl">
              L&apos;infrastructure technique de QAPRIL est distribuée sur plusieurs fournisseurs certifiés afin de garantir une haute disponibilité et la sécurité des données immobilières.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-8 rounded-3xl border border-black/5 bg-white shadow-xl shadow-black/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#E0F2FE", color: "#0EA5E9" }}>
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-sky-500">Hébergeur Principal</p>
                    <h3 className="font-black text-ink">Hostinger International Ltd.</h3>
                  </div>
                </div>
                <p className="text-sm font-medium text-ink3 leading-relaxed mb-4">Serveur web, base de données relationnelle (PostgreSQL), stockage de fichiers et actifs numériques.</p>
                <div className="flex flex-wrap gap-2">
                  {["SSL/TLS", "Backup quotidien", "99.9% SLA"].map((t) => (
                    <span key={t} className="text-xs font-bold px-3 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-100">{t}</span>
                  ))}
                </div>
              </div>
              <div className="p-8 rounded-3xl border border-black/5 bg-white shadow-xl shadow-black/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#EDE9FE", color: "#7C3AED" }}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-purple-500">CDN & Déploiement</p>
                    <h3 className="font-black text-ink">Vercel Inc.</h3>
                  </div>
                </div>
                <p className="text-sm font-medium text-ink3 leading-relaxed mb-4">Distribution mondiale via Edge Network, optimisation de performance et déploiement continu de l&apos;application Next.js.</p>
                <div className="flex flex-wrap gap-2">
                  {["Edge Network", "HTTPS forcé", "DDoS Protection"].map((t) => (
                    <span key={t} className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-sky-100 bg-sky-50 flex items-start gap-4">
              <ShieldCheck className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-sky-900 leading-relaxed">
                Toutes les données en transit sont chiffrées via TLS 1.3. Les sauvegardes sont effectuées quotidiennement avec une rétention de 30 jours.
              </p>
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 03 — Propriété Intellectuelle */}
          <motion.section id="propriete" className="scroll-mt-28"
            custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>03</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-500 mb-1">Droits Réservés</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Propriété Intellectuelle</h2>
              </div>
            </div>
            <p className="text-lg font-medium text-ink3 leading-relaxed mb-8 max-w-3xl">
              L&apos;ensemble des éléments de la plateforme QAPRIL — code source, interfaces, logotypes, algorithmes de scoring et contenus — sont protégés par le droit de la propriété intellectuelle ivoirien.
            </p>
            <div className="grid grid-cols-1 gap-4">
              {[
                { title: "Marques & Logotypes", desc: "Le nom « QAPRIL », son logotype, ses variantes graphiques et ses slogans sont des marques déposées. Toute reproduction sans autorisation écrite est interdite.", accent: "#7C3AED" },
                { title: "Algorithmes & Score ICL", desc: "La méthodologie de calcul du Score ICL (Indice de Crédit Locatif), les modèles de données et les algorithmes de matching constituent des secrets commerciaux protégés.", accent: "#0EA5E9" },
                { title: "Contenus Éditoriaux", desc: "Les textes, visuels, maquettes de documents (baux, quittances) et tout contenu produit par QAPRIL sont protégés par le droit d'auteur. Toute reproduction est soumise à autorisation.", accent: "#059669" },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
                  <div className="w-1.5 rounded-full flex-shrink-0 self-stretch" style={{ background: item.accent }} />
                  <div>
                    <h3 className="font-black text-ink mb-2">{item.title}</h3>
                    <p className="text-sm font-medium text-ink3 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 04 — Responsabilité */}
          <motion.section id="responsabilite" className="scroll-mt-28"
            custom={3} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>04</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-600 mb-1">Limites</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Limitation de Responsabilité</h2>
              </div>
            </div>
            <p className="text-lg font-medium text-ink3 leading-relaxed mb-8 max-w-3xl">
              QAPRIL s&apos;engage à assurer le meilleur niveau de service. Toutefois, sa responsabilité ne saurait être engagée dans les cas suivants :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                "Interruptions liées à la maintenance ou à des événements de force majeure",
                "Inexactitudes dans les informations fournies par les utilisateurs (identité, biens, documents)",
                "Litiges entre bailleurs et locataires portant sur des faits extérieurs à la plateforme",
                "Dommages résultant d'une utilisation non conforme des fonctionnalités",
                "Contenus publiés par des tiers sur des sites externes liés depuis QAPRIL",
                "Pertes financières découlant de décisions basées sur le Score ICL à titre indicatif",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-black/5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#FEE2E2" }}>
                    <AlertCircle className="w-3 h-3 text-red-600" />
                  </div>
                  <p className="text-sm font-medium text-ink3 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
            <div className="p-8 rounded-3xl" style={{ background: "var(--ink)", color: "white" }}>
              <p className="text-sm font-medium leading-relaxed opacity-70">
                La responsabilité maximale de QAPRIL ne pourra en aucun cas excéder le montant des sommes versées par l&apos;utilisateur au cours des 12 derniers mois.
              </p>
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 05 — Droit Applicable */}
          <motion.section id="droit" className="scroll-mt-28"
            custom={4} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>05</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600 mb-1">Juridiction</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Droit Applicable & Juridiction</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-lg font-medium text-ink3 leading-relaxed">
                  Les présentes mentions légales et l&apos;ensemble des relations entre QAPRIL et ses utilisateurs sont régies exclusivement par le droit ivoirien.
                </p>
                <p className="text-base font-medium text-ink3 leading-relaxed">
                  En cas de litige, les parties s&apos;engagent à rechercher une solution amiable. À défaut, tout différend sera soumis aux tribunaux compétents d&apos;Abidjan.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Droit applicable", value: "Loi ivoirienne" },
                  { label: "Langue des contrats", value: "Français" },
                  { label: "Juridiction compétente", value: "Tribunaux d'Abidjan" },
                  { label: "Loi de référence", value: "Loi n°2013-546 du 30/07/2013" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center p-4 bg-white rounded-xl border border-black/5">
                    <span className="text-sm font-bold text-ink3">{item.label}</span>
                    <span className="text-sm font-black text-ink">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 06 — Cookies */}
          <motion.section id="cookies" className="scroll-mt-28"
            custom={5} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>06</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-500 mb-1">Traceurs</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Politique de Cookies</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { type: "Cookies Fonctionnels", desc: "Strictement nécessaires au maintien de votre session d'authentification (token JWT sécurisé).", status: "Obligatoires", statusColor: "#059669", bg: "#D1FAE5" },
                { type: "Cookies Analytiques", desc: "Analyse anonyme de l'utilisation de la plateforme pour en améliorer l'ergonomie et les performances.", status: "Optionnels", statusColor: "#0EA5E9", bg: "#E0F2FE" },
                { type: "Cookies Publicitaires", desc: "QAPRIL n'utilise aucun cookie de ciblage publicitaire. Aucune donnée n'est revendue à des tiers.", status: "Non utilisés", statusColor: "#CC2020", bg: "#FEE2E2" },
              ].map((cookie, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm">
                  <span className="inline-block text-xs font-black px-3 py-1 rounded-full mb-3" style={{ background: cookie.bg, color: cookie.statusColor }}>
                    {cookie.status}
                  </span>
                  <h3 className="font-black text-ink mb-2">{cookie.type}</h3>
                  <p className="text-sm font-medium text-ink3 leading-relaxed">{cookie.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ─── Cross-links ─── */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="p-10 rounded-[2.5rem]" style={{ background: "var(--ink)" }}>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/30 mb-6">Pages associées</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Confidentialité", href: "/confidentialite", desc: "Politique de protection des données" },
                  { label: "CGU", href: "/cgu", desc: "Conditions générales d'utilisation" },
                  { label: "Contact", href: "/contact", desc: "Nous contacter" },
                ].map((link) => (
                  <Link key={link.href} href={link.href}
                    className="flex items-center justify-between p-5 rounded-2xl border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all group">
                    <div>
                      <p className="font-black text-white text-sm">{link.label}</p>
                      <p className="text-xs text-white/40 mt-0.5">{link.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
