"use client";
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AdminHeaderProps {
    session: any
    onLogout: () => Promise<void>
}

export default function AdminHeader({ session, onLogout }: AdminHeaderProps) {
    const pathname = usePathname()

    return (
        <div className="topbar">
            <div className="topbar-left">
                <div className="breadcrumb">
                    qapril / <span>{pathname === '/admin' ? 'Tableau de bord' : pathname.replace('/admin/', '').toUpperCase()}</span>
                </div>
                <div className="search-bar">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="4" stroke="#8B949E" strokeWidth="1.3"/><path d="M8.5 8.5L11 11" stroke="#8B949E" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    <input placeholder="Chercher bail, locataire..." />
                </div>
            </div>
            
            <div className="topbar-right">
                <div className="top-btn" title="Notifications">
                    <div className="notif-dot"></div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1a4 4 0 014 4v2.5l1 1.5H2L3 7.5V5a4 4 0 014-4zM5.5 11a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                </div>
                
                <div className="top-btn" onClick={onLogout} title="Déconnexion (Rapide)" style={{ cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M6 14H3a2 2 0 01-2-2V4a2 2 0 012-2h3M10 11l4-3-4-3M14 8H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                
                <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--ci-orange), var(--ci-or))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 700, color: '#fff'
                }}>
                    {session?.user?.fullName ? session.user.fullName.substring(0, 2).toUpperCase() : 'SA'}
                </div>
            </div>
        </div>
    )
}
