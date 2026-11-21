import React from "react";
import Link from "next/link";
import { Download, Smartphone, ShieldCheck, CheckCircle2, ArrowRight, Building2, KeyRound, Home, Check } from "lucide-react";

export const metadata = {
  title: "Télécharger l'Application Mobile Unique QAPRIL",
  description: "Téléchargez l'application officielle unique QAPRIL pour Android (Locataire et Bailleur) et accédez à la console Agence agréée sur le web.",
};

export default function TelechargerPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#141824] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* EN-TÊTE OFFICIEL SOUVERAIN */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Application Mobile Unique · Standard ADD-33
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Télécharger QAPRIL sur votre smartphone
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Une seule et même application pour les <strong>locataires</strong> et les <strong>propriétaires-bailleurs</strong>. 
            Les agences immobilières agréées opèrent directement sur leur console web dédiée.
          </p>
        </div>

        {/* GRILLE PRINCIPALE : APPLICATION MOBILE UNIQUE + CONSOLE AGENCE WEB */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* CARTE PRINCIPALE : L'APPLICATION MOBILE UNIQUE QAPRIL (8 COLONNES) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-slate-900 shadow-xl flex flex-col p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-slate-900 text-white text-[11px] font-extrabold uppercase px-4 py-1.5 rounded-bl-xl tracking-wider">
              Nouvelle Version Universelle
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                Application Unique QAPRIL
              </span>
              <span className="text-xs font-bold text-slate-500">
                v2.1.0 (Build 37) · 21 nov. 2026
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              QAPRIL Mobile
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              L'infrastructure de confiance de l'immobilier ivoirien dans votre poche. Choisissez votre espace (Locataire ou Bailleur) à la connexion et gérez tous vos dossiers avec le même numéro.
            </p>

            <div className="space-y-4 mb-8 border-t border-slate-100 pt-5 flex-1">
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <KeyRound className="w-4 h-4 text-blue-800" />
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">Espace Locataire</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Paiements sécurisés Mobile Money (Wave, Orange, MTN, Moov), quittances numériques infalsifiables scellées SHA256, attestations de résidence républicaines et signalements.
                </p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Home className="w-4 h-4 text-emerald-800" />
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Espace Bailleur</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gestion du patrimoine, signature des baux par code SMS, encaissements directs, télédéclaration fiscale DGI, quittance express et vérification GPS contradictoire.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-slate-700 font-semibold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unicité de compte : un seul compte pour cumuler les qualités sans conflit.</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="/downloads/qapril-latest.apk"
                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl text-sm font-black transition-all bg-emerald-800 hover:bg-emerald-900 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                Télécharger QAPRIL (.APK Android)
              </a>
              <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
                <span>Certifié Android 8.0 et supérieur</span>
                <span>Taille : ~48 Mo</span>
              </div>
            </div>
          </div>

          {/* CARTE SECONDAIRE : CONSOLE AGENCE WEB (5 COLONNES) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col p-8">
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                Professionnels CPRAIMA-CI
              </span>
              <span className="text-xs font-bold text-slate-400">
                Portail Web Dédié
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Portail Agence Agréée
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Conformément à la règle <strong>RG-IDN-30</strong>, la gestion d'agence immobilière s'opère sur le portail web professionnel, avec interface mobile responsive pour vos visites de terrain.
            </p>

            <div className="space-y-3 mb-8 border-t border-slate-100 pt-5 flex-1">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 leading-tight">
                  Gestion du portefeuille multi-mandants certifié
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 leading-tight">
                  Substitution légale totale et masquage souverain du bailleur (RG-CONF-01)
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 leading-tight">
                  Télédéclaration DGI automatisée des droits d'enregistrement
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 leading-tight">
                  Visites de conformité physique Niveau 4 optimisées smartphone
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/espace-agence"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold transition-colors bg-slate-900 hover:bg-black text-white shadow-sm"
              >
                <Building2 className="w-4 h-4" />
                Ouvrir la Console Agence Web →
              </Link>
              <p className="text-[11px] text-center text-slate-400">
                Accessible directement sur PC, tablette et mobile sans installation
              </p>
            </div>
          </div>

        </div>

        {/* GUIDE RAPIDE D'INSTALLATION EN 3 ÉTAPES */}
        <div className="mt-14 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Comment installer l'application sur votre smartphone ?</h3>
              <p className="text-xs text-slate-500">Installation directe du fichier APK en 3 étapes simples</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="inline-block w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold text-center leading-6 mb-2">1</span>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Téléchargez le fichier APK</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Appuyez sur le bouton vert « Télécharger QAPRIL » ci-dessus pour récupérer l'archive.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="inline-block w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold text-center leading-6 mb-2">2</span>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Autorisez l'installation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Si Android affiche un avertissement, appuyez sur « Paramètres » et autorisez l'installation depuis cette source.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="inline-block w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold text-center leading-6 mb-2">3</span>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Ouvrez l'application</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Appuyez sur « Installer » puis « Ouvrir », et choisissez votre espace pour commencer.
              </p>
            </div>
          </div>
        </div>

        {/* ACCÈS WEB ALTERNATIF */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 mb-2">
            Vous préférez utiliser QAPRIL sur votre ordinateur sans rien installer ?
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 underline"
          >
            Accéder directement à votre espace web
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
