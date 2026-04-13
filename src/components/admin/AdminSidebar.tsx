"use client";
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AdminSidebarProps {
    onLogout: () => Promise<void>;
    sessionUser?: any;
}

export default function AdminSidebar({ onLogout, sessionUser }: AdminSidebarProps) {
    const pathname = usePathname()

    return (
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
            <Link href="/admin/agency" className={`nav-item ${pathname === '/admin/agency' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1L10 6H15L11 9.5L12.5 14.5L8 11.5L3.5 14.5L5 9.5L1 6H6L8 1Z" fill="currentColor"/></svg>
              Baux
              <span className="nav-badge">12</span>
            </Link>
            <Link href="/admin/reversals" className={`nav-item ${pathname === '/admin/reversals' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 3V2M11 3V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 7H14" stroke="currentColor" strokeWidth="1.2"/></svg>
              Loyers
              <span className="nav-badge" style={{ background: 'var(--ci-or)', color: 'var(--ci-nuit)' }}>3</span>
            </Link>
            <div className="nav-item">
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 118 5a1.5 1.5 0 010 3z" fill="currentColor"/></svg>
              Biens
            </div>
            <Link href="/admin/users" className={`nav-item ${pathname === '/admin/users' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M1 14c0-3.31 2.24-6 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 11H12V9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Utilisateurs
            </Link>

            <div className="nav-section">Finances</div>
            <Link href="/admin/fiscal" className={`nav-item ${pathname === '/admin/fiscal' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="9" r="1.5" fill="currentColor"/></svg>
              CDC / Cautions
            </Link>
            <Link href="/admin/reclamations" className={`nav-item ${pathname === '/admin/reclamations' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M3 12L6 8l3 3 4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Paiements
            </Link>
            <Link href="/admin/reports" className={`nav-item ${pathname === '/admin/reports' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Rapports CRG
            </Link>

            <div className="nav-section">Opérations</div>
            <Link href="/admin/disputes" className={`nav-item ${pathname === '/admin/disputes' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Médiation
            </Link>
            <Link href="/admin/edl" className={`nav-item ${pathname === '/admin/edl' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M2 10V13H5L13 5L10 2L2 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              EDL
            </Link>
            <Link href="/admin/system" className={`nav-item ${pathname === '/admin/system' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1v5M4 4l3 2M12 4l-3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="10" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>
              Paramètres
            </Link>

            {/* Logout button mimicking a nav-item */}
            <div className="nav-item" onClick={onLogout} style={{ color: '#FF6600', marginTop: '20px' }}>
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
    )
}

