"use client";
import React, { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AdminSidebarProps {
    onLogout: () => Promise<void>;
    sessionUser?: any;
}

export default function AdminSidebar({ onLogout, sessionUser }: AdminSidebarProps) {
    const pathname = usePathname()

    // Fermer la sidebar sur mobile lors d'un changement de page
    useEffect(() => {
        document.body.classList.remove('sidebar-open');
    }, [pathname]);

    return (
        <>
        {/* Overlay sombre pour fermer la sidebar en tapant à côté */}
        <div 
            className="sidebar-overlay" 
            onClick={() => document.body.classList.remove('sidebar-open')}
        />
        <div className="sidebar">
          <Link href="/admin" className="logo" style={{ textDecoration: 'none' }}>
            <div className="logo-mark">Q</div>
            <div>
              <div className="logo-text">qapril</div>
              <span className="logo-sub">Admin</span>
            </div>
          </Link>
          
          <nav className="nav">
            <div className="nav-section">Principal</div>
            <Link href="/admin" className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/></svg>
              Tableau de bord
            </Link>
            <Link href="/admin/leases" className={`nav-item ${pathname === '/admin/leases' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1L10 6H15L11 9.5L12.5 14.5L8 11.5L3.5 14.5L5 9.5L1 6H6L8 1Z" fill="currentColor"/></svg>
              Baux & Contrats
            </Link>
            <Link href="/admin/receipts" className={`nav-item ${pathname === '/admin/receipts' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 3V2M11 3V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 7H14" stroke="currentColor" strokeWidth="1.2"/></svg>
              Paiements Loyers
            </Link>
            <Link href="/admin/properties" className={`nav-item ${pathname === '/admin/properties' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 118 5a1.5 1.5 0 010 3z" fill="currentColor"/></svg>
              Maisons & Immeubles
            </Link>
            <Link href="/admin/users" className={`nav-item ${pathname === '/admin/users' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M1 14c0-3.31 2.24-6 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 11H12V9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Comptes Utilisateurs
            </Link>

            <div className="nav-section">Finances</div>
            <Link href="/admin/fiscal" className={`nav-item ${pathname === '/admin/fiscal' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="9" r="1.5" fill="currentColor"/></svg>
              Cautions (CDC-CI)
            </Link>
            <Link href="/admin/reversals" className={`nav-item ${pathname === '/admin/reversals' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M2 10l4-4 4 4 4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Reversements Propriétaires
            </Link>
            <Link href="/admin/reclamations" className={`nav-item ${pathname === '/admin/reclamations' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M3 12L6 8l3 3 4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Pannes & Réclamations
            </Link>
            <Link href="/admin/reports" className={`nav-item ${pathname === '/admin/reports' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Comptabilité & Bilans
            </Link>

            <div className="nav-section">Opérations</div>
            <Link href="/admin/disputes" className={`nav-item ${pathname === '/admin/disputes' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Gestion des Litiges
            </Link>
            <Link href="/admin/agency" className={`nav-item ${pathname === '/admin/agency' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M4 12V4a2 2 0 012-2h4a2 2 0 012 2v8m-6-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Agences & Mandats
            </Link>
            <Link href="/admin/edl" className={`nav-item ${pathname === '/admin/edl' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M2 10V13H5L13 5L10 2L2 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              États des Lieux (EDL)
            </Link>
            <Link href="/admin/system" className={`nav-item ${pathname === '/admin/system' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1v5M4 4l3 2M12 4l-3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="10" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>
              Paramètres Système
            </Link>
            <Link href="/admin/whatsapp" className={`nav-item ${pathname === '/admin/whatsapp' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1a7 7 0 00-6.07 10.5L1 15l3.63-.95A7 7 0 108 1zm0 12.6a5.57 5.57 0 01-2.84-.78l-.2-.12-2.11.55.56-2.06-.13-.21A5.6 5.6 0 118 13.6z" fill="currentColor"/></svg>
              Notifications WhatsApp
            </Link>

            <Link href="/" className="nav-item" style={{ marginTop: '10px' }}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M8 2L2 7v7h4v-4h4v4h4V7L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Retour Accueil
            </Link>

            {/* Logout button mimicking a nav-item */}
            <div className="nav-item cursor-pointer" onClick={onLogout} style={{ color: '#FF6600', marginTop: '5px' }}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M6 14H3a2 2 0 01-2-2V4a2 2 0 012-2h3M10 11l4-3-4-3M14 8H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Déconnexion
            </div>
          </nav>
          
          <div className="sidebar-bottom">
            <div className="user-mini">
              <div className="user-avatar">{sessionUser?.fullName ? sessionUser.fullName.substring(0, 2).toUpperCase() : 'SA'}</div>
              <div className="user-info">
                <p>{sessionUser?.fullName || 'Super Admin'}</p>
                <span>{sessionUser?.role || 'SUPER_ADMIN'}</span>
              </div>
            </div>
          </div>
        </div>
        </>
    )
}

