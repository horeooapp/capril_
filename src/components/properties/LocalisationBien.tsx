"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Check,
  X,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import lieuxConfig from "../../../config/lieux.json";

export interface LocalisationData {
  quartier: string | null;
  commune: string;
  ville: string;
  quartierManuel: boolean;
  quartierSource: string;
}

export interface LocalisationBienProps {
  latitude?: number | null;
  longitude?: number | null;
  initialQuartier?: string | null;
  initialCommune?: string | null;
  initialVille?: string | null;
  initialQuartierManuel?: boolean;
  initialQuartierSource?: string | null;
  editable?: boolean;
  compact?: boolean;
  onChange?: (loc: LocalisationData) => void;
  className?: string;
}

export default function LocalisationBien({
  latitude,
  longitude,
  initialQuartier = null,
  initialCommune = "Cocody",
  initialVille = "Abidjan",
  initialQuartierManuel = false,
  initialQuartierSource = null,
  editable = true,
  compact = false,
  onChange,
  className = "",
}: LocalisationBienProps) {
  // États de localisation
  const [quartier, setQuartier] = useState<string | null>(initialQuartier);
  const [commune, setCommune] = useState<string>(initialCommune || "Cocody");
  const [ville, setVille] = useState<string>(initialVille || "Abidjan");
  const [isManuel, setIsManuel] = useState<boolean>(initialQuartierManuel);
  const [source, setSource] = useState<string | null>(initialQuartierSource);

  // États de requête
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "notFound" | "error">(
    initialQuartier ? "success" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Édition manuelle
  const [isEditing, setIsEditing] = useState(false);
  const [customInput, setCustomInput] = useState(initialQuartier || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sauvegarde de la dernière position résolue
  const lastResolvedCoords = useRef<{ lat: number; lng: number } | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Liste des suggestions basées sur la commune actuelle dans lieux.json
  const getSuggestionsForCommune = useCallback((communeName: string): string[] => {
    const list: string[] = [];
    for (const v of lieuxConfig.villes || []) {
      for (const c of v.communes || []) {
        if (c.nom.toLowerCase() === communeName.toLowerCase()) {
          for (const q of c.quartiers || []) {
            list.push(q.nom);
          }
        }
      }
    }
    return list;
  }, []);

  // Déclencheur du reverse geocoding via l'API interne
  const executerResolution = useCallback(
    async (lat: number, lng: number) => {
      // Si le quartier a été verrouillé manuellement, ne pas écraser
      if (isManuel && quartier) {
        return;
      }

      setStatus("loading");
      setErrorMessage(null);

      try {
        const res = await fetch("/api/geo/reverse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Erreur serveur (${res.status})`);
        }

        const data = await res.json();
        const resolvedQuartier = data.quartier || null;
        const resolvedCommune = data.commune || commune;
        const resolvedVille = data.ville || ville;
        const resolvedSource = data.source || "google";

        setQuartier(resolvedQuartier);
        setCommune(resolvedCommune);
        setVille(resolvedVille);
        setSource(resolvedSource);
        setIsManuel(false);

        if (resolvedQuartier) {
          setStatus("success");
        } else {
          setStatus("notFound");
        }

        lastResolvedCoords.current = { lat, lng };

        if (onChange) {
          onChange({
            quartier: resolvedQuartier,
            commune: resolvedCommune,
            ville: resolvedVille,
            quartierManuel: false,
            quartierSource: resolvedSource,
          });
        }
      } catch (err: any) {
        console.warn("[LocalisationBien] Erreur géocodage:", err);
        setStatus("error");
        setErrorMessage(
          err.message || "Impossible de résoudre le quartier. Vérifiez votre connexion."
        );
      }
    },
    [commune, ville, isManuel, quartier, onChange]
  );

  // Surveillance des coordonnées avec debounce de 600 ms
  useEffect(() => {
    if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
      return;
    }

    if (isNaN(latitude) || isNaN(longitude)) return;

    // Si les coordonnées n'ont pas bougé significativement (< 0.0001 soit ~11m)
    if (
      lastResolvedCoords.current &&
      Math.abs(lastResolvedCoords.current.lat - latitude) < 0.0001 &&
      Math.abs(lastResolvedCoords.current.lng - longitude) < 0.0001
    ) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executerResolution(latitude, longitude);
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [latitude, longitude, executerResolution]);

  // Validation manuelle de la saisie
  const handleValiderManuel = (nomChoisi?: string) => {
    const finalNom = (nomChoisi || customInput).trim();
    if (!finalNom) return;

    setQuartier(finalNom);
    setIsManuel(true);
    setSource("manuel");
    setStatus("success");
    setIsEditing(false);
    setShowSuggestions(false);

    if (onChange) {
      onChange({
        quartier: finalNom,
        commune,
        ville,
        quartierManuel: true,
        quartierSource: "manuel",
      });
    }
  };

  const handleFiltrerSuggestions = (text: string) => {
    setCustomInput(text);
    const pool = getSuggestionsForCommune(commune);
    if (!text.trim()) {
      setSuggestions(pool.slice(0, 6));
    } else {
      const match = pool.filter((item) => item.toLowerCase().includes(text.toLowerCase()));
      setSuggestions(match.slice(0, 6));
    }
  };

  // 1. Rendu Compact (pour les tableaux de bord et cartes récapitulatives)
  if (compact) {
    return (
      <span
        aria-live="polite"
        className={`inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 ${className}`}
      >
        <MapPin size={13} className="text-emerald-700 shrink-0" />
        {status === "loading" ? (
          <span className="inline-block w-28 h-3.5 bg-slate-200 animate-pulse rounded" />
        ) : (
          <span>
            {quartier ? `${quartier}, ` : ""}
            {commune ? `${commune}, ` : ""}
            {ville || "Abidjan"}
          </span>
        )}
      </span>
    );
  }

  // 2. Rendu Standard Complet
  return (
    <div
      aria-live="polite"
      className={`rounded-2xl border p-4 bg-white transition-all shadow-xs ${
        status === "error"
          ? "border-rose-200 bg-rose-50/40"
          : status === "notFound"
          ? "border-amber-200 bg-amber-50/30"
          : "border-slate-200/90"
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              status === "error"
                ? "bg-rose-100 text-rose-700 border-rose-200"
                : status === "notFound"
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            <MapPin size={18} />
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Localisation & Quartier résolu
            </p>

            {/* État : Chargement */}
            {status === "loading" && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-32 h-4 bg-slate-200 animate-pulse rounded" />
                <span className="text-[11px] text-slate-400 italic">Identification satellite...</span>
              </div>
            )}

            {/* État : Succès */}
            {status === "success" && (
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="text-sm font-black text-slate-900 tracking-tight">
                  📍 {quartier ? `${quartier}, ` : ""}
                  {commune}, {ville}
                </span>

                {isManuel ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Saisie manuelle
                  </span>
                ) : source === "google" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <Sparkles size={10} /> Google
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                    OSM
                  </span>
                )}
              </div>
            )}

            {/* État : Quartier Introuvable */}
            {status === "notFound" && (
              <div className="mt-0.5">
                <span className="text-sm font-bold text-amber-950">
                  📍 {commune}, {ville}
                </span>
                <p className="text-[11px] text-amber-700 mt-0.5 flex items-center gap-1">
                  <HelpCircle size={12} />
                  <span>Quartier précis non identifié par satellite. Veuillez le préciser ci-dessous.</span>
                </p>
              </div>
            )}

            {/* État : Erreur Réseau */}
            {status === "error" && (
              <div className="mt-0.5">
                <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <AlertCircle size={13} />
                  <span>{errorMessage || "Erreur de géocodage inverse."}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {status === "error" && latitude !== null && latitude !== undefined && (
            <button
              type="button"
              onClick={() => executerResolution(latitude, longitude!)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Réessayer</span>
            </button>
          )}

          {editable && !isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                handleFiltrerSuggestions(quartier || "");
                setShowSuggestions(true);
              }}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
            >
              <Edit2 size={11} />
              <span>{quartier ? "Corriger" : "Saisir quartier"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Formulaire d'édition manuelle avec suggestions intelligentes */}
      {isEditing && (
        <div className="mt-3.5 pt-3 border-t border-slate-200/80">
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
            Nom exact du quartier (Commune de {commune}) :
          </label>
          <div className="relative">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => handleFiltrerSuggestions(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Ex : Angré 8e Tranche, Riviera 2, Zone 4..."
                className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
              />
              <button
                type="button"
                onClick={() => handleValiderManuel()}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <Check size={14} />
                <span>Valider</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Menu de suggestions déroulantes */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden divide-y divide-slate-100">
                <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Suggestions officielles pour {commune}
                </div>
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setCustomInput(sug);
                      handleValiderManuel(sug);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-950 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{sug}</span>
                    <span className="text-[10px] text-slate-400">{commune}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
