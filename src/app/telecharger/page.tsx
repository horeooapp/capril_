import React from "react";
import Link from "next/link";
import { Download, Smartphone, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Télécharger les Applications Mobiles QAPRIL",
  description: "Téléchargez les applications officielles QAPRIL Propriétaire, Locataire et Agence pour Android.",
};

const APPS = [
  {
    id: "proprietaire",
    title: "QAPRIL Propriétaire & Bailleur",
    subtitle: "Gestion locative directe, baux certifiés, encaissements et suivi en temps réel",
    version: "v2.0.0 (Build 7)",
    date: "9 novembre 2026",
    badge: "Espace Bailleur",
    badgeColor: "bg-emerald-900/10 text-emerald-800 border-emerald-300",
    buttonColor: "bg-emerald-800 hover:bg-emerald-900 text-white",
    directUrl: "/downloads/qapril-proprietaire-latest.apk",
    features: [
      "Signature des baux par code SMS certifié",
      "Émission de quittances sécurisées et QR codes de vérification",
      "Validation des paiements alternatifs (Wave, Orange, MTN, Espèces)",
      "Gestion multi-biens et calcul fiscal DGI",
    ],
  },
  {
    id: "locataire",
    title: "QAPRIL Locataire",
    subtitle: "Paiement des loyers, quittances infalsifiables, déclaration de logement et attestations",
    version: "v2.0.0 (Build 7)",
    date: "9 novembre 2026",
    badge: "Espace Locataire",
    badgeColor: "bg-blue-900/10 text-blue-800 border-blue-300",
    buttonColor: "bg-blue-900 hover:bg-blue-950 text-white",
    directUrl: "/downloads/qapril-locataire-latest.apk",
    features: [
      "Historique complet des quittances de loyer certifiées",
      "Déclaration de logement & adoption bailleur",
      "Paiements Mobile Money et déclaration de paiement alternatif",
      "Attestations de résidence et gestion des signalements",
    ],
  },
  {
    id: "agence",
    title: "QAPRIL Agence Agréée",
    subtitle: "Portefeuille sous mandat, substitution légale, DGI et transactions",
    version: "v2.0.0 (Build 7)",
    date: "9 novembre 2026",
    badge: "Professionnels CPRAIMA-CI",
    badgeColor: "bg-amber-900/10 text-amber-800 border-amber-300",
    buttonColor: "bg-slate-900 hover:bg-black text-white",
    directUrl: "/downloads/qapril-agence-latest.apk",
    features: [
      "Pilotage portefeuille sous mandat certifié",
      "Protection du portefeuille et masquage souverain",
      "Télédéclaration DGI automatisée (droits d'enregistrement)",
      "Gestion des visites de conformité physique Niveau 4",
    ],
  },
];

export default function TelechargerPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#141824] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Applications Mobiles Certifiées
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Télécharger QAPRIL sur votre smartphone
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Installez l'application mobile adaptée à votre rôle pour gérer vos biens, signer vos baux
            et suivre vos quittances de loyer en toute sérénité.
          </p>
        </div>

        {/* Grille des applications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {APPS.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col p-6"
            >
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border ${app.badgeColor}`}>
                  {app.badge}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {app.version}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                {app.title}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-6 flex-1">
                {app.subtitle}
              </p>

              <div className="space-y-2.5 mb-8 border-t border-slate-100 pt-4">
                {app.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700 leading-tight">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={app.directUrl}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm ${app.buttonColor}`}
                >
                  <Download className="w-4 h-4" />
                  Télécharger le fichier APK
                </a>
                <p className="text-[10px] text-center text-slate-400">
                  Version certifiée pour Android 8.0 et supérieur
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions d'installation */}
        <div className="mt-14 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Comment installer l'application sur Android ?</h3>
              <p className="text-xs text-slate-500">Guide rapide en 3 étapes pour installer le fichier APK</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="inline-block w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold text-center leading-6 mb-2">1</span>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Téléchargez le fichier</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Appuyez sur le bouton « Télécharger » ci-dessus correspondant à votre profil.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="inline-block w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold text-center leading-6 mb-2">2</span>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Autorisez l'installation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Si Android vous le demande, autorisez l'installation depuis cette source (votre navigateur Chrome).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="inline-block w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold text-center leading-6 mb-2">3</span>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Ouvrez l'application</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Appuyez sur « Ouvrir » ou retrouvez l'icône QAPRIL sur l'écran d'accueil de votre téléphone.
              </p>
            </div>
          </div>
        </div>

        {/* Accès Web alternatif */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 mb-2">
            Vous préférez utiliser QAPRIL sans rien installer ?
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

