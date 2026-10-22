"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  FileText, Building2, Home, CheckCircle2, XCircle, Lock,
  ArrowRight, Scale, AlertCircle, Zap, UserCheck, ShieldCheck
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export default function CGUPage() {
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
          <div className="absolute inset-0" aria-hidden style={{
            backgroundImage: "radial-gradient(circle at 20% 60%, rgba(5,150,105,0.07) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.07) 0%, transparent 55%)",
          }} />

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-emerald-400" style={{ background: "rgba(5,150,105,0.08)" }}>
                <Scale className="w-3.5 h-3.5" />
                Engagements Mutuels · Applicables au 01 Mars 2026
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 uppercase">
                Conditions<br />Générales<br />
                <span style={{ color: "var(--mango)" }}>d&apos;Utilisation</span>
              </h1>
              <p className="text-lg font-medium max-w-2xl mx-auto leading-relaxed mb-12" style={{ color: "rgba(255,255,255,0.5)" }}>
                En utilisant QAPRIL, vous acceptez les présentes conditions qui définissent les droits et obligations de chaque partie — Propriétaires, Locataires, et la plateforme QAPRIL.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10" style={{ background: "rgba(245,158,11,0.1)" }}>
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">Bailleurs</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10" style={{ background: "rgba(5,150,105,0.1)" }}>
                  <Home className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400">Locataires</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10" style={{ background: "rgba(14,165,233,0.1)" }}>
                  <Zap className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-bold text-sky-400">Plateforme</span>
                </div>
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

          {/* 01 — Objet */}
          <motion.section id="objet" className="scroll-mt-28"
            custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>01</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-500 mb-1">Présentation</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Objet de la Plateforme</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-lg font-medium text-ink3 leading-relaxed mb-6">
                  QAPRIL est la <strong>plateforme nationale de sécurisation et de certification des baux locatifs</strong> et des quittances de loyers en Côte d&apos;Ivoire. Elle a pour mission d&apos;encadrer, normaliser et dématérialiser la relation entre le Propriétaire (Bailleur) et son Locataire.
                </p>
                <p className="text-base font-medium text-ink3 leading-relaxed">
                  L&apos;accès à QAPRIL implique l&apos;acceptation sans réserve des présentes CGU, dans leur version en vigueur au moment de la connexion.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { icon: <FileText className="w-4 h-4" />, label: "Baux numériques certifiés à valeur légale", accent: "#0EA5E9", bg: "#E0F2FE" },
                  { icon: <CheckCircle2 className="w-4 h-4" />, label: "Quittances automatiques horodatées", accent: "#059669", bg: "#D1FAE5" },
                  { icon: <UserCheck className="w-4 h-4" />, label: "Score ICL de fiabilité locative", accent: "#7C3AED", bg: "#EDE9FE" },
                  { icon: <Lock className="w-4 h-4" />, label: "Gestion sécurisée de la caution", accent: "#F59E0B", bg: "#FEF3C7" },
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-black/5 shadow-sm">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: feat.bg, color: feat.accent }}>
                      {feat.icon}
                    </div>
                    <span className="font-bold text-ink text-sm">{feat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 02 — Accès & Inscription */}
          <motion.section id="acces" className="scroll-mt-28"
            custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>02</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-500 mb-1">Conditions</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Accès & Inscription</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-sm">
                <h3 className="font-black text-ink mb-5 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Conditions d&apos;accès
                </h3>
                <ul className="space-y-3">
                  {[
                    "Être une personne physique majeure (18 ans+) ou une personne morale légalement constituée",
                    "Disposer d'une pièce d'identité valide (CNI ivoirienne ou Passeport en cours de validité)",
                    "Fournir un numéro de téléphone mobile actif pour la réception des OTP",
                    "Accepter les présentes CGU et la Politique de Confidentialité",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-ink3">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 bg-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-sm">
                <h3 className="font-black text-ink mb-5 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" /> Comportements interdits
                </h3>
                <ul className="space-y-3">
                  {[
                    "Créer plusieurs comptes pour un même utilisateur",
                    "Fournir de fausses informations lors de l'inscription ou du KYC",
                    "Accéder au compte d'un autre utilisateur sans autorisation",
                    "Tenter de contourner les mécanismes de sécurité de la plateforme",
                    "Utiliser QAPRIL à des fins de blanchiment ou de fraude immobilière",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-ink3">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 bg-red-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 03 — Obligations du Bailleur */}
          <motion.section id="bailleur" className="scroll-mt-28"
            custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>03</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-500 mb-1">Propriétaires</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Obligations du Bailleur</h2>
              </div>
            </div>
            <p className="text-lg font-medium text-ink3 leading-relaxed mb-8 max-w-3xl">
              En tant que propriétaire-bailleur sur QAPRIL, vous vous engagez à respecter les obligations suivantes pour garantir la licéité des transactions sur la plateforme.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Déclaration de biens licites", desc: "Déclarer uniquement des biens immobiliers existants, légaux et disposant d'un ACD (Acte de Cession de Droit) ou titre équivalent.", icon: <Building2 className="w-4 h-4" /> },
                { title: "Exactitude du loyer", desc: "Déclarer le montant exact du loyer mensuel et ne percevoir aucun supplément non déclaré via la plateforme.", icon: <FileText className="w-4 h-4" /> },
                { title: "Émission immédiate des quittances", desc: "Émettre les quittances de loyer via le système QAPRIL le jour exact du paiement confirmé. Aucun retard n'est toléré.", icon: <CheckCircle2 className="w-4 h-4" /> },
                { title: "Gestion réglementaire de la caution", desc: "Respecter scrupuleusement la réglementation sur le plafonnement, le gel et la restitution de la caution locative.", icon: <Lock className="w-4 h-4" /> },
                { title: "Signalement des incidents", desc: "Signaler tout incident (impayé, dégradation, abandon du logement) dans les 72 heures via l'interface dédiée.", icon: <AlertCircle className="w-4 h-4" /> },
                { title: "Conformité ARTCI", desc: "Se conformer aux obligations déclaratives auprès de l'ARTCI concernant la mise en location de biens résidentiels.", icon: <ShieldCheck className="w-4 h-4" /> },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5 bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-all">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#FEF3C7", color: "#F59E0B" }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-ink text-sm mb-1">{item.title}</h3>
                    <p className="text-xs font-medium text-ink3 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 04 — Obligations du Locataire */}
          <motion.section id="locataire" className="scroll-mt-28"
            custom={3} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>04</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600 mb-1">Locataires</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Obligations du Locataire</h2>
              </div>
            </div>
            <p className="text-lg font-medium text-ink3 leading-relaxed mb-8 max-w-3xl">
              En tant que locataire sur QAPRIL, vous bénéficiez d&apos;une protection renforcée et d&apos;une traçabilité complète de vos paiements. En contrepartie, vous vous engagez à :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Pièce d'identité valide", desc: "Fournir une pièce d'identité officielle en cours de validité (CNI ivoirienne ou passeport) pour la vérification KYC.", accent: "#059669" },
                { title: "Acceptation du digital", desc: "Accepter la dématérialisation intégrale des processus baux, quittances et communications liées à votre contrat de location.", accent: "#0EA5E9" },
                { title: "Respect des échéances", desc: "Régler le loyer avant ou à la date d'échéance validée dans l'application. Tout retard impacte votre Score ICL.", accent: "#7C3AED" },
                { title: "Mise à jour des informations", desc: "Signaler tout changement de situation (départ, sous-location, dommages) dans les 7 jours calendaires.", accent: "#F59E0B" },
                { title: "Usage exclusif", desc: "N'utiliser le logement qu'à des fins d'habitation principale sauf accord préalable écrit du bailleur.", accent: "#CC2020" },
                { title: "Conservation des documents", desc: "Télécharger et conserver localement vos quittances et baux, QAPRIL n'étant pas un service d'archivage permanent.", accent: "#059669" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5 bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-all">
                  <div className="w-1 rounded-full flex-shrink-0 self-stretch" style={{ background: item.accent }} />
                  <div>
                    <h3 className="font-black text-ink text-sm mb-1">{item.title}</h3>
                    <p className="text-xs font-medium text-ink3 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 05 — Signatures Électroniques */}
          <motion.section id="signatures" className="scroll-mt-28"
            custom={4} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>05</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-500 mb-1">Légalité</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Signatures Électroniques</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <p className="text-lg font-medium text-ink3 leading-relaxed">
                  Toute signature électronique apposée via <strong>OTP SMS</strong> ou <strong>empreinte biométrique</strong> au sein de l&apos;application QAPRIL bénéficie d&apos;une valeur légale probante au regard des lois ivoiriennes.
                </p>
                <p className="text-base font-medium text-ink3 leading-relaxed">
                  Les parties renoncent expressément à contester la validité d&apos;un bail ou d&apos;une quittance au seul motif de son caractère électronique.
                </p>
                <div className="p-5 rounded-2xl border border-purple-100 bg-purple-50">
                  <p className="text-sm font-medium text-purple-900">
                    <strong>Base légale :</strong> Loi ivoirienne n°2013-546 du 30 juillet 2013 relative aux transactions électroniques, Article 14 à 23.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { method: "OTP SMS", desc: "Code à 6 chiffres envoyé sur votre mobile enregistré. Valide 5 minutes.", valid: true },
                  { method: "Empreinte Biométrique", desc: "Authentification via le capteur d'empreinte de l'appareil mobile (Face ID ou Touch ID).", valid: true },
                  { method: "Signature manuscrite scannée", desc: "Non acceptée. La plateforme n'accepte que les modalités de signature dématérialisées.", valid: false },
                ].map((method, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-black/5">
                    {method.valid
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    }
                    <div>
                      <h3 className="font-black text-ink text-sm mb-1">{method.method}</h3>
                      <p className="text-xs font-medium text-ink3">{method.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* 06 — Résiliation & Sanctions */}
          <motion.section id="resiliation" className="scroll-mt-28"
            custom={5} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-7xl font-black" style={{ color: "rgba(0,0,0,0.05)" }}>06</span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-600 mb-1">Sanctions</p>
                <h2 className="text-3xl font-black uppercase tracking-tight text-ink">Résiliation & Sanctions</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-sm">
                <h3 className="font-black text-ink mb-5">Résiliation à l&apos;initiative de l&apos;utilisateur</h3>
                <p className="text-sm font-medium text-ink3 leading-relaxed mb-4">
                  Tout utilisateur peut résilier son compte QAPRIL à tout moment depuis les paramètres de son profil. La résiliation entraîne :
                </p>
                <ul className="space-y-2">
                  {["Désactivation immédiate du compte", "Conservation des données légales pendant les délais prescrits", "Aucun remboursement des abonnements en cours"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm font-medium text-ink3">
                      <div className="w-1.5 h-1.5 rounded-full bg-black/30 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 rounded-3xl border border-red-100 bg-red-50">
                <h3 className="font-black text-red-900 mb-5">Suspension par QAPRIL</h3>
                <p className="text-sm font-medium text-red-800 leading-relaxed mb-4">
                  QAPRIL se réserve le droit de suspendre ou supprimer tout compte en cas de :
                </p>
                <ul className="space-y-2">
                  {[
                    "Fraude documentaire avérée",
                    "Violation répétée des CGU",
                    "Impayés supérieurs à 3 mois non justifiés",
                    "Comportement abusif envers l'équipe ou les autres utilisateurs",
                    "Décision judiciaire ou réquisition des autorités",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm font-medium text-red-900">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-8 rounded-3xl" style={{ background: "var(--ink)", color: "white" }}>
              <p className="text-sm font-medium opacity-70 leading-relaxed">
                <strong className="text-white">Recours :</strong> Toute décision de suspension peut faire l&apos;objet d&apos;une réclamation motivée adressée à <span className="font-mono text-amber-400">recours@qapril.ci</span> dans un délai de 30 jours.
              </p>
            </div>
          </motion.section>

          {/* ─── Cross-links ─── */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="p-10 rounded-[2.5rem]" style={{ background: "var(--ink)" }}>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/30 mb-6">Pages associées</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Mentions Légales", href: "/mentions-legales", desc: "Informations éditeur" },
                  { label: "Confidentialité", href: "/confidentialite", desc: "Protection des données" },
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

