"use client";

import { useState, useEffect } from "react";
import { Save, Bell, Smartphone, Mail, Clock } from "lucide-react";

export function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const [prefs, setPrefs] = useState({
    waActif: true,
    waNumero: "",
    smsActif: true,
    emailActif: false,
    emailAdresse: "",
    pushActif: true,
    heureDebut: 7,
    heureFin: 21,
  });

  useEffect(() => {
    fetch("/api/v1/notifications/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data.preferences) {
          setPrefs({
            waActif: data.preferences.waActif,
            waNumero: data.preferences.waNumero || "",
            smsActif: data.preferences.smsActif,
            emailActif: data.preferences.emailActif,
            emailAdresse: data.preferences.emailAdresse || "",
            pushActif: data.preferences.pushActif,
            heureDebut: data.preferences.heureDebut,
            heureFin: data.preferences.heureFin,
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load preferences", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });

      if (!res.ok) throw new Error("Erreur de sauvegarde");

      setMessage({ type: "success", text: "Préférences mises à jour avec succès." });
    } catch (error) {
      setMessage({ type: "error", text: "Impossible de sauvegarder vos préférences." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl w-full"></div>;
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Préférences de Notification</h2>
          <p className="text-sm text-slate-500">Gérez comment vous souhaitez être alerté par QAPRIL.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-xl text-sm font-medium flex items-center gap-2 ${
          message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Canaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition cursor-pointer group">
            <div className="mt-1">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                checked={prefs.waActif}
                onChange={(e) => setPrefs({ ...prefs, waActif: e.target.checked })}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                WhatsApp
              </div>
              <p className="text-xs text-slate-500 mt-1">Recevez vos quittances et alertes directement sur WhatsApp.</p>
              {prefs.waActif && (
                <input 
                  type="text" 
                  placeholder="Numéro (+225...)" 
                  className="mt-3 block w-full text-sm rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  value={prefs.waNumero}
                  onChange={(e) => setPrefs({ ...prefs, waNumero: e.target.value })}
                  onClick={(e) => e.preventDefault()}
                />
              )}
            </div>
          </label>

          <label className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition cursor-pointer group">
            <div className="mt-1">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                checked={prefs.smsActif}
                onChange={(e) => setPrefs({ ...prefs, smsActif: e.target.checked })}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Smartphone className="w-4 h-4 text-slate-600" />
                SMS (Fallback)
              </div>
              <p className="text-xs text-slate-500 mt-1">Utilisé uniquement en cas d'échec de WhatsApp ou pour les alertes critiques.</p>
            </div>
          </label>

          <label className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition cursor-pointer group">
            <div className="mt-1">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                checked={prefs.emailActif}
                onChange={(e) => setPrefs({ ...prefs, emailActif: e.target.checked })}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Mail className="w-4 h-4 text-blue-500" />
                Email
              </div>
              <p className="text-xs text-slate-500 mt-1">Recevez des copies PDF de vos documents par email.</p>
              {prefs.emailActif && (
                <input 
                  type="email" 
                  placeholder="Adresse email" 
                  className="mt-3 block w-full text-sm rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  value={prefs.emailAdresse}
                  onChange={(e) => setPrefs({ ...prefs, emailAdresse: e.target.value })}
                  onClick={(e) => e.preventDefault()}
                />
              )}
            </div>
          </label>
        </div>

        {/* Plages Horaires */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
            <Clock className="w-4 h-4 text-orange-500" />
            Horaires de réception
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Ne pas déranger avant</label>
              <select 
                className="block w-full text-sm rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                value={prefs.heureDebut}
                onChange={(e) => setPrefs({ ...prefs, heureDebut: parseInt(e.target.value) })}
              >
                {[...Array(24)].map((_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Ne pas déranger après</label>
              <select 
                className="block w-full text-sm rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                value={prefs.heureFin}
                onChange={(e) => setPrefs({ ...prefs, heureFin: parseInt(e.target.value) })}
              >
                {[...Array(24)].map((_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#C55A11] hover:bg-[#A34A0D] text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          Enregistrer
        </button>
      </div>
    </div>
  );
}
