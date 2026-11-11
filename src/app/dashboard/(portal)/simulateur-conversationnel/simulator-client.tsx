"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Smartphone,
  ShieldCheck,
  Send,
  RefreshCw,
  FileText,
  AlertTriangle,
  Scale,
  CheckCheck,
  Lock,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Download,
  Info
} from "lucide-react";

interface SimulatorMessage {
  id: string;
  sens: "IN" | "OUT";
  transport: "WHATSAPP" | "SMS" | "USSD";
  texte: string;
  intention?: string;
  sha256?: string;
  horodatage: string;
  isQuickReply?: boolean;
}

export default function SimulatorClient({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [initDone, setInitDone] = useState(false);
  const [leaseInfo, setLeaseInfo] = useState<any>(null);
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [transportMode, setTransportMode] = useState<"WHATSAPP" | "SMS">("WHATSAPP");

  // Formulaire locataire
  const [montant, setMontant] = useState(150000);
  const [mois, setMois] = useState("novembre 2026");
  const [moyen, setMoyen] = useState("Wave Mobile Money");

  // Chat conversation
  const [messages, setMessages] = useState<SimulatorMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [auditLog, setAuditLog] = useState<any[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialisation du simulateur
  const initDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/conversational/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "init_demo" })
      });
      const data = await res.json();
      if (data.success) {
        setLeaseInfo(data.lease);
        setContactInfo(data.contact);

        // Convertir messages existants
        const formatted = (data.messages || []).map((m: any) => ({
          id: m.id,
          sens: m.sens,
          transport: m.transport,
          texte: m.texteBrut,
          intention: m.intention,
          sha256: m.sha256,
          horodatage: new Date(m.horodatageServeur).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
          })
        }));

        setMessages(formatted);
        setAuditLog(data.messages || []);
        setInitDone(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initDemo();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 1. Déclaration locataire
  const handleDeclare = async () => {
    if (!leaseInfo) return;
    setLoading(true);
    try {
      const res = await fetch("/api/conversational/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "declare_payment",
          leaseId: leaseInfo.id,
          montant,
          mois,
          moyen
        })
      });
      const data = await res.json();
      if (data.success && data.declaration) {
        const outMsg: SimulatorMessage = {
          id: data.declaration.declarationId,
          sens: "OUT",
          transport: transportMode,
          texte: data.declaration.messageEnvoye,
          intention: "CONFIRMATION_PAIEMENT",
          sha256: data.declaration.sha256,
          horodatage: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, outMsg]);
        setAuditLog((prev) => [
          ...prev,
          {
            id: outMsg.id,
            sens: "OUT",
            transport: transportMode,
            texteBrut: outMsg.texte,
            intention: outMsg.intention,
            sha256: outMsg.sha256,
            horodatageServeur: new Date().toISOString()
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Réponse du bailleur
  const handleSendLandlordMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || !leaseInfo) return;

    const inMsg: SimulatorMessage = {
      id: "temp-" + Date.now(),
      sens: "IN",
      transport: transportMode,
      texte: textToSend,
      horodatage: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, inMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/conversational/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "landlord_reply",
          phone: leaseInfo.landlordPhone,
          text: textToSend,
          transport: transportMode
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        const result = data.result;

        // Mise à jour de l'empreinte du message entrant
        setAuditLog((prev) => [
          ...prev,
          {
            id: inMsg.id,
            sens: "IN",
            transport: transportMode,
            texteBrut: textToSend,
            intention: result.intentionDetectee,
            sha256: result.sha256Empreinte,
            horodatageServeur: new Date().toISOString()
          }
        ]);

        // Message de réponse QAPRIL sortant
        if (result.reponseTexte) {
          const replyMsg: SimulatorMessage = {
            id: "reply-" + Date.now(),
            sens: "OUT",
            transport: transportMode,
            texte: result.reponseTexte,
            intention: result.quittanceCreee ? "QUITTANCE_EMISE" : "INFO",
            sha256: result.quittanceCreee?.sha256 || "AUTO_SEALED_" + Date.now(),
            horodatage: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
          };
          setMessages((prev) => [...prev, replyMsg]);
          setAuditLog((prev) => [
            ...prev,
            {
              id: replyMsg.id,
              sens: "OUT",
              transport: transportMode,
              texteBrut: replyMsg.texte,
              intention: replyMsg.intention,
              sha256: replyMsg.sha256,
              horodatageServeur: new Date().toISOString()
            }
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const codeCourt = leaseInfo?.codeCourt || "A1";

  return (
    <div className="space-y-6">
      {/* En-tête officiel ADD-26 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> ADD-26 — Mode sans application
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Règles RG-CNV-01 à RG-CNV-30
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Fil de discussion conversationnel du bailleur
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Démonstration normative d&apos;émission de quittance instantanée par simple SMS ou WhatsApp,
            sans création préalable de compte (Loi n° 2013-546 & Code Civil).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={initDemo}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-card hover:bg-muted border border-border rounded-lg text-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Réinitialiser le scénario
          </button>
        </div>
      </div>

      {/* Grille principale : Console de déclenchement à gauche / Smartphone à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne gauche : Panneau de contrôle et d'audit légal (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Carte 1 : Déclencheur locataire (RG-CNV-06) */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Étape 1 : Déclaration de loyer par le locataire
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Règle RG-CNV-06 · Paiement direct hors-plateforme
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                Code bail : {codeCourt}
              </span>
            </div>

            {/* Presets rapides de démonstration */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setMontant(150000);
                  setMois("novembre 2026");
                }}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                  montant === 150000
                    ? "border-emerald-500 bg-emerald-500/5 text-foreground font-medium"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <div className="font-semibold text-foreground">Standard (150 000 F)</div>
                <div className="text-[10px] text-muted-foreground">Quittance immédiate via OUI</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMontant(650000);
                  setMois("T4 2026 (3 mois)");
                }}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                  montant > 500000
                    ? "border-amber-500 bg-amber-500/5 text-foreground font-medium"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <div className="font-semibold text-foreground">Seuil critique (650 000 F)</div>
                <div className="text-[10px] text-amber-600 font-medium">Exige code PIN (RG-CNV-21)</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMontant(100000);
                  setMois("novembre 2026");
                }}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                  montant === 100000
                    ? "border-blue-500 bg-blue-500/5 text-foreground font-medium"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <div className="font-semibold text-foreground">Acompte (100 000 F / 150k)</div>
                <div className="text-[10px] text-blue-600 font-medium">Paiement partiel (ADD-24)</div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Montant déclaré (FCFA)
                </label>
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Mois / Terme</label>
                <input
                  type="text"
                  value={mois}
                  onChange={(e) => setMois(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Moyen de règlement
                </label>
                <select
                  value={moyen}
                  onChange={(e) => setMoyen(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Wave Mobile Money">Wave Mobile Money</option>
                  <option value="Orange Money CI">Orange Money CI</option>
                  <option value="MTN MoMo">MTN MoMo</option>
                  <option value="Espèces en main propre">Espèces en main propre</option>
                  <option value="Virement bancaire">Virement bancaire</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleDeclare}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                Déclencher l&apos;envoi du message au bailleur (Notification QAPRIL)
              </button>
            </div>
          </div>

          {/* Carte 2 : Coffre-fort de preuves légales & Journal probant (RG-CNV-19) */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Journal probant scellé SHA-256 (RG-CNV-19)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Valeur légale · Article 1315 Code Civil & Loi n° 2013-546
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Lock className="w-3 h-3" /> Scellement cryptographique
              </span>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg bg-background">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="py-2 px-3">Sens</th>
                    <th className="py-2 px-3">Transport</th>
                    <th className="py-2 px-3">Intention</th>
                    <th className="py-2 px-3">Horodatage serveur</th>
                    <th className="py-2 px-3">Empreinte SHA-256</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {auditLog.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-muted-foreground italic">
                        Aucun message scellé pour le moment. Déclenchez une déclaration ci-dessus.
                      </td>
                    </tr>
                  ) : (
                    auditLog.slice(-6).map((log, idx) => (
                      <tr key={idx} className="hover:bg-muted/50">
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.sens === "OUT"
                                ? "bg-blue-500/10 text-blue-600"
                                : "bg-emerald-500/10 text-emerald-600"
                            }`}
                          >
                            {log.sens}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{log.transport}</td>
                        <td className="py-2 px-3 font-sans text-foreground font-medium">
                          {log.intention || "CONFIRM_YES"}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {new Date(log.horodatageServeur).toLocaleTimeString("fr-FR")}
                        </td>
                        <td className="py-2 px-3 text-emerald-600 truncate max-w-[150px]">
                          {log.sha256 ? `${log.sha256.substring(0, 16)}...` : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                Conservation légale : 10 ans pour les quittances, 12 mois pour le dialogue (RG-CNV-27).
              </span>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(auditLog, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `registre-cnv-artci-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1 text-primary hover:underline font-medium text-xs"
              >
                <Download className="w-3.5 h-3.5" /> Exporter le registre certifié
              </button>
            </div>
          </div>
        </div>

        {/* Colonne droite : Smartphone Mockup « Fil WhatsApp du bailleur » (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Sélecteur de transport en direct */}
          <div className="flex items-center gap-2 mb-3 bg-muted p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setTransportMode("WHATSAPP")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                transportMode === "WHATSAPP"
                  ? "bg-card text-emerald-600 font-bold shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Business (Principal)
            </button>
            <button
              type="button"
              onClick={() => setTransportMode("SMS")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                transportMode === "SMS"
                  ? "bg-card text-blue-600 font-bold shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> SMS GSM (Secours)
            </button>
          </div>

          {/* Châssis Smartphone */}
          <div className="w-full max-w-[390px] h-[680px] bg-card border-4 border-muted rounded-[36px] shadow-2xl flex flex-col overflow-hidden relative">
            {/* Barre d'état smartphone */}
            <div className="h-6 bg-emerald-800 text-white flex items-center justify-between px-6 text-[11px] font-semibold tracking-tight">
              <span>09:41</span>
              <div className="w-16 h-3 bg-black rounded-b-xl -mt-1 mx-auto" />
              <span>4G CI · 100%</span>
            </div>

            {/* En-tête de la conversation WhatsApp / SMS */}
            <div className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white text-emerald-800 flex items-center justify-center font-bold text-sm shadow">
                  Q
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm leading-none">QAPRIL</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-200 fill-emerald-200" />
                  </div>
                  <span className="text-[10px] text-emerald-100 flex items-center gap-1">
                    Compte certifié · Plateforme Nationale
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-emerald-800/60 px-2 py-0.5 rounded text-emerald-100 font-mono">
                  Bailleur : {codeCourt}
                </span>
              </div>
            </div>

            {/* Corps du fil de discussion */}
            <div className="flex-1 bg-muted/40 p-3 overflow-y-auto space-y-3 text-xs">
              <div className="text-center my-1">
                <span className="bg-card text-muted-foreground text-[10px] px-2.5 py-1 rounded-full shadow-xs border border-border">
                  🔒 Messages scellés conformément à la loi n° 2013-546
                </span>
              </div>

              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 text-muted-foreground/40 mb-2" />
                  <p className="text-xs">
                    Aucun message pour le moment.
                    <br />
                    Cliquez sur <strong>« Déclencher l&apos;envoi »</strong> à gauche pour initier le flux.
                  </p>
                </div>
              )}

              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sens === "IN" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs relative ${
                      m.sens === "IN"
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-card text-foreground border border-border rounded-bl-none"
                    }`}
                  >
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.texte}</p>

                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                        m.sens === "IN" ? "text-emerald-100" : "text-muted-foreground"
                      }`}
                    >
                      <span>{m.horodatage}</span>
                      {m.sens === "IN" && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                    </div>

                    {/* Empreinte SHA-256 scellée sous chaque bulle */}
                    {m.sha256 && (
                      <div className="mt-1 pt-1 border-t border-white/20 text-[8px] font-mono opacity-75 truncate">
                        SHA: {m.sha256.substring(0, 18)}...
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Boutons d'action rapide dans le fil WhatsApp (RG-CNV-07 & 14) */}
            <div className="bg-card p-2 border-t border-border flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => handleSendLandlordMessage(`OUI ${codeCourt}`)}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors shadow-xs"
              >
                <span>🟢</span> OUI {codeCourt} (Valider)
              </button>

              <button
                type="button"
                onClick={() => handleSendLandlordMessage(`NON ${codeCourt}`)}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors shadow-xs"
              >
                <span>🔴</span> NON {codeCourt} (Contester)
              </button>

              <button
                type="button"
                onClick={() => handleSendLandlordMessage(`PLAN ${codeCourt}`)}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-colors shadow-xs"
              >
                <span>🟡</span> PLAN {codeCourt}
              </button>

              <button
                type="button"
                onClick={() => handleSendLandlordMessage("1234")}
                disabled={loading}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors border border-border"
              >
                <Lock className="w-3 h-3" /> PIN 1234
              </button>
            </div>

            {/* Champ de saisie direct (Simulation de réponse personnalisée du bailleur) */}
            <div className="bg-card p-2.5 border-t border-border flex items-center gap-2">
              <input
                type="text"
                placeholder={`Tapez une réponse (ex: OUI ${codeCourt}, NON, STOP)...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendLandlordMessage();
                  }
                }}
                className="flex-1 text-xs px-3 py-2 bg-muted/50 border border-input rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleSendLandlordMessage()}
                disabled={loading || !inputText.trim()}
                className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

