"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  Smartphone, 
  ShieldCheck, 
  Trash2,
  ExternalLink,
  Wifi,
  QrCode
} from "lucide-react";

interface WhatsAppState {
  connected: boolean;
  phone?: string | null;
  status: string;
  qr?: string | null;
  error?: string | null;
}

export default function AdminWhatsAppPage() {
  const [data, setData] = useState<WhatsAppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testPhone, setTestPhone] = useState("+2250707334770");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [resetting, setResetting] = useState(false);

  // Fonction pour interroger l'état du conteneur OpenWA
  const fetchStatus = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/whatsapp", { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setData({
        connected: false,
        status: "ERROR",
        error: "Impossible de joindre l'API interne QAPRIL",
      });
    } finally {
      setLoading(false);
      if (showSpinner) setIsRefreshing(false);
    }
  };

  // Polling toutes les 3 secondes pour actualiser le QR code et détecter le scan instantanément
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus(false);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Envoi d'un message de test WhatsApp
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;

    setTestSending(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          phone: testPhone,
          message: `🔐 *QAPRIL — Test Passerelle WhatsApp*\n\nVotre ligne WhatsApp est parfaitement connectée au serveur QAPRIL !\nHorodatage : ${new Date().toLocaleTimeString("fr-FR")}`,
        }),
      });

      const resJson = await res.json();
      if (res.ok && resJson.success) {
        setTestResult({
          success: true,
          message: `Message de test envoyé avec succès à ${testPhone} !`,
        });
      } else {
        setTestResult({
          success: false,
          message: resJson.error || "Erreur lors de l'envoi du message.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Erreur réseau",
      });
    } finally {
      setTestSending(false);
    }
  };

  // Réinitialiser la session
  const handleReset = async () => {
    if (!confirm("Voulez-vous vraiment déconnecter la session WhatsApp actuelle et générer un nouveau QR Code ?")) {
      return;
    }

    setResetting(true);
    try {
      await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      fetchStatus(true);
    } catch {
      alert("Erreur lors de la réinitialisation");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <MessageSquare size={24} />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Passerelle WhatsApp Officielle
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gestion de la connexion OpenWA pour les codes de validation Admin (2FA) et les notifications d'urgence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStatus(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-emerald-600" : ""} />
            Actualiser
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
          <RefreshCw size={28} className="animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Interrogation de la passerelle OpenWA...</p>
        </div>
      ) : data?.connected ? (
        /* ÉCRAN 1 : WHATSAPP EST CONNECTÉ */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Bannière de connexion active */}
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-emerald-950">
                    Ligne WhatsApp Connectée & Active
                  </h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    En ligne
                  </span>
                </div>
                <p className="text-sm text-emerald-700 font-medium">
                  Numéro associé : <span className="font-bold">{data.phone ? `+${data.phone}` : "Ligne opérationnelle"}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={resetting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition shadow-sm"
            >
              <Trash2 size={14} />
              {resetting ? "Déconnexion..." : "Déconnecter / Changer de ligne"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Outil de test d'envoi en direct */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Send size={18} className="text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Tester l'envoi d'un message WhatsApp</h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Envoyez un message test en direct pour valider la délivrabilité immédiate sur un numéro mobile.
              </p>

              <form onSubmit={handleSendTest} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numéro de téléphone cible
                  </label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+2250707334770"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={testSending}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
                >
                  <Send size={14} className={testSending ? "animate-pulse" : ""} />
                  {testSending ? "Envoi en cours..." : "Envoyer le test WhatsApp"}
                </button>
              </form>

              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium border flex items-start gap-2 ${
                    testResult.success
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {testResult.success ? <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            {/* Informations du service */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck size={18} className="text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Règles de distribution actives</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Codes de sécurité 2FA Administrateurs</p>
                    <p className="text-slate-500 text-[11px]">Envoi instantané par WhatsApp via OpenWA</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                    ACTIF
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Alertes & Notifications Prioritaires</p>
                    <p className="text-slate-500 text-[11px]">Signature de bail et confirmation de loyer</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                    ACTIF
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Autres flux (Locataires / Bailleurs)</p>
                    <p className="text-slate-500 text-[11px]">Quittances, reçus et informations générales</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold rounded text-[10px]">
                    PAR EMAIL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ÉCRAN 2 : EN ATTENTE DU SCAN DU QR CODE */
        <div className="p-8 bg-white border border-slate-200 rounded-xl shadow-sm space-y-8 animate-in fade-in duration-300">
          <div className="text-center max-w-md mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              En attente d'association
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Liez votre compte WhatsApp en scannant le QR code
            </h2>
            <p className="text-xs text-slate-500">
              Scannez directement ce QR code depuis l'application WhatsApp de votre smartphone. La page se mettra à jour automatiquement dès la validation.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 max-w-3xl mx-auto">
            {/* Zone du QR Code */}
            <div className="p-4 bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl flex flex-col items-center justify-center shadow-inner">
              {data?.qr ? (
                <div className="relative group">
                  <img
                    src={data.qr}
                    alt="WhatsApp QR Code"
                    className="w-64 h-64 object-contain rounded-xl bg-white p-2 shadow-sm"
                  />
                  <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-xl pointer-events-none"></div>
                </div>
              ) : (
                <div className="w-64 h-64 flex flex-col items-center justify-center gap-3 text-slate-400 bg-white rounded-xl">
                  <RefreshCw size={32} className="animate-spin text-emerald-500" />
                  <p className="text-xs font-semibold text-slate-600">Génération du QR Code...</p>
                  <span className="text-[10px] text-slate-400">Veuillez patienter quelques instants</span>
                </div>
              )}

              <p className="text-[11px] font-semibold text-slate-500 mt-3 flex items-center gap-1">
                <RefreshCw size={12} className="animate-spin text-emerald-600" />
                Actualisation automatique active (toutes les 3s)
              </p>
            </div>

            {/* Guide des étapes */}
            <div className="space-y-4 max-w-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-xs">
                Instructions de connexion
              </h3>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ouvrez <strong>WhatsApp</strong> sur le smartphone dédié à l'administration.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Allez dans <strong>Réglages</strong> (ou appuyez sur les <strong>3 points</strong> en haut à droite).
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sélectionnez <strong>Appareils connectés</strong> puis <strong>Connecter un appareil</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pointez votre caméra vers le QR code ci-contre pour l'associer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
