"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#09090B] px-6 md:px-12 py-16 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <div className="bg-white/5 p-2 rounded-2xl border border-white/10 inline-block">
                <img src="/logo.png" alt="QAPRIL" className="h-10 w-auto object-contain brightness-110" />
              </div>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              L&apos;application simple et sécurisée pour gérer vos maisons, contrats de bail et loyers en Côte d&apos;Ivoire.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-bold text-white/40 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                Abidjan · Cocody Riviera
              </span>
            </div>
          </div>

          {/* Nav Col 1 */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-5">Découvrir QAPRIL</div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/piliers" className="text-white/45 hover:text-white transition-colors">Les 4 Piliers</Link>
              </li>
              <li>
                <Link href="/solutions" className="text-white/45 hover:text-white transition-colors">Solutions par Profil</Link>
              </li>
              <li>
                <Link href="/services" className="text-white/45 hover:text-white transition-colors">Nos Services</Link>
              </li>
              <li>
                <Link href="/comparatif" className="text-white/45 hover:text-white transition-colors">Comparatif</Link>
              </li>
              <li>
                <Link href="/tarifs" className="text-white/45 hover:text-white transition-colors">Tarifs & Offres</Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/45 hover:text-white transition-colors">Assistance & Support</Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-5">Portails d&apos;accès</div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/mon-espace-locataire/login" className="text-white/45 hover:text-white transition-colors">Espace Locataire</Link>
              </li>
              <li>
                <Link href="/dashboard/login" className="text-white/45 hover:text-white transition-colors">Espace Propriétaire</Link>
              </li>
              <li>
                <Link href="/dashboard/login" className="text-white/45 hover:text-white transition-colors">Agences Immobilières</Link>
              </li>
              <li>
                <Link href="/admin" className="text-white/45 hover:text-white transition-colors">Administration</Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 3 */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-5">Légal & Sécurité</div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/mentions-legales" className="text-white/45 hover:text-white transition-colors">Mentions Légales</Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-white/45 hover:text-white transition-colors">Confidentialité (RGPD/CI)</Link>
              </li>
              <li>
                <Link href="/cgu" className="text-white/45 hover:text-white transition-colors">Conditions Générales (CGU)</Link>
              </li>
              <li>
                <Link href="/contact" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">Nous Contacter</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p suppressHydrationWarning className="text-xs text-white/30">
            © {new Date().getFullYear()} QAPRIL Technologies SAS · Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span suppressHydrationWarning className="inline-flex items-center gap-2 text-xs text-white/40 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <span className="inline-flex w-3.5 h-2.5 rounded-[2px] overflow-hidden border border-white/20 shrink-0" aria-label="Drapeau Côte d'Ivoire">
                <span className="w-1/3 h-full bg-[#F77F00]" />
                <span className="w-1/3 h-full bg-white" />
                <span className="w-1/3 h-full bg-[#009E60]" />
              </span>
              Conforme droit ivoirien
            </span>
            <span className="text-xs text-white/40 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              🔒 Données chiffrées & certifiées
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
