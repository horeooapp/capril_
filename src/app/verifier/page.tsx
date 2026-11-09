"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Search, CheckCircle2, AlertTriangle, Building2, Calendar, FileText, ArrowRight, Lock, Printer } from "lucide-react";

function VerifierContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("ref") || searchParams.get("sha") || searchParams.get("id") || "";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = async (valToVerify?: string) => {
    const target = (valToVerify !== undefined ? valToVerify : query).trim();
    if (!target) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/v1/receipts/${encodeURIComponent(target)}/verify`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setResult(data);
      } else {
        setError(data.error || "Aucune quittance officielle ne correspond à cette référence ou empreinte.");
      }
    } catch {
      setError("Erreur de connexion au serveur de certification souverain.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleVerify(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E293B]">
      {/* HEADER INSTITUTIONNEL */}
      <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-[#1B4D3E]">QAPRIL</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#EBF5F0] text-[#1E7E4E] border border-[#C6E7D6]">
              PORTAIL OFFICIEL DE CONFIANCE
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/telecharger"
              className="text-xs font-semibold text-[#1B4D3E] hover:underline"
            >
              Applications Mobiles
            </Link>
            <Link
              href="/mon-espace-locataire"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#1B4D3E] text-white hover:bg-[#153D31] transition"
            >
              Connexion
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* BANDEAU TITRE */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF5F0] text-[#1E7E4E] text-xs font-bold mb-3 border border-[#C6E7D6]">
            <ShieldCheck size={16} />
            CONTRÔLE DE CONFORMITÉ & AUTHENTICITÉ
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Vérification Officielle d’une Quittance
          </h1>
          <p className="text-sm text-[#64748B] mt-2 max-w-xl mx-auto leading-relaxed">
            Service public tiers de vérification d’authenticité pour banques, notaires, administrations, consulats et tribunaux.
          </p>
        </div>

        {/* BARRE DE RECHERCHE / VÉRIFICATION */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E2E8F0] mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 text-[#94A3B8]" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex. : QUI-2026-0001 ou collez l'empreinte numérique..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4D3E] focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 rounded-xl bg-[#1B4D3E] hover:bg-[#153D31] disabled:opacity-50 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? "Contrôle..." : "Vérifier la quittance"}
              <ArrowRight size={16} />
            </button>
          </form>
          <p className="text-[11px] text-[#94A3B8] mt-2.5 text-center sm:text-left">
            Vous pouvez saisir le numéro de quittance ou scanner le QR code présent sur le reçu.
          </p>
        </div>

        {/* RÉSULTAT DU CONTRÔLE */}
        {loading && (
          <div className="bg-white rounded-2xl p-10 text-center border border-[#E2E8F0]">
            <div className="animate-spin w-8 h-8 border-3 border-[#1B4D3E] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#64748B]">Interrogation du registre sécurisé QAPRIL...</p>
          </div>
        )}

        {error && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-6 text-center">
            <AlertTriangle className="mx-auto text-[#DC2626] mb-2" size={32} />
            <h3 className="text-base font-bold text-[#991B1B]">Quittance non authentifiée</h3>
            <p className="text-xs text-[#B91C1C] mt-1 max-w-md mx-auto leading-relaxed">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl border-2 border-[#1E7E4E] p-6 sm:p-8 shadow-md">
            {/* EN-TÊTE SCEAU OFFICIEL */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E2E8F0] gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#EBF5F0] border border-[#C6E7D6] flex items-center justify-center text-[#1E7E4E]">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#1E7E4E]">
                    DOCUMENT OFFICIEL CERTIFIÉ
                  </div>
                  <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                    {result.reference}
                  </h2>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-[#EBF5F0] text-[#1E7E4E] text-xs font-bold border border-[#C6E7D6]">
                  {result.statut === "PAID" ? "✓ INTÉGRALEMENT RÉGLÉ" : "STATUT VALIDÉ"}
                </span>
                <div className="text-[11px] text-[#64748B] mt-1">
                  Période : <span className="font-semibold text-[#0F172A]">{result.moisConcerne}</span>
                </div>
              </div>
            </div>

            {/* GRILLE DÉTAILLÉE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-sm">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                <div className="text-[11px] font-bold text-[#64748B] uppercase mb-1">Logement concerné</div>
                <div className="font-bold text-[#0F172A]">{result.bien}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                <div className="text-[11px] font-bold text-[#64748B] uppercase mb-1">Montant certifié</div>
                <div className="text-lg font-black text-[#1B4D3E]">
                  {Number(result.montant || 0).toLocaleString("fr-FR")} F CFA
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                <div className="text-[11px] font-bold text-[#64748B] uppercase mb-1">Locataire titulaire</div>
                <div className="font-bold text-[#0F172A]">{result.locataire}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                <div className="text-[11px] font-bold text-[#64748B] uppercase mb-1">Mode de règlement</div>
                <div className="font-semibold text-[#0F172A]">{result.methode || "Paiement numérique sécurisé"}</div>
              </div>
            </div>

            {/* BLOC EMPREINTE SOUVERAINE & OPPOSABILITÉ */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                <Lock size={14} className="text-[#1E7E4E]" />
                Empreinte numérique scellée (Opposable aux tiers)
              </div>
              <div className="font-mono text-[11px] break-all p-2 rounded bg-white border border-[#E2E8F0] text-[#475569]">
                {result.sha256Hash}
              </div>
              <div className="text-[11px] text-[#64748B] leading-relaxed">
                Ce document a été émis et scellé sur l’infrastructure QAPRIL Technologies CI conformément au Code de la Construction et de l’Habitat de la République de Côte d’Ivoire. Il fait foi auprès des institutions financières, bancaires et consulaires.
              </div>
            </div>

            {/* ACTION IMPRIMER / EXPORTER */}
            <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-[#94A3B8]">
                Contrôle effectué le {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR")}
              </span>
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-bold text-[#1E293B] flex items-center justify-center gap-2 transition"
              >
                <Printer size={14} />
                Imprimer l’attestation de vérification
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E2E8F0] bg-white py-6 mt-16 text-center text-xs text-[#94A3B8]">
        <div className="max-w-5xl mx-auto px-4">
          © {new Date().getFullYear()} QAPRIL Technologies CI · Infrastructure numérique de confiance pour l’immobilier en Côte d’Ivoire.
        </div>
      </footer>
    </div>
  );
}

export default function VerifierPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center text-sm font-semibold text-[#64748B]">Chargement du portail de vérification...</div>}>
      <VerifierContent />
    </Suspense>
  );
}

