"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-v2-wrapper" style={{ minHeight: 'auto', background: 'transparent' }}>
      <nav className={scrolled ? "scrolled" : ""} style={{ position: 'sticky', top: 0, zIndex: 500, borderBottom: '1px solid rgba(255,139,0,.12)' }}>
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="QAPRIL Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
        </Link>
        <div className="nav-links">
          <Link href="/a-propos" className="nav-link">À Propos</Link>
          <Link href="/faq" className="nav-link">Assistance</Link>
          <Link href="/blog" className="nav-link">Blog</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/mon-espace-locataire/login" className="nav-link !font-bold opacity-70 hover:opacity-100">Connexion Locataire</Link>
          <Link href="/dashboard/login" className="nav-cta">Connexion Propriétaire</Link>
        </div>
        <button className="nav-hamburger">
          <span></span><span></span><span></span>
        </button>
      </nav>
    </div>
  );
}
