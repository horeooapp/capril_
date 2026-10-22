"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Phone, Mail, MapPin, MessageSquare, Clock, ShieldCheck,
  Send, CheckCircle2, ArrowRight, Building2, HelpCircle,
  Smartphone, UserCheck, AlertCircle, Headphones
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const CONTACT_CHANNELS = [
  {
    icon: <Building2 className="w-6 h-6" />,
    badge: "Bailleurs & Investisseurs",
    title: "Support Propriétaires",
    desc: "Assistance dédiée à la gestion de patrimoine, baux certifiés et déclarations fiscales.",
    phone: "+225 27 22 59 00 10",
    email: "proprietaires@qapril.ci",
    hours: "Lun - Ven : 8h00 - 18h30",
    accent: "#F59E0B",
    bg: "#FEF3C7",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    badge: "Paiements & Quittances",
    title: "Assistance Locataires",
    desc: "Aide pour le règlement des loyers via Wave, Orange, MTN, Moov et quittances PDF.",
    phone: "+225 07 07 45 12 30",
    email: "locataires@qapril.ci",
    hours: "7j/7 : 7h30 - 20h00",
    accent: "#059669",
    bg: "#D1FAE5",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    badge: "Institutionnel & Agences",
    title: "Partenariats & Grands Comptes",
    desc: "Intégration API, mandats multi-biens pour agences agréées et notaires.",
    phone: "+225 27 20 25 80 00",
    email: "partenariats@qapril.ci",
    hours: "Lun - Ven : 8h30 - 18h00",
    accent: "#0EA5E9",
    bg: "#E0F2FE",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    badge: "Abidjan · Siège",
    title: "Accueil Physique",
    desc: "Riviera Bonoumin, Boulevard Latrille, Immeuble QAPRIL, 3ème étage, Abidjan.",
    phone: "+225 27 22 00 44 20",
    email: "contact@qapril.ci",
    hours: "Accueil sans RDV : 9h - 17h",
    accent: "#7C3AED",
    bg: "#EDE9FE",
  },
];

const FAQS = [
  {
    q: "Quels sont les délais de prise en charge d'une demande ?",
    a: "Nos équipes d'Abidjan répondent sous 2 heures ouvrées pour les demandes prioritaires (blocage paiement ou signature de bail). Pour toute question générale, le délai maximal est de 24 heures.",
  },
  {
    q: "Que faire en cas d'erreur lors d'un paiement Mobile Money ?",
    a: "Si un débit a eu lieu sur votre compte Wave, Orange Money ou MTN sans génération immédiate de quittance, contactez directement l'Assistance Locataires en fournissant le numéro de transaction SMS. La régularisation est opérée sous 15 minutes.",
  },
  {
    q: "Comment prendre rendez-vous avec un conseiller juridique ?",
    a: "Les bailleurs disposant d'un compte Premium peuvent solliciter une consultation relative aux baux et litiges d'expulsion directement depuis leur espace ou en envoyant un email à proprietaires@qapril.ci.",
  },
  {
    q: "Les agences immobilières peuvent-elles bénéficier d'une formation ?",
    a: "Oui, nous organisons chaque semaine des sessions de prise en main en présentiel à Cocody ou à distance via visio pour les équipes de gestion locative.",
  },
];

export default function ContactPage() {
  const [profile, setProfile] = useState<"PROPRIETAIRE" | "LOCATAIRE" | "AGENCE" | "AUTRE">("PROPRIETAIRE");
  const [subject, setSubject] = useState("BAIL");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  };

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
            backgroundImage: "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.12) 0%, transparent 60%), radial-gradient(circle at 85% 70%, rgba(5,150,105,0.08) 0%, transparent 50%)"
          }} />

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-amber-400" style={{ background: "rgba(245,158,11,0.08)" }}>
                <Headphones className="w-3.5 h-3.5" />
                Support National & Assistance Client
              </span>
              <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 uppercase">
                À votre <br />
                <span style={{ color: "var(--mango)" }}>écoute</span>
              </h1>
              <p className="text-lg font-medium max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
                Une équipe basée à Abidjan pour accompagner propriétaires, locataires et agences immobilières dans toutes leurs démarches.
              </p>

              {/* Quick stats badges */}
              <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-white/70">
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Réponse sous 2h ouvrées</span>
                </div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Assistance certifiée conforme CI</span>
                </div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>Bureaux à Cocody, Abidjan</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── CHANNELS GRID ─── */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-black/5 text-ink/60 mb-3">
              Canaux Directs
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-ink tracking-tight uppercase">
              Choisissez votre ligne d&apos;assistance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {CONTACT_CHANNELS.map((c, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-7 border border-black/8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: c.bg, color: c.accent }}>
                      {c.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/5 text-ink/60">
                      {c.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-ink mb-2">{c.title}</h3>
                  <p className="text-xs text-ink3 leading-relaxed mb-6">{c.desc}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-black/5">
                  <a
                    href={`tel:${c.phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-2 text-sm font-black text-ink hover:text-amber-600 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{c.phone}</span>
                  </a>
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-2 text-xs font-bold text-ink3 hover:text-ink transition-colors"
                  >
                    <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{c.email}</span>
                  </a>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-black/40">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.hours}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ─── CONTACT FORM & LOCATION ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-24">

            {/* FORMULAIRE (7 COLS) */}
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 sm:p-12 border border-black/8 shadow-xl"
            >
              <div className="mb-8">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 mb-2 block">
                  Formulaire Sécurisé
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-ink tracking-tight uppercase">
                  Envoyez-nous un message
                </h3>
                <p className="text-sm text-ink3 mt-2">
                  Nous orientons directement votre requête vers le pôle compétent d&apos;Abidjan.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black text-emerald-900">Message transmis avec succès</h4>
                  <p className="text-sm text-emerald-700 max-w-md mx-auto">
                    Merci <strong>{name || "cher utilisateur"}</strong>. Un accusé de réception a été envoyé à <strong>{email}</strong>. Un conseiller QAPRIL prendra contact avec vous sous 2 heures ouvrées.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setMessage(""); }}
                    className="mt-4 px-6 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-colors"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Profil selector */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                      Vous êtes :
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "PROPRIETAIRE", label: "Bailleur" },
                        { id: "LOCATAIRE", label: "Locataire" },
                        { id: "AGENCE", label: "Agence" },
                        { id: "AUTRE", label: "Autre" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setProfile(p.id as any)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all text-center ${
                            profile === p.id
                              ? "bg-amber-500 text-black border-amber-500 shadow-sm"
                              : "bg-black/5 text-ink/70 border-transparent hover:bg-black/10"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Motif */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                      Motif de la demande :
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-cream text-ink text-sm font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="BAIL">Rédaction ou signature d&apos;un bail numérique</option>
                      <option value="PAIEMENT">Question sur un paiement Mobile Money / Quittance</option>
                      <option value="SCORE">Score ICL & solvabilité locataire</option>
                      <option value="TECH">Support technique / Problème d&apos;accès compte</option>
                      <option value="PARTENARIAT">Proposition de partenariat / Mandat agence</option>
                      <option value="AUTRE">Autre renseignement</option>
                    </select>
                  </div>

                  {/* Nom & Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Koffi Kouassi"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-cream text-ink text-sm font-medium focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                        Téléphone (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+225 07 00 00 00 00"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-cream text-ink text-sm font-medium focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                      Adresse Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="koffi@exemple.ci"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-cream text-ink text-sm font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                      Votre Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Précisez votre demande, vos références de bail ou de bien..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-cream text-ink text-sm font-medium focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-black hover:bg-neutral-800 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-black/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Transmission en cours...</span>
                    ) : (
                      <>
                        <span>Transmettre ma demande</span>
                        <Send className="w-4 h-4 text-amber-400" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-ink3">
                    Vos données sont traitées en conformité avec la loi ivoirienne n° 2013-450 sur la protection des données.
                  </p>
                </form>
              )}
            </motion.div>

            {/* ADRESSE & PERMANENCE (5 COLS) */}
            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-6"
            >
              {/* Carte adresse */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-black/8 shadow-md space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-ink">Siège Opérationnel</h4>
                    <p className="text-xs text-ink3">Abidjan, République de Côte d&apos;Ivoire</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-cream border border-black/5 space-y-2 text-sm text-ink font-medium">
                  <p className="font-bold text-ink">QAPRIL TECHNOLOGIES SAS</p>
                  <p>Riviera Bonoumin, Boulevard Latrille</p>
                  <p>Immeuble Horizon, 3ème étage</p>
                  <p>Commune de Cocody · Abidjan</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-black/5">
                    <span className="text-ink3 font-medium">Standard</span>
                    <span className="font-bold text-ink">+225 27 22 00 44 20</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-black/5">
                    <span className="text-ink3 font-medium">WhatsApp Pro</span>
                    <span className="font-bold text-emerald-600">+225 07 07 45 12 30</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-black/5">
                    <span className="text-ink3 font-medium">Email Général</span>
                    <span className="font-bold text-ink">contact@qapril.ci</span>
                  </div>
                </div>
              </div>

              {/* Permanence d'urgence */}
              <div className="p-8 rounded-[2.5rem]" style={{ background: "var(--ink)" }}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base">Permanence Litiges & Urgences</h4>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">
                      En cas de contestation immédiate de loyer ou de tentative d&apos;expulsion illégale, un juriste d&apos;astreinte est mobilisable.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Ligne d&apos;Astreinte</p>
                    <p className="text-amber-400 font-black text-lg">+225 05 05 99 11 00</p>
                  </div>
                  <span className="text-xs font-bold text-white/60 bg-white/10 px-3 py-1.5 rounded-full">
                    24h/24
                  </span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* ─── FAQ ─── */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-24"
          >
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-black/5 text-ink/60 mb-3">
                Questions Fréquentes
              </span>
              <h3 className="text-3xl font-black text-ink tracking-tight uppercase">
                Questions d&apos;assistance récurrentes
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FAQS.map((faq, i) => (
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

          {/* ─── Cross-links ─── */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="p-10 rounded-[2.5rem]" style={{ background: "var(--ink)" }}>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/30 mb-6">Pages associées</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Mentions Légales", href: "/mentions-legales", desc: "Informations éditeur & hébergeur" },
                  { label: "Confidentialité", href: "/confidentialite", desc: "Protection des données personnelles" },
                  { label: "CGU", href: "/cgu", desc: "Conditions Générales d'Utilisation" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between p-5 rounded-2xl border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all group"
                  >
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
