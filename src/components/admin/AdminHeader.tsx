"use client";
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import NotificationCenter from "./NotificationCenter"
import { Home, LogOut } from "lucide-react"

interface AdminHeaderProps {
    session: any
    onLogout: () => Promise<void>
}

export default function AdminHeader({ session, onLogout }: AdminHeaderProps) {
    const pathname = usePathname()

    return (
        <div className="topbar">
            <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div 
                    className="hamburger-btn" 
                    onClick={() => document.body.classList.toggle('sidebar-open')}
                    title="Menu de navigation"
                    style={{ cursor: 'pointer', marginRight: '8px', color: 'var(--text-main)', alignItems: 'center' }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </div>

                {/* Bouton Retour Accueil Site */}
                <Link 
                    href="/" 
                    title="Retour à la page d'accueil du site" 
                    className="top-btn"
                    style={{ 
                        textDecoration: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '6px 10px', 
                        borderRadius: '8px', 
                        backgroundColor: '#F1F5F9',
                        color: '#0F172A',
                        fontSize: '12px',
                        fontWeight: 700
                    }}
                >
                    <Home size={15} color="#FF8200" />
                    <span className="hidden sm:inline">Accueil</span>
                </Link>

                <div className="breadcrumb" style={{ marginLeft: '6px' }}>
                    qapril / <span>{pathname === '/admin' ? 'Tableau de bord' : pathname.replace('/admin/', '').toUpperCase()}</span>
                </div>

                <div className="search-bar">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="4" stroke="#8B949E" strokeWidth="1.3"/><path d="M8.5 8.5L11 11" stroke="#8B949E" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    <input placeholder="Chercher bail, locataire..." />
                </div>
            </div>
            
            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <NotificationCenter />
                
                {/* Bouton Déconnexion Direct Mobile & Desktop */}
                <button 
                    onClick={onLogout} 
                    title="Déconnexion Sécurisée" 
                    className="top-btn"
                    style={{ 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #FECDD3',
                        backgroundColor: '#FFF1F2',
                        color: '#E11D48',
                        fontWeight: 700,
                        fontSize: '11px'
                    }}
                >
                    <LogOut size={14} />
                    <span className="hidden xs:inline">Quitter</span>
                </button>
                
                <div style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--ci-orange), var(--ci-or))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 800, color: '#fff',
                    flexShrink: 0
                }}>
                    {session?.user?.fullName ? session.user.fullName.substring(0, 2).toUpperCase() : 'SA'}
                </div>
            </div>
        </div>
    )
}
