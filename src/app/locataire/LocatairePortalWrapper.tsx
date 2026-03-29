'use client';

import { useTenantData } from '@/hooks/tenant-web-hooks';
import QAPRILLocataire from '@/components/portals/QapriLocataireUI';
import { useState, useEffect } from 'react';

export default function LocatairePortalWrapper() {
  const { data, loading, error } = useTenantData();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for at least 1.5s
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash || (loading && !data)) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D2B6E',
        color: '#FFFFFF',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 20 }}>QAPRIL</div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, opacity: 0.7 }}>CHARGEMENT DE VOTRE ESPACE...</div>
        <div style={{ marginTop: 30, width: 40, height: 40, border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        ` }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#A00000' }}>
        <h3>Erreur de connexion</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#0D2B6E', color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Prepare abos mapping if needed
  const abos = [
    {
      id: 'cie',
      type: 'CIE',
      icon: '⚡',
      label: 'Électricité — CIE',
      color: '#C05B00',
      bg: '#FFF3E0',
      compteur: data.bail.cie || 'N/A',
      montant: data.abos.cieAmount || 0,
      statut: 'Payée',
      mois: 'Mars 2026',
      mode: 'Orange Money',
      hist: [24, 27.5, 26, 28.5, null]
    },
    {
      id: 'sodeci',
      type: 'SODECI',
      icon: '💧',
      label: 'Eau — SODECI',
      color: '#0E7490',
      bg: '#E0F4F9',
      compteur: data.bail.sodeci || 'N/A',
      montant: data.abos.sodeciAmount || 0,
      statut: 'Payée',
      mois: 'Mars 2026',
      mode: 'Wave',
      hist: [8.1, 8.6, 8.8, 9.2, null]
    }
  ];

  return (
    <QAPRILLocataire 
      loc={data.loc}
      bail={data.bail}
      quittances={data.quittances}
      abos={abos}
      tickets={data.tickets}
    />
  );
}
