"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface QRState {
  connected: boolean;
  phone?: string | null;
  status?: string;
  qr?: string | null;
  error?: string | null;
}

export default function WhatsAppSetupPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [data, setData] = useState<QRState | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const fetchQR = useCallback(async () => {
    if (!token) {
      setData({ connected: false, error: "Token manquant dans l'URL." });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/system/whatsapp-qr?token=${encodeURIComponent(token)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      setData(json);
    } catch {
      setData({ connected: false, error: "Impossible de contacter le serveur QAPRIL." });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchQR();
    // Polling toutes les 3 secondes
    const interval = setInterval(() => {
      fetchQR();
      setTick((t) => t + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchQR]);

  if (!token) {
    return (
      <div style={styles.errorPage}>
        <div style={styles.errorBox}>
          <div style={styles.errorIcon}>🔒</div>
          <h1 style={styles.errorTitle}>Accès refusé</h1>
          <p style={styles.errorText}>
            Cette page nécessite un token de configuration valide dans l'URL.
            <br />
            Contactez votre administrateur système.
          </p>
        </div>
      </div>
    );
  }

  if (data?.error && !data.qr && !data.connected) {
    return (
      <div style={styles.errorPage}>
        <div style={styles.errorBox}>
          <div style={styles.errorIcon}>⚠️</div>
          <h1 style={styles.errorTitle}>Erreur de configuration</h1>
          <p style={styles.errorText}>{data.error}</p>
          <button onClick={() => fetchQR()} style={styles.retryBtn}>
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* En-tête */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>💬</span>
            <span style={styles.logoText}>QAPRIL</span>
          </div>
          <h1 style={styles.title}>Configuration WhatsApp</h1>
          <p style={styles.subtitle}>
            Scannez ce QR code pour connecter la passerelle de notifications.
          </p>
        </div>

        {/* Contenu principal */}
        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Connexion au serveur WhatsApp...</p>
          </div>
        ) : data?.connected ? (
          // ── CONNECTÉ ──
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>WhatsApp Connecté !</h2>
            <p style={styles.successText}>
              {data.phone
                ? `Numéro actif : +${data.phone}`
                : "La passerelle WhatsApp est opérationnelle."}
            </p>
            <p style={styles.successHint}>
              Vous pouvez maintenant vous connecter à l'interface admin.
              <br />
              <a href="/admin" style={styles.adminLink}>
                → Aller à l'interface admin
              </a>
            </p>
          </div>
        ) : (
          // ── QR CODE ──
          <div style={styles.qrSection}>
            <div style={styles.qrBox}>
              {data?.qr ? (
                <>
                  <img
                    src={data.qr}
                    alt="QR Code WhatsApp"
                    style={styles.qrImage}
                  />
                  <div style={styles.qrBadge}>
                    <span style={styles.pingDot}></span>
                    Actualisation automatique (3s)
                  </div>
                </>
              ) : (
                <div style={styles.qrPlaceholder}>
                  <div style={styles.spinner}></div>
                  <p style={styles.qrPlaceholderText}>Génération du QR code...</p>
                  <p style={styles.qrPlaceholderHint}>
                    Statut : {data?.status || "INITIALIZING"}
                  </p>
                </div>
              )}
            </div>

            <div style={styles.steps}>
              <h3 style={styles.stepsTitle}>Instructions</h3>
              {[
                { n: 1, text: "Ouvrez WhatsApp sur votre smartphone dédié admin." },
                { n: 2, text: "Appuyez sur les 3 points (⋮) › Appareils connectés." },
                { n: 3, text: "Touchez « Connecter un appareil »." },
                { n: 4, text: "Pointez la caméra vers ce QR code." },
              ].map(({ n, text }) => (
                <div key={n} style={styles.step}>
                  <span style={styles.stepNum}>{n}</span>
                  <span style={styles.stepText}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div style={styles.footer}>
          <span style={styles.footerBadge}>🔐 Accès sécurisé — QAPRIL Internal Setup</span>
        </div>
      </div>

      {/* CSS animation inline */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping { 0%,100% { opacity:1; } 50% { opacity:.4; } }
      `}</style>
    </div>
  );
}

// ── Styles inline (page autonome, pas de dépendance Tailwind) ────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    padding: "40px",
    maxWidth: "640px",
    width: "100%",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
    color: "#f0f4f8",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logo: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(16,185,129,0.15)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "100px",
    padding: "6px 16px",
    marginBottom: "20px",
  },
  logoIcon: { fontSize: "20px" },
  logoText: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#10b981",
    letterSpacing: "2px",
  },
  title: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#ffffff",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: 0,
    lineHeight: 1.6,
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "48px 0",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(16,185,129,0.2)",
    borderTop: "3px solid #10b981",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  successBox: {
    textAlign: "center",
    padding: "32px 0",
  },
  successIcon: { fontSize: "64px", marginBottom: "16px" },
  successTitle: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#10b981",
    margin: "0 0 8px",
  },
  successText: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: "0 0 24px",
  },
  successHint: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: 1.8,
  },
  adminLink: {
    color: "#10b981",
    fontWeight: 600,
    textDecoration: "none",
  },
  qrSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "32px",
  },
  qrBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "20px",
    background: "rgba(255,255,255,0.03)",
    border: "2px dashed rgba(16,185,129,0.35)",
    borderRadius: "20px",
  },
  qrImage: {
    width: "260px",
    height: "260px",
    objectFit: "contain",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "8px",
  },
  qrBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    color: "#10b981",
    fontWeight: 600,
  },
  pingDot: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    background: "#10b981",
    borderRadius: "50%",
    animation: "ping 1.5s ease-in-out infinite",
  },
  qrPlaceholder: {
    width: "260px",
    height: "260px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "12px",
  },
  qrPlaceholderText: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: 600,
    margin: 0,
  },
  qrPlaceholderHint: {
    fontSize: "11px",
    color: "#475569",
    margin: 0,
    fontFamily: "monospace",
  },
  steps: { width: "100%", maxWidth: "400px" },
  stepsTitle: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "12px",
  },
  step: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  stepNum: {
    minWidth: "24px",
    height: "24px",
    background: "rgba(16,185,129,0.15)",
    border: "1px solid rgba(16,185,129,0.3)",
    color: "#10b981",
    borderRadius: "50%",
    fontSize: "12px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: 1.5,
    paddingTop: "3px",
  },
  footer: {
    textAlign: "center",
    marginTop: "32px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  footerBadge: {
    fontSize: "11px",
    color: "#475569",
  },
  errorPage: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "system-ui, sans-serif",
  },
  errorBox: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "400px",
    textAlign: "center",
    color: "#f0f4f8",
  },
  errorIcon: { fontSize: "48px", marginBottom: "16px" },
  errorTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#ef4444",
    margin: "0 0 12px",
  },
  errorText: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: 1.6,
    margin: 0,
  },
  retryBtn: {
    marginTop: "20px",
    padding: "10px 24px",
    background: "rgba(16,185,129,0.15)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "10px",
    color: "#10b981",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
