"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  Smartphone, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";

interface OrangeStatus {
  configured: boolean;
  provider: string;
  senderNumber: string;
  senderName: string;
  success?: boolean;
  availableUnits?: number;
  status?: string;
  expirationDate?: string;
  country?: string;
  error?: string;
}

export default function AdminSMSPage() {
  const [status, setStatus] = useState<OrangeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testPhone, setTestPhone] = useState("+2250707334770");
  const [testMessage, setTestMessage] = useState("[QAPRIL] Ceci est un message test envoyé via la passerelle SMS Orange.");
  const [selectedProvider, setSelectedProvider] = useState("ORANGE");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    provider?: string;
    messageId?: string;
  } | null>(null);

  const fetchStatus = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/sms", { cache: "no-store" });
      const json = await res.json();
      setStatus(json);
    } catch {
      setStatus({
        configured: false,
        provider: "ORANGE",
        senderNumber: "tel:+22500000000",
        senderName: "QAPRIL",
        error: "Impossible d'interroger l'état de l'API Orange",
      });
    } finally {
      setLoading(false);
      if (showSpinner) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim() || !testMessage.trim()) return;

    setTestSending(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: testPhone,
          message: testMessage,
          provider: selectedProvider,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || "Erreur de communication lors de l'envoi",
      });
    } finally {
      setTestSending(false);
      fetchStatus(false);
    }
  };

  const hasZeroUnits = status?.availableUnits === 0 || status?.status === "PENDING";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", fontFamily: "var(--font-body, system-ui)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#FFF4ED",
              color: "#FF6600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #FFD8BE"
            }}>
              <MessageSquare size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                Passerelle SMS Orange & Notifications
              </h1>
              <p style={{ fontSize: "14px", color: "#64748B", margin: 0 }}>
                Gestion des alertes, signatures de baux et codes OTP via le réseau Orange Côte d'Ivoire.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchStatus(true)}
          disabled={isRefreshing}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
            background: "#FFFFFF",
            color: "#334155",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }}
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Alerte Forfait / Unités si besoin */}
      {hasZeroUnits && (
        <div style={{
          background: "#FFFBEB",
          border: "1px solid #FDE68A",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          gap: "14px",
          alignItems: "flex-start"
        }}>
          <AlertCircle size={22} style={{ color: "#D97706", flexShrink: 0, marginTop: "2px" }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "700", color: "#92400E" }}>
              Forfait SMS Orange en attente de recharge (0 unités restantes)
            </h4>
            <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#B45309", lineHeight: "1.5" }}>
              L'authentification API Orange fonctionne parfaitement avec vos identifiants, mais le pack SMS pour la Côte d'Ivoire (contrat <code>{status?.country || "CIV"}</code>) nécessite d'acheter ou d'activer un faisceau de SMS sur la console Orange Developer.
            </p>
            <a
              href="https://developer.orange.com"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: "700",
                color: "#92400E",
                background: "#FEF3C7",
                padding: "6px 12px",
                borderRadius: "6px",
                textDecoration: "none",
                border: "1px solid #FCD34D"
              }}
            >
              Recharger mon pack sur Orange Developer <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}

      {/* Cartes d'état */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {/* Carte 1 : Connexion API */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>
              API Orange Developer
            </span>
            <span style={{
              fontSize: "11px",
              fontWeight: "700",
              padding: "3px 8px",
              borderRadius: "12px",
              background: status?.configured ? "#DCFCE7" : "#FEE2E2",
              color: status?.configured ? "#166534" : "#991B1B"
            }}>
              {status?.configured ? "Connecté (OAuth2)" : "Non configuré"}
            </span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", marginBottom: "4px" }}>
            Client ID Actif
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", fontFamily: "monospace" }}>
            App ID: xO7LeDG2fdcJ1A6l
          </div>
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#166534" }}>
            <ShieldCheck size={14} /> Jeton d'accès régénéré & mis en cache
          </div>
        </div>

        {/* Carte 2 : Crédits SMS */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>
              Solde de SMS (CIV)
            </span>
            <span style={{
              fontSize: "11px",
              fontWeight: "700",
              padding: "3px 8px",
              borderRadius: "12px",
              background: (status?.availableUnits || 0) > 0 ? "#DCFCE7" : "#FEF3C7",
              color: (status?.availableUnits || 0) > 0 ? "#166534" : "#92400E"
            }}>
              {status?.status || "PENDING"}
            </span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: (status?.availableUnits || 0) > 0 ? "#166534" : "#D97706", marginBottom: "4px" }}>
            {status?.availableUnits ?? 0} <span style={{ fontSize: "14px", fontWeight: "600", color: "#64748B" }}>SMS restants</span>
          </div>
          <div style={{ fontSize: "12px", color: "#64748B" }}>
            Offre : SMS_OCB • Côte d'Ivoire (+225)
          </div>
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #F1F5F9", fontSize: "12px", color: "#64748B" }}>
            Expire le : {status?.expirationDate ? new Date(status.expirationDate).toLocaleDateString("fr-FR") : "Non défini"}
          </div>
        </div>

        {/* Carte 3 : Expéditeur & Paramètres */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>
              En-tête & Émetteur
            </span>
            <span style={{
              fontSize: "11px",
              fontWeight: "700",
              padding: "3px 8px",
              borderRadius: "12px",
              background: "#F1F5F9",
              color: "#334155"
            }}>
              Mode Production
            </span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", marginBottom: "4px" }}>
            {status?.senderName || "QAPRIL"}
          </div>
          <div style={{ fontSize: "12px", color: "#64748B" }}>
            Numéro émetteur : <code>{status?.senderNumber || "tel:+22500000000"}</code>
          </div>
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#3B82F6" }}>
            <Zap size={14} /> Passerelle active : <strong>{status?.provider || "ORANGE"}</strong>
          </div>
        </div>
      </div>

      {/* Section Formulaire d'envoi de test en direct */}
      <div style={{
        background: "#FFFFFF",
        borderRadius: "14px",
        padding: "28px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Smartphone size={20} style={{ color: "#FF6600" }} />
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: 0 }}>
            Test d'envoi SMS en direct
          </h2>
        </div>

        <form onSubmit={handleSendTest}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                Numéro de téléphone du destinataire (Format CI ou international)
              </label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+2250700000000 ou 0707000000"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              <span style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px", display: "block" }}>
                Les numéros à 10 chiffres (01, 05, 07) sont automatiquement convertis en format international E.164.
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                Passerelle à tester
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "#FFFFFF"
                }}
              >
                <option value="ORANGE">Orange SMS (API Orange Partner)</option>
                <option value="OPENWA">WhatsApp (Passerelle OpenWA)</option>
                <option value="HSMS">HSMS (Passerelle SMS Secondaire)</option>
                <option value="AFRICASTALKING">Africa's Talking</option>
                <option value="TWILIO">Twilio</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
              Message à expédier
            </label>
            <textarea
              rows={3}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "14px",
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={testSending}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "8px",
              background: "#FF6600",
              color: "#FFFFFF",
              fontWeight: "700",
              fontSize: "14px",
              border: "none",
              cursor: testSending ? "not-allowed" : "pointer",
              opacity: testSending ? 0.7 : 1,
              boxShadow: "0 2px 6px rgba(255, 102, 0, 0.3)"
            }}
          >
            <Send size={16} />
            {testSending ? "Envoi en cours..." : "Envoyer le SMS test"}
          </button>
        </form>

        {/* Résultat du test */}
        {testResult && (
          <div style={{
            marginTop: "24px",
            padding: "16px",
            borderRadius: "10px",
            background: testResult.success ? "#F0FDF4" : "#FEF2F2",
            border: `1px solid ${testResult.success ? "#BBF7D0" : "#FECACA"}`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              {testResult.success ? (
                <CheckCircle2 size={18} style={{ color: "#16A34A" }} />
              ) : (
                <AlertCircle size={18} style={{ color: "#DC2626" }} />
              )}
              <span style={{
                fontSize: "14px",
                fontWeight: "700",
                color: testResult.success ? "#166534" : "#991B1B"
              }}>
                {testResult.success ? "SMS envoyé avec succès !" : "Échec de l'envoi"}
              </span>
            </div>

            <div style={{ fontSize: "13px", color: testResult.success ? "#15803D" : "#B91C1C", fontFamily: "monospace" }}>
              {testResult.success ? (
                <div>
                  <p style={{ margin: "4px 0" }}>Fournisseur : {testResult.provider}</p>
                  <p style={{ margin: "4px 0" }}>Message ID : {testResult.messageId}</p>
                </div>
              ) : (
                <p style={{ margin: "4px 0" }}>{testResult.error}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Guide & Documentation technique */}
      <div style={{
        marginTop: "28px",
        padding: "20px",
        background: "#F8FAFC",
        borderRadius: "12px",
        border: "1px solid #E2E8F0"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <Info size={18} style={{ color: "#3B82F6" }} />
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1E293B", margin: 0 }}>
            Fonctionnement de la passerelle SMS Orange & Fallback
          </h3>
        </div>
        <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", margin: 0 }}>
          La plateforme QAPRIL utilise une cascade de distribution intelligente : 
          quand une notification critique (code de signature OTP de bail, quittance de loyer, alerte de litige, validation de candidature) est déclenchée, 
          le système sollicite en priorité <strong>Orange SMS</strong>. Si le pack de SMS est épuisé ou temporairement indisponible, 
          le message bascule automatiquement et de façon transparente vers la passerelle <strong>WhatsApp (OpenWA)</strong> ou les passerelles de secours.
        </p>
      </div>
    </div>
  );
}

