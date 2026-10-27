"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/piliers", label: "Piliers" },
  { href: "/solutions", label: "Solutions" },
  { href: "/services", label: "Services" },
  { href: "/comparatif", label: "Comparatif" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Sur la home, le header est transparent puis devient opaque au scroll.
  // Sur toutes les autres pages (fond clair), il reste toujours sombre et opaque.
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Classe de fond : toujours opaque sauf sur la home avant scroll
  const navBgClass = !isHome || scrolled
    ? "bg-[#09090B]/97 backdrop-blur-xl border-b border-white/10 shadow-2xl"
    : "bg-[#09090B]/60 backdrop-blur-md border-b border-white/5";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <nav
        className={`flex items-center justify-between px-6 md:px-12 h-20 transition-all duration-300 ${navBgClass}`}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-white/5 p-2 rounded-2xl border border-white/10 group-hover:border-amber-500/40 transition-all">
            <img src="/logo.png" alt="QAPRIL" className="h-9 w-auto object-contain brightness-110" />
          </div>
          <span className="font-black text-xl tracking-tight text-white hidden sm:inline-block">
            QAPRIL
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
          {navLinks.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3.5 py-2 text-sm font-semibold transition-all duration-200 rounded-full ${
                  active
                    ? href === "/contact"
                      ? "text-amber-300 bg-amber-400/15"
                      : "text-white bg-white/10"
                    : href === "/contact"
                    ? "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
                {/* Active indicator dot */}
                {active && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/mon-espace-locataire/login"
            className="flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-sm px-5 py-2.5 rounded-full transition-all shadow-md shadow-amber-500/20 hover:scale-105"
          >
            Espace Locataire <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/login"
            className="flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-sm px-5 py-2.5 rounded-full transition-all shadow-md shadow-amber-500/20 hover:scale-105"
          >
            Espace Propriétaire <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#09090B]/98 backdrop-blur-2xl border-b border-white/10 px-6 py-8 space-y-5 shadow-2xl">
          <div className="flex flex-col space-y-1">
            {navLinks.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 text-base font-bold px-4 py-3 rounded-2xl transition-all ${
                    active
                      ? href === "/contact"
                        ? "text-amber-300 bg-amber-400/10"
                        : "text-white bg-white/10"
                      : href === "/contact"
                      ? "text-amber-400"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  )}
                  {label}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <Link
              href="/mon-espace-locataire/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-2xl border border-white/20 text-white font-bold text-sm hover:bg-white/5"
            >
              Connexion Locataire
            </Link>
            <Link
              href="/dashboard/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-2xl bg-[#F59E0B] text-black font-black text-sm hover:bg-[#D97706]"
            >
              Connexion Propriétaire
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
